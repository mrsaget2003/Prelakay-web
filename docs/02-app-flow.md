# 02 — App Flow

Légende : ✅ Décidé | 🟡 Proposé | ⚠️ Ouvert | **[À CONFIRMER]**
Référence visuelle : prototypes Excalidraw fournis séparément — `prototypage-mobile-01_excalidraw_2.svg` (mobile) et `desktop-prototype-02_excalidraw.svg` (desktop, maquette de référence basée sur l'IA d'AliExpress). Synthèse intégrée en section 5.

## 1. Pages & accès

| Page | Visiteur | User connecté | Business (vendeur approuvé) | Admin |
|---|---|---|---|---|
| Landing page | ✅ | ✅ | ✅ | ✅ |
| Splashscreen → Intro (3 écrans max) | ✅ | une fois | — | — |
| Login / Signup | ✅ | — | — | — |
| Accueil / Discover / Map | lecture seule | ✅ | ✅ | — |
| Fiche produit | lecture seule | achat possible | — | — |
| Panier | redirigé vers login | ✅ | ✅ | — |
| Compte (commandes, wishlist, coupons, help…) | redirigé vers login | ✅ | ✅ | — |
| "Enregistrer sa Commerce" (devenir vendeur) | redirigé vers login | ✅ | — (déjà vendeur) | — |
| Dashboard vendeur | — | — | ✅ (après approbation KYC) | — |
| Dashboard admin | — | — | — | ✅ |

**Règle de navigation ✅ Décidé** : le visiteur non connecté peut parcourir librement l'app (Discover, fiches produit, profils business). Tout achat, toute ouverture du panier, ou tout accès à une donnée personnelle/stockée en base requiert un compte — redirection vers Login/Signup, retour au point de départ après connexion.

~~**Barre de navigation mobile** : pill nav + panier flottant.~~ ~~6 nov. : pas de barre du bas.~~
**✅ Décidé (7 nov. 2026) : comme l'app AliExpress.** Mobile : barre d'onglets plate **Accueil · Catégories · Panier · Compte**, visible seulement sur ces 4 pages ; les autres pages ont une flèche retour. Desktop : header AliExpress (03-design §9.2). Aucune destination en double dans un même niveau de navigation.

## 2. Parcours clé, clic par clic

### 2.1 Inscription → premier achat
1. Splashscreen → jusqu'à 3 écrans d'intro, un par pilier (géolocalisation, paiement wallet, Coins/récompenses) — bouton "Passer" visible dès l'écran 1
2. Signup (email + mot de passe, ou Google)
3. Compte créé → redirection Accueil
4. Suggestion de 2-3 catégories ("Qu'est-ce qui vous intéresse ?") pour personnaliser le fil
5. Coins de bienvenue crédités **[À CONFIRMER montant exact, 20-30 proposé]**
6. Écran promo "avant-entrée" (si event actif) — affiché une seule fois par session, pas à chaque ouverture
7. Parcourt Discover → fiche produit → sélectionne une variante → ajoute au panier
8. Panier → checkout → choix "Retrait en magasin" (seul mode v1) → paiement via wallet → écran de confirmation
9. Si aucun achat sous 24h : une notification unique avec offre de bienvenue limitée dans le temps

### 2.2 Devenir vendeur
1. Compte → "Enregistrer sa Commerce"
2. Formulaire KYC : Nom, Prénom, date de naissance (≥18 ans), NIF, NINU, upload pièce d'identité recto/verso
3. Dossier examiné par les admins — statut visible en temps réel : Reçu → En vérification → Approuvé / Rejeté (avec motif)
4. Si approuvé : notification app + WhatsApp (Callmebot) + email
5. Checklist "Prêt à vendre" : ajouter son premier produit, définir sa politique de retour, ajouter un moyen de paiement pour les retraits
6. Dashboard vendeur devient accessible depuis Compte

