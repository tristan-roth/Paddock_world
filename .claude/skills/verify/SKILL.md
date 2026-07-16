---
name: verify
description: Vérifier un changement visuel/runtime de Paddock World en pilotant l'app dans un navigateur headless (Playwright) et en capturant des screenshots.
---

# Vérifier Paddock World (Next.js + GSAP)

## Build & lancement

```bash
npm run build                 # build de prod (~15s)
PORT=3100 npm start           # le port 3000 est souvent pris par le dev server de l'utilisateur
curl -s -o /dev/null -w "%{http_code}" http://localhost:3100/   # attendre le 200
```

## Piloter au navigateur

Playwright est déjà une dépendance du projet. Le navigateur se télécharge une fois :

```bash
npx playwright install chromium --only-shell   # headless shell suffit (~90 Mo)
```

Script Node : `require('<repo>/node_modules/playwright')`, viewport 1440×900,
puis `page.goto(...)`, `window.scrollTo(...)` + `waitForTimeout`, `page.screenshot(...)`.

## Pièges connus

- **`waitUntil: 'networkidle'` ne se résout jamais** : la page émet des prefetch
  RSC vers des routes pas encore créées (/shop, /account, /creators…) et des
  images manquantes (motogp-bg.jpg…) qui répondent 404 en boucle.
  Utiliser `waitUntil: 'load'` + un `waitForTimeout`.
- **Smooth scroll Lenis** : `window.scrollTo` programmatique fonctionne
  (scroll natif), mais laisser ~1.5–2s après chaque saut pour que les
  animations GSAP (fondus 1.2s, ScrollTriggers) se stabilisent avant de
  mesurer ou capturer.
- **Mesures objectives plutôt que pixels** pour les animations subtiles :
  lire `getComputedStyle(el).opacity` / `.transform` via `page.evaluate` —
  les formes de fond à alpha 0.05 sont dures à juger sur screenshot seul.
- **Débordement horizontal** : comparer
  `document.documentElement.scrollWidth - clientWidth` (doit être 0).

## Flows qui valent la peine d'être déroulés

- `/sports/f1/univers` : scroller aux waypoints `#history`, `#timeline`,
  `#impact`, `#circuits-carousel`, `#fans` (fondus du background pilotés par
  ces ancres), puis remonter (les `onLeaveBack` doivent restaurer l'état
  précédent). Vérifier aussi une largeur mobile (390×844).
- `/` : paliers de couleur du HomeBackground par section (#about,
  #sports-categories, #model-section).
