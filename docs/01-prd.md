# 01 — PRD (Product Requirements Document)

Statut : généré à partir des spécifications existantes (00 à 09) et de la mémoire projet.
Légende : ✅ Décidé | 🟡 Proposé (à valider par Prélakay LLC.) | ⚠️ Ouvert | **[À CONFIRMER]** zone de doute, rien inventé.

## 1. Le produit en trois phrases
Prelakay est un marketplace géolocalisé pour Haïti (référence de conception : AliExpress/Amazon/Shein), qui connecte des stores — physiques géolocalisés ou virtuels — à des acheteurs via une PWA, une app mobile (phase 2) et une landing page, tous pilotés par un dashboard admin.
Il répond à l'absence d'un canal d'achat en ligne structuré et fiable en Haïti, où la carte bancaire est peu utilisée, en combinant retrait en magasin (Click & Collect), un wallet local (MonCash/NatCash) et de la confiance vérifiée (avis, Store Health Score, escrow).
Il se différencie par la géolocalisation des stores physiques, le Click & Collect sans livreur dès le lancement, un wallet semi-fermé partageable (payer le panier d'un proche) et un angle diaspora — renforcé en v1.1 par un sourcing international (Shein/Amazon/Temu) acheté tout compris et livré en Haïti, sans que l'acheteur ait à gérer lui-même la commande à l'étranger (🟡 proposé, voir §3).

## 2. Les utilisateurs
- **Profil User** (acheteur) : identifié par un `@username` unique, pour préserver sa vie privée sur les avis/questions. Veut découvrir et acheter des produits, suivre ses commandes, cumuler Coins et points de fidélité.
- **Profil Business** (vendeur) : identifié par son nom (pas de username public). Accède à son dashboard une fois son dossier KYC approuvé. Veut gérer son catalogue, ses commandes (fulfillment), son wallet.
- **Livreur** (phase 2, hors périmètre v1) : chauffeur Prelakay, recruté sur invitation uniquement. PWA dédié non construit au lancement.
- **Admin** : comptes différenciés par rôle (support, finance, marketing…) + superadmin à accès total. Pilote l'approbation des stores, les litiges, les events, les livreurs.

## 3. Fonctionnalités, par priorité

### v1 — Indispensable (pilote Les Cayes)
- Inscription/connexion user (email + mot de passe, ou Google) — aucune info non indispensable demandée à l'inscription
- Devenir vendeur : formulaire KYC (nom, prénom, date de naissance ≥18 ans, NIF, NINU, pièce d'identité recto/verso) → file d'approbation admin, statut visible en temps réel
- Catalogue : arbre de catégories (2 niveaux minimum), gabarit d'attributs par catégorie, variantes avec stock indépendant
- Fiche produit complète : galerie, sélecteur de variante, avis vérifiés, Q&A publique, compteur "X vendus", indicateur de stock bas
- Recherche (autocomplete produits/stores/catégories) + filtres (prix, distance, note, disponibilité) + tri + algorithme de classement avec quota "Nouveaux sur Prelakay"
- **Click & Collect** : checkout, statuts Reçue → En préparation → Prête pour retrait → Retiré, code/QR de remise, délai de 3 jours avec rappels J+1/J+2
- ✅ **Livraison dès le lancement** (décision de Marc-Karlin, 10 nov. 2026 — remplace « Click & Collect, seul mode de fulfillment v1 ») : choix retrait / livraison par store au paiement, adresse (quartier, repère, téléphone), statuts Reçue → En préparation → Remise au livreur → En route → Livrée, code de livraison donné au livreur. ⚠️ Ouverts : frais et zones, paiement du livreur, libération de l'escrow à la livraison, remboursement en cas d'échec de livraison. La PWA livreur reste en phase 2.
- ✅ Pages **« Devenir partenaire de paiement »** et **« Devenir partenaire de livraison »** (10 nov. 2026, modèle AliExpress) avec candidature et file admin
- Wallet : recharge (MonCash/NatCash/Sogebank + Wise/Stripe/Meru pour la diaspora), paiement panier, escrow (libération 3 jours / 24h pour stores de confiance), paiement du panier d'un proche
- Coins : 50/commande, 25/avis, bonus de bienvenue, bonus pour un retrait en magasin plutôt qu'une livraison
- Avis vérifiés (achat réel requis), notes multi-critères, réponse vendeur, signalement
- Dashboard vendeur minimal : catalogue, fulfillment des commandes, notifications, stats de base, identité du store
- Dashboard admin minimal : approbation stores/produits, bannissement, création d'events/banners, notifications in-app
- Liens partageables : produit, panier (mode consultation), profil business — avec bouton WhatsApp prioritaire et QR code pour stores physiques
- Landing page (liste d'attente, preuve sociale)

### Souhaitable — v1.x / au fil du pilote
- Flash-offers admin (24h) et coupons créés par les vendeurs
- Events/promos globaux avec exonération de commission pour les participants
- Badges (users VIP, business par seuil de points de confiance)
- Programme ambassadeurs étudiants (récompensé en Coins, non rémunéré en cash)
- Dispute Center complet côté admin
- 🟡 **Sourcing international (v1.1)** — proposé le 29 oct 2026 : Prelakay achète pour le compte du client sur des plateformes internationales (Shein, Amazon, Temu, etc.) sans que le client ait besoin de le savoir au moment de l'achat sur Prelakay — pour lui, c'est un produit Prelakay comme un autre. Le client paie un prix tout compris : produit + taxes + livraison jusqu'en Haïti. La commande apparaît ensuite dans son historique de commandes habituel une fois le produit reçu, exactement comme une commande Click & Collect. C'est un deuxième système de produits qui coexiste avec le catalogue local (stores pilotes de Les Cayes), pas un remplacement.
  - *Pourquoi c'est un bon levier :* ça répond à une vraie douleur de la diaspora et des acheteurs haïtiens (pas d'accès simple à AliExpress/Amazon/Shein depuis Haïti) sans attendre d'avoir un réseau de vendeurs locaux large — Prelakay devient utile dès le jour 1 pour des catégories que les stores pilotes ne couvrent pas encore.
  - ⚠️ **[À CONFIRMER]** avant tout développement : mécanisme d'achat réel (API fournisseur vs. achat manuel par une équipe interne), calcul du délai de livraison affiché au client, calcul des taxes/droits de douane (fixe ? variable par catégorie ?), marge appliquée sur le prix affiché, qui porte le risque si le produit source est en rupture/différent de la fiche, et impact sur le modèle d'escrow existant (un store "Prelakay Sourcing" fictif dans `businesses` ? un statut de commande dédié ?). Rien de ceci n'est tranché — à spécifier avec Marc-Karlin avant d'écrire la moindre ligne de code (règle CLAUDE.md §1-2).

### Plus tard — phase 2+
- Livraison Prelakay (flotte de chauffeurs invités, KYC livreur, PWA livreur, tracking temps réel)
- Prelakay+ : abonnement 1500 HTG/mois, badge gold, réductions/events exclusifs
- Application Flutter (mobile/tablette native) — dernier livrable de la roadmap
- Produits boostés (mise en avant payante type AliExpress)
- Dashboard financier plateforme complet (GMV, commissions, escrow en circulation, retraits en attente)
- Multilingue (créole en complément du français — v1 est français uniquement, ✅ décidé)
- Comptes staff multi-utilisateurs par store (reporté v2)
- Inscription par téléphone + OTP SMS (reporté v2)
- Recherche vocale et recherche par photo / scan code-barres

## 4. Hors périmètre (explicite)
- Automatisation avancée / IA générative dans le produit — non mentionnée dans les spécifications
- Fiche produit partagée multi-vendeurs type "Buy Box" (Amazon) — modèle "fiche par vendeur" retenu à la place (AliExpress)
- Float de trésorerie wallet générant un rendement — nécessite une étude légale avant toute implémentation
- Frais de retrait wallet — proposé puis refusé pour l'instant
- Publicité payante (Facebook Ads, etc.) avant d'avoir prouvé la rétention des 20-30 vendeurs pilotes

## 5. Critères de succès mesurables (pilote Les Cayes)
- 20 à 30 stores pilotes actifs (ajoutent des produits chaque semaine) avant toute communication grand public
- Taux de retrait effectif des commandes Click & Collect suivi chaque semaine (un taux de non-retrait élevé = signal d'alerte, pas un détail opérationnel)
- Rétention des stores pilotes mesurée à 30/60/90 jours
- Une commande retirée en magasin (code/QR validé) déclenche automatiquement le décompte de libération d'escrow, sans intervention manuelle
- **[À CONFIRMER]** objectif chiffré de commandes/semaine en fin de pilote — non fourni dans les documents fournis

## 6. Décisions encore ouvertes qui affectent ce PRD
- ⚠️ Taux de commission exact (fourchette 5-10%)
- ⚠️ Protection anti-abus du bonus de parrainage (500 Coins)
- ⚠️ Montant des frais de restockage en cas de non-retrait, et à qui ils reviennent
- ⚠️ Formule exacte du Store Health Score
- ⚠️ Recherche vocale : v1 ou backlog v2
