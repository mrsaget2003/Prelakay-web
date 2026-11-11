# Prélakay : du prototype HTML au PWA prêt au lancement — plan d'implémentation

> **Pour les agents qui exécutent ce plan :** sous-skill requis : `superpowers:subagent-driven-development` (recommandé) ou `superpowers:executing-plans`, tâche par tâche. Les étapes utilisent des cases à cocher (`- [ ]`).

**Objectif :** transformer `prototype/prelakay-prototype.html` (acheteur + vendeur + admin, mobile + desktop) en application Next.js où **chaque page et sous-page existe et est interactive**, d'abord sur des données de démonstration, puis branchée page par page sur Supabase, jusqu'au lancement du pilote Les Cayes.

**Architecture :** trois couches. (1) **UI** : routes App Router et composants React, CSS natif à partir des tokens de `design-prelakay.md` §8.5. (2) **Domaine** (`lib/domain/`) : règles métier pures en TypeScript (stock par combinaison, totaux du panier, code de retrait, escrow, Coins, droits admin), testées unitairement. (3) **Données** (`lib/data/`) : des *ports* (interfaces de dépôt) avec deux adaptateurs : `mock` (données du prototype, en mémoire, pour le développement) et `supabase` (production). Les pages et les Server Actions n'appellent que les ports. Passer du prototype à la base = changer d'adaptateur, domaine par domaine, sans retoucher l'UI.

**Stack :** Next.js (App Router) · React 19 · TypeScript strict · CSS natif + CSS Modules (pas de Tailwind, cf. README) · Font Awesome 6 Free (SVG, local) · Supabase Postgres + Storage (région Europe) · BetterAuth · Serwist (PWA) · Vitest + Testing Library + Playwright (🟡 à valider, porte G1).

**Spécifications :** `docs/01-prd.md`, `docs/02-app-flow.md` (§6 = carte des routes), `docs/03-design.md` (§9 = structure des pages), `docs/design-prelakay.md` v1.1 (prévaut sur les couleurs, polices et ton), `docs/04-trd.md`, `docs/05-backend.md`, `docs/06-plan.md`, `CHANGELOG.md`, `CLAUDE.md`. Référence visuelle et de parcours : `prototype/prelakay-prototype.html`.

---

## Comment lire ce plan

