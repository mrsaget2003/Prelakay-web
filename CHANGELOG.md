# CHANGELOG · Prélakay

*Créé le 6 nov. 2026 · Dérivé de `docs/01-prd.md` §3, `docs/06-plan.md` et `docs/CLAUDE.md` · Référence visuelle : `prelakay-prototype.html`*

Légende des docs conservée : ✅ Décidé · 🟡 Proposé · ⚠️ Ouvert · **[À CONFIRMER]**. Ce fichier **ne tranche aucun point ouvert** (CLAUDE.md règle 2) : il les signale là où ils bloquent une version.

---

## Règle : tout construire, n'activer que la version en cours

1. **Toute l'interface est construite dès la V1**, comme dans le prototype : menus, onglets, boutons, sections. Rien n'est caché.
2. **Seules les fonctionnalités de la version en cours marchent.** Toute fonctionnalité d'une version suivante (V1.x, V1.1, V2, V3) reste visible, et son action affiche le **toast `À venir`** (pastille d'information neutre, 3 secondes).
3. **Où le toast se déclenche** :
   - bouton, lien, onglet ou entrée de menu d'une version future : clic → toast, aucune navigation, l'onglet actif ne change pas ;
   - adresse d'une version future ouverte directement : redirection vers l'Accueil + toast ;
   - option d'un choix (ex. « Livraison » au paiement) : visible, grisée, clic → toast.
4. **Jamais de fausses données en production** pour remplir une fonctionnalité non livrée.
5. **Mise en œuvre** (`06-plan.md` étape 2bis) : `src/config/release.ts` avec `CURRENT_RELEASE` et la version de chaque fonctionnalité ; `isAvailable(feature)` côté serveur et client ; composant `<ComingSoon>` autour des déclencheurs ; middleware sur les routes ; l'API répond `403 feature_not_released`. **Passer à la version suivante = changer une valeur.**

---

## Non publié

### En cours : V1 · Pilote Les Cayes
Ordre de construction : `docs/06-plan.md` (landing v1 « ads » → PWA complet, deadline fin décembre → dashboard admin minimal en parallèle → landing finale). Plan détaillé : `docs/superpowers/plans/2026-11-07-prelakay-prototype-to-launch.md` (3 projets en 1 : Acheteur → Espace vendeur → Espace admin, une branche Git chacun).

#### Phase A — Fondations (8 nov. 2026, branche `feat/phase-a-fondations`)
- Next.js 16 (build webpack pour Serwist), tests Vitest + Testing Library + Playwright (360 px et desktop).
- Logo : `<Logo>` avec les vrais fichiers (complet = icône + wordmark ; icône seule = secondary), tailles minimales 32 / 24 px.
- Icônes : Font Awesome 6 Free en SVG local (148 icônes du prototype), registre unique et table `docs/icon-mapping.md` pour Iconly Pro.
- Versions : `lib/config/release.ts` (clés de ce CHANGELOG), toast « À venir » 3 s, `<ComingSoon>`, redirection des pages futures vers l'accueil, API `403 feature_not_released`.
- Espaces : `APP_SPACE` (acheteur, vendeur, admin, all) ; données de démo refusées au démarrage avec `PRELAKAY_ENV=production`.
- Composants de base (bouton, champ, carte, étiquette, prix, étoiles, état vide, modale, feuille du bas, onglets, case ronde, quantité) et style guide `/style-guide`.

