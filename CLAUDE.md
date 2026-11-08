# CLAUDE.md — Prelakay

Ce fichier encadre **tout** travail de Claude Code sur ce repo. Il n'est pas une liste de suggestions : chaque règle ci-dessous existe parce qu'elle a déjà empêché, ou aurait empêché, un retour en arrière coûteux sur ce projet. Les suivre n'est pas optionnel — c'est ce qui permet au pilote Les Cayes de rester faisable avec zéro budget marketing et un calendrier serré (PWA complet avant fin décembre, voir `06-plan.md`).

## Source de vérité
Toute décision produit vit dans :
- `docs/01-prd.md`, `02-app-flow.md`, `03-design.md`, `04-trd.md`, `05-backend.md`, `06-plan.md`
- `docs/design-prelakay.md` v1.1 — **source de vérité visuelle** (couleurs, polices, ton) : prévaut sur `03-design.md` en cas d'écart
- `CHANGELOG.md` — **ce qui marche dans chaque version** (V1 pilote, V1.x, V1.1, V2, V3)
- Les spécifications originales 00 à 09 (vision & modèle économique, opérations/dashboards/livraison, liens partageables, recherche & découverte, confiance & sécurité, onboarding & activation, click & collect, catalogue & fiche produit, stratégie de lancement), référencées dans `00-super-prompt-prelakay.txt`

Si une information ne se trouve dans **aucun** de ces fichiers, elle n'existe pas pour Claude Code. Ce n'est pas une contrainte bureaucratique : c'est ce qui évite qu'un produit ne dérive, feature après feature, vers quelque chose que Marc-Karlin n'a jamais validé — et qu'il faille ensuite défaire.

## Règles

1. **Ne jamais coder une fonctionnalité absente du PRD (`01-prd.md`).** En cas de doute, citer la section concernée plutôt que deviner. Une fonctionnalité inventée coûte toujours plus cher à retirer qu'à ne pas construire.
2. **Respecter strictement la légende ✅ Décidé / 🟡 Proposé / ⚠️ Ouvert / [À CONFIRMER].** Ne jamais trancher silencieusement un point ⚠️ Ouvert ou [À CONFIRMER] — même si la réponse semble évidente, même pour « juste avancer ». Un point marqué ouvert qui se retrouve codé en dur devient une dette qu'il faut ensuite détricoter dans la base de données, pas juste dans le texte.
3. **Suivre l'ordre du plan d'implémentation (`06-plan.md`) — une étape à la fois.** Chaque étape doit être vérifiable dans le navigateur avant de passer à la suivante, et une fois figée, elle ne se retouche pas en passant. L'ordre actuel (29 oct 2026) : landing v1 rapide pour les ads → **PWA complet, deadline fin décembre** → dashboard admin minimal en parallèle → landing finale soignée. Si une étape semble bloquante ou mal ordonnée, le signaler — ne pas réordonner le plan de son propre chef.
4. **Ne jamais renommer ou refondre un terme déjà établi** (Coins, Points de confiance, Points de fidélité, Store Health Score, escrow, Click & Collect) sans le signaler explicitement comme un changement. Un renommage silencieux casse la cohérence entre le code, les specs et ce que Marc-Karlin a en tête — et génère des bugs de communication, pas seulement de code.
5. **Aucune nouvelle dépendance sans validation explicite de Marc-Karlin. Aucun changement de base de données sans accord. Aucune clé en dur dans le code** — toujours via variables d'environnement (voir `04-trd.md`). Ces trois interdits protègent la règle du « un outil par besoin, gratuit autant que possible » qui structure tout le TRD — une dépendance ajoutée sans validation casse ce principe silencieusement.
6. **Avant toute réécriture large d'un fichier ou d'un prototype existant, s'assurer qu'une version antérieure reste récupérable.** Le prototype original a déjà été perdu une fois sur ce projet — c'est précisément pour ça que cette approche spec-driven existe. Ne pas reproduire l'erreur.
7. **Référence produit constante : AliExpress** pour les mécaniques marketplace. S'écarter du modèle uniquement pour les adaptations haïtiennes déjà documentées (wallet locale, géolocalisation des stores physiques, retrait en magasin, angle diaspora, et désormais le sourcing international v1.1 — voir ci-dessous).
8. **Avant un gros travail (nouveau build, réécriture, fonctionnalité majeure) : poser au maximum 3 questions ciblées plutôt que deviner puis livrer un résultat hors cible.** Trois bonnes questions coûtent minutes ; un livrable hors cible coûte une session entière à refaire.
9. **Versions et toast « À venir »** : tout l'écran est construit dès la V1 (comme le prototype), mais seules les fonctionnalités de la version en cours marchent. Une fonctionnalité d'une version suivante reste visible et affiche le toast « À venir » ; l'API la refuse. Voir `CHANGELOG.md`.

## Décisions récentes (7 nov 2026 — plan de construction)

