# 04 — TRD (Technical Requirements Document)

🟡 **Proposé** — à valider/figer explicitement avant de lancer Claude Code dessus. Basé sur la stack déjà utilisée sur d'autres livrables Prelakay (app.prelakay.com) et sur les conventions habituelles de GRANDOU Agency. Viser le gratuit le plus possible, payant seulement si nécessaire.

⚠️ 00-super-prompt (section 3) liste ce point comme **ouvert** : « choix technique du stack PWA et structure du repo — questions posées, pas encore répondues. » Ce TRD propose une valeur par défaut raisonnable ; elle doit être confirmée explicitement, pas supposée figée.

## Un outil par besoin

| Besoin | Outil proposé | Pourquoi |
|---|---|---|
| Framework PWA / Dashboard / Landing | Next.js (App Router) | Cohérent avec app.prelakay.com existant ; SSR/SEO pour la landing ; écosystème React/TypeScript déjà maîtrisé |
| Base de données | Supabase, région Europe | Déjà utilisé sur Prelakay ; Postgres relationnel adapté au modèle marketplace (commandes/escrow/stock) ; RLS natif pour les droits par rôle |
| Authentification | ✅ **BetterAuth** (ou équivalent self-hosted — 🟡 bibliothèque exacte **[À CONFIRMER]**), intégré directement dans Next.js, base Postgres Supabase | ✅ Décidé le 29 oct 2026 : éviter d'acheter un domaine dédié au service d'auth (requis par les solutions hébergées type Clerk en production). Self-hosted = zéro domaine supplémentaire, zéro coût récurrent, et le plugin natif Phone/OTP de BetterAuth est déjà positionné pour le téléphone + OTP SMS en v2 (voir 01-prd.md §3 "Plus tard") |
| Hébergement | Netlify ou Vercel | Déjà utilisé (app.prelakay.com sur Netlify) |
| E-mail transactionnel | Resend | 100 e-mails/jour en gratuit ; à relier au SPF déjà en place sur prelakay.com (ne jamais créer un second enregistrement `v=spf1`) |
| Notification WhatsApp | Callmebot | Déjà cité dans les specs produit pour les notifications de dossier vendeur |
| Stockage média (photos/vidéos produit) | Supabase Storage | Même fournisseur que la base, évite un service supplémentaire |
| Paiement wallet national | Intégration MonCash / NatCash / Sogebank | Imposé par les spécifications produit |
| Paiement wallet international | Wise / Stripe / Meru | Imposé par les spécifications produit (angle diaspora) |
| Graphiques des dashboards | ✅ Nivo (`@nivo/*`, validé par Marc-Karlin le 10 nov. 2026 — remplace la proposition Recharts) ; carte des ventes : `@nivo/geo` + contours geoBoundaries HTI ADM3 (CC BY 4.0) | Voir « Graphiques des dashboards » ci-dessous |
| Toasts, mouvement, interface | ✅ `sileo` (toasts), `motion`, `@number-flow/react`, `embla-carousel-react` ; `vaul` validé, non utilisé pour l'instant (10 nov. 2026) | Composants Spectrum UI repris sans Tailwind ni shadcn |
| Carte / géolocalisation | Google Maps | Déjà utilisé pour la capture lat/lng des stores physiques |
| App mobile native (phase 2+) | Flutter | Décidé comme dernier livrable de la roadmap ; stack exact **[À CONFIRMER]** |

## Graphiques des dashboards (vendeur et admin)

🟡 **Proposé le 7 nov. 2026 — à valider par Marc-Karlin** (CLAUDE.md règle 5 : aucune dépendance sans validation). Rien n'est installé tant que ce tableau n'est pas validé.

Le prototype dessine ses graphiques en HTML/CSS/SVG, sans bibliothèque. En production (Next.js App Router), une seule bibliothèque de graphiques suffit pour presque tout ; le reste se fait en composants maison.

### Dépendances proposées

