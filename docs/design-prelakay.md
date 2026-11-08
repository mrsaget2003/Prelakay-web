# Prélakay — Design System
Version 1.1 · source de vérité unique · dernière mise à jour : 29 octobre 2026

> Statut des fichiers précédents (00–10, "Context") : **supprimés**. Ce document est la référence unique pour la marque Prélakay. Toute couleur, police, composant ou asset logo utilisé en dehors de ce qui est listé ici est une erreur, pas une variante.

---

## 0. Comment utiliser ce document (lecture pour agent)

Ce fichier est conçu pour être lu et appliqué **sans interprétation** par n'importe quel agent (humain ou IA) travaillant sur le projet — landing page, PWA, dashboard admin, app Flutter, supports marketing.

- **Priorité des sources** : ce document > tout fichier de spec antérieur (00–10, Context — supprimés et obsolètes). En cas de conflit entre ce fichier et un autre, celui-ci gagne.
- **Valeurs marquées ⚠️** : calculées/proposées pour respecter une contrainte actée (ratio WCAG, règle 60/30/10), pas extraites d'un fichier maître — à valider visuellement une fois, puis à traiter comme définitives.
- **Valeurs marquées ✅** : décisions actées par le porteur de projet, non négociables sans nouvelle instruction explicite.
- **Tout ce qui n'est pas dans ce document** (layout détaillé, iconographie étendue, imagerie photo) vit ailleurs dans le repo/chat — ne pas improviser, demander plutôt que supposer.

---

## 1. Positionnement

**Tagline :** *"Cherchez-vous encore votre produit ?"*

**Ton : direct et friendly.** Marketplace à la haïtienne, sans jargon tech, chaleureux sans être familier à l'excès. Copy UI en français (v1), créole en v2.

| À faire | À éviter |
|---|---|
| Phrases courtes, verbes d'action | Jargon technique ("backend", "API", "cache") |
| Vouvoiement par défaut, ton chaleureux | Ton corporate / froid |
| Humour léger possible dans les micro-copy (empty states, erreurs) | Ironie ou humour qui minimise un problème réel de l'utilisateur |
| Nommer concrètement l'action ("Trouvez votre produit") | Formulations vagues ("Découvrez nos solutions") |

---

## 2. Couleurs

### Règle de répartition — 60 / 30 / 10

| Rôle | Couleur | Poids |
|---|---|---|
| Secondaire (fond dominant) | Blanc `#fffaf7` | 60% |
| Primaire (texte, structure) | Noir `#0b0c10` | 30% |
| Accent (Lagon) | `#0E6B74` | 10% |

L'accent Lagon ne doit jamais porter plus de ~10% d'une composition — il marque l'action, pas le décor. Un écran où le Lagon domine visuellement (fond plein, grande surface) est un écran à corriger, pas une variante de style.

### Rampe Lagon (accent)

Dérivée par luminosité depuis la base `#0E6B74`, hue et saturation constants :

| Stop | Hex | Usage | Contraste vs blanc | Contraste vs noir |
|---|---|---|---|---|
| `lagon-100` | `#dbf8fb` | fonds très clairs, badges subtils | 1.08:1 | 17.49:1 |
| `lagon-300` | `#80e6f0` | hover léger, highlights | 1.40:1 | 13.45:1 |
| `lagon-500` | `#0e6b74` | **accent principal** (boutons, liens, focus) | 6.01:1 ✅ AA | 3.14:1 |
| `lagon-700` | `#0a4c52` | texte sur fond clair, état pressed | 9.40:1 ✅ AAA | 2.01:1 |
| `lagon-900` | `#052a2e` | fonds sombres accentués | 14.72:1 ✅ AAA | 1.28:1 |

**Règle pratique pour un agent qui code :** texte sur fond blanc → `lagon-500` ou `lagon-700` (jamais `lagon-100`/`lagon-300`, contraste insuffisant). Fond plein `lagon-500` → texte `#fffaf7` ou `lagon-100` uniquement, jamais `#0b0c10`.