Plan de référence : `docs/superpowers/plans/2026-11-07-prelakay-prototype-to-launch.md`.
- ✅ **3 projets en 1** : une application Next.js, trois projets déployables — **Acheteur**, **Espace vendeur**, **Espace admin** — construits dans cet ordre. Chaque projet abouti est fusionné depuis `main` dans **sa branche** (`acheteur`, `vendeur`, `admin`), surveillée par son site Vercel ou Netlify ; la variable `APP_SPACE` limite les routes servies (plan §1.0).
- ✅ **Ordre de construction** : toute l'interface d'abord sur données de démonstration, puis branchement Supabase domaine par domaine (écart assumé avec `06-plan.md`, dont les jalons restent les critères de sortie).
- ✅ **Accès aux données (option A)** : lecture et écriture uniquement côté serveur, droits vérifiés dans les dépôts, RLS activée sans politique (la clé anon ne lit rien). Remplace la RLS par rôle de `05-backend.md`, incompatible telle quelle avec BetterAuth.
- ✅ **Dépendances** : Font Awesome 6 Free en SVG local (`@fortawesome/*`, remplace BoxIcons) ; tests : Vitest, Testing Library, Playwright (devDependencies, choix délégué à Claude Code) ; Next.js 16.x (aligné sur `04-trd.md`).
- ✅ **Logo** : `full-logo-*` (icône + wordmark) = logo principal ; `secondary-logo-*` quand seule l'icône tient ; favicon et icônes d'app inchangés (`logo-primary-*`, design-prelakay §6).
- ✅ Données de démonstration autorisées seulement avec `PRELAKAY_ENV=demo` (bandeau visible) ; refusées avec `PRELAKAY_ENV=production`.

## Décisions récentes (6 nov 2026)

- **Navigation (7 nov. 2026)** : desktop = header AliExpress ; mobile = coque de l'app AliExpress avec barre d'onglets plate Accueil · Catégories · Panier · Compte (remplace la pill nav de design-prelakay.md et la décision du 6 nov.). Aucune entrée en double (03-design §9.2 et §9.2 bis). Couleurs et polices inchangées.
- **Icônes du prototype : Font Awesome 6 Free** (remplace BoxIcons). Production : Iconly Pro selon design-prelakay §4, *[À CONFIRMER]*.
- **Espace vendeur (7 nov. 2026)** : structure du Seller Center AliExpress, dans le même prototype que l'acheteur, après KYC approuvé ; tout le plan (V1 + Phase 10), le reste en « À venir » (03-design §9.10).
- **Espace admin (7 nov. 2026)** : console avec connexion fictive (mot de passe + code à 6 chiffres), 4 rôles (Superadmin, Support, Finance, Marketing), dans le même prototype (03-design §9.11).
- **Graphiques des dashboards (7 nov. 2026)** 🟡 : nombreux graphiques vendeur et admin (catalogue et règles : 03-design §9.13). Production proposée : `recharts` + `@vis.gl/react-google-maps` pour la carte (04-trd « Graphiques des dashboards ») — **à valider par Marc-Karlin avant toute installation** (règle 5). Palette des graphiques 🟡 : extension, couleurs de marque inchangées. Les objectifs affichés (90 % de retrait, 2 h de préparation) sont *[À CONFIRMER]*.
- **Escrow** : terme et montants réservés aux vendeurs et à l'admin ; l'acheteur ne voit que « argent protégé » (03-design §9.12).
- **Mobile partout** : chaque page acheteur, vendeur et admin doit fonctionner dès 360 px de large.
- **Caractéristiques produit (SKU)** : jusqu'à 3 axes (couleur, taille, longueur, largeur…), stock par combinaison, choix modifiable au panier (03-design §9.4 bis).
- ✅ **Ton : vouvoiement partout** (aligné sur `design-prelakay.md` v1.1 ; `03-design.md` corrigé).
- ✅ **v1 mobile + desktop** (point ⚠️ de `02-app-flow.md` §5.2 tranché par Marc-Karlin).
- ✅ **Règle de version** : tout construire, seule la version en cours est active, le reste affiche « À venir » (`CHANGELOG.md`).
- ✅ **Prototype acheteur** `prelakay-prototype.html` : référence de structure (AliExpress) et d'identité (Prélakay), pas du code de production.

## Décisions récentes (29 oct 2026)
- ✅ **Authentification : BetterAuth** (ou équivalent self-hosted — bibliothèque exacte 🟡 à confirmer), intégré directement dans Next.js sur la base Postgres Supabase. Décidé explicitement pour éviter d'acheter un domaine dédié au service d'auth. Voir `04-trd.md`.
- ✅ **Ordre de build inversé** : PWA avant la landing page complète (deadline fin décembre), avec une landing v1 rapide vibecodée en amont pour les ads. Voir `06-plan.md`.
- 🟡 **Nouvelle feature v1.1 proposée : sourcing international** (Shein/Amazon/Temu — achat pour le compte du client, prix tout compris produit + taxes + livraison, visible dans son historique de commandes). Scope v1.1, pas v1 — **ne pas commencer à coder avant que les points ci-dessous soient tranchés.** Voir `01-prd.md` §3 et `05-backend.md`.

## Décisions encore ouvertes (ne pas trancher sans validation de Marc-Karlin)
- Taux de commission exact (fourchette 5-10%)
- Frais de retrait wallet (proposé puis refusé pour l'instant)
- Float de trésorerie wallet (étude légale requise avant toute exploitation)
- Formule exacte du Store Health Score
- Protection anti-abus du bonus de parrainage (500 Coins)
- Recherche vocale : v1 ou backlog v2
- Montant des frais de restockage en cas de non-retrait Click & Collect, et à qui ils reviennent
- **Sourcing international (v1.1)** : mécanisme d'achat réel (API fournisseur vs. achat manuel), calcul des taxes/droits de douane, marge appliquée, qui porte le risque en cas de rupture/produit différent, et structure exacte de la table `sourcing_orders`

Un point qui disparaît de cette liste doit d'abord apparaître, daté, dans la section « Décisions récentes » ci-dessus — jamais l'inverse.
