# Architecture de la couche de données F1 — Paddock World

> Ce document remplace/complète l'issue [#1](../../../issues/1) ("Choisir l'API F1 et créer la couche d'accès aux données") suite à un changement de programme : au lieu d'appeler une API F1 externe directement depuis le site, on construit notre propre base de données qui ingère les données F1 en arrière-plan. Le site ne dépend alors **plus jamais** d'une API tierce en temps réel — si elle tombe, change ses règles ou ferme (ce qui est déjà arrivé une fois : Ergast → Jolpica-F1), le site continue de servir les dernières données synchronisées.

## Vue d'ensemble

```
┌─────────────┐      ┌──────────────────┐      ┌──────────────┐      ┌───────────────────┐      ┌─────────┐
│  Jolpica-F1  │ ---> │  GitHub Actions   │ ---> │  Neon Postgres│ ---> │ Next.js Route      │ ---> │ Vercel  │
│  (API externe│ cron │  (script          │ upsert│  (BD interne)│ read │ Handlers (API      │ site │ (hobby) │
│  gratuite)   │      │  d'ingestion TS)  │      │              │      │ interne du site)   │      │         │
└─────────────┘      └──────────────────┘      └──────────────┘      └───────────────────┘      └─────────┘
```

Principe central : **seule la brique d'ingestion parle à l'API F1 externe**. Le site (pages, Route Handlers) ne lit que la base Postgres. Une panne de l'API externe ne peut donc jamais casser le rendu du site — au pire, les données cessent d'être rafraîchies jusqu'à ce que la source revienne ou soit remplacée.

## Sommaire des choix

