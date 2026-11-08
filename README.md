# Prélakay — PWA

Marketplace géolocalisé pour Haïti (pilote Les Cayes). Voir `docs/docs/` pour
les specs produit — `CLAUDE.md` encadre tout travail sur ce repo, à lire en
premier.

## Démarrage

```bash
npm install
cp .env.example .env.local   # puis remplir les valeurs (jamais commité)
npm run dev
```

- `http://localhost:3000` — page d'accueil ("Hello Prélakay")
- `http://localhost:3000/style-guide` — tous les tokens de design en un coup d'œil

Les deux déploiements vérifiables de la **Phase 0** (`06-plan.md`).

## Décisions prises pour ce scaffold (30 oct 2026)

- **Gestionnaire de paquets :** npm
- **Icônes :** BoxIcons — fallback déjà documenté dans
  `design-prelakay.md` §4 (icône pleine + calque 20% opacité pour simuler le
  duotone actif, outline simple `neutral-500` en inactif). À remplacer
  mécaniquement par Iconly Pro une fois l'abonnement/MCP actif — tenir la
  table de correspondance en le faisant.
- **Polices :** converties en `.woff2` dès maintenant (conforme au spec).
  Fraunces et Onest sont servies via leur fichier **variable** (1 fichier
  couvre tous les poids 100–900) plutôt qu'un fichier statique par poids —
  réduit le bundle par rapport à charger Regular/Medium/SemiBold
  séparément, pour la même raison que celle documentée dans le spec
  ("garder le bundle léger"). Surgena reste statique (seul poids SemiBold
  fourni), chargée uniquement si le wordmark est un jour rendu en texte —
  les logos existants (SVG/PNG) suffisent pour l'instant.
- **Styling :** CSS brut (pas de Tailwind) — Tailwind n'est pas dans
  `04-trd.md` et ajouter une dépendance de styling non actée va à
  l'encontre de la règle "aucune nouvelle dépendance sans validation
  explicite" (`CLAUDE.md` règle 5). Les tokens CSS de
  `design-prelakay.md` §8.5 sont collés tels quels dans `app/globals.css`.
  À revoir si Tailwind (ou autre) est explicitement voulu.
- **Icônes d'app/PWA :** générées depuis `public/logo/JPG/logo-primary-lagonbg.svg`
  (180/192/512px) dans `public/icons/`, référencées par `public/manifest.json`.
  Le `favicon.ico` existant n'a pas été touché.
- **Service worker (offline) :** [Serwist](https://serwist.pages.dev)
  (successeur maintenu de `next-pwa`, lui-même à l'arrêt) — mode webpack
  classique (pas le mode "configurator", plus complexe et pensé pour
  Turbopack, qu'on n'utilise pas). Stratégie : `defaultCache` fourni par
  Serwist (StaleWhileRevalidate JS/CSS/fonts/images, NetworkFirst pour les
  pages HTML) + une page `/~offline` sur la charte, affichée si une
  navigation échoue sans réseau. Pas de stratégie par endpoint API pour
  l'instant — rien à mettre en cache tant que le catalogue/Discovery
  n'existent pas (Phase 4-5 de `06-plan.md`), inutile de complexifier
  avant d'en avoir besoin. Désactivé en dev (`NODE_ENV=development`) pour
  ne pas interférer avec le hot-reload. **Vérifiable :** après
  `npm run build && npm run start`, couper le réseau et recharger une page
  déjà visitée — elle doit continuer à s'afficher.

## Structure

```
app/
  layout.tsx          # <html>, metadata, manifest
  page.tsx             # Hello Prélakay (Phase 0, étape 1)
  style-guide/page.tsx  # tokens affichés (Phase 0, étape 2)
  globals.css          # tokens CSS + @font-face + composants de référence
  sw.ts                 # service worker (Serwist) — précache + offline
  ~offline/page.tsx      # page affichée hors-ligne
lib/supabase/
  client.ts            # client navigateur (anon key)
  server.ts             # client serveur (service role, server-only)
public/
  fonts/_woff2/         # Fraunces/Onest (variable) + Surgena, convertis depuis le zip fourni
  icons/                # app icons PWA générées (180/192/512)
  manifest.json
  logo/, images/        # fournis dans le zip, inchangés
docs/                    # specs produit — source de vérité, voir CLAUDE.md
```

## Pas encore fait (hors scope de ce scaffold)

- Création réelle du projet Supabase (région Europe) — nécessite tes accès,
  pas faisable depuis cette session. Une fois créé, remplir `.env.local`.
- Déploiement Netlify/Vercel réel.
- Auth (BetterAuth) — Phase 2 du plan, pas Phase 0.
- Toute logique produit (catalogue, wallet, etc.) — explicitement hors
  périmètre tant que le PRD/TRD ne sont pas figés pour ces zones
  (`CLAUDE.md` règle 1).

## Points encore ouverts (ne pas trancher sans validation)

Voir `docs/docs/CLAUDE.md` section "Décisions encore ouvertes" — rien de ce
qui est listé là n'a été tranché dans ce scaffold.