#### Phase B — Projet 1 Acheteur, prototype abouti (9 nov. 2026, branche `feat/phase-b-acheteur`)
- Toutes les pages et sous-pages acheteur du prototype en Next.js (43 adresses testées) : accueil, Discovery et recherche (filtres, tri, quota « Nouveaux sur Prélakay »), carte des stores, catégories, fiche produit (caractéristiques, stock par combinaison, panneau d'achat, ancres, avis, questions), page store (6 onglets + Promos « À venir »), panier, paiement, confirmation, panier partagé, compte, commandes et carte de retrait, wallet, Coins, wishlist, Enregistrer sa Commerce (KYC), messages, paramètres (6 sections), aide et articles, vus récemment, litiges, mes avis, connexion, inscription, intro.
- Layout identique au prototype : CSS du prototype repris tel quel, même balisage ; vrai logo complet ; photos Unsplash (vérifiées, sans marque visible) posées sur les tuiles Font Awesome.
- Données de démonstration identiques au prototype (vérifiées par test) ; état de démo dans le navigateur.
- Paiement idempotent (un double clic ne paie qu'une fois) ; choix épuisé refusé au paiement ; « escrow » jamais affiché à l'acheteur.

#### Prototype complet (10-11 nov. 2026, branche `feat/phase-b9-prototype-complet`)
Décision de Marc-Karlin (10 nov. 2026, `CLAUDE.md`) : dans le prototype de démonstration (`PRELAKAY_ENV=demo`), **toutes les versions sont actives** sauf l'application native, le sourcing et le créole. **Ce CHANGELOG reste la règle de mise en production** : avec `PRELAKAY_ENV=production`, seule la V1 est active et le tableau « Limites de la V1 » s'applique (nettoyage au branchement Supabase).
- Versions : `releaseFor()` → `all` en démo, `1` en production ; `HELD_IN_PROTOTYPE` = natif, sourcing, créole.
- **Livraison** dès le lancement (ajoutée à la V1, voir PRD §3) : choix par store au paiement, suivi, remise au livreur, page admin Livraisons. ⚠️ frais, zones, paiement du livreur, escrow : valeurs de démo.
- Pages **partenaire de paiement / de livraison** + file Admin → Partenaires.
- Graphiques **Nivo** ; **carte des ventes** du Sud et des Cayes (% et montant).
- Toasts **Sileo**, triés (pas de toast quand le résultat se voit à l'écran).
- Coupons, offres flash 24 h, events, produits boostés, badges, parrainage *(anti-abus ⚠️ non implémenté)*, ambassadeurs, Prélakay+, téléphone + SMS, comptes employés, recherches vocale / photo / code-barres, Dispute Center, finances plateforme *(commission ⚠️ non calculée)*, mode sombre — actifs en démo.
- Mouvement : maintenir pour confirmer, carrousel Embla, apparition progressive, montants NumberFlow.
- Dépendances validées : `@nivo/*`, `sileo`, `motion`, `@number-flow/react`, `vaul`, `embla-carousel-react`.

---

## V1 · Pilote Les Cayes · *à venir*

**Objectif (PRD §5)** : 20 à 30 stores pilotes actifs, des commandes Click & Collect retirées en magasin, l'escrow libéré automatiquement après validation du code de retrait.

### Fonctionnel en V1 (côté acheteur)

**Navigation (✅ 7 nov. 2026)**
- Desktop : header AliExpress (recherche, Télécharger l'app « À venir », Ville/langue/devise, menu Compte, Panier ; « Toutes les catégories » + raccourcis sur l'accueil).
- Mobile : coque de l'app, barre d'onglets Accueil · Catégories · Panier · Compte ; pages secondaires avec retour. Aucune entrée en double.
- Fiche produit : panneau d'achat collant (Engagement Prélakay), sections par ancres, page de tous les avis.
- Caractéristiques (couleur, taille, longueur, largeur…) avec stock par combinaison ; bouton panier des cartes : ajout direct ou aperçu rapide / feuille de choix ; choix modifiable au panier.
- Stores : un seul modèle (bandeau, recherche dans le store, Accueil · Produits · Meilleures ventes · Nouveautés · Avis · À propos).
- Compte : barre latérale AliExpress, aperçu, commandes avec recherche, centre de messages, paramètres, vus récemment, retours et litiges, mes avis, articles d'aide.

**Espace vendeur (✅ 7 nov. 2026, structure Seller Center AliExpress)**
- Accès après KYC approuvé ; checklist « Prêt à vendre ».
- Produits : statuts (brouillon, modération, actif, rupture, rejeté, archivé), formulaire avec caractéristiques et stock par combinaison.
- Commandes : préparer, marquer prête (code + QR), valider le retrait (code ou scan), annuler, non-retrait ; litiges (48 h, remboursement total ou partiel, escalade).
- Finances : solde, escrow, transactions, retraits MonCash / NatCash / Sogebank.
- Avis (réponses), questions (réponses publiques), messagerie, notifications.
- Statistiques (Phase 10), profil du store, horaires, politique de retour, store de confiance, partage du store.

**Espace admin (✅ 7 nov. 2026)**
- Connexion fictive : e-mail @prelakay.ht, mot de passe, code à 6 chiffres, mot de passe oublié, blocage après 5 échecs ; rôles Superadmin, Support, Finance, Marketing avec accès refusé hors rôle.
- Validation : KYC (approuver / rejeter avec motif), modération des produits, signalements, litiges escaladés.
- Opérations : stores (confiance, avertissement, suspension), utilisateurs (bannissement), commandes (annulation et remboursement).
- Contenu : bannières de l'accueil, notifications, catégories et gabarits d'attributs. Système : équipe et rôles, paramètres, journal d'activité.

**Graphiques des dashboards (🟡 7 nov. 2026)**
- Vendeur : tuiles avec tendance sur l'accueil ; Statistiques en 5 onglets (Ventes, Trafic, Acheteurs, Produits, Opérations) avec filtre 7 / 30 / 90 jours ; sparklines dans la liste des produits ; 3 graphiques dans Finances.
- Admin : tableau de bord avec tuiles, commandes par statut et jauge du pilote ; page **Statistiques** 🟡 (hors PRD v1, à valider) ; aperçu des finances plateforme (V2, données de démonstration).
- Infobulles au survol et au clavier, tableau « Voir les données » sous chaque graphique, mobile dès 360 px.
- Production : `recharts` + `@vis.gl/react-google-maps` proposés dans `04-trd.md`, **non installés sans validation** (CLAUDE.md règle 5). Catalogue : `03-design.md` §9.13.
- Objectifs affichés *[À CONFIRMER]* : taux de retrait 90 %, préparation 2 h pour un store de confiance.

**Wallet acheteur** : plus de mention « escrow » ni de montant « en escrow » (réservé aux vendeurs) ; on parle d'« argent protégé ».

**Compte**
- Inscription et connexion : e-mail + mot de passe, ou Google (BetterAuth ✅, bibliothèque exacte 🟡). Rien de non indispensable demandé à l'inscription.
- Intro (3 écrans max, « Passer »), choix de 2-3 catégories, Coins de bienvenue *(montant [À CONFIRMER], 20-30 proposé)*.
- Profil `@username`, hub du compte, wishlist, paramètres, centre d'aide.
- **Enregistrer sa Commerce** : formulaire KYC (nom, prénom, date de naissance ≥ 18 ans, NIF, NINU, pièce recto/verso) et suivi du dossier (Reçu → En vérification → Approuvé / Rejeté avec motif).

**Découverte**
- Accueil : bannières de l'admin, raccourcis de catégories, Près de vous, **Nouveaux sur Prélakay**, Prêts à retirer aujourd'hui, Pour vous.
- Discovery : arbre de catégories (2 niveaux), filtres prix / distance / note / disponibilité, tri, classement avec quota « Nouveaux sur Prélakay ».
- Recherche avec autocomplétion (produits, stores, catégories).
- Carte des stores physiques et liste par distance.

**Produit et store**
- Fiche produit : galerie, variantes à stock indépendant, indicateur de stock bas, « X vendus », avis vérifiés multi-critères avec réponse du vendeur et signalement, Q&R publique, politique de retour.
- Profil store : physique (géolocalisé) ou virtuel, Store de confiance, itinéraire, QR code.
- **Liens partageables** : produit, panier (mode consultation), profil store — WhatsApp en priorité, QR code pour les stores physiques.

**Achat**
- Panier multi-store.
- **Click & Collect**, seul mode de fulfillment : retrait store par store, statuts Reçue → En préparation → Prête pour retrait → Retirée, **code 4-6 chiffres + QR**, délai de 3 jours, rappels J+1 et J+2, non-retrait → remboursement partiel *(frais de restockage [À CONFIRMER])* et remise en stock.
- **Wallet** : recharge (MonCash, NatCash, Sogebank ; diaspora : Wise, Stripe, Meru — passerelles actives au jour 1 [À CONFIRMER]), paiement du panier, **escrow** (libération 3 jours, 24 h pour un store de confiance), **payer le panier d'un proche**, historique.
- **Coins** : 50 par commande, 25 par avis, bonus de bienvenue, bonus de retrait en magasin.
- Reçu numérique, avis après retrait, ouverture d'un litige dans les 3 jours (motif, photo obligatoire si non conforme ou endommagé, remboursement vers le wallet uniquement).

**Notifications** : in-app (+ push pour « Prête pour retrait »), e-mail (Resend), WhatsApp vendeur (Callmebot).

### Limites de la V1 (visibles, toast « À venir »)

| Élément visible | Prévu en | Ce que voit l'acheteur |
| --- | --- | --- |
| Coupons (hub du compte, champ « Code promo » au paiement, onglet Promos d'un store, coupon de bienvenue d'un store) | V1.x | Toast « À venir » |
| Flash-offers 24 h, events / promos globaux | V1.x | Toast « À venir » |
| Badges (VIP, stores par points de confiance) | V1.x | Toast « À venir » |
| Inviter des amis / parrainage *(500 Coins, anti-abus ⚠️)* | V1.x | Toast « À venir » |
| Programme ambassadeurs étudiants | V1.x | Toast « À venir » |
| « Produits du monde » (sourcing Shein / Amazon / Temu) | V1.1 🟡 | Toast « À venir » |
| Mode sombre | V1.1 | Toast « À venir » |
| Option « Livraison » au paiement, suivi de livreur | V2 | Option grisée, toast « À venir » |
| Prelakay+ (abonnement) | V2 | Toast « À venir » |
| Créole (langue) | V2 | Option grisée, toast « À venir » |
| Inscription par téléphone + code SMS | V2 | Toast « À venir » |
| Recherche vocale *(⚠️ v1 ou v2 : non tranché)*, recherche par photo, scan de code-barres | V2 | Icône visible, toast « À venir » |
| Produits boostés | V2 | Aucun affichage côté acheteur |
| Vendeur : créer des coupons, offres flash, participer aux events | V1.x | Cartes Marketing « À venir » |
| Vendeur : mettre en avant un produit (boost payant) | V2 | Carte Marketing « À venir » |
| Vendeur : comptes employés | V2 | « Ajouter un employé » « À venir » |
| Admin : events et flash-offers | V1.x | Entrée de menu « V1.x », page « À venir » |
| Admin : finances plateforme (GMV, commissions, escrow en circulation) | V2 | Entrée de menu « V2 », page « À venir » |
| Vendeur : livraison à domicile | V2 | Ligne « Livraison » « À venir » dans le formulaire produit |
| Application mobile native | V3 | Bandeau « Télécharger l'app » : toast « À venir » |

### Points ouverts qui bloquent la V1
- ⚠️ Taux de commission (5-10 %).
- ⚠️ Frais de restockage en cas de non-retrait, et à qui ils reviennent.
- ⚠️ Formule du Store Health Score (le prototype affiche seulement « Store de confiance »).
- [À CONFIRMER] Montant des Coins de bienvenue.
- [À CONFIRMER] Passerelles de paiement actives au lancement.
- 🟡 Dépendances des graphiques (`recharts`, `@vis.gl/react-google-maps`) : validation de Marc-Karlin attendue.
- 🟡 Page Statistiques admin : hors PRD v1 (dashboard admin minimal) ; à garder en V1 ou à reporter.
- ⚠️ **Coupons vendeurs** : le PRD les classe en v1.x, mais `06-plan.md` les place en Phase 9, **avant** l'ouverture du pilote. À trancher : V1 ou V1.x. En attendant, ce CHANGELOG suit le PRD (V1.x).

---

## V1.x · Au fil du pilote · *à venir*

- **Coupons** créés par les vendeurs (pourcentage, seuil, code à 6 chiffres) et code promo au paiement.
- **Flash-offers** de 24 h (seuil de points de confiance), **events / promos globaux** avec exonération de commission.
- **Badges** : acheteurs VIP, stores par seuil de points de confiance.
- **Parrainage** *(protection anti-abus ⚠️)* et **programme ambassadeurs étudiants** (récompensé en Coins).
- **Dispute Center complet** côté admin.

## V1.1 · Sourcing international et confort · *à venir*

- 🟡 **Sourcing international** (Shein, Amazon, Temu) : produit acheté par Prélakay pour le client, prix tout compris (produit + taxes + livraison vers Haïti), visible dans l'historique comme une commande normale. **Ne pas coder avant que soient tranchés** : mécanisme d'achat, délai affiché, taxes et douane, marge, risque de rupture, impact sur l'escrow, table `sourcing_orders`.
- **Mode sombre** (tokens déjà compatibles, `design-prelakay.md` §7).

## V2 · Phase 2 · *à venir*

- **Livraison Prélakay** : flotte de chauffeurs sur invitation, KYC livreur, PWA livreur, suivi en temps réel.
- **Prelakay+** : abonnement à 1 500 HTG / mois, badge or, réductions et events exclusifs.
- **Créole** en plus du français.
- **Inscription par téléphone + code SMS**, **comptes staff** multi-utilisateurs par store.
- **Recherche vocale** *(⚠️ peut remonter en V1)*, recherche par photo, scan de code-barres.
- **Produits boostés** et **dashboard financier plateforme** (GMV, commissions, escrow en circulation, retraits en attente).

## V3 · Application native · *à venir*

- **Application Flutter** (mobile et tablette), dernier livrable de la roadmap.

---

## Correspondance fonctionnalité → version (`src/config/release.ts`)

| Clé | Version |
| --- | --- |
| `auth`, `intro`, `profile`, `wishlist`, `help`, `kyc_seller` | 1 |
| `home`, `discover`, `search`, `map`, `product`, `store`, `share_links` | 1 |
| `cart`, `click_collect`, `wallet_topup`, `wallet_pay`, `pay_for_relative`, `escrow` | 1 |
| `orders`, `pickup_code`, `receipt`, `reviews`, `qa`, `report`, `dispute_open`, `coins` | 1 |
| `coupons`, `flash_offers`, `events`, `badges`, `referral`, `ambassadors`, `dispute_center` | 1.x |
| `sourcing`, `dark_mode` | 1.1 |
| `delivery`, `prelakay_plus`, `creole`, `phone_otp`, `staff_accounts`, `voice_search`, `photo_search`, `barcode`, `boost`, `platform_finance` | 2 |
| `native_app` | 3 |

---

## Modèle pour publier une version

```markdown
## V1.0.0 · Pilote Les Cayes · 2026-MM-JJ

### Ajouté
- …

### Modifié
- …

### Corrigé
- …

### Toujours « À venir »
- (lignes restantes du tableau « Limites de la V1 »)
```

Correctifs : `V1.0.1`… La version suivante s'active quand **toutes** ses fonctionnalités sont prêtes et testées : on change `CURRENT_RELEASE`, on retire les lignes concernées du tableau des limites, on publie l'entrée datée.