| Brique | Choix | Statut |
|---|---|---|
| Source de données F1 | [Jolpica-F1](https://github.com/jolpica/jolpica-f1) (phase 1 : structuré) | Retenu |
| Source de données F1 (évolution) | [OpenF1](https://openf1.org/) (phase 2 : live timing) | Prévu, non prioritaire |
| Base de données | [Neon](https://neon.com/) Postgres (free tier) | Retenu |
| ORM | [Drizzle](https://orm.drizzle.team/) + `drizzle-orm/neon-http` | Retenu |
| Ingestion | GitHub Actions (cron + `workflow_dispatch`) | Retenu |
| Exposition | Next.js App Router Route Handlers | Retenu |
| Hébergement site | Vercel (Hobby) | Existant |
| Coût total | **0 €/mois** | Sous réserve des seuils ci-dessous |

---

## 1. Source de données F1

### Phase 1 (actuelle) — données structurées : Jolpica-F1

[Jolpica-F1](https://github.com/jolpica/jolpica-f1) est le successeur communautaire de l'API Ergast (fermée en 2024), avec un schéma REST rétrocompatible. C'est le candidat le plus adapté aux issues #2 à #6 (calendrier, pilotes, écuries, classements) :

- **Couverture** : saisons 1950 → 2026 incluse (confirmé — la saison 2026 est déjà supportée), calendrier, résultats de course, qualifications, standings pilotes/constructeurs, tours.
- **Rate limit** : 4 requêtes/seconde (burst), 500 requêtes/heure (sustained). Pas de clé d'API requise actuellement ; l'authentification par token arrivera plus tard pour des quotas plus élevés.
- **Fréquence de mise à jour côté Jolpica** : l'équipe (bénévole) vise **une seule mise à jour par week-end de course, le lundi suivant**. Inutile donc de poller plusieurs fois pendant un week-end — la donnée ne bougera pas avant.
- **Fiabilité** : projet maintenu par une petite équipe de bénévoles, coûts d'hébergement ~45 $/mois, objectif d'équilibre budgétaire pour 2026. C'est précisément le type de dépendance fragile que cette architecture neutralise : si Jolpica disparaît à son tour, seule la brique d'ingestion doit être remplacée — le site et sa BD restent intacts.

### Phase 2 (roadmap) — télémétrie / live timing : OpenF1

Réservé pour une itération future si le site veut proposer du direct pendant les sessions (position voiture, intervalles, vitesse) :

- **Rate limit gratuit** : ~3 req/s, ~30 req/10s.
- **Données historiques** (2023+) : libres, sans authentification.
- **Données temps réel** : capacité doublée + accès WebSocket/MQTT pour les "supporters" du projet — à vérifier au moment de l'implémentation si des restrictions s'appliquent au live pur.
- Volumes bien plus importants (potentiellement des milliers de lignes par minute par session) → nécessitera un schéma et une stratégie d'ingestion dédiés, à ne pas mélanger avec le schéma structuré de la phase 1.

---

## 2. Base de données : Neon Postgres (free tier)

### Neon vs Supabase — pourquoi Neon

| Critère | Neon | Supabase |
|---|---|---|
| Storage free | 0.5 GB / projet | 500 MB / projet |
| Compute free | 100 CU-heures/mois, scale-to-zero automatique | Toujours actif (jusqu'à pause) |
| Comportement en cas d'inactivité | **Autosuspend transparent** : la requête suivante réveille le compute en quelques centaines de ms, sans action humaine | **Pause dure après 7 jours d'inactivité API** : nécessite une restauration manuelle depuis le dashboard avant que l'API reréponde |
| Egress free | 5 GB/mois | 5 GB (+5 GB cache) |
| Portée fonctionnelle | Postgres pur + branching (10 branches/projet) | Bundle complet : Auth, Storage, Realtime, Edge Functions |

Le critère décisif est le **mode de récupération après inactivité**. L'objectif de cette architecture est d'éliminer les points de défaillance qui demandent une intervention humaine pour se rétablir. Neon se réveille tout seul ; Supabase, passé 7 jours sans trafic API, reste bloqué tant que personne n'a cliqué "Restore" dans son dashboard — ce qui est exactement le genre de risque qu'on cherche à éliminer.

Second argument : Supabase est une plateforme backend complète (Auth/Storage/Realtime en plus de Postgres). Le besoin ici est un simple entrepôt de données F1 alimenté par un cron — utiliser Supabase couplerait cette BD à un futur système d'authentification (le bouton "ACCOUNT" de la navbar) sans nécessité. Le jour où l'authentification devient un vrai besoin, elle pourra être choisie indépendamment (Supabase Auth, Clerk, Auth.js...) sans que ce choix soit contraint rétroactivement par la BD F1.

Neon reste donc la brique la plus alignée avec le périmètre réel : un cache Postgres résilient, rien de plus.

### Dimensionnement attendu

Un jeu de données structuré complet pour une saison (22 courses, 22 pilotes, 11 écuries, standings) pèse quelques Mo — largement dans les 0.5 GB gratuits, y compris en conservant plusieurs saisons d'historique.

---

## 3. ORM : Drizzle

### Drizzle vs Prisma — pourquoi Drizzle

| Critère | Prisma | Drizzle |
|---|---|---|
| Exécution | Query engine (binaire Rust) à charger à chaque cold start | Pur TypeScript → SQL, aucun binaire |
| Compatibilité serverless/Neon | Nécessite l'adaptateur `@prisma/adapter-neon` pour éviter l'épuisement de connexions TCP en environnement serverless | Driver HTTP officiel `drizzle-orm/neon-http`, conçu nativement pour ce pattern |
| Cold start (Vercel Function + Neon scale-to-zero) | Plus lourd | Quasi instantané |
| Migrations | Format propriétaire (`schema.prisma` + moteur de migration) | Fichiers SQL bruts générés par `drizzle-kit`, lisibles et versionnables directement dans une PR |
| Schéma | DSL dédié | TypeScript pur (`pgTable(...)`), pas de codegen bloquant |
| DX sur relations complexes | Plus haut niveau | Légèrement plus verbeux |

Les requêtes de ce projet restent simples (jointures peu profondes : course ↔ résultats ↔ pilote ↔ écurie). L'avantage de Prisma sur les relations complexes ne compense pas son coût en cold start — cumulé au scale-to-zero de Neon et au cold start des fonctions Vercel, chaque milliseconde compte. Drizzle est également le choix recommandé par Neon lui-même pour ce type d'architecture.

---

## 4. Ingestion : GitHub Actions

### Déclenchement

```yaml
on:
  schedule:
    - cron: "0 6 * * *"   # quotidien : calendrier, pilotes, écuries
    - cron: "0 8 * * 1"   # lundi matin : résultats + classements post-course
  workflow_dispatch: {}     # déclenchement manuel depuis l'onglet Actions
```

La cadence est calée sur le rythme réel de Jolpica (une mise à jour par lundi post-course) — pas besoin de poller plus souvent, la donnée source ne changera pas.

### Comportement du script (`scripts/sync-f1.ts`)

1. **Respect des rate limits Jolpica** (4 req/s burst, 500 req/h sustained) : espacement ~250-300 ms entre appels, pagination gérée (limite par défaut de l'API de type Ergast : 30 résultats/page), retry en backoff exponentiel sur HTTP 429.
2. **Idempotence** : chaque écriture est un `upsert` (`insert().onConflictDoUpdate()`) sur une clé naturelle (`driverId`, `constructorId`, `season+round`) — rejouer le script à tout moment ne duplique jamais de données.
3. **Détection de changement** : hash du payload comparé à celui du dernier sync réussi ; si identique, l'écriture est skip (économise des CU-heures Neon, garde le log lisible).
4. **Échec explicite** : si l'API source est indisponible ou renvoie des erreurs de façon persistante, le job échoue bruyamment (exit code ≠ 0, notification GitHub) — mais **le site continue de fonctionner** avec les dernières données valides en base, sans aucun impact utilisateur.
5. **Log lisible** : résumé (lignes créées/mises à jour/skip) écrit dans `$GITHUB_STEP_SUMMARY` pour un contrôle visuel rapide sans dashboard dédié.

### Secrets

`DATABASE_URL` (chaîne de connexion Neon) stocké en secret du repository GitHub Actions, jamais commité, injecté en variable d'environnement dans le workflow.

### Piège à connaître

GitHub désactive automatiquement les workflows programmés après **60 jours sans activité sur le repository**. Peu probable en développement actif, mais à garder en tête si le projet entre en pause prolongée.

### Limites gratuites

- Minutes GitHub Actions : illimitées si le repo est public, ~2000 min/mois si privé — à vérifier selon la visibilité de `tristan-roth/paddock_world`.
- Intervalle minimum technique entre deux cron : 5 minutes (sans objet ici, la cadence retenue est quotidienne/hebdomadaire) ; des délais de 5 à 30 min sont normaux, surtout à `:00` pile — éviter de programmer pile à l'heure.

---

## 5. Exposition : Route Handlers Next.js

Routes prévues (dans `app/api/f1/`) :

- `GET /api/f1/calendar`
- `GET /api/f1/drivers`, `GET /api/f1/drivers/[id]`
- `GET /api/f1/teams`, `GET /api/f1/teams/[id]`
- `GET /api/f1/standings`

Chaque route lit uniquement la base Neon via Drizzle — **aucun appel réseau vers Jolpica au moment de la requête utilisateur**. C'est le cœur de la résilience de cette architecture : le temps de réponse et la disponibilité du site ne dépendent que de Neon + Vercel, jamais de la disponibilité de l'API F1 externe.

### Limites gratuites Vercel (Hobby)

- 100 000 invocations de fonctions/mois
- 10 secondes d'exécution max par fonction (largement suffisant pour une lecture SQL)
- 100 GB de bande passante/mois
- Cron Vercel natif limité à 1 exécution/jour sur Hobby — c'est pour cette raison que l'ingestion est déportée sur GitHub Actions plutôt que sur un cron Vercel.

---

## 6. Schéma de données (phase 1)

Types partagés à définir (reprend les entités listées dans l'issue #1) :

- `Circuit` (id, nom, ville, pays, longueur, nb de tours, continent)
- `Race` (season, round, circuitId, date, nom GP, sprintWeekend: boolean)
- `Driver` (id, nom, numéro, nationalité, date/lieu de naissance)
- `Constructor` (id, nom, couleur, moteur, nationalité)
- `DriverStanding` (season, round, driverId, constructorId, position, points, victoires)
- `ConstructorStanding` (season, round, constructorId, position, points, victoires)
- `RaceResult` (raceId, driverId, constructorId, position, points, grid, statut, temps)

Chaque entité est alimentée par upsert lors du sync — aucune table ne dépend d'un appel API au moment de la lecture par le site.

---

## 7. Risques et mitigations

| Risque | Mitigation |
|---|---|
| Jolpica-F1 ferme ou devient payant (projet bénévole, budget serré) | Seule la brique d'ingestion est à remplacer (ex. bascule vers OpenF1 ou une autre source) ; site et BD restent intacts |
| Cold start Neon après veille | Acceptable pour des lectures API classiques (quelques centaines de ms), imperceptible pour l'utilisateur final |
| Rate limit Jolpica dépassé | Cadence de sync volontairement basse (quotidien + hebdo), espacement des requêtes, retry avec backoff |
| Workflow GitHub désactivé après 60 jours d'inactivité repo | À surveiller si le développement marque une longue pause |
| Panne totale d'ingestion prolongée | Le site continue de servir les dernières données valides ; envisager un snapshot JSON de secours committé en complément si souhaité |

---

## 8. Coût total

**0 €/mois**, tant que :
- Le volume de données structurées reste sous ~0.5 GB (largement le cas pour plusieurs saisons de données F1 structurées).
- Le site reste sous 100 000 invocations Vercel/mois et 100 GB de bande passante/mois.
- L'ingestion respecte les rate limits Jolpica (le cas avec la cadence retenue).

---

## 9. Prochaines étapes

1. Créer le schéma Drizzle (`lib/db/schema.ts`) reprenant les entités de la section 6.
2. Mettre en place la connexion Neon (`lib/db/client.ts`, driver `neon-http`).
3. Écrire le script d'ingestion (`scripts/sync-f1.ts`) et le workflow GitHub Actions associé.
4. Créer les Route Handlers de lecture (`app/api/f1/...`).
5. Brancher les pages des issues #2 à #6 sur ces routes au lieu d'un appel direct à l'API externe.