### 2.3 Click & Collect (achat avec retrait en magasin) — cœur du v1
1. Au checkout, "Retrait en magasin" apparaît comme option uniquement pour les stores physiques du panier — store par store si le panier contient plusieurs stores
2. Paiement via wallet → fonds placés en escrow
3. Le store reçoit la commande dans son Fulfillment Center : Reçue → En préparation → Prête pour retrait (pas d'étape "remise au livreur")
4. Dès "Prête pour retrait" : notification (in-app + push) avec code 4-6 chiffres, QR code, et itinéraire vers le store
5. Rappels avant échéance : J+1 ("votre commande vous attend"), J+2 ("il reste 1 jour, sinon frais de restockage")
6. Acheteur se présente en magasin, le store valide via scan QR ou saisie du code → statut "Retiré"
7. Escrow libéré au vendeur (3 jours, ou 24h pour un store de confiance) ; reçu numérique généré, consultable dans Compte → Historique
8. Si non retiré après 3 jours : remboursement partiel (frais de restockage **[À CONFIRMER]**), unité automatiquement remise en stock

> Séquence écran détaillée (mobile, groupe G du prototype) : Fiche produit (G1) → galerie/variante (G2-G5, badge "Ugged Case"/couleur) → Reviews (G13) → guides & documents de l'item (G4) → sélection variante avec confirmation retrait ("Are you sure you want to remove the selected item?") → Add to cart → Panier (D1, liste par store, "Shipped by <store>") → Shipping address (D3, formulaire adresse + ville + tax ID) → Promo code (écran dédié avec clavier numérique) → récap paiement avec total → confirmation. Le paiement par carte (Visa) peut être ajouté depuis "Add new card" (F3/Visa). Référence desktop équivalente : Cart (C1-C3) → Shipping address (D1-D2 desktop) → Payment (carte + QR code) → Summary & "Pay now" (page de résumé finale avec Subtotal/Promo code/Shipping fee/Total).

### 2.4 Litige (Dispute Center)
1. Acheteur ouvre un litige depuis sa commande (fenêtre : 3 jours après réception, alignée sur la politique de retour)
2. Motif obligatoire (non reçu / non conforme / endommagé / autre) + preuve photo obligatoire pour "non conforme"/"endommagé"
3. Vendeur répond sous 48h via la messagerie du dashboard
4. Accord entre les parties → remboursement (partiel/total) vers le wallet de l'acheteur, jamais en cash
5. Désaccord ou silence → escalade automatique vers un admin, qui tranche à partir du code de preuve de retrait, des photos et de l'historique de messages

## 3. États qu'on n'oublie pas (sur toute liste/page)
- **Vide** : aucun produit/commande/avis — message explicite + action suggérée (confirmé par l'écran I(3) du prototype : "No orders in this account" avec illustration + CTA)
- **Chargement** : texte et prix affichés avant la fin du chargement des images (contrainte data mobile) ; images compressées, lazy-load
- **Erreur** : paiement refusé, upload KYC échoué, variante tombée en rupture au moment du checkout
- **Succès** : confirmation de commande, confirmation de retrait, confirmation KYC
- **Retour arrière** : depuis une fiche produit ou une notification, retour au point d'origine (Discover, panier, Compte)

## 4. [À CONFIRMER]
- Diagramme Excalidraw référencé dans les spécifications d'origine — ✅ fourni (voir section 5) ; les parcours visuels exacts sont maintenant intégrés ci-dessous. Reste à confirmer : montant exact des Coins de bienvenue, frais de restockage en cas de non-retrait.

## 5. Parcours visuels (prototypes Excalidraw)

Les deux fichiers fournis sont des wireframes annotés (captures d'app existantes — AliExpress — retravaillées : éléments à retirer marqués d'un ❌, flux à ajouter indiqués par flèches rouges/oranges/bleues/vertes). Ils servent de référence d'architecture d'info et de layout, pas de design final Prélakay.

### 5.1 Mobile (`prototypage-mobile-01`)

| Groupe | Écrans | Contenu / rôle |
|---|---|---|
| **Home** | B(1)–B(3) | Accueil : recherche, bannière promo (clic → B(2) page promo "X% OFF" avec coupons "Collect"), sections "Dollar Express"/"SuperDeals" marquées ❌ à retirer, catégories rapides (For you, Auto&moto, Tech&Toys, Home&DIY, Beauty&Hair), bandeau coupon, "Local picks" (scroll down → B(3) plus de produits) |
| **Discovery tab** | C(1)–C(2) | Grille produits filtrable par catégorie (pills en haut) ; sélection d'une catégorie change le fil produit |
| **Cart tab** | D(1)–D(6) | Panier groupé par store ("Shipped by <store>"), édition quantité, scroll down → récap + "Choose your location" (D3) → formulaire adresse (D4, ville/tax ID) |
| **Store profile** | — | Page publique d'un vendeur : tabs Home / All items / New arrivals / Sale, bouton Follow, icônes chat & partage, catégories (iPhone/Samsung/Xiaomi/Huawei/Airpods case), "Picked for you", **popup "Welcome! I'm in" / coupon de bienvenue 1er achat** déclenché à l'entrée sur le store |
| **Fiche produit → Checkout** | G(1)–G(13) | Galerie variantes → reviews & notes → guides/documents du produit → confirmation de sélection variante → Add to cart → Panier → adresse de livraison → **code promo (écran dédié + clavier)** → récap total → paiement |
| **Mon compte (hub)** | E(1)–E(7) | Hub avec icônes de statut commande (à payer / à expédier / à recevoir / à évaluer), coupons, raccourcis (adresses, paiements, paramètres), "Shop coupons" |
| **Profil / édition** | I(1)–I(2) | Édition des infos perso, adresses, "My orders" |
| **Historique commandes** | I(3)–I(6) | État vide ("No orders in this account") / liste commandes complétées ("Track my order", "Buy again") / détail commande & avis |
| **Paramètres, aide, paiement** | F(1)–F(7) | Ajout carte (Visa), Help Center (FAQ par thème : livraison, retours, compte, commande, coupons, politiques), notifications, "Invite friends" / suggestions |
| **Partage produit** | G(9)–G(12) | Écran de partage (WhatsApp, Instagram, Facebook, X/Twitter) depuis une fiche produit |

### 5.2 Desktop (`desktop-prototype-02`) — référence de structure uniquement

Basé sur l'interface AliExpress desktop, annoté pour servir de base à la v1 desktop (si/quand une version desktop est développée) :
- **A(1)–A(5)** : page d'accueil (bandeau promo, "Shop by category", sections produits, scroll long)
- **B / B(1) / B(2)** : menu déroulant catégories depuis le header
- **C(1)–C(3)** : panier latéral (summary, "Place order")
- **D(1)–D(9)** : tunnel checkout — sélection adresse de livraison (QR code visible sur un écran, à clarifier si lié au retrait en magasin) → formulaire adresse → paiement (carte + méthodes) → paramètres de compte (sidebar : account / orders / addresses / payment / security)
- **Page finale** : récapitulatif de commande (Shipping address, Payment method, Subtotal/Promo code/Shipping fee/Total, bouton "Pay now")

~~⚠️ Ouvert : confirmer si une version desktop est bien au scope du v1.~~ ✅ **Décidé (6 nov. 2026)** : la v1 cible **mobile et desktop**. Voir CLAUDE.md « Décisions récentes ».

## 6. Prototype interactif acheteur (6 nov. 2026)

`prelakay-prototype.html` (HTML, CSS et JS intégrés) montre tout le parcours acheteur, en mobile et en desktop, avec la structure d'AliExpress et l'identité de `design-prelakay.md` v1.1. Il sert de **référence visuelle et de parcours**, pas de code de production. Ce qui n'est pas en V1 est visible mais affiche le toast « À venir » (voir `CHANGELOG.md`).

| Route du prototype | Page | Accès | Version |
| --- | --- | --- | --- |
| `#/intro` | 3 écrans d'intro (géolocalisation, wallet, Coins) + « Passer » | Première visite | V1 |
| `#/login`, `#/signup` | Connexion / inscription (e-mail + mot de passe, Google) | Visiteur | V1 |
| `#/` | Accueil | Tous | V1 |
| `#/discover` | Discovery : pastilles de catégories, filtres (prix, distance, note, disponibilité), tri | Tous | V1 |
| `#/map` | Carte des stores physiques + liste par distance | Tous | V1 |
| `#/search?q=` | Résultats ; l'autocomplétion (produits, stores, catégories) s'ouvre depuis la barre de recherche | Tous | V1 |
| `#/p/:id` | Fiche produit | Tous (achat : compte requis) | V1 |
| `#/store/:id` | Profil public d'un store | Tous | V1 |
| `#/categories` | Catégories (onglet de l'app) : colonne de catégories, sous-catégories, stores, populaires | Tous | V1 |
| `#/p/:id/reviews` | Tous les avis d'un produit, filtres | Tous | V1 |
| `#/store/:id/:onglet` | Store : accueil, products, top, new, reviews, about ; `?q=` recherche dans le store | Tous | V1 |
| `#/cart` | Panier groupé par store, caractéristiques modifiables | Compte | V1 |
| `#/checkout` | Retrait en magasin + paiement wallet | Compte | V1 |
| `#/done/:id` | Confirmation | Compte | V1 |
| `#/orders`, `#/orders/:id` | Commandes, code et QR de retrait, reçu, avis, litige | Compte | V1 |
| `#/wallet` | Solde, recharge, payer le panier d'un proche, escrow, historique | Compte | V1 |
| `#/coins` | Solde et gains de Coins | Compte | V1 |
| `#/wishlist` | Wishlist | Compte | V1 |
| `#/account` | Hub du compte | Compte | V1 |
| `#/sell` | Enregistrer sa Commerce (KYC) et suivi du dossier | Compte | V1 |
| `#/shared/:id` | Panier partagé (mode consultation) + « Payer ce panier » | Tous (paiement : compte) | V1 |
| `#/help`, `#/help/:n`, `#/help?q=` | Centre d'aide, article, recherche | Tous | V1 |
| `#/notifications` | Centre de messages | Compte | V1 |
| `#/settings`, `#/settings/:section` | Paramètres : profil, secu, notifs, lang, ville, privacy | Compte | V1 |
| `#/viewed` | Vus récemment | Compte | V1 |
| `#/disputes` | Retours et litiges | Compte | V1 |
| `#/myreviews` | Mes avis (à évaluer, publiés) | Compte | V1 |
| `#/seller` | Espace vendeur : accueil (À faire, solde, performances) | Business (KYC approuvé) | V1 |
| `#/seller/products`, `/products/new`, `/products/:id`, `/stock` | Catalogue, formulaire produit, stock par variante | Business | V1 |
| `#/seller/orders`, `/orders/:id`, `/pickup`, `/disputes[/:id]` | Fulfillment, validation du retrait, litiges | Business | V1 |
| `#/seller/finance`, `/payouts` | Solde, escrow, transactions, retraits | Business | V1 (Phase 10) |
| `#/seller/reviews`, `/questions`, `/messages[/:id]` | Avis, questions, messagerie | Business | V1 |
| `#/seller/stats` | Statistiques | Business | V1 (Phase 10) |
| `#/seller/store`, `/policy`, `/trust`, `/share`, `/marketing`, `/account`, `/notifications`, `/menu` | Profil du store, politique de retour, store de confiance, partage, marketing (« À venir »), compte, notifications, menu mobile | Business | V1 |
| `#/admin/login` | Connexion admin fictive : e-mail + mot de passe + code à 6 chiffres, mot de passe oublié | Équipe Prélakay | V1 |
| `#/admin`, `/menu`, `/search?q=` | Tableau de bord, menu mobile, recherche globale | Admin (tous rôles) | V1 |
| `#/admin/kyc[/:id]`, `/products[/:id]`, `/reports`, `/disputes[/:id]` | Validation : KYC, modération, signalements, litiges | Superadmin, Support (+ Finance pour litiges) | V1 |
| `#/admin/stores[/:id]`, `/users[/:id]`, `/orders[/:id]` | Opérations | Superadmin, Support (+ Finance pour commandes) | V1 |
| `#/admin/banners`, `/notify`, `/categories` | Contenu | Superadmin, Marketing (+ Support pour notifications) | V1 |
| `#/admin/team`, `/settings`, `/audit` | Équipe et rôles, paramètres, journal | Superadmin (+ Finance en lecture pour paramètres) | V1 |
| `#/admin/stats` | Statistiques plateforme (Commandes, Acheteurs, Stores, Catégories, Opérations), filtre 7 / 30 / 90 jours | Admin (tous rôles) | 🟡 Proposé (hors PRD v1) |
| `#/admin/finance`, `/events` | Finances plateforme, events et flash-offers | — | V2 / V1.x « À venir » |
| `#/admin/finance?preview=1` | Aperçu prototype des finances plateforme (données de démonstration) | Superadmin, Finance | Aperçu V2, prototype seulement |
| Coupons, events, flash-offers, badges, livraison, sourcing international, Prelakay+, créole, mode sombre | — | — | V1.x et suivantes : toast « À venir » |
