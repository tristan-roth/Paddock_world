# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Projet Overview

Paddock World est une plateforme immersive dédiée au sport automobile (F1, MotoGP, etc.). Le projet utilise Next.js 16 avec TypeScript, React Three Fiber pour les visualisations 3D, GSAP pour les animations, et Lenis pour le smooth scrolling.

## Commandes Essentielles

### Développement
```bash
npm run dev       # Démarre le serveur de développement avec webpack polling (WSL-friendly)
npm run build     # Build de production
npm start         # Démarre le serveur de production
npm run lint      # Exécute ESLint
```

Note: Le serveur de dev utilise `--webpack -H localhost` avec polling activé (voir next.config.ts) pour compatibilité WSL.

## Architecture du Projet

### Structure des Composants

**Layout Global** (app/layout.tsx)
- Configure 3 polices Google Fonts: Geist, Geist Mono, et Playfair Display (utilisée pour les titres stylisés)
- Enveloppe toute l'application dans `<SmoothScroll>` pour un défilement fluide via Lenis
- Configuration des variables CSS pour les polices via className variables

**Page Principale** (app/page.tsx)
- Structure en sections: Navbar → Hero → About → Section 3D
- Utilise un fond noir (`bg-neutral-950`) comme base
- Sections identifiées par IDs pour la navigation (`#about`, `#model-section`)

### Composants Clés

**SmoothScroll** (`components/SmoothScroll.tsx`)
- Client component qui initialise Lenis pour le smooth scrolling
- Configuration: duration 1.2s, easing personnalisé, wheelMultiplier: 1, touchMultiplier: 2
- Utilise requestAnimationFrame pour la synchronisation
- Cleanup important: cancel RAF + destroy Lenis instance

**Hero** (`components/Hero.tsx`)
- Section full-screen avec image de fond (`/img/piste.png`)
- Titre en Playfair Display (120px mobile, 180px desktop) avec effet italic + drop-shadow
- Scroll indicator animé en bas (bounce animation)
- Overlay noir semi-transparent pour lisibilité

**About** (`components/About.tsx`)
- Client component avec animations GSAP ScrollTrigger
- Animation: opacity 0→1, translateY 100→0 déclenchée par scroll
- Layout en 2 colonnes (md:flex-row): sidebar "Our Mission" + contenu principal
- ScrollTrigger config: start "top 70%", end "top 30%", scrub: 1

**Scene3D** (`components/Scene3D.tsx`)
- Canvas React Three Fiber avec cube rouge rotatif
- Utilise Suspense pour le chargement
- Dimensions: 400px height, bg-neutral-900
- Caméra position: [0, 0, 5]
- Cube: 1.5×1.5×1.5, couleur #dc2626 (red-600), metalness 0.3, roughness 0.4
- Animation: rotation.x += 0.3*delta, rotation.y += 0.5*delta

**Navbar** (`components/Navbar.tsx`)
- Client component avec navigation fixe en haut
- 3 îles flottantes (glassmorphism):
  - Gauche: Navigation items (HOME, ABOUT, SPORTS, CREATORS)
  - Centre: Logo avec effet glow au hover
  - Droite: Boutons ACCOUNT + SHOP
- Style: `bg-black/20 backdrop-blur-xl border border-white/10`
- Active state: fond blanc + shadow, autres: hover effects subtils
- Logo: `/img/logo.png` (220×80px) avec hover scale + glow effect

### Configuration TypeScript

- Path alias: `@/*` pointe vers la racine du projet
- Target: ES2017 (Next.js 16 requirement)
- JSX: react-jsx (nouvelle transformation JSX)
- Strict mode activé

### Styles et Design System

**Tailwind v4**
- Variables CSS custom: `--background`, `--foreground`
- Palette principale: neutral-900/950 (backgrounds), red-500/600 (accents), white/gray pour textes
- Design glassmorphic: `bg-black/20 backdrop-blur-xl border border-white/10`
- Font families disponibles via CSS variables: `--font-geist-sans`, `--font-geist-mono`, `--font-playfair`

**Conventions de Style**
- Fond principal: `bg-neutral-950` (noir profond)
- Accents de marque: rouge (#dc2626 / red-600)
- Glassmorphism pattern: semi-transparent noir avec backdrop-blur et bordures white/10
- Titres importants: Playfair Display, italic, font-black, tracking-tighter
- Texte secondaire: gray-400, poids normal
- Animations: transitions 300ms pour interactions, 500-700ms pour effects hover majeurs

### Technologies Principales

**Stack 3D**
- `@react-three/fiber`: Renderer React pour Three.js
- `@react-three/drei`: Helpers et abstractions
- `three`: Bibliothèque 3D de base (v0.182.0)

**Stack Animation**
- `gsap`: Animations complexes et ScrollTrigger
- `lenis`: Smooth scrolling moderne
- `@gsap/react`: Intégration React pour GSAP

**Configuration Webpack**
- Polling activé (1000ms interval, 300ms aggregate) pour WSL/Docker
- Configuration dans next.config.ts via config.watchOptions

## Patterns et Conventions

### Client Components
- Marquer avec `'use client'` tous les composants utilisant:
  - Hooks React (useState, useEffect, useRef)
  - Event handlers
  - GSAP/Lenis/Three.js
  - usePathname ou autres hooks Next.js navigaton

### Animations GSAP
- Toujours register plugins: `gsap.registerPlugin(ScrollTrigger)`
- Cleanup dans useEffect return pour éviter memory leaks
- Vérifier existence des refs avant animation

### Images
- Utiliser Next.js `<Image>` pour les logos/images optimisées
- Images de fond via `<img>` standard pour full-cover backgrounds
- Assets dans `/public/img/`

### Navigation
- Utiliser `<Link>` de Next.js pour navigation interne
- usePathname() pour active states dans navbar
- Sections identifiables par IDs pour smooth scroll vers ancres