- **Partie 1** : décisions à valider avant de démarrer (portes), écarts avec `06-plan.md`, contraintes globales, Review Focus.
- **Partie 2** : architecture cible (arborescence, carte des routes, ports de données, règles d'usage du logo et des icônes).
- **Partie 3** : **Phase A — Fondations**, détaillée en tâches TDD prêtes à exécuter.
- **Partie 4** : **Phases B à I**, découpées en tâches avec livrable, fichiers, interfaces et test de validation. Chaque phase sera détaillée au niveau de la Phase A (même format) **au moment de la démarrer**, parce que ses détails dépendent des portes qui la précèdent (schéma de base validé, choix d'auth, passerelles actives). Écrire ces détails maintenant reviendrait à trancher des points ouverts (CLAUDE.md règle 2).

---

# PARTIE 1 — Cadre

## 1.0 Trois projets en un (✅ décidé par Marc-Karlin le 7 nov. 2026)

Le dépôt contient **une seule application Next.js** et **trois projets déployables** : **Acheteur**, **Espace vendeur**, **Espace admin** — plus la **landing**, quatrième livrable, sur sa propre branche et hors de cette application. Ils partagent les fondations (design system, logo, icônes, domaine, données, auth). On construit dans l'ordre **Acheteur → Vendeur → Admin**. Chaque projet abouti est versé dans **sa branche Git**, que surveille son propre site Vercel ou Netlify.

| Branche | Projet | Variable `APP_SPACE` | Routes servies | Domaine proposé |
|---|---|---|---|---|
| `main` | intégration (tout) | `all` | toutes | — (local et prévisualisations) |
| `landing` | Landing | — (hors application) | la vitrine seule | `www.prelakay.com` ✅ (11 nov. 2026) |
| `acheteur` | Acheteur | `acheteur` | tout sauf `/seller/*` et `/admin/*` | `app.prelakay.com` ✅ (11 nov. 2026) |
| `vendeur` | Espace vendeur | `vendeur` | `/seller/*` + `/login`, `/signup`, `/sell` ; `/` redirige vers `/seller` | `vendeur.prelakay.com` ✅ (11 nov. 2026) — avec connexion et SEO |
| `admin` | Espace admin | `admin` | `/admin/*` seulement ; `/` redirige vers `/admin` | `admin.prelakay.com` ✅ (11 nov. 2026) — sans SEO (`noindex`) |

- **Flux Git** : on travaille sur `feat/<phase>-<sujet>`, on fusionne dans `main`. Quand un projet atteint un jalon validé, on fusionne `main` dans sa branche (`git switch acheteur && git merge --ff-only main`), ce qui déclenche son déploiement. On ne commite jamais directement sur `acheteur`, `vendeur` ou `admin`.
- **Deux jalons par projet** : (1) **prototype abouti** : toutes ses pages, interactives sur données de démo, déployé avec `PRELAKAY_ENV=demo` et un bandeau permanent « Données de démonstration » ; (2) **production aboutie** : branché sur Supabase, `PRELAKAY_ENV=production`, données de démo refusées.
- **Liens entre espaces** : « Espace vendeur » dans le compte acheteur, « Retour aux achats » chez le vendeur, « Voir le site » dans l'admin pointent vers `NEXT_PUBLIC_URL_ACHETEUR`, `NEXT_PUBLIC_URL_VENDEUR`, `NEXT_PUBLIC_URL_ADMIN` (même domaine relatif quand `APP_SPACE=all`).
- **Sessions** : acheteur et vendeur partagent le même compte, avec un cookie valable sur les sous-domaines (option `crossSubDomainCookies` de BetterAuth, Phase D). La session admin est **séparée** (cookie distinct, 8 h, deuxième facteur) : l'admin sur son propre déploiement réduit aussi la surface d'attaque.

## 1.1 Portes de validation (Marc-Karlin) — rien ne passe sans un « oui » daté

Chaque porte bloque les tâches indiquées. Une fois validée, l'ajouter datée dans `CLAUDE.md` « Décisions récentes ».

| # | Décision | Proposition par défaut | Bloque |
|---|---|---|---|
| **G0** ✅ 7 nov. | Ordre de construction : toute l'UI d'abord sur données de démo (Phase B), puis branchement base par domaine (Phases C-H). `06-plan.md` construit fonctionnalité par fonctionnalité de bout en bout. | **Validé.** L'UI n'attend pas le schéma (que `05-backend.md` réserve à Marc-Karlin), et chaque étape reste vérifiable dans le navigateur. Les jalons de `06-plan.md` restent les critères de sortie des Phases C-I. | Tout le plan |
| **G1** ✅ 7 nov. | Dépendances de développement pour les tests : `vitest`, `@vitejs/plugin-react`, `jsdom`, `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`, `@playwright/test`. | **Choix délégué à Claude Code** : cette liste (devDependencies seulement, rien n'est livré au navigateur). | A1 et toutes les tâches TDD |
| **G2** ✅ 7 nov. | Font Awesome 6 Free en paquets SVG : `@fortawesome/fontawesome-svg-core`, `free-solid-svg-icons`, `free-regular-svg-icons`, `free-brands-svg-icons` (WhatsApp, Google), `react-fontawesome`. Retrait de `BoxIcons-react` (jamais installé, remplacé le 7 nov.). | **Demandé** (« use font-awesome »). SVG importé icône par icône = seules les icônes utilisées partent au navigateur (contrainte 3G), sans CDN (même règle que les polices). | A1, A4 |
| **G3** ✅ 7 nov. (choix Claude) | Version de Next.js : `package.json` dit `^15.1.0`, `04-trd.md` dit « Next.js 16.x déjà présent ». | Passer en 16.x maintenant (rien n'est construit). À l'installation, vérifier : Serwist en mode webpack (`next build --webpack` si Turbopack est le défaut) et nom du fichier middleware (`proxy.ts` en 16, `middleware.ts` en 15). | A1 |
| **G4** ✅ 7 nov. (choix Claude) | Fichiers lourds du dossier `prototype/` : `handwritten-…/` (155 Mo, un fichier de 86 Mo) et `Screenshot AliExpress/` (28 Mo, captures d'une marque tierce). | Exclus de Git (`.gitignore`), **conservés sur le disque** ; à sauvegarder hors dépôt (Drive). On commite `prelakay-prototype.html`. | A0 |
| **G5** ✅ 7 nov. (option A) | Accès aux données avec BetterAuth : Supabase RLS se base sur `auth.uid()`, qui n'existe pas quand l'auth n'est pas Supabase Auth. | **Option A (validée)** : tout accès aux données côté serveur (Server Components, Server Actions, Route Handlers) avec la clé service, droits vérifiés dans les dépôts (`requireUser`, `requireStoreOwner`, `requireAdmin(role)`), RLS activée **sans aucune politique** sur toutes les tables (la clé anon ne lit rien). Option B : signer un JWT Supabase par requête pour garder des politiques RLS par rôle (plus fidèle à `05-backend.md`, plus complexe). | Phase C |
| **G6** | Schéma de base (migration SQL complète dérivée de `05-backend.md`) et montants en **centimes entiers** (`bigint`). | Revue de la migration avant `supabase db push` (règle 5). | Phase C et suivantes |
| **G7** | Deuxième facteur admin : le prototype envoie le code « par SMS », mais aucun fournisseur SMS n'est dans le TRD (le SMS est V2). | Code à 6 chiffres envoyé **par e-mail (Resend)** en V1, ou TOTP (plugin `twoFactor` de BetterAuth). **[À CONFIRMER]** | Phase D |
| **G8** | Dépendances de production, une par besoin : `better-auth` + `pg` (auth), `qrcode` (vrai QR de retrait : celui du prototype est décoratif), `@vis.gl/react-google-maps` (carte), `web-push` (push « Prête pour retrait »), `recharts` (🟡 TRD). | Valider au moment de la phase qui l'utilise. Resend, Callmebot et MonCash passent par `fetch` : **aucun SDK**. Le scan du QR utilise l'API native `BarcodeDetector`, avec la saisie du code toujours disponible : **aucune dépendance**. Les graphiques sont d'abord portés en SVG maison depuis le prototype. | D, E, F, H |
| **G9** | Nouvelles variables d'environnement absentes de `04-trd.md` : `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `CRON_SECRET`, `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `DATA_SOURCE`, `PRELAKAY_ENV`, `APP_SPACE`, `NEXT_PUBLIC_URL_ACHETEUR`, `NEXT_PUBLIC_URL_VENDEUR`, `NEXT_PUBLIC_URL_ADMIN`, `DEMO_COOKIE_SECRET`, `DEMO_ADMIN_PASSWORD`, `DEMO_ADMIN_OTP`. | Les ajouter à `.env.example` (noms seulement) et à `04-trd.md`. | Phases C, D, F |
| **G10** | Tâches planifiées (libération d'escrow, rappels J+1/J+2, non-retrait après 3 jours). | Fonctions planifiées de l'hébergeur (Netlify, déjà utilisé pour app.prelakay.com) qui appellent `/api/cron/*` protégé par `CRON_SECRET`. Alternative : `pg_cron` dans Supabase. | Phase F |

## 1.2 Écarts relevés entre le prototype et le design system (à trancher, non bloquants)

Par défaut, on suit le **prototype**, parce que `03-design.md` §9 (6-7 nov.) est la décision la plus récente pour la structure. Couleurs, polices et ton suivent toujours `design-prelakay.md` v1.1.

1. **Rayon pilule** (`--radius-pill: 999px`, pastilles et onglets) en plus des deux rayons prévus (10 / 20 px).
2. **Deuxième ombre** (`--shadow-pop`, menus déroulants et feuilles) alors que le design n'en prévoit qu'une.
3. **Carte produit** : `radius-sm` dans §9.4, `radius-lg` dans §4.4 et dans design-prelakay §8.4.
4. **Logo** : le prototype dessine une icône Font Awesome (chariot) + le mot « Prélakay » en texte. **Remplacé** par les vrais fichiers logo (règle 1 de la demande, §2.4 ci-dessous).
5. **Code de retrait** : « 4-6 chiffres » dans le PRD et le CHANGELOG, **6 chiffres** dans `03-design.md` §9.9 et le prototype. On fige 6.
6. **Chemin du fichier de versions** : `06-plan.md` cite `src/config/release.ts`, mais le repo n'a pas de dossier `src/`. On utilise `lib/config/release.ts` (signalé, pas un renommage silencieux).

## 1.3 Contraintes globales (s'appliquent à chaque tâche)

- **Langue** : français uniquement, **vouvoiement partout**, une à deux phrases par message, pas d'humour dans le paiement, la commande ou les erreurs (03-design §6).
- **Couleurs** : uniquement les tokens de `design-prelakay.md` §8.5 (`--color-white: #fffaf7`, `--color-black: #0b0c10`, rampe Lagon, neutres, success `#1c832c`, error `#c62a2a`, warning `#825f1c`). Règle 60 / 30 / 10 : le Lagon reste rare (CTA, état actif, liens).
- **Polices** : Fraunces (titres), Onest (texte), Surgena (wordmark seulement, et le wordmark vient des fichiers logo). En `.woff2` local, **jamais Google Fonts ni CDN**.
- **Icônes** : Font Awesome 6 Free via le composant `<Icon>`, jamais une classe `fa-…` en dur (pour garder le passage à Iconly Pro mécanique).
- **Largeurs** : chaque page acheteur, vendeur et admin fonctionne **dès 360 px**, sans défilement horizontal. Points de rupture : < 768 px (2 colonnes), 768-1023 px (3 colonnes), ≥ 1024 px (5 colonnes, conteneur 1240 px).
- **Accessibilité** : zones tactiles de 44 × 44 px minimum ; focus visible `lagon-500` 2 px, décalage 2 px ; jamais `outline: none` sans remplacement.
- **Versions** : toute fonctionnalité au-delà de la V1 reste visible et affiche le toast « À venir » 3 s ; l'API répond `403 {"error":"feature_not_released"}` (CHANGELOG).
- **Vocabulaire** : « escrow » n'apparaît que côté vendeur et admin ; l'acheteur lit « argent protégé » (03-design §9.12). Termes figés : Coins, Points de confiance, Points de fidélité, Store Health Score, escrow, Click & Collect.
- **Points ouverts** : commission, frais de restockage, Store Health Score, Coins de bienvenue, critères « Store de confiance », passerelles actives, durée de blocage admin après 5 échecs : valeur `null` dans la config, affichée « — » ou *[À CONFIRMER]*, **jamais un chiffre inventé ni un calcul**.
- **Données** : jamais de données de démonstration en production. Montants en entiers. Aucune clé dans le code.
- **Git** : branches de travail `feat/<phase>-<sujet>` fusionnées dans `main`, un commit par tâche ; jamais de travail direct sur `main` une fois le commit initial fait ; les branches `acheteur`, `vendeur`, `admin` ne reçoivent que des fusions depuis `main` (§1.0).
- **Espaces** : un composant d'un espace n'importe jamais un composant d'un autre espace (`components/shop` ↛ `components/seller` ↛ `components/admin`) ; seuls `components/ui`, `components/brand`, `components/charts` et `lib/` sont partagés. Garde-fou ESLint `no-restricted-imports` (tâche A5).

## 1.4 Review Focus — ce que la spec implique et qu'on teste explicitement

1. **Données de démo en production** : avec `PRELAKAY_ENV=production` et `DATA_SOURCE=mock`, l'application doit refuser de démarrer au lieu d'afficher de faux produits (CHANGELOG règle 4). Un déploiement de démonstration (`PRELAKAY_ENV=demo`) les autorise, mais affiche toujours le bandeau « Données de démonstration ». → test dans A5.
2. **Variante épuisée entre l'ajout au panier et le paiement** (02-app-flow §3 « Erreur ») : le paiement refuse la ligne avec un message actionnable et ne débite rien. → test dans B4 (domaine) et F3 (transaction SQL).
3. **Visiteur sur une page protégée** (panier, compte, paiement) : redirection vers la connexion, puis **retour à la page d'origine** (02-app-flow §1). → test e2e dans B1.
4. **Le mot « escrow » côté acheteur** : aucune page acheteur ne le contient. → test e2e qui parcourt toutes les routes acheteur dans B5.
5. **Double clic sur « Payer »** ou réseau qui coupe pendant le paiement : une seule commande et un seul débit (clé d'idempotence). → test dans B4 (port) et F3 (base).

---

# PARTIE 2 — Architecture cible

## 2.1 Arborescence

```
app/
  layout.tsx                      # <html lang="fr">, polices, ToastProvider, config FA
  globals.css                     # tokens §8.5 (existant) + base + utilitaires
  (shop)/layout.tsx               # coque acheteur : DesktopHeader + MobileTop + TabBar + Footer
  (shop)/page.tsx                 # Accueil
  (shop)/discover/ search/ map/ categories/
  (shop)/p/[id]/page.tsx          # Fiche produit
  (shop)/p/[id]/reviews/page.tsx
  (shop)/store/[id]/[[...tab]]/page.tsx   # home | products | top | new | reviews | about
  (shop)/cart/ checkout/ done/[ids]/ shared/[id]/
  (shop)/orders/ orders/[id]/ wallet/ coins/ wishlist/ account/ sell/
  (shop)/notifications/ settings/ settings/[section]/ viewed/ disputes/ myreviews/
  (shop)/help/ help/[n]/
  (auth)/login/ signup/ intro/
  seller/layout.tsx               # SellerShell (menu latéral desktop, onglets mobile) + garde KYC
  seller/…                        # voir 2.2
  admin/login/page.tsx
  admin/(console)/layout.tsx      # AdminShell + garde de session + garde de rôle
  admin/(console)/…               # voir 2.2
  api/                            # Route Handlers : auth, webhooks paiement, cron
  demo/page.tsx                   # sélecteur de persona, mode mock uniquement (404 sinon)
  ~offline/page.tsx sw.ts         # existants
components/
  brand/Logo.tsx
  ui/        Icon, Button, Field, Card, Tag, Price, Stars, Toast, ComingSoon, Modal, BottomSheet,
             Tabs, EmptyState, Qr, Countdown, Checkbox (ronde), Stepper (quantité)
  shop/      ProductCard, ProductGrid, SkuPicker, QuickView, SkuSheet, CartStoreGroup, …
  seller/    SellerMenu, OrderStatusActions, ProductForm, StockMatrix, …
  admin/     AdminMenu, RoleBadge, QueueCard, DecisionForm, …
  charts/    Line, Cols, HBars, Diverge, Heat, Cohort, Funnel, Seg, Meter, Spark, Tile, DataTable
lib/
  config/release.ts               # versions et fonctionnalités (CHANGELOG)
  config/business.ts              # règles chiffrées (escrow, Coins, délais) + points ouverts à null
  domain/                         # règles pures, sans I/O, testées
  data/ports.ts                   # interfaces des dépôts
  data/index.ts                   # choisit l'adaptateur selon DATA_SOURCE
  data/mock/                      # seed (port du prototype) + dépôts en mémoire
  data/supabase/                  # dépôts Supabase (Phase C+)
  auth/                           # getSession(), requireUser(), requireAdmin() — mock puis BetterAuth
  icons/registry.ts               # nom sémantique → icône FA (+ équivalent Iconly à remplir)
  format.ts                       # HTG, distances, « k », dates fr-FR
  payments/ notify/               # Phases F
supabase/migrations/ supabase/seed.sql   # Phase C
tests/unit/ tests/e2e/
```

Un fichier = une responsabilité. Les pages restent des Server Components qui lisent via `lib/data` ; l'interactivité vit dans de petits composants `'use client'` ; toute écriture passe par une Server Action dans `app/**/actions.ts` qui appelle un port.

## 2.2 Carte des routes (prototype → Next.js)

Source : `02-app-flow.md` §6 et le routeur du prototype (`render()`, ligne ~3001 ; `SMENU` ~2225 ; `AMENU`/`PERM` ~2620-2670).

| Prototype | Next.js | Accès | Fonction du prototype à porter |
|---|---|---|---|
| `#/` | `/` | Tous | `pageHome` |
| `#/discover`, `#/search?q=` | `/discover`, `/search?q=` | Tous | `pageDiscover`, `filtered`, `filtersHtml`, `acHtml` |
| `#/map` | `/map` | Tous | `pageMap` |
| `#/categories` | `/categories` | Tous | `pageCategories` |
| `#/p/:id`, `#/p/:id/reviews` | `/p/[id]`, `/p/[id]/reviews` | Tous (achat : compte) | `pageProduct`, `reviewsHtml`, `pageReviews` |
| `#/store/:id/:onglet` | `/store/[id]/[[...tab]]` | Tous | `pageStore`, `STABS`, `sortBar` |
| `#/cart`, `#/checkout`, `#/done/:ids` | `/cart`, `/checkout`, `/done/[ids]` | Compte | `pageCart`, `cartTotals`, `pageCheckout`, `pageDone` |
| `#/shared/:id` | `/shared/[id]` | Tous (paiement : compte) | `pageShared` |
| `#/orders`, `#/orders/:id` | `/orders`, `/orders/[id]` | Compte | `pageOrders`, `pageOrder`, `orderCard` |
| `#/wallet`, `#/coins`, `#/wishlist` | idem | Compte | `pageWallet`, `pageCoins`, `pageWishlist` |
| `#/account` | `/account` | Compte | `pageAccount`, `accLayout` |
| `#/sell` | `/sell` | Compte | `pageSell` |
| `#/notifications`, `#/viewed`, `#/disputes`, `#/myreviews` | idem | Compte | `pageNotifications`, `pageViewed`, `pageDisputes`, `pageMyReviews` |
| `#/settings/:section` | `/settings/[section]` (`profile`, `secu`, `notifs`, `lang`, `ville`, `privacy`) | Compte | `pageSettings`, `SETS` |
| `#/help`, `#/help/:n` | `/help`, `/help/[n]` | Tous | `pageHelp`, `pageHelpArticle`, `HELP`, `FAQ` |
| `#/login`, `#/signup`, `#/intro` | `/login`, `/signup`, `/intro` | Visiteur | `pageLogin`, `renderIntro`, `INTRO` |
| `#/seller/…` | `/seller`, `/seller/menu`, `/seller/products`, `/seller/products/new`, `/seller/products/[id]`, `/seller/stock`, `/seller/orders`, `/seller/orders/[id]`, `/seller/pickup`, `/seller/disputes`, `/seller/disputes/[id]`, `/seller/marketing`, `/seller/share`, `/seller/finance`, `/seller/payouts`, `/seller/reviews`, `/seller/questions`, `/seller/messages`, `/seller/messages/[id]`, `/seller/stats`, `/seller/store`, `/seller/policy`, `/seller/trust`, `/seller/account`, `/seller/notifications` | Vendeur, KYC approuvé (sinon accueil vendeur + « Enregistrer sa Commerce ») | `pageSeller`, `sellerGate`, `sHome`… `sNotifs` |
| `#/admin/login` | `/admin/login` | Équipe | `adminLogin`, `adLogin` |
| `#/admin/…` | `/admin`, `/admin/menu`, `/admin/search`, `/admin/kyc[/id]`, `/admin/products[/id]`, `/admin/reports`, `/admin/disputes[/id]`, `/admin/stores[/id]`, `/admin/users[/id]`, `/admin/orders[/id]`, `/admin/banners`, `/admin/notify`, `/admin/categories`, `/admin/team`, `/admin/settings`, `/admin/audit`, `/admin/stats` 🟡 | Selon `PERM` | `aDash`… `aAudit`, `aStats` |
| `#/admin/finance`, `#/admin/events` | `/admin/finance` (V2), `/admin/events` (V1.x) | — | redirection + toast « À venir » ; l'aperçu `?preview=1` n'existe qu'en mode mock |

## 2.3 Ports de données (contrat entre UI, mock et Supabase)

`lib/data/ports.ts` définit les interfaces ; `lib/data/index.ts` exporte `getRepos(): Repos`. Types de base dans `lib/domain/types.ts` (ids en `string`, montants en `number` entiers HTG pour le mock ; la Phase C bascule en centimes via `lib/format.ts` uniquement si G6 est validé).

```ts
export interface Repos {
  catalog: CatalogRepo;   // categories(), product(id), search(q, filters, sort, page), sku(productId)
  stores: StoreRepo;      // store(id), list({near?}), storeProducts(id, tab, sort, q?)
  cart: CartRepo;         // get(userId), add(userId, line), update(userId, lineId, patch), remove(...), shareSnapshot(userId)
  orders: OrderRepo;      // placeOrder(userId, input, idempotencyKey), forBuyer(userId, filter), forStore(storeId, filter),
                          // setStatus(orderId, next, actor), validatePickup(storeId, code)
  wallet: WalletRepo;     // balance(userId), topUp(userId, gateway, amount), history(userId), payForRelative(...)
  coins: CoinsRepo;       // balance(userId), history(userId)
  reviews: ReviewRepo;    // forProduct(id, filter), create(userId, orderId, input), reply(storeId, reviewId, text), report(...)
  qa: QaRepo; messages: MessageRepo; notifications: NotificationRepo;
  kyc: KycRepo;           // submit(userId, dossier), status(userId), queue(filter), decide(id, decision, actor)
  admin: AdminRepo;       // users, stores, moderation, reports, disputes, banners, categories, team, settings, audit
  stats: StatsRepo;       // agrégats (03-design §9.13), jamais les tables brutes
}
```

Chaque méthode qui écrit reçoit l'acteur (`Actor = {kind:'buyer'|'seller'|'admin', id, role?}`) et vérifie le droit **dans le dépôt** (pas dans la page). L'adaptateur mock doit appliquer exactement les mêmes règles que l'adaptateur Supabase : ce sont les mêmes fonctions de `lib/domain/`.

## 2.4 Logo et icônes (règles de la demande)

**Règle 1 — « full logo » = icône + wordmark.** Les fichiers `full-logo-*` sont le logo principal (design-prelakay §5.1). Le wordmark n'est jamais recomposé en texte Surgena.
**Règle 2 — icône seule = `secondary`.** Quand seule l'icône tient (petite taille, avatar, menu replié), on utilise les fichiers `secondary-logo-*`.

| Usage | Variante `<Logo>` | Fichier | Fond |
|---|---|---|---|
| Header desktop, pied de page, connexion, inscription, intro, page hors ligne, connexion admin (formulaire) | `full` / `lagon` | `/logo/_simple/full-logo-lagon.svg` | blanc `#fffaf7` (usage digital par défaut, §5) |
| Barre du haut admin (`lagon-900`), panneau de marque de la connexion admin, surfaces noires | `full` / `white` | `/logo/_simple/full-logo-white.svg` | Lagon ou noir |
| Barre du haut mobile (vendeur, admin), menu latéral replié, expéditeur « Prélakay » dans le centre de messages | `mark` / `lagon` | `/logo/_simple/secondary-logo-lagon.svg` | blanc |
| Idem sur fond sombre | `mark` / `white` | `/logo/_simple/secondary-logo-white.svg` | Lagon ou noir |
| Favicon et icônes d'app (existants, inchangés) | — | `public/icons/*` générés depuis `logo-primary-lagonbg` | design-prelakay §6 (primary, jamais secondary) |

Tailles minimales (03-design §7.1) : 24 px pour l'icône seule, 32 px de haut pour le logo complet. Pas d'ombre, pas de recoloration, pas de logo noir sur fond Lagon. Proportions : full `2324.17 / 772.09`, secondary `664.95 / 663.1` (viewBox des SVG).

**Icônes : Font Awesome 6 Free**, 154 icônes distinctes dans le prototype. Elles sont déclarées une fois dans `lib/icons/registry.ts` sous un **nom sémantique** (`cart`, `store`, `wallet`, `pickup-qr`…), avec la version pleine (`fas`, état actif) et la version contour (`far`, état inactif) quand elle existe, et une colonne `iconly` vide à remplir au passage à Iconly Pro (design-prelakay §4 : remplacement mécanique). Actif = icône pleine + pastille de fond à 20 % d'opacité de la même couleur (duotone simulé, 03-design §5.1) ; inactif = contour `neutral-500`.

---

# PARTIE 3 — Phase A : Fondations (06-plan Phase 0, étapes 1, 2 et 2bis)

**Sortie de phase (vérifiable dans le navigateur)** : `/style-guide` montre les tokens, les deux logos, la grille d'icônes et tous les composants de base à 360 px et à 1240 px ; un bouton d'une version future affiche « À venir » 3 s ; `GET /api/release-check/coupons` répond 403 `feature_not_released`.

### Task A0 : Sauvegarde récupérable avant tout (CLAUDE.md règle 6)

**Fichiers :**
- Modifier : `.gitignore`

- [ ] **Step 1 : Exclure les fichiers lourds** (porte G4) — ajouter à `.gitignore` :
```
# Sources de prototypage lourdes / captures tierces — sauvegardées hors dépôt
/prototype/handwritten-prototypage-with-aliexpress-screenshot-page/
/prototype/Screenshot AliExpress/
.superpowers/
```
- [ ] **Step 2 : Vérifier qu'aucun fichier de plus de 20 Mo ni `.env.local` n'est suivi**
Run : `git add -A --dry-run | grep -E "\.env\.local|handwritten|Screenshot"`
Attendu : aucune ligne.
- [ ] **Step 3 : Commit initial sur `main` puis tag**
```bash
git add -A
git commit -m "chore: état initial — scaffold Phase 0, docs, prototype HTML de référence"
git tag prototype-html-v1
git switch -c feat/phase-a-fondations
```
Attendu : `git show --stat prototype-html-v1 -- prototype/prelakay-prototype.html` liste le fichier.

### Task A1 : Dépendances et outillage de test

**Fichiers :**
- Modifier : `package.json`
- Créer : `vitest.config.ts`, `tests/setup.ts`, `playwright.config.ts`, `tests/unit/smoke.test.ts`

**Interfaces :** Produit les scripts `npm test` (Vitest), `npm run test:e2e` (Playwright), `npm run typecheck` (`tsc --noEmit`) utilisés par toutes les tâches.

- [ ] **Step 1 : Mettre à jour les dépendances** (portes G1, G2, G3) — retirer `BoxIcons-react` ; ajouter `@fortawesome/fontawesome-svg-core@^6`, `@fortawesome/free-solid-svg-icons@^6`, `@fortawesome/free-regular-svg-icons@^6`, `@fortawesome/free-brands-svg-icons@^6`, `@fortawesome/react-fontawesome@^0.2` ; devDependencies de G1 ; Next.js selon G3. Puis `npm install`.
- [ ] **Step 2 : Configurer Vitest** — `vitest.config.ts` : environnement `jsdom`, `setupFiles: ['tests/setup.ts']` (qui importe `@testing-library/jest-dom/vitest`), alias `@` → racine, `include: ['tests/unit/**/*.test.ts?(x)']`.
- [ ] **Step 3 : Configurer Playwright** — `playwright.config.ts` : `webServer: { command: 'npm run dev', port: 3000 }`, deux projets : `mobile-360` (viewport 360 × 740) et `desktop-1240` (1280 × 800), `testDir: 'tests/e2e'`.
- [ ] **Step 4 : Test de fumée**
```ts
// tests/unit/smoke.test.ts
it('Vitest tourne', () => { expect(1 + 1).toBe(2); });
```
Run : `npm test` → PASS. Run : `npm run typecheck` → 0 erreur. Run : `npm run build` → build réussi (Serwist compris).
- [ ] **Step 5 : Commit** — `git commit -am "chore: outillage de test, Font Awesome 6, retrait BoxIcons"`

### Task A2 : Formatage fr-FR

**Fichiers :**
- Créer : `lib/format.ts`, `tests/unit/format.test.ts`

**Interfaces :** Produit `formatHTG(amount: number): string`, `formatDistance(km: number): string`, `formatCount(n: number): string`, `formatDate(d: Date, style: 'short'|'long'): string`.

- [ ] **Step 1 : Tests (valeurs reprises de `htg`, `km`, `k` du prototype, ligne ~1577)**
```ts
const NB = ' '; // séparateur des milliers et espace avant l'unité
expect(formatHTG(450000)).toBe(`450${NB}000 HTG`);
expect(formatHTG(1250.4)).toBe(`1${NB}250 HTG`);
expect(formatDistance(0.6)).toBe('600 m');
expect(formatDistance(1.2)).toBe('1,2 km');
expect(formatCount(1240)).toBe('1,2 k');
expect(formatCount(1000)).toBe('1 k');
expect(formatCount(860)).toBe('860');
```
- [ ] **Step 2 : Lancer** `npm test -- format` → FAIL (module absent).
- [ ] **Step 3 : Implémenter** avec `Intl.NumberFormat('fr-FR')`, en remplaçant l'espace fine insécable (U+202F) produite par `Intl` par une espace insécable (U+00A0), comme le prototype.
- [ ] **Step 4 : Lancer** → PASS.
- [ ] **Step 5 : Commit** — `feat(format): montants HTG, distances et compteurs fr-FR`

### Task A3 : Composant `<Logo>`

**Fichiers :**
- Créer : `components/brand/Logo.tsx`, `components/brand/Logo.module.css`, `tests/unit/Logo.test.tsx`

**Interfaces :** Produit `Logo({ variant: 'full' | 'mark', tone: 'lagon' | 'white', height?: number, href?: string, priority?: boolean })` — rend `next/image` (`unoptimized`, SVG) avec `alt="Prélakay"`, enveloppé d'un lien avec `aria-label="Prélakay, accueil"` si `href`.

- [ ] **Step 1 : Tests**
```ts
it('full lagon pointe vers le logo complet', () => {
  render(<Logo variant="full" tone="lagon" height={40} />);
  const img = screen.getByAltText('Prélakay');
  expect(img).toHaveAttribute('src', expect.stringContaining('full-logo-lagon.svg'));
  expect(img).toHaveAttribute('width', String(Math.round(40 * 2324.17 / 772.09))); // 120
});
it('mark white utilise le logo secondary', () => {
  render(<Logo variant="mark" tone="white" height={32} />);
  expect(screen.getByAltText('Prélakay')).toHaveAttribute('src', expect.stringContaining('secondary-logo-white.svg'));
});
it('respecte les tailles minimales (03-design §7.1)', () => {
  render(<Logo variant="full" tone="lagon" height={20} />);
  expect(screen.getByAltText('Prélakay')).toHaveAttribute('height', '32');
  cleanup(); render(<Logo variant="mark" tone="lagon" height={10} />);
  expect(screen.getByAltText('Prélakay')).toHaveAttribute('height', '24');
});
it('avec href, rend un lien accessible', () => {
  render(<Logo variant="full" tone="lagon" href="/" />);
  expect(screen.getByRole('link', { name: 'Prélakay, accueil' })).toHaveAttribute('href', '/');
});
```
- [ ] **Step 2 : Lancer** → FAIL.
- [ ] **Step 3 : Implémenter** — table `{ full: { lagon, white }, mark: { lagon, white } }` vers les 4 fichiers de §2.4, ratios des viewBox, `Math.max(height, min)` avec min = 32 (full) / 24 (mark). Hauteur par défaut : 36 (full), 32 (mark).
- [ ] **Step 4 : Lancer** → PASS.
- [ ] **Step 5 : Commit** — `feat(brand): composant Logo (full = icône + wordmark, mark = secondary)`

### Task A4 : Registre d'icônes et composant `<Icon>`

**Fichiers :**
- Créer : `lib/icons/registry.ts`, `components/ui/Icon.tsx`, `components/ui/Icon.module.css`, `tests/unit/Icon.test.tsx`, `docs/icon-mapping.md` (écrit à la main)
- Modifier : `app/layout.tsx` (import `@fortawesome/fontawesome-svg-core/styles.css` + `config.autoAddCss = false`)

**Interfaces :** Produit `type IconName = keyof typeof ICONS` et `Icon({ name: IconName, active?: boolean, size?: 16|20|24|32, label?: string, className?: string })`. Chaque entrée de `ICONS` : `{ solid: IconDefinition, regular?: IconDefinition, iconly: string | null }`.

- [ ] **Step 1 : Extraire la liste** — `grep -o 'fa-\(solid\|regular\|brands\) fa-[a-z0-9-]*' prototype/prelakay-prototype.html | sort -u` (154 entrées) ; donner à chacune un nom sémantique en kebab-case (ex. `fa-cart-shopping` → `cart`, `fa-diamond-turn-right` → `directions`, `fa-qrcode` → `pickup-qr`, `fa-brands fa-whatsapp` → `whatsapp`). Les icônes de catégorie (`fa-shirt`, `fa-bread-slice`…) gardent un nom `cat-<id>`.
- [ ] **Step 2 : Tests**
```ts
it('décoratif par défaut', () => {
  const { container } = render(<Icon name="cart" />);
  expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
});
it('avec label, est une image nommée', () => {
  render(<Icon name="cart" label="Panier" />);
  expect(screen.getByRole('img', { name: 'Panier' })).toBeInTheDocument();
});
it('inactif = contour, actif = plein + pastille duotone', () => {
  const { container, rerender } = render(<Icon name="heart" />);
  expect(container.querySelector('svg')).toHaveAttribute('data-prefix', 'far');
  rerender(<Icon name="heart" active />);
  expect(container.querySelector('svg')).toHaveAttribute('data-prefix', 'fas');
  expect(container.firstChild).toHaveAttribute('data-active', 'true');
});
it('toutes les entrées du registre ont une icône pleine', () => {
  for (const [k, v] of Object.entries(ICONS)) expect(v.solid, k).toBeDefined();
});
```
- [ ] **Step 3 : Lancer** → FAIL. **Step 4 : Implémenter** (pastille active : `background: color-mix(in srgb, currentColor 20%, transparent)`, rayon `radius-sm`). **Step 5 : Lancer** → PASS.
- [ ] **Step 6 : Écrire `docs/icon-mapping.md`** à la main depuis le registre (aucun outil ajouté) : colonnes Nom sémantique · Font Awesome · Iconly Pro (vide, à remplir au passage à Iconly).
- [ ] **Step 7 : Garde-fou** — ajouter une règle ESLint `no-restricted-syntax` qui interdit les chaînes littérales `fa-solid`/`fa-regular` dans `app/` et `components/`. Run : `npm run lint` → 0 erreur.
- [ ] **Step 8 : Commit** — `feat(ui): registre d'icônes Font Awesome 6 et composant Icon (duotone simulé)`

### Task A5 : Versions, fonctionnalités et garde des données de démo

**Fichiers :**
- Créer : `lib/config/release.ts`, `lib/config/business.ts`, `lib/config/env.ts`, `lib/config/space.ts`, `tests/unit/release.test.ts`, `tests/unit/env.test.ts`, `tests/unit/space.test.ts`, `app/api/release-check/[feature]/route.ts` (route de vérification de la porte, retirée en Phase I)
- Créer : `proxy.ts` (ou `middleware.ts` selon G3)

**Interfaces :**
- `RELEASE_ORDER = ['1', '1.x', '1.1', '2', '3'] as const` ; `type Release` ; `CURRENT_RELEASE: Release = '1'`.
- `FEATURES: Record<FeatureKey, Release>` — **copie exacte** du tableau « Correspondance fonctionnalité → version » du CHANGELOG (clés `auth` … `native_app`, y compris `staff_accounts` et `dispute_center`). Les clés du prototype qui diffèrent (`dark`, `voice`, `photo`, `staff`, `flash`, `plus`) sont renommées vers celles du CHANGELOG.
- `isAvailable(key: FeatureKey, current: Release = CURRENT_RELEASE): boolean`
- `notReleased(): Response` → `403`, corps `{"error":"feature_not_released"}`.
- `FUTURE_ROUTES: Array<{ prefix: string; feature: FeatureKey }>` = `[{ prefix: '/admin/finance', feature: 'platform_finance' }, { prefix: '/admin/events', feature: 'events' }]`.
- `BUSINESS` (dans `business.ts`) : `{ escrowDays: 3, escrowTrustedHours: 24, pickupHoldDays: 3, reminderDays: [1, 2], coinsPerOrder: 50, coinsPerReview: 25, coinsWelcome: null, disputeWindowDays: 3, storeReplyHours: 48, newcomerEvery: 4, maxProductPhotos: 8, maxSkuAxes: 3, pickupCodeLength: 6, minSellerAge: 18, adminMaxFailures: 5, adminSessionHours: 8, adminLockMinutes: null, commissionRate: null, restockFee: null, trustedStoreCriteria: null }` — les `null` sont les points ouverts.
- `assertDataSource(env: { PRELAKAY_ENV?: string; DATA_SOURCE?: string }): 'mock' | 'supabase'` — `PRELAKAY_ENV` ∈ `development` (défaut) | `demo` | `production` ; `DATA_SOURCE` par défaut `mock` hors production.
- `type AppSpace = 'all' | 'acheteur' | 'vendeur' | 'admin'` ; `appSpace(env): AppSpace` (défaut `all`) ; `spaceRoute(space: AppSpace, pathname: string): { action: 'next' } | { action: 'notFound' } | { action: 'redirect'; to: string }` (§1.0), appliqué par le proxy **avant** la garde des versions.

- [ ] **Step 1 : Tests**
```ts
it('V1 : le cœur du pilote est actif', () => {
  for (const k of ['cart', 'click_collect', 'wallet_pay', 'escrow', 'pickup_code', 'coins', 'kyc_seller'] as const)
    expect(isAvailable(k)).toBe(true);
});
it('V1 : les versions suivantes sont « À venir »', () => {
  for (const k of ['coupons', 'flash_offers', 'referral', 'sourcing', 'dark_mode', 'delivery', 'creole', 'phone_otp', 'voice_search', 'native_app'] as const)
    expect(isAvailable(k)).toBe(false);
});
it("l'ordre est 1 < 1.x < 1.1 < 2 < 3 (pas un ordre numérique)", () => {
  expect(isAvailable('coupons', '1.x')).toBe(true);
  expect(isAvailable('sourcing', '1.x')).toBe(false);
  expect(isAvailable('sourcing', '1.1')).toBe(true);
});
it('403 feature_not_released', async () => {
  const r = notReleased(); expect(r.status).toBe(403);
  expect(await r.json()).toEqual({ error: 'feature_not_released' });
});
it('points ouverts jamais chiffrés', () => {
  expect(BUSINESS.commissionRate).toBeNull(); expect(BUSINESS.restockFee).toBeNull(); expect(BUSINESS.coinsWelcome).toBeNull();
});
// env.test.ts — Review Focus n°1
it('refuse les données de démo en production', () => {
  expect(() => assertDataSource({ PRELAKAY_ENV: 'production', DATA_SOURCE: 'mock' })).toThrow(/données de démonstration/);
  expect(() => assertDataSource({ PRELAKAY_ENV: 'production' })).toThrow(/DATA_SOURCE/);
  expect(assertDataSource({})).toBe('mock');
  expect(assertDataSource({ PRELAKAY_ENV: 'demo' })).toBe('mock');
  expect(assertDataSource({ PRELAKAY_ENV: 'production', DATA_SOURCE: 'supabase' })).toBe('supabase');
});
// space.test.ts — §1.0
it('acheteur ne sert ni le vendeur ni l\'admin', () => {
  expect(spaceRoute('acheteur', '/p/mode-0')).toEqual({ action: 'next' });
  expect(spaceRoute('acheteur', '/seller')).toEqual({ action: 'notFound' });
  expect(spaceRoute('acheteur', '/admin/kyc')).toEqual({ action: 'notFound' });
});
it('vendeur : / redirige vers /seller, la connexion reste servie', () => {
  expect(spaceRoute('vendeur', '/')).toEqual({ action: 'redirect', to: '/seller' });
  expect(spaceRoute('vendeur', '/login')).toEqual({ action: 'next' });
  expect(spaceRoute('vendeur', '/cart')).toEqual({ action: 'notFound' });
});
it('admin : seulement /admin', () => {
  expect(spaceRoute('admin', '/')).toEqual({ action: 'redirect', to: '/admin' });
  expect(spaceRoute('admin', '/login')).toEqual({ action: 'notFound' });
  expect(spaceRoute('admin', '/admin/login')).toEqual({ action: 'next' });
});
it('all sert tout, et les fichiers statiques passent toujours', () => {
  expect(spaceRoute('all', '/admin')).toEqual({ action: 'next' });
  expect(spaceRoute('admin', '/logo/_simple/full-logo-white.svg')).toEqual({ action: 'next' });
});
```
- [ ] **Step 2 : Lancer** → FAIL. **Step 3 : Implémenter.** **Step 4 : Lancer** → PASS.
- [ ] **Step 5 : Proxy** — d'abord `spaceRoute(appSpace(process.env), pathname)` (404 via réécriture vers `/_not-found`, ou redirection) ; ensuite, pour chaque `FUTURE_ROUTES`, redirection 307 vers `/?soon=<feature>` (CHANGELOG règle 3 : redirection vers l'Accueil + toast). `app/api/release-check/[feature]/route.ts` renvoie `notReleased()` si `!isAvailable`, sinon `{ok:true}`.
- [ ] **Step 6 : Vérifier** — `npm run dev`, puis `curl -i localhost:3000/api/release-check/coupons` → `403` et `{"error":"feature_not_released"}` ; `curl -i localhost:3000/admin/events` → `307` vers `/?soon=events`.
- [ ] **Step 7 : Cloisonnement des espaces** — règle ESLint `no-restricted-imports` : `components/shop/**` ne peut pas importer `@/components/seller/*` ni `@/components/admin/*`, et réciproquement. Run : `npm run lint` → 0 erreur.
- [ ] **Step 8 : Commit** — `feat(release): versions, espaces, règles chiffrées et garde des données de démo`

### Task A6 : Toast et `<ComingSoon>`

**Fichiers :**
- Créer : `components/ui/Toast.tsx`, `components/ui/Toast.module.css`, `components/ui/ComingSoon.tsx`, `components/ui/SoonFromQuery.tsx`, `tests/unit/Toast.test.tsx`, `tests/unit/utils.tsx` (`renderWithToast(ui)` = `render` dans un `ToastProvider`)
- Modifier : `app/layout.tsx` (monte `<ToastProvider>`)

**Interfaces :** `ToastProvider`, `useToast(): { show(msg: string, kind?: 'info' | 'success' | 'error'): void; soon(): void }` ; `ComingSoon({ feature: FeatureKey, children: ReactElement, asOption?: boolean })` ; `SoonFromQuery()` lit `?soon=` et appelle `soon()` une fois.

- [ ] **Step 1 : Tests (fake timers)**
```ts
it('« À venir » 3 s, région live polie', () => {
  vi.useFakeTimers(); renderWithToast(<ComingSoon feature="coupons"><a href="/coupons">Mes coupons</a></ComingSoon>);
  fireEvent.click(screen.getByText('Mes coupons'));
  expect(screen.getByRole('status')).toHaveTextContent('À venir');
  act(() => vi.advanceTimersByTime(3000));
  expect(screen.queryByText('À venir')).not.toBeInTheDocument();
});
it('empêche la navigation et ne change rien', () => {
  const onClick = vi.fn(); renderWithToast(<ComingSoon feature="coupons"><button onClick={onClick}>X</button></ComingSoon>);
  fireEvent.click(screen.getByText('X')); expect(onClick).not.toHaveBeenCalled();
});
it('fonctionnalité disponible : laisse passer', () => {
  const onClick = vi.fn(); renderWithToast(<ComingSoon feature="cart"><button onClick={onClick}>X</button></ComingSoon>);
  fireEvent.click(screen.getByText('X')); expect(onClick).toHaveBeenCalled();
});
it('option grisée (asOption) : aria-disabled + toast', () => {
  renderWithToast(<ComingSoon feature="delivery" asOption><button>Livraison</button></ComingSoon>);
  expect(screen.getByText('Livraison')).toHaveAttribute('aria-disabled', 'true');
});
```
- [ ] **Step 2 : Lancer** → FAIL. **Step 3 : Implémenter** (clic intercepté en phase de capture ; un seul toast à la fois, le suivant remplace le précédent comme `toast()` du prototype ; icône `clock` pour « À venir », `circle-check` succès, `circle-exclamation` erreur ; `role="status"`). **Step 4 : Lancer** → PASS.
- [ ] **Step 5 : Commit** — `feat(ui): toast et ComingSoon (CHANGELOG règle 2-3)`

### Task A7 : Composants de base

**Fichiers :**
- Créer dans `components/ui/` : `Button`, `Field`, `Card`, `Tag`, `Price`, `Stars`, `EmptyState`, `Modal`, `BottomSheet`, `Tabs`, `RoundCheck`, `QtyStepper` (+ `.module.css`) ; `tests/unit/ui.test.tsx`
- Modifier : `app/globals.css` (ajouter les tokens de mise en page du prototype : `--max: 1240px`, `--cols`, `--margin`, `--gut`, `--hdr: 72px`, `--tabbar: 58px`, `--dur: 180ms`, `--ease`, et les écarts §1.2 n° 1-2 commentés « 🟡 écart à valider »)

**Interfaces :**
- `Button({ variant: 'primary' | 'outline' | 'ghost' | 'dark', size?: 'md' | 'sm', loading?, ...ButtonHTMLAttributes })` — primaire : 48 px, `radius-sm`, padding 16 px, fond `lagon-500`, texte `#fffaf7` 13 px Medium, hover `lagon-700`, disabled `neutral-300` / `neutral-500`, **sans ombre**.
- `Field({ label, error?, hint?, ...InputHTMLAttributes })` — 48 px, bordure 1 px `neutral-300`, focus 2 px `lagon-500` + halo `lagon-100` 40 % ; erreur : fond `error` 8 %, texte `error`, icône `danger`, texte actionnable.
- `Price({ amount, was? })` (via `formatHTG`, prix barré en Caption), `Stars({ value })` (demi-étoiles : règle `r >= i - .25` plein, `r >= i - .75` demi, sinon vide — fonction `stars` du prototype).
- `QtyStepper({ value, min = 1, max, onChange })`.

- [ ] **Step 1 : Tests** — `Button` désactivé n'émet pas de clic et a `aria-disabled` ; `Field` relie l'erreur via `aria-describedby` ; `Stars({value: 4.6})` rend 4 pleines + 1 demie ; `Stars({value: 4.1})` rend 4 pleines + 1 vide ; `QtyStepper` ne descend pas sous `min` et ne dépasse pas `max` (bouton « + » désactivé à `max`) ; `Modal` ferme sur `Escape` et rend le focus à l'élément déclencheur.
- [ ] **Step 2 : Lancer** → FAIL. **Step 3 : Implémenter** en portant le CSS correspondant du prototype (section « 3. composants », lignes ~60-260). **Step 4 : Lancer** → PASS.
- [ ] **Step 5 : Commit** — `feat(ui): composants de base (design-prelakay §8.4)`

### Task A8 : Style guide et vérification de sortie de phase

**Fichiers :**
- Modifier : `app/style-guide/page.tsx`
- Créer : `tests/e2e/style-guide.spec.ts`

- [ ] **Step 1 : Test e2e**
```ts
test('style guide : logos, icônes, composants, pas de défilement horizontal', async ({ page }) => {
  await page.goto('/style-guide');
  await expect(page.getByAltText('Prélakay').first()).toBeVisible();
  await page.getByRole('button', { name: 'Mes coupons' }).click();
  await expect(page.getByRole('status')).toHaveText(/À venir/);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});
```
- [ ] **Step 2 : Lancer** `npm run test:e2e -- style-guide` → FAIL (le bouton n'existe pas).
- [ ] **Step 3 : Étendre la page** : sections Logos (les 4 variantes sur leurs fonds autorisés), Icônes (grille du registre, actif / inactif), Composants (A7), démo « À venir ».
- [ ] **Step 4 : Lancer** → PASS sur `mobile-360` et `desktop-1240`.
- [ ] **Step 5 : Vérification manuelle** : ouvrir `/style-guide` à 360 px et 1240 px ; `curl` de A5 Step 6.
- [ ] **Step 6 : Commit + fin de phase** — `git commit -m "feat: style guide complet — sortie de Phase A"` ; ouvrir la PR `phase-a-fondations` → `main` ; mettre à jour `CHANGELOG.md` « Non publié ».

---

# PARTIE 4 — Phases B à I (feuille de route par tâche)

Format de chaque tâche : **livrable vérifiable**, fichiers principaux, fonctions du prototype à porter, règles du domaine à tester d'abord, test e2e de sortie. Chaque phase est détaillée au format de la Phase A avant son démarrage.

## Ordre par projet (§1.0)

| Projet | Jalon 1 : prototype abouti → branche | Jalon 2 : production aboutie → branche |
|---|---|---|
| **1. Acheteur** | A + B0-B6 + **B6b** → `acheteur` (démo) | C + D1-D2 + E (lecture) + F (côté acheteur) + G (côté acheteur) + I → `acheteur` |
| **2. Espace vendeur** | B7 + graphiques vendeur de B9 + **B7b** → `vendeur` (démo) | E2 + F4-F5 + G (réponses) + H → `vendeur` |
| **3. Espace admin** | B8 + graphiques admin de B9 + **B8b** → `admin` (démo) | D3 + E1 + modération, KYC, litiges, contenu sur la base → `admin` |

Le jalon 2 de l'Acheteur ne peut pas précéder celui du Vendeur pour le Click & Collect (un store doit marquer la commande prête) : les Phases C à I avancent donc **domaine par domaine sur les trois espaces à la fois**, et chaque branche reçoit la fusion de `main` dès que son espace passe le jalon. Le lancement public (I7) suppose les trois jalons 2 atteints.

## Phase B — Prototype Next.js interactif complet (adaptateur `mock`)

**Sortie** : toutes les routes de §2.2 existent, sont navigables à 360 px et à 1240 px, et chaque action du prototype marche sur les données de démonstration (ajouter au panier, payer, préparer, valider un retrait, approuver un KYC…). `npm run test:e2e` couvre un parcours par espace.

**Décisions d'exécution de la Phase B (8 nov. 2026)** — demande : « pages et sous-pages identiques au prototype, layout respecté à 100 %, images hébergées (Unsplash) + Font Awesome en placeholder ».
- **CSS** : la feuille du prototype (lignes 13-1458) est reprise **telle quelle** dans `app/proto.css` (globale), plus `app/proto-next.css` pour les seuls ajouts Next (logo image, image sur tuile). Elle prime sur les styles des composants de la Phase A pour tout l'écran acheteur, vendeur et admin.
- **Balisage** : chaque fonction `page*` du prototype devient un composant qui produit le même HTML (mêmes classes, même ordre). `<Icon>` rend un élément `<i>` pour que les sélecteurs `… i` du prototype s'appliquent.
- **Icônes des données** : les données gardent les classes Font Awesome du prototype (`lib/`), converties par `<DataIcon>` via le registre (pas de classe en dur dans `app/` ni `components/`).
- **Images** : `lib/data/mock/images.ts` associe produits, stores et bannières à des photos `images.unsplash.com` vérifiées ; `<Ph>` pose l'image sur la tuile Font Awesome, qui reste visible pendant le chargement ou en cas d'échec.
- **État de démo** : comme le prototype, panier, wishlist, commandes, notifications vivent côté navigateur (`localStorage`, clés `pk-*`) derrière les ports de `lib/data/ports.ts` ; l'adaptateur Supabase implémentera les mêmes ports via des Server Actions. Remplace le pilote « mémoire serveur + cookie » prévu en B0 (plus simple, et identique sur Vercel / Netlify).

**B0 — Données de démo et adaptateur mock.**
`lib/data/mock/seed.ts` porte **à l'identique** `CATS`, `STORES`, `NAMES`, `CAT_STORE`, le générateur pseudo-aléatoire (`seed = 11`, `seed = (seed * 9301 + 49297) % 233280`), `optsOf` (axes de caractéristiques), `stockFor` (stock par combinaison), `DEMO_ORDERS`, `BANNERS`, `REVS`, `HELP`, `FAQ`, `ADMINS`, `BUYERS` : mêmes produits, mêmes prix que le prototype. `lib/data/mock/store.ts` garde l'état, un dépôt par port, avec deux pilotes de persistance : `memory` (`globalThis.__pk`, développement et tests) et `cookie` (déploiements `PRELAKAY_ENV=demo` sur Vercel / Netlify, où les instances serverless ne partagent pas leur mémoire : seul le **delta** du visiteur — panier, wishlist, commandes, KYC — est stocké dans un cookie signé ≤ 3,5 Ko, la base étant regénérée à l'identique par le seed déterministe). En démo seulement, une commande affiche un bouton « Simuler l'étape suivante (démo) » pour faire avancer son statut sans l'espace vendeur. `lib/auth/mock.ts` lit le cookie `pk_demo` posé par `/demo` (personas : visiteur, acheteur, vendeur KYC approuvé, vendeur KYC en attente, admin ×4 rôles). Tests : 60 produits générés (8 catégories, avant les ajouts vendeur) ; `prodBy('mode-0').price` identique au prototype ; une combinaison épuisée renvoie 0 ; `/demo` répond 404 si `DATA_SOURCE=supabase`.

**B1 — Coques et navigation.** Supprimer `app/page.tsx` (« Hello Prélakay ») au profit de `app/(shop)/page.tsx`. `DesktopHeader` (`renderHeader`, `megaFill` : ligne 1 collante, recherche, Télécharger l'app « À venir », Ville / langue / devise, menu Compte, Panier avec compteur ; ligne 2 sur l'accueil ; panneau « Toutes les catégories »), `MobileTop` (`renderMTop`), `TabBar` (`renderTabbar` : Accueil · Catégories · Panier · Compte, uniquement sur ces 4 pages), `Footer` (desktop seulement), rail flottant. Gardes : `requireUser()` redirige vers `/login?next=<chemin>`. Tests e2e : la barre d'onglets n'apparaît que sur les 4 racines ; aucune destination en double par niveau (03-design §9.1) ; **Review Focus n° 3** : `/cart` en visiteur → `/login?next=/cart` → connexion → retour sur `/cart`.

**B2 — Découverte.** Accueil (bannières, raccourcis ronds, bande de confiance, Près de vous, Nouveaux sur Prélakay, Prêts à retirer, Pour vous + « Voir plus »), `/discover`, `/search` (autocomplétion produits / stores / catégories avec partie tapée en gras), `/categories`, `/map` (carte stylisée du prototype ; vraie carte en E3). Domaine : `rankProducts(list, { newcomerEvery: 4 })` — test : au moins un produit « Nouveau » toutes les 4 positions quand il en existe ; filtres prix, distance, note, disponibilité ; tris. Recherche vocale, par photo, code-barres : icônes visibles + « À venir ».

**B3 — Produit et store.** Fiche produit (galerie, encadré prix, caractéristiques, quantité, stock bas, panneau d'achat collant desktop, ancres, avis + filtres, Q&R, Signaler, partage WhatsApp en premier / copier / QR), `/p/[id]/reviews`, `QuickView` (desktop) et `SkuSheet` (mobile), page store à 6 onglets + Promos « À venir ». Domaine : `selectSku(product, choice)` — tests : choix épuisé non sélectionnable ; sélection initiale = première combinaison en stock (`selOf`) ; libellé « Écru · 160 cm · 140 cm » (`selLabel`) ; 0 axe → ajout direct.

**B4 — Panier, paiement, confirmation, panier partagé.** Panier groupé par store (cases rondes tout / store / article, puce de caractéristiques modifiable, récapitulatif collant, « Commander (n) », code promo « À venir »), paiement (Retrait en magasin actif, Livraison grisée « À venir », point de retrait par store, wallet, total, Payer), confirmation (une commande par store, « Reçue »), `/shared/[id]` (consultation + « Payer ce panier »). Domaine `lib/domain/checkout.ts` : `cartTotals`, `splitByStore`, `placeOrder` — tests : une commande par store ; **Review Focus n° 2** : stock passé à 0 entre-temps → erreur « Cet article n'est plus disponible dans ce choix. Modifiez-le ou retirez-le. », aucun débit ; solde insuffisant → erreur actionnable, aucun débit ; **Review Focus n° 5** : même `idempotencyKey` deux fois → une seule commande.

**B5 — Compte acheteur.** `/account` (barre latérale desktop, aperçu, compteurs de commandes, en-tête mobile + grille Services), commandes (onglets, recherche n° / produit / store, période, Copier le n°), détail commande + **carte de retrait** (code 6 chiffres en Onest SemiBold 32 px espacé, QR, adresse, itinéraire, compte à rebours de 3 jours, rappel des frais de restockage *[À CONFIRMER]*), avis après retrait, ouverture de litige, wallet (solde, recharge, payer le panier d'un proche, historique — **sans « escrow »**), Coins, wishlist, vus récemment, centre de messages, paramètres (6 sections ; Créole et Mode sombre « À venir »), retours et litiges, mes avis, aide + articles. Domaine : `disputeAllowed(order, now)` (3 jours après retrait), `disputeNeedsPhoto(reason)` (vrai pour « non conforme » et « endommagé »). **Review Focus n° 4** : e2e qui visite toutes les routes acheteur et vérifie que `escrow` n'apparaît nulle part dans le texte.

**B6 — Entrée et devenir vendeur.** `/intro` (3 écrans max, « Passer » dès le premier), `/login` et `/signup` (e-mail + mot de passe, Google ; téléphone « À venir »), choix de 2-3 catégories, Coins de bienvenue affichés seulement si `BUSINESS.coinsWelcome` n'est pas `null`, `/sell` (KYC : nom, prénom, date de naissance, NIF, NINU, pièce recto / verso ; suivi Reçu → En vérification → Approuvé / Rejeté avec motif). Domaine : `isAdult(birthDate, today)` — tests : 18 ans la veille de l'anniversaire = refusé, le jour même = accepté.

**B6b — Livraison du Projet 1 Acheteur (démo).** Bandeau « Données de démonstration » (`PRELAKAY_ENV=demo`) ; e2e complet avec `APP_SPACE=acheteur` (`/seller` et `/admin` → 404 ; « Espace vendeur » pointe vers `NEXT_PUBLIC_URL_VENDEUR`) ; `npm run build` réussi ; `git switch acheteur && git merge --ff-only main` (la branche est créée depuis `main` la première fois) ; site Vercel ou Netlify avec branche de production `acheteur` et variables `APP_SPACE=acheteur`, `PRELAKAY_ENV=demo`, `DATA_SOURCE=mock`, `DEMO_COOKIE_SECRET`. Vérifiable : l'URL de démo ouvre l'accueil sur mobile et desktop, un achat de démo va jusqu'à la confirmation.

**B7 — Espace vendeur** (03-design §9.10). `SellerShell` (menu `SMENU`, onglets mobile Accueil · Commandes · Produits · Messages · Plus), accueil (checklist « Prêt à vendre », À faire, solde, performances 7 j), produits (6 statuts, tableau, actions), formulaire produit (catégorie 2 niveaux, 8 photos max, vidéo, jusqu'à 3 axes, **stock par combinaison**, prix / prix barré, cycle Brouillon → En modération → Actif), stock, commandes (Reçue « À préparer » → En préparation → Prête pour retrait → Retirée ; annulation avant retrait), valider un retrait, litiges (48 h ; rembourser, partiel, contester), finances et retraits (MonCash, NatCash, Sogebank ; commission « — »), avis, questions, messages + réponses rapides, profil du store, horaires, politique de retour (3 jours minimum), store de confiance (critères *[À CONFIRMER]*), partage (lien, WhatsApp, QR, affiche), marketing « À venir », employés « À venir ». Domaine `lib/domain/fulfillment.ts` : `nextStatus(current, action)` — tests : transitions autorisées seulement ; `ready` génère un code de 6 chiffres ; `validatePickup` avec un mauvais code → refus sans changer le statut ; `cancel` après `done` → refus ; `releaseAt(pickedUpAt, trusted)` = +3 jours ou +24 h. e2e de bout en bout : l'acheteur paie → le vendeur prépare → marque prête → l'acheteur voit le code → le vendeur le valide → la commande passe « Retirée » des deux côtés.

**B7 — détail d'exécution (10 nov. 2026)** — même méthode que l'Acheteur : CSS et balisage du prototype (fonctions `s*`, lignes 2183-2618), données identiques, état de démo partagé avec l'acheteur.
- **Routes** (`app/seller/…`, hors du groupe `(shop)`) : `/seller`, `/seller/menu`, `/seller/products`, `/seller/products/new`, `/seller/products/[id]`, `/seller/stock`, `/seller/orders`, `/seller/orders/[id]`, `/seller/pickup`, `/seller/disputes`, `/seller/disputes/[id]`, `/seller/marketing`, `/seller/share`, `/seller/finance`, `/seller/payouts`, `/seller/reviews`, `/seller/questions`, `/seller/messages`, `/seller/messages/[id]`, `/seller/stats`, `/seller/store`, `/seller/policy`, `/seller/trust`, `/seller/account`, `/seller/notifications`.
- **État** : tranche `seller` dans `DemoState` (objet `SL` du prototype : store géré, politique, moyen de retrait, retraits, stock par combinaison, réponses, conversations, commandes de démo, produits créés ou modifiés et leur statut, notifications vendeur). Les commandes de l'acheteur apparaissent chez le store, et chaque changement de statut prévient l'acheteur (03-design §9.10).
- **Domaine** (`lib/demo/seller.ts`, testé, référence générée depuis le prototype comme pour le seed) : `combos`, `stockTotal`, `sellerOrders`, `fin`, `kpis`, `todo`, transitions de commande (`prep` → `ready` avec code à 6 chiffres → `done` ; annulation avant retrait ; non-retrait = stock remis), `validateCode`, litiges (total, partiel ≤ total, escalade), `saveProduct` (validations et cycle Brouillon → En modération → Actif).
- **Lots** : V1 état + domaine + coque (menu latéral, onglets mobiles, accès KYC) + accueil · V2 produits, formulaire, stock · V3 commandes, détail, retrait, litiges · V4 finances, retraits · V5 avis, questions, messages · V6 marketing, partage, profil, politique, store de confiance, compte, notifications, menu · V7 kit de graphiques SVG (B9) + statistiques + graphiques de l'accueil et des finances · V8 e2e de toutes les routes (360, 390, 768, 1240 px) + livraison B7b.
- **Écarts déjà fixés** : logo complet / icône secondary (règle 1-2), lot « polish » (boutons, onglets, popovers, toast, liens) appliqué aussi au vendeur ; « Enregistrer son commerce ».

**B7b — Livraison du Projet 2 Vendeur (démo).** Même procédure que B6b avec `APP_SPACE=vendeur` et la branche `vendeur`. En démo, le persona vendeur reçoit des commandes de démonstration du seed (`BUYERS`, `sellerOrders` du prototype), puisque l'acheteur est sur un autre déploiement.

**B8 — Console admin** (03-design §9.11). `/admin/login` (e-mail @prelakay.ht, mot de passe, « Rester connecté 8 heures », code à 6 chiffres, mot de passe oublié au message neutre, blocage après 5 échecs ; pas d'inscription), `AdminShell` (barre `lagon-900` avec `<Logo full white>`, recherche globale, badge du rôle, menu groupé Validation · Opérations · Contenu · Système), toutes les pages de §2.2. Domaine `lib/domain/admin.ts` : `PERM` copié du prototype, `can(role, section)` — tests : Marketing sur `/admin/kyc` → « Accès refusé » ; Finance lit `/admin/settings` sans pouvoir modifier ; seul Superadmin modifie les paramètres ; 5ᵉ échec → blocage ; route admin sans session → `/admin/login?next=…`. NIF / NINU masqués dans les listes.

**B8b — Livraison du Projet 3 Admin (démo).** Même procédure avec `APP_SPACE=admin` et la branche `admin` ; en démo, la connexion utilise les identifiants fictifs du prototype (`DEMO_PW`, `DEMO_OTP`), lus depuis des variables d'environnement, jamais en dur.

**B9 — Graphiques maison.** Porter `vzLine`, `vzCols`, `vzHBars`, `vzDiverge`, `vzHeat`, `vzCohort`, `vzFunnel`, `vzSeg`, `vzMeter`, `vzSpark`, `vzTile`, `vzBubbles` en composants SVG `'use client'` dans `components/charts/`, plus `DataTable` (« Voir les données ») et le filtre 7 / 30 / 90 jours. Brancher le catalogue de 03-design §9.13 (vendeur accueil, statistiques 5 onglets, sparklines produits, finances ; admin tableau de bord, statistiques 🟡). Tests : infobulle au focus clavier ; tableau présent sous chaque graphique ; colonnes ≤ 24 px ; une étiquette d'axe sur deux sous 768 px. `recharts` n'est installé que si G8 le valide et qu'un graphique maison ne suffit plus.

**B10 — Sortie de Phase B.** Passe d'accessibilité (axe manuel : focus, contrastes, zones de 44 px) ; e2e « aucune page en débordement horizontal à 360 px » sur toutes les routes de §2.2 ; tag `prototype-next-v1`. Mettre à jour `02-app-flow.md` §6 (routes Next.js) et le CHANGELOG.

## Phase C — Base de données (porte G5 + G6)

**C1 — Projet Supabase** (région Europe, deux projets : `staging` et `production`) et CLI Supabase pour les migrations (`supabase/migrations/`). Vérifiable : `supabase db diff` vide sur staging.
**C2 — Migration du schéma**, proposée en un fichier relu par Marc-Karlin avant application : tables de `05-backend.md` utiles à la V1 (pas `coupons`, `events_promos`, `flash_offers`, `referrals`, `delivery_riders`, `sourcing_orders` : V1.x et suivantes), énumérations reprises des statuts du prototype (`order_status`: received, prep, ready, done, expired, cancelled ; `product_status`: draft, mod, active, rejected, archived — « rupture » est calculée, pas stockée ; `kyc_status`: recu, verif, ok, rej ; `dispute_status`: open, escalated, done), montants en centimes `bigint`, wallet en **grand livre** (`wallet_transactions` en écritures signées, solde = somme, contrainte « jamais négatif » dans la fonction de paiement), `escrow` lié à la commande, index sur les colonnes de recherche et de distance. RLS activée partout selon G5.
**C3 — Seed staging** (`supabase/seed.sql`) : mêmes stores et produits que le mock, **marqués démo**, jamais exécuté en production.
**C4 — Adaptateur Supabase** : implémenter les ports domaine par domaine dans `lib/data/supabase/`, avec les **mêmes tests de contrat** que le mock (`tests/contract/*.test.ts` exécutés contre les deux adaptateurs : c'est ce qui garantit que l'UI ne change pas).
Sortie : `DATA_SOURCE=supabase npm run dev` affiche le catalogue de staging ; les tests de contrat passent sur les deux adaptateurs.

## Phase D — Authentification réelle (06-plan Phase 2 étapes 6-7, Phase 3 étape 8)

**D1 — BetterAuth** (porte G8) dans Next.js sur Postgres Supabase : e-mail + mot de passe, Google ; `lib/auth/index.ts` garde l'interface de `lib/auth/mock.ts` (`getSession`, `requireUser`, `requireStoreOwner`, `requireAdmin(role)`). Vérifiable : compte réel créé, aucun domaine acheté.
**D2 — Profil** `@username` unique (validation, unicité), avatar parmi `public/images/avatar/3D Avatars`, Coins à 0. Vérifiable : `/account` affiche le profil.
**D3 — Admin** : comptes créés par un Superadmin uniquement, deuxième facteur selon G7, blocage après 5 échecs (durée *[À CONFIRMER]*), session de 8 h, journal d'activité. Vérifiable : un compte acheteur reçoit « Accès refusé » sur `/admin`.

## Phase E — Catalogue et découverte sur la base (06-plan Phases 4-5)

**E1 — Catégories** (2 niveaux) + gabarits d'attributs (admin). **E2 — Formulaire produit vendeur** : photos dans Supabase Storage (bucket public `products`, redimensionnées côté client avant envoi, 8 max), cycle Brouillon → En modération → Actif via la modération admin. **E3 — Fiche, recherche, filtres, classement** sur Postgres (recherche plein texte `french` + trigrammes, distance depuis la ville de retrait), quota « Nouveaux sur Prélakay » ; carte Google Maps (porte G8). Vérifiable : jalons 11 à 16 de `06-plan.md`.

## Phase F — Panier, wallet, Click & Collect (06-plan Phases 6-7, cœur du pilote)

**F1 — Panier persistant** en base. **F2 — Recharge wallet** : MonCash **sandbox** d'abord (REST via `fetch`, vérification de la transaction côté serveur au retour, jamais sur la seule redirection) ; autres passerelles selon *[À CONFIRMER]*, affichées « bientôt » tant qu'inactives. **F3 — Paiement** : fonction Postgres `place_order(user, cart_snapshot, idempotency_key)` en une transaction (verrou des lignes de stock, refus si épuisé, débit du wallet, création des commandes par store, mise en escrow) — **Review Focus n° 2 et 5** retestés contre la vraie base. **F4 — Fulfillment** : statuts, code à 6 chiffres + vrai QR (`qrcode`), notifications in-app + e-mail (Resend) + WhatsApp vendeur (Callmebot) + push « Prête pour retrait » (`web-push`). **F5 — Validation du retrait** (saisie du code, ou scan via `BarcodeDetector`), reçu numérique, date de libération d'escrow. **F6 — Tâches planifiées** (porte G10) : libération d'escrow, rappels J+1 / J+2, non-retrait après 3 jours (remboursement et remise en stock ; frais de restockage = `null` tant que *[À CONFIRMER]* → **remboursement intégral** en attendant, à valider explicitement). Vérifiable : jalons 17 à 23 de `06-plan.md`.

## Phase G — Confiance, Coins, liens partageables (06-plan Phases 8-9)

**G1** Avis vérifiés (commande retirée obligatoire, multi-critères, réponse du store, signalement) et Q&R. **G2** Signalements + file de modération admin. **G3** Coins (50 par commande, 25 par avis ; bienvenue seulement une fois le montant validé). **G4** Liens partageables (produit, panier en consultation, store) avec OG dynamique via `next/og` (intégré à Next, pas de dépendance), WhatsApp en premier, QR pour les stores physiques. **G5** Litiges (fenêtre de 3 jours, photo obligatoire selon le motif, réponse du store sous 48 h, escalade admin, remboursement wallet uniquement). Coupons : **non construits** tant que le conflit PRD (V1.x) / `06-plan.md` (Phase 9) n'est pas tranché ; ils restent « À venir ».

## Phase H — Dashboard vendeur complet et statistiques (06-plan Phase 10)

**H1** Vues ou fonctions RPC d'agrégats (05-backend « Agrégats », accord requis) ; un vendeur ne lit que son store. **H2** Brancher les graphiques de B9 sur ces agrégats. **H3** Centre financier : disponible, en escrow, retiré, retraits vers MonCash / NatCash / Sogebank (frais *[À CONFIRMER]*). Les visites et les recherches sans résultat supposent un suivi d'événements *[À CONFIRMER]* : affichés « — » d'ici là. Vérifiable : jalons 29-30.

## Phase I — Prêt au lancement (06-plan Phase 11)

**I1 — Performance réseau lent** : budget à fixer avec Marc-Karlin (*[À CONFIRMER]* dans le TRD ; proposition : JS initial < 170 Ko compressés sur l'accueil, LCP < 2,5 s en « Slow 4G » Lighthouse) ; texte et prix avant les images ; `next/image` AVIF / WebP ; lazy-load ; graphiques et carte via `next/dynamic`. **I2 — PWA** : manifeste, page hors ligne, cache Serwist des pages catalogue déjà vues ; test « couper le réseau, recharger ». **I3 — Sécurité** : `/security-review`, en-têtes (CSP sans CDN), tests de droits sur chaque port (un vendeur ne lit pas les commandes d'un autre store, un acheteur ne lit pas le wallet d'un autre), bucket KYC privé à URL signées lisibles par l'admin seulement, limitation de débit sur connexion et paiement, retrait de `/api/release-check`. **I4 — Exploitation** : sauvegardes Supabase, journal d'erreurs, page de statut des tâches planifiées, procédure de retour arrière. **I5 — Légal** : CGU et politique de confidentialité, durée de conservation (*[À CONFIRMER]*, 05-backend). **I6 — Production** : déploiement sur l'hébergeur validé, `DATA_SOURCE=supabase`, domaine, Resend relié au SPF existant (jamais un second `v=spf1`). **I7 — Pilote** : onboarding de 20 à 30 stores, puis ouverture aux acheteurs de Les Cayes ; critère de sortie : une commande réelle de bout en bout (achat → retrait → avis). Publier `V1.0.0` dans le CHANGELOG.

## Hors de ce plan (ordre de `06-plan.md` inchangé)

- **Landing page v1 « ads »** (06-plan Phase 1) : prévue **avant** le PWA. Elle n'est pas dans le repo ; à faire dans une session dédiée, ou à signaler si elle existe ailleurs.
- **Landing finale** (Phase 11bis), Dispute Center complet, events, flash-offers, badges, sourcing international (V1.1, ne rien coder avant les décisions), livraison, Prelakay+, Flutter.