### Neutres (dérivés du hue Lagon — pas des gris purs)

| Stop | Hex |
|---|---|
| `neutral-100` | `#f7f8f8` |
| `neutral-300` | `#d8dada` |
| `neutral-500` | `#898f90` |
| `neutral-700` | `#575b5c` |
| `neutral-900` | `#141515` |

*(Les gris hérités de l'ancienne charte — `#bebfc2` / `#878c8f` — sont remplacés par cette rampe pour rester cohérents avec le hue du Lagon. Ne jamais réintroduire un gris pur hors-rampe.)*

### Couleurs fonctionnelles

Calculées pour respecter les ratios WCAG actés (contraste vs fond blanc `#fffaf7`) :

| Fonction | Hex | Contraste | Niveau |
|---|---|---|---|
| Success | `#1c832c` | 4.69:1 | AA |
| Error | `#c62a2a` | 5.39:1 | AA |
| Warning | `#825f1c` | 5.59:1 | AA |

⚠️ Ces trois hex sont **générés par calcul de contraste** pour correspondre aux ratios actés (4.7 / 5.4 / 5.6) — à valider visuellement avant intégration, puis considérés comme définitifs.

---

## 3. Typographie (toutes en local, `.woff2`)

| Police | Rôle | Usage |
|---|---|---|
| **Surgena** | Wordmark / logo uniquement | Jamais en UI courante |
| **Fraunces** | Titres UI | H1–H4, headers de section, display |
| **Onest** | Body / labels | Paragraphes, boutons, formulaires, UI texte |

Aucune police ne doit être chargée depuis une CDN externe — toutes servies en `.woff2` local pour la performance et l'indépendance réseau (contexte connectivité Haïti).

### Échelle de tailles ⚠️ (standard marketplace, base 16px — proposée pour combler l'absence d'échelle actée, à valider une fois puis figée)

| Niveau | Taille / interligne | Police | Usage |
|---|---|---|---|
| Display | 32 / 40px (desktop 40 / 48px) | Fraunces SemiBold | Hero landing |
| H1 | 28 / 36px | Fraunces SemiBold | Titre de page |
| H2 | 22 / 30px | Fraunces Medium | Titre de section, catégorie |
| H3 | 18 / 26px | Fraunces Medium | Titre de carte produit |
| Body Large | 16 / 24px | Onest Regular | Description produit |
| Body | 14 / 20px | Onest Regular | Texte courant |
| Label | 13 / 18px | Onest Medium | Labels, boutons, tags |
| Caption | 12 / 16px | Onest Regular | Métadonnées (distance, date) |

Poids à charger : Onest Regular/Medium/SemiBold, Fraunces Medium/SemiBold — rien de plus, pour garder le bundle léger.

---

## 4. Iconographie

- **Set :** Iconly Pro
- **Styles retenus :** Duotone Rounded (icônes actives/remplies) + Rounded Outline (icônes inactives/neutres)
- État inactif : via opacité/couleur (pas de style dédié supplémentaire)

**Fallback ⚠️ en attendant l'accès au MCP Iconly Pro (payant) :** utiliser BoxIcon (open-source, famille visuelle proche) — icône pleine + calque à 20% d'opacité pour simuler le duotone en état actif, outline simple `neutral-500` en état inactif. Tenir une table de correspondance icône-par-icône pour que le remplacement par Iconly Pro soit mécanique, pas une refonte.

---

## 5. Logo & wordmark

Avec le Lagon comme seul accent (règle 10%) :

| Combinaison | Usage |
|---|---|
| Wordmark Lagon (`#0e6b74`) sur fond blanc (`#fffaf7`) | Usage digital par défaut |
| Wordmark blanc sur fond Lagon (`#0e6b74` ou `#052a2e`) | Fonds colorés, packaging, réseaux sociaux |
| Wordmark blanc sur fond noir (`#0b0c10`) | Version sombre / dark mode |

À éviter : logo en noir plein sur fond Lagon (rupture de la hiérarchie 60/30/10), et toute réintroduction de l'orange de l'ancienne charte.

### 5.1 Taxonomie des fichiers logo — quel fichier pour quel usage

Trois familles de fichiers, trois contextes d'usage distincts. Un agent ne doit jamais substituer l'une à l'autre :

| Famille | Composition | Usage |
|---|---|---|
| **Full logo** | Icône (panier qui marche) + wordmark complet | **Logo principal** — site web, app, documents officiels, présentations, signature email, tout contexte où la marque se présente pleinement |
| **`logo-primary-*`** | Icône seule, déclinée par fond (ex. `logo-primary-blackbg`, `logo-primary-lagonbg`) | **Réseaux sociaux et usages externes** — posts, bannières, partenariats, tout endroit où un format carré/compact est attendu mais où la marque doit rester identifiable sans wordmark |
| **`logo-secondary-*`** | Icône seule, variantes de couleur étendues (ex. `logo-secondary-whitelogo-on-blackbg`, `logo-secondary-blacklogo-on-lagonbg`) | **Profils** — avatar WhatsApp Business, Google Business Profile, réseaux où seul un cercle/carré minuscule s'affiche et où la lisibilité à très petite taille prime |

**Pending :** les fichiers "full logo" (icône + wordmark assemblés) n'ont pas encore été fournis à ce stade du projet — seules les déclinaisons `logo-primary-*` et `logo-secondary-*` (icône seule) sont disponibles. Tant que le full logo n'est pas livré, utiliser `logo-primary-lagonbg` ou `logo-primary-blackbg` comme logo principal de repli, jamais une variante `logo-secondary-*`.

**Statut :** en construction sur Adobe Illustrator 2026. Specs d'export attendues une fois le mark finalisé : espace de protection, taille minimale, variantes (horizontal / icône seule).

---

## 6. Favicon & réseaux sociaux (OG images)

**Favicon / app icons :** 1 master SVG → décliné en PNG (16/32/180/192/512px) + `favicon.ico`. Standard, pas de variation créative nécessaire au-delà du logo icône seul (utiliser une variante `logo-primary-*`, jamais `logo-secondary-*`, pour garder une cohérence avec l'usage "réseaux/externe" du favicon).

**OG images (Open Graph / partage de lien) :**

| Image | Dimensions | Usage |
|---|---|---|
| OG par défaut (site-wide) | 1200×630 | Fallback pour toute page sans OG dédié (accueil, pages statiques) |
| OG listing (template, pas un fichier unique) | 1200×630 | Généré dynamiquement par page commerce/produit — nom + photo du commerce + logo. À construire comme template de génération côté code (ex. Satori / `@vercel/og`), pas comme asset statique Illustrator |

Donc : **2 à préparer en statique** (favicon/app icons + 1 OG par défaut). Le reste (OG par listing) est un template dynamique, pas un lot d'images à dessiner à l'avance — le confier au dev plutôt qu'à Illustrator.

Pas de version carrée (1:1) nécessaire en v1 : WhatsApp et les réseaux utilisés en Haïti lisent correctement le format 1200×630.

---

## 7. Accessibilité (au-delà des couleurs)

- **Touch targets :** 44×44px minimum (zone tactile), même si l'icône visuelle est plus petite
- **Focus visible :** anneau de focus en `lagon-500` (`#0e6b74`), 2px, offset 2px — jamais `outline: none` sans remplacement
- **Dark mode :** reporté en v1.1 — les tokens actuels (rampe Lagon + neutres) sont déjà compatibles, l'implémentation suivra après le lancement v1

---

## 8. Design System — composants, tokens CSS, grille

### 8.1 Rayons

Deux rayons, pas plus — suffisant pour une hiérarchie visuelle claire sans multiplier les variantes à maintenir :

| Token | Valeur | Usage |
|---|---|---|
| `radius-sm` | **10px** | Boutons, champs de formulaire, tags, petits contrôles |
| `radius-lg` | **20px** | Cartes produit, modales, bottom sheets, bannières |

### 8.2 Espacement

Grille 8pt : `4 / 8 / 12 / 16 / 24 / 32 / 48 / 64`. Le padding interne des cartes et le gap entre éléments de liste tombent toujours sur une de ces valeurs.

### 8.3 Ombre

Une seule ombre fonctionnelle, pour ne pas alourdir l'UI : `0 4px 12px rgba(11, 12, 16, 0.08)` — cartes produit et modales uniquement. Les boutons n'ont **pas** d'ombre (le relief vient de la couleur pleine Lagon, pas d'un effet skeuomorphe).

### 8.4 Composants de référence

**Bouton primaire** — hauteur 48px · `radius-sm` · padding horizontal 16px · fond `lagon-500` · texte `#fffaf7` Label 13px Medium · hover/pressed `lagon-700` · disabled fond `neutral-300` texte `neutral-500`

**Carte produit** — `radius-lg` · padding 16px · ombre §8.3 · fond `#fffaf7` ou `neutral-100`

**Champ de formulaire** — hauteur 48px · `radius-sm` · bordure 1px `neutral-300` · focus : bordure 2px `lagon-500` + halo `lagon-100` à 40% d'opacité (cohérent avec §7)

**Message d'erreur** — fond `error` à 8% d'opacité · texte `error` plein · icône Iconly "Danger" Duotone (ou fallback BoxIcon) · `radius-sm` · padding 12px · toujours un texte actionnable ("Réessayez" plutôt que "Erreur 500")

### 8.5 Tokens CSS — prêts à l'emploi

```css
:root {
  /* Couleurs de base */
  --color-white: #fffaf7;
  --color-black: #0b0c10;

  /* Rampe Lagon */
  --color-lagon-100: #dbf8fb;
  --color-lagon-300: #80e6f0;
  --color-lagon-500: #0e6b74; /* accent principal */
  --color-lagon-700: #0a4c52;
  --color-lagon-900: #052a2e;

  /* Neutres */
  --color-neutral-100: #f7f8f8;
  --color-neutral-300: #d8dada;
  --color-neutral-500: #898f90;
  --color-neutral-700: #575b5c;
  --color-neutral-900: #141515;

  /* Fonctionnelles */
  --color-success: #1c832c;
  --color-error: #c62a2a;
  --color-warning: #825f1c;

  /* Rayons */
  --radius-sm: 10px;
  --radius-lg: 20px;

  /* Espacement (grille 8pt) */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 24px;
  --space-6: 32px;
  --space-7: 48px;
  --space-8: 64px;

  /* Ombre */
  --shadow-card: 0 4px 12px rgba(11, 12, 16, 0.08);

  /* Focus */
  --focus-ring-color: var(--color-lagon-500);
  --focus-ring-width: 2px;
  --focus-ring-offset: 2px;

  /* Typographie */
  --font-wordmark: "Surgena";
  --font-heading: "Fraunces";
  --font-body: "Onest";
}
```

---

## 9. Checklist de complétude

- [x] Layout — réalisé (hors de ce document, cf. repo/chat)
- [x] Imagery — réalisé (hors de ce document, cf. repo/chat)
- [x] Texture — réalisé (hors de ce document, cf. repo/chat)
- [x] Design System (composants, tokens CSS, grille) — §8 ci-dessus
- [x] Full logo (icône + wordmark assemblé) — en attente de livraison, cf. §5.1

---

*Fichiers de specs 00–10 et "Context" précédents : obsolètes, supprimés. Ce document est désormais la référence unique pour couleurs/typographie/iconographie/logo/composants tant que non remplacé.*