| Paquet | Version | Rôle | Statut |
|---|---|---|---|
| `recharts` | dernière 3.x (vérifier à l'installation) | Courbes, aires, colonnes groupées et empilées, barres horizontales, barres divergentes, lignes d'objectif, sparklines, infobulles | 🟡 Proposé |
| `@vis.gl/react-google-maps` | 1.x | Carte « Commandes par zone » (cercles proportionnels sur Google Maps, déjà choisi pour la géolocalisation des stores) | 🟡 Proposé |
| `@deck.gl/google-maps` + `@deck.gl/aggregation-layers` | — | Uniquement si une vraie carte de chaleur est demandée plus tard (le calque Heatmap natif de Google Maps est déprécié) | ⚠️ Pas en V1 |
| shadcn/ui `chart` (copié dans le repo, basé sur Recharts) | — | Habillage prêt à l'emploi, **seulement si** Tailwind + shadcn/ui sont adoptés | **[À CONFIRMER]** (le TRD ne fixe pas encore de framework CSS) |

Déjà présents, rien à ajouter : Next.js 16.x (App Router), React 19.

### Points techniques à respecter
- **Composants client** : chaque graphique est un composant `'use client'`. La page (Server Component) lit les agrégats et passe des tableaux simples en props.
- **React 19 + Recharts 3** : un conflit avec `immer` 11.0.0 provoque l'erreur `"lanes" is read-only`. Si elle apparaît, ajouter dans `package.json` : `"overrides": { "immer": ">=11.0.1" }`.
- **Responsive** : utiliser la prop `responsive` des graphiques Recharts 3 plutôt que `ResponsiveContainer`.
- **Données mobiles** : charger les graphiques sous la ligne de flottaison avec `next/dynamic` ; la carte avec `ssr: false`.
- **Agrégats** : vues SQL ou fonctions RPC Supabase par jour, par statut, par store, par catégorie (voir `05-backend.md`). ⚠️ Ce sont des changements de base de données : accord de Marc-Karlin requis (règle 5).
- **Carte des stores** ✅ (11 nov. 2026) : `maplibre-gl` sur un fond **MapTiler** (`streets-v2`), chargé en `ssr: false`. Les couches « poi » du fond sont masquées au chargement : hôtels, restaurants et sites touristiques disparaissent, seuls les stores Prélakay portent un repère. Clé gratuite `NEXT_PUBLIC_MAPTILER_KEY` (100 000 chargements par mois, sans carte bancaire) ; sans clé, la page garde le plan schématique. Remplace la proposition Google Maps (`@vis.gl/react-google-maps`, `GOOGLE_MAPS_API_KEY`), qui demandait un compte de facturation. Les coordonnées des stores sont dérivées des positions du prototype (`lib/data/mock/geo.ts`) ; la **géolocalisation réelle des boutiques est prévue en V3**.

### Sans bibliothèque (composants maison, CSS/SVG)
Grille de chaleur (heures de retrait), tableau de cohortes, jauge d'objectif (pilote 20-30 stores), barre segmentée (issue des litiges, origine des fonds), entonnoir (barres horizontales), tableau « Voir les données », formats de nombres et de dates (`Intl` en `fr-FR`).

### Correspondance prototype → production

| Graphique du prototype | Production |
|---|---|
| Courbe / aire (`vzLine`), période précédente en gris | `LineChart` / `AreaChart` + `Line`, `Tooltip` (curseur vertical), `CartesianGrid` |
| Objectif (trait 24 h, 20 stores) | `ReferenceLine` |
| Colonnes, colonnes empilées (`vzCols`) | `BarChart` + `Bar` (`stackId` si empilé, `radius={[4,4,0,0]}`, `maxBarSize={24}`) |
| Barres horizontales (`vzHBars`), seuil de stock bas | `BarChart layout="vertical"` + `ReferenceLine` |
| Barres divergentes (`vzDiverge`) | `BarChart layout="vertical"`, valeurs négatives, `Cell` par signe |
| Sparkline des tuiles (`vzSpark`) | `LineChart` sans axes |
| Entonnoir (`vzFunnel`) | Barres horizontales maison (plus lisibles que `FunnelChart`) |
| Grille de chaleur, cohortes, jauge, barre segmentée | Composants maison |
| Carte des zones (`vzBubbles`) | `@vis.gl/react-google-maps` (`Map` + `AdvancedMarker` dimensionnés) |

### Alternatives écartées (pour mémoire)
Tremor (dépend de Tailwind), Nivo (plus lourd, une dépendance par type de graphique), Chart.js (canvas, accessibilité plus faible), visx (bas niveau, plus de code), ECharts (lourd pour des connexions mobiles lentes).

Catalogue complet des graphiques par écran : `03-design.md` §9.13.

## Services externes et limites gratuites
- Resend : 100 e-mails/jour en gratuit
- Supabase, Callmebot, Netlify/Vercel : limites exactes du plan gratuit à vérifier avant le pilote — **[À CONFIRMER]**

## Variables d'environnement (noms uniquement — jamais les valeurs, jamais collées dans une conversation)
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
RESEND_API_KEY
CALLMEBOT_API_KEY
NEXT_PUBLIC_MAPTILER_KEY
MONCASH_CLIENT_ID
MONCASH_CLIENT_SECRET
NATCASH_API_KEY
STRIPE_SECRET_KEY
WISE_API_KEY
```
**[À CONFIRMER]** liste exacte selon les passerelles réellement activées dès le pilote Les Cayes — le wallet complet est annoncé "prêt" pour le lancement, mais toutes les passerelles ne sont pas nécessairement actives au jour 1.

## Principe directeur
✅ Chaque ligne du budget tech doit se justifier seule. La décision Auth (BetterAuth self-hosted plutôt qu'un domaine dédié) illustre la règle : on ne paie pour un service externe que quand le gratuit/self-hosted ne tient plus — pas par défaut.

## Contraintes
- ✅ Mobile d'abord — contrainte data mobile documentée : images compressées, lazy-load, texte/prix affichés avant la fin du chargement des images
- ✅ Langue v1 : français uniquement
- Performance : dégradation réseau fréquente en Haïti à anticiper systématiquement — pas de chiffre cible précisé, **[À CONFIRMER]**
- Accessibilité : **[À CONFIRMER]**, non spécifiée dans les documents produit fournis

## Interdits
- Aucune nouvelle dépendance sans validation explicite de Marc-Karlin
- Aucun changement de base de données sans accord
- Aucune clé en dur dans le code — toujours via variables d'environnement
- Ne jamais coder une fonctionnalité absente du PRD (voir CLAUDE.md)
