# Tous les liens du projet (localhost)

Généré par `npx tsx scripts/all-links.ts` à partir des données de démonstration (état de départ) :
chaque produit, store, commande, litige, dossier… a sa ligne. À relancer après un ajout de route ou de données.

**516 liens.** Serveur de dev : `npm run dev` → http://localhost:3000

En production, chaque espace a son domaine (CLAUDE.md, 11 nov. 2026) : acheteur `app.prelakay.com`, vendeur
`vendeur.prelakay.com`, admin `admin.prelakay.com` (la landing `www.prelakay.com` est hors de cette application).
Les pages créées pendant une session (nouvelle commande, nouveau litige…) ont des identifiants qui n'existent pas au départ :
elles ne sont pas listées.

## Espace acheteur


### Accueil, découverte, recherche

- http://localhost:3000/
- http://localhost:3000/categories
- http://localhost:3000/discover
- http://localhost:3000/discover?flash=1
- http://localhost:3000/discover?sort=new
- http://localhost:3000/discover?ready=1
- http://localhost:3000/map
- http://localhost:3000/search

### Catégories (onglet Catégories)

- http://localhost:3000/categories?c=mode — Mode
- http://localhost:3000/categories?c=tech — Téléphones et tech
- http://localhost:3000/categories?c=maison — Maison
- http://localhost:3000/categories?c=beaute — Beauté et soins
- http://localhost:3000/categories?c=alim — Épicerie
- http://localhost:3000/categories?c=enfants — Enfants et école
- http://localhost:3000/categories?c=sport — Sport et loisirs
- http://localhost:3000/categories?c=auto — Auto et moto

### Produits par catégorie et sous-catégorie (Discover)

- http://localhost:3000/discover?cat=mode — Mode
- http://localhost:3000/discover?cat=mode&sub=Femme — Mode › Femme
- http://localhost:3000/discover?cat=mode&sub=Homme — Mode › Homme
- http://localhost:3000/discover?cat=mode&sub=Chaussures — Mode › Chaussures
- http://localhost:3000/discover?cat=mode&sub=Sacs%20et%20accessoires — Mode › Sacs et accessoires
- http://localhost:3000/discover?cat=tech — Téléphones et tech
- http://localhost:3000/discover?cat=tech&sub=T%C3%A9l%C3%A9phones — Téléphones et tech › Téléphones
- http://localhost:3000/discover?cat=tech&sub=Accessoires%20t%C3%A9l%C3%A9phone — Téléphones et tech › Accessoires téléphone
- http://localhost:3000/discover?cat=tech&sub=Audio — Téléphones et tech › Audio
- http://localhost:3000/discover?cat=tech&sub=Ordinateurs — Téléphones et tech › Ordinateurs
- http://localhost:3000/discover?cat=maison — Maison
- http://localhost:3000/discover?cat=maison&sub=Cuisine — Maison › Cuisine
- http://localhost:3000/discover?cat=maison&sub=D%C3%A9co — Maison › Déco
- http://localhost:3000/discover?cat=maison&sub=%C3%89lectrom%C3%A9nager — Maison › Électroménager
- http://localhost:3000/discover?cat=maison&sub=M%C3%A9nage — Maison › Ménage
- http://localhost:3000/discover?cat=beaute — Beauté et soins
- http://localhost:3000/discover?cat=beaute&sub=Cheveux — Beauté et soins › Cheveux
- http://localhost:3000/discover?cat=beaute&sub=Soins%20de%20la%20peau — Beauté et soins › Soins de la peau
- http://localhost:3000/discover?cat=beaute&sub=Maquillage — Beauté et soins › Maquillage
- http://localhost:3000/discover?cat=beaute&sub=Parfums — Beauté et soins › Parfums
- http://localhost:3000/discover?cat=alim — Épicerie
- http://localhost:3000/discover?cat=alim&sub=Produits%20locaux — Épicerie › Produits locaux
- http://localhost:3000/discover?cat=alim&sub=Boissons — Épicerie › Boissons
- http://localhost:3000/discover?cat=alim&sub=Snacks — Épicerie › Snacks
- http://localhost:3000/discover?cat=alim&sub=Caf%C3%A9 — Épicerie › Café
- http://localhost:3000/discover?cat=enfants — Enfants et école
- http://localhost:3000/discover?cat=enfants&sub=Jouets — Enfants et école › Jouets
- http://localhost:3000/discover?cat=enfants&sub=Fournitures%20scolaires — Enfants et école › Fournitures scolaires
- http://localhost:3000/discover?cat=enfants&sub=B%C3%A9b%C3%A9 — Enfants et école › Bébé
- http://localhost:3000/discover?cat=enfants&sub=Uniformes — Enfants et école › Uniformes
- http://localhost:3000/discover?cat=sport — Sport et loisirs
- http://localhost:3000/discover?cat=sport&sub=Football — Sport et loisirs › Football
- http://localhost:3000/discover?cat=sport&sub=Fitness — Sport et loisirs › Fitness
- http://localhost:3000/discover?cat=sport&sub=V%C3%A9lo — Sport et loisirs › Vélo
- http://localhost:3000/discover?cat=sport&sub=Plein%20air — Sport et loisirs › Plein air
- http://localhost:3000/discover?cat=auto — Auto et moto
- http://localhost:3000/discover?cat=auto&sub=Pi%C3%A8ces%20moto — Auto et moto › Pièces moto
- http://localhost:3000/discover?cat=auto&sub=Accessoires%20auto — Auto et moto › Accessoires auto
- http://localhost:3000/discover?cat=auto&sub=Entretien — Auto et moto › Entretien
- http://localhost:3000/discover?cat=auto&sub=Casques — Auto et moto › Casques

### Fiches produit (60 produits)

Chaque fiche a aussi sa page d'avis (`/reviews`).

- http://localhost:3000/p/mode-0 — Robe en lin brodée
- http://localhost:3000/p/mode-0/reviews — Robe en lin brodée — avis
- http://localhost:3000/p/mode-1 — Chemise guayabera homme
- http://localhost:3000/p/mode-1/reviews — Chemise guayabera homme — avis
- http://localhost:3000/p/mode-2 — Sandales en cuir tressé
- http://localhost:3000/p/mode-2/reviews — Sandales en cuir tressé — avis
- http://localhost:3000/p/mode-3 — Sac cabas en paille
- http://localhost:3000/p/mode-3/reviews — Sac cabas en paille — avis
- http://localhost:3000/p/mode-4 — Jean droit taille haute
- http://localhost:3000/p/mode-4/reviews — Jean droit taille haute — avis
- http://localhost:3000/p/mode-5 — T-shirt « Lakay » coton
- http://localhost:3000/p/mode-5/reviews — T-shirt « Lakay » coton — avis
- http://localhost:3000/p/mode-6 — Casquette brodée
- http://localhost:3000/p/mode-6/reviews — Casquette brodée — avis
- http://localhost:3000/p/mode-7 — Ensemble enfant coton
- http://localhost:3000/p/mode-7/reviews — Ensemble enfant coton — avis
- http://localhost:3000/p/tech-0 — Écouteurs sans fil
- http://localhost:3000/p/tech-0/reviews — Écouteurs sans fil — avis
- http://localhost:3000/p/tech-1 — Chargeur rapide 20 W
- http://localhost:3000/p/tech-1/reviews — Chargeur rapide 20 W — avis
- http://localhost:3000/p/tech-2 — Coque antichoc
- http://localhost:3000/p/tech-2/reviews — Coque antichoc — avis
- http://localhost:3000/p/tech-3 — Batterie externe 10 000 mAh
- http://localhost:3000/p/tech-3/reviews — Batterie externe 10 000 mAh — avis
- http://localhost:3000/p/tech-4 — Smartphone 128 Go
- http://localhost:3000/p/tech-4/reviews — Smartphone 128 Go — avis
- http://localhost:3000/p/tech-5 — Câble USB-C tressé
- http://localhost:3000/p/tech-5/reviews — Câble USB-C tressé — avis
- http://localhost:3000/p/tech-6 — Enceinte Bluetooth
- http://localhost:3000/p/tech-6/reviews — Enceinte Bluetooth — avis
- http://localhost:3000/p/tech-7 — Clé USB 64 Go
- http://localhost:3000/p/tech-7/reviews — Clé USB 64 Go — avis
- http://localhost:3000/p/maison-0 — Marmite en fonte 6 L
- http://localhost:3000/p/maison-0/reviews — Marmite en fonte 6 L — avis
- http://localhost:3000/p/maison-1 — Ventilateur rechargeable
- http://localhost:3000/p/maison-1/reviews — Ventilateur rechargeable — avis
- http://localhost:3000/p/maison-2 — Lampe solaire LED
- http://localhost:3000/p/maison-2/reviews — Lampe solaire LED — avis
- http://localhost:3000/p/maison-3 — Set de 6 verres
- http://localhost:3000/p/maison-3/reviews — Set de 6 verres — avis
- http://localhost:3000/p/maison-4 — Seau et balai
- http://localhost:3000/p/maison-4/reviews — Seau et balai — avis
- http://localhost:3000/p/maison-5 — Rideau occultant
- http://localhost:3000/p/maison-5/reviews — Rideau occultant — avis
- http://localhost:3000/p/maison-6 — Boîtes de conservation x5
- http://localhost:3000/p/maison-6/reviews — Boîtes de conservation x5 — avis
- http://localhost:3000/p/maison-7 — Fer à repasser
- http://localhost:3000/p/maison-7/reviews — Fer à repasser — avis
- http://localhost:3000/p/beaute-0 — Huile de ricin noire
- http://localhost:3000/p/beaute-0/reviews — Huile de ricin noire — avis
- http://localhost:3000/p/beaute-1 — Crème hydratante karité
- http://localhost:3000/p/beaute-1/reviews — Crème hydratante karité — avis
- http://localhost:3000/p/beaute-2 — Kit de tresses
- http://localhost:3000/p/beaute-2/reviews — Kit de tresses — avis
- http://localhost:3000/p/beaute-3 — Parfum floral 50 ml
- http://localhost:3000/p/beaute-3/reviews — Parfum floral 50 ml — avis
- http://localhost:3000/p/beaute-4 — Shampoing sans sulfate
- http://localhost:3000/p/beaute-4/reviews — Shampoing sans sulfate — avis
- http://localhost:3000/p/beaute-5 — Rouge à lèvres mat
- http://localhost:3000/p/beaute-5/reviews — Rouge à lèvres mat — avis
- http://localhost:3000/p/beaute-6 — Peigne démêlant
- http://localhost:3000/p/beaute-6/reviews — Peigne démêlant — avis
- http://localhost:3000/p/beaute-7 — Savon artisanal x3
- http://localhost:3000/p/beaute-7/reviews — Savon artisanal x3 — avis
- http://localhost:3000/p/alim-0 — Café des Cayes 500 g
- http://localhost:3000/p/alim-0/reviews — Café des Cayes 500 g — avis
- http://localhost:3000/p/alim-1 — Mamba (beurre d'arachide)
- http://localhost:3000/p/alim-1/reviews — Mamba (beurre d'arachide) — avis
- http://localhost:3000/p/alim-2 — Confiture de chadèque
- http://localhost:3000/p/alim-2/reviews — Confiture de chadèque — avis
- http://localhost:3000/p/alim-3 — Clairin 750 ml
- http://localhost:3000/p/alim-3/reviews — Clairin 750 ml — avis
- http://localhost:3000/p/alim-4 — Pikliz maison
- http://localhost:3000/p/alim-4/reviews — Pikliz maison — avis
- http://localhost:3000/p/alim-5 — Cassave x6
- http://localhost:3000/p/alim-5/reviews — Cassave x6 — avis
- http://localhost:3000/p/alim-6 — Riz local 5 kg
- http://localhost:3000/p/alim-6/reviews — Riz local 5 kg — avis
- http://localhost:3000/p/alim-7 — Sirop d'orgeat
- http://localhost:3000/p/alim-7/reviews — Sirop d'orgeat — avis
- http://localhost:3000/p/enfants-0 — Sac à dos scolaire
- http://localhost:3000/p/enfants-0/reviews — Sac à dos scolaire — avis
- http://localhost:3000/p/enfants-1 — Kit de crayons x24
- http://localhost:3000/p/enfants-1/reviews — Kit de crayons x24 — avis
- http://localhost:3000/p/enfants-2 — Ballon junior
- http://localhost:3000/p/enfants-2/reviews — Ballon junior — avis
- http://localhost:3000/p/enfants-3 — Puzzle 100 pièces
- http://localhost:3000/p/enfants-3/reviews — Puzzle 100 pièces — avis
- http://localhost:3000/p/enfants-4 — Cahiers x10
- http://localhost:3000/p/enfants-4/reviews — Cahiers x10 — avis
- http://localhost:3000/p/enfants-5 — Poupée en tissu
- http://localhost:3000/p/enfants-5/reviews — Poupée en tissu — avis
- http://localhost:3000/p/enfants-6 — Calculatrice
- http://localhost:3000/p/enfants-6/reviews — Calculatrice — avis
- http://localhost:3000/p/enfants-7 — Gourde enfant
- http://localhost:3000/p/enfants-7/reviews — Gourde enfant — avis
- http://localhost:3000/p/sport-0 — Ballon de football
- http://localhost:3000/p/sport-0/reviews — Ballon de football — avis
- http://localhost:3000/p/sport-1 — Corde à sauter
- http://localhost:3000/p/sport-1/reviews — Corde à sauter — avis
- http://localhost:3000/p/sport-2 — Maillot domicile
- http://localhost:3000/p/sport-2/reviews — Maillot domicile — avis
- http://localhost:3000/p/sport-3 — Haltères 2 x 2 kg
- http://localhost:3000/p/sport-3/reviews — Haltères 2 x 2 kg — avis
- http://localhost:3000/p/sport-4 — Gants de gardien
- http://localhost:3000/p/sport-4/reviews — Gants de gardien — avis
- http://localhost:3000/p/sport-5 — Tapis de yoga
- http://localhost:3000/p/sport-5/reviews — Tapis de yoga — avis
- http://localhost:3000/p/auto-0 — Casque moto homologué
- http://localhost:3000/p/auto-0/reviews — Casque moto homologué — avis
- http://localhost:3000/p/auto-1 — Batterie moto 12 V
- http://localhost:3000/p/auto-1/reviews — Batterie moto 12 V — avis
- http://localhost:3000/p/auto-2 — Huile 4 temps 1 L
- http://localhost:3000/p/auto-2/reviews — Huile 4 temps 1 L — avis
- http://localhost:3000/p/auto-3 — Rétroviseurs x2
- http://localhost:3000/p/auto-3/reviews — Rétroviseurs x2 — avis
- http://localhost:3000/p/auto-4 — Housse de selle
- http://localhost:3000/p/auto-4/reviews — Housse de selle — avis
- http://localhost:3000/p/auto-5 — Antivol en U
- http://localhost:3000/p/auto-5/reviews — Antivol en U — avis

### Stores (8 stores × 7 onglets)


**Boutik Lakay**

- http://localhost:3000/store/boutik-lakay — Accueil
- http://localhost:3000/store/boutik-lakay/products — Produits
- http://localhost:3000/store/boutik-lakay/top — Meilleures ventes
- http://localhost:3000/store/boutik-lakay/new — Nouveautés
- http://localhost:3000/store/boutik-lakay/reviews — Avis
- http://localhost:3000/store/boutik-lakay/about — À propos
- http://localhost:3000/store/boutik-lakay/promos — Promos

**Tech Sud**

- http://localhost:3000/store/tech-sud — Accueil
- http://localhost:3000/store/tech-sud/products — Produits
- http://localhost:3000/store/tech-sud/top — Meilleures ventes
- http://localhost:3000/store/tech-sud/new — Nouveautés
- http://localhost:3000/store/tech-sud/reviews — Avis
- http://localhost:3000/store/tech-sud/about — À propos
- http://localhost:3000/store/tech-sud/promos — Promos

**Kay Pratik**

- http://localhost:3000/store/kay-pratik — Accueil
- http://localhost:3000/store/kay-pratik/products — Produits
- http://localhost:3000/store/kay-pratik/top — Meilleures ventes
- http://localhost:3000/store/kay-pratik/new — Nouveautés
- http://localhost:3000/store/kay-pratik/reviews — Avis
- http://localhost:3000/store/kay-pratik/about — À propos
- http://localhost:3000/store/kay-pratik/promos — Promos

**Bel Soley Beauté**

- http://localhost:3000/store/bel-soley — Accueil
- http://localhost:3000/store/bel-soley/products — Produits
- http://localhost:3000/store/bel-soley/top — Meilleures ventes
- http://localhost:3000/store/bel-soley/new — Nouveautés
- http://localhost:3000/store/bel-soley/reviews — Avis
- http://localhost:3000/store/bel-soley/about — À propos
- http://localhost:3000/store/bel-soley/promos — Promos

**Mache Bon Pri**

- http://localhost:3000/store/mache-bon-pri — Accueil
- http://localhost:3000/store/mache-bon-pri/products — Produits
- http://localhost:3000/store/mache-bon-pri/top — Meilleures ventes
- http://localhost:3000/store/mache-bon-pri/new — Nouveautés
- http://localhost:3000/store/mache-bon-pri/reviews — Avis
- http://localhost:3000/store/mache-bon-pri/about — À propos
- http://localhost:3000/store/mache-bon-pri/promos — Promos

**Lekòl ak Jwèt**

- http://localhost:3000/store/lekol-ak-jwet — Accueil
- http://localhost:3000/store/lekol-ak-jwet/products — Produits
- http://localhost:3000/store/lekol-ak-jwet/top — Meilleures ventes
- http://localhost:3000/store/lekol-ak-jwet/new — Nouveautés
- http://localhost:3000/store/lekol-ak-jwet/reviews — Avis
- http://localhost:3000/store/lekol-ak-jwet/about — À propos
- http://localhost:3000/store/lekol-ak-jwet/promos — Promos

**Moto Pyès Sud**

- http://localhost:3000/store/moto-pyes — Accueil
- http://localhost:3000/store/moto-pyes/products — Produits
- http://localhost:3000/store/moto-pyes/top — Meilleures ventes
- http://localhost:3000/store/moto-pyes/new — Nouveautés
- http://localhost:3000/store/moto-pyes/reviews — Avis
- http://localhost:3000/store/moto-pyes/about — À propos
- http://localhost:3000/store/moto-pyes/promos — Promos

**Atelier Lagon**

- http://localhost:3000/store/atelier-lagon — Accueil
- http://localhost:3000/store/atelier-lagon/products — Produits
- http://localhost:3000/store/atelier-lagon/top — Meilleures ventes
- http://localhost:3000/store/atelier-lagon/new — Nouveautés
- http://localhost:3000/store/atelier-lagon/reviews — Avis
- http://localhost:3000/store/atelier-lagon/about — À propos
- http://localhost:3000/store/atelier-lagon/promos — Promos

### Panier, paiement, confirmation

- http://localhost:3000/cart
- http://localhost:3000/checkout
- http://localhost:3000/done/PK-1042 — confirmation PK-1042
- http://localhost:3000/done/PK-1038 — confirmation PK-1038
- http://localhost:3000/done/PK-1021 — confirmation PK-1021
- http://localhost:3000/done/PK-0997 — confirmation PK-0997
- http://localhost:3000/shared/lili_cayes — panier partagé d'un proche

### Commandes (4)

- http://localhost:3000/orders
- http://localhost:3000/orders/PK-1042 — Bel Soley Beauté
- http://localhost:3000/orders/PK-1038 — Tech Sud
- http://localhost:3000/orders/PK-1021 — Boutik Lakay
- http://localhost:3000/orders/PK-0997 — Mache Bon Pri
- http://localhost:3000/disputes — retours et litiges

### Compte et wallet

- http://localhost:3000/account
- http://localhost:3000/account/coupons
- http://localhost:3000/wallet
- http://localhost:3000/wallet?tab=hist
- http://localhost:3000/wallet?topup=1
- http://localhost:3000/coins
- http://localhost:3000/wishlist
- http://localhost:3000/viewed
- http://localhost:3000/myreviews
- http://localhost:3000/notifications
- http://localhost:3000/invite
- http://localhost:3000/plus

### Paramètres

- http://localhost:3000/settings
- http://localhost:3000/settings/profil — Informations personnelles
- http://localhost:3000/settings/secu — Sécurité et connexion
- http://localhost:3000/settings/notifs — Notifications
- http://localhost:3000/settings/lang — Langue et devise
- http://localhost:3000/settings/ville — Ville de retrait
- http://localhost:3000/settings/privacy — Confidentialité

### Connexion

- http://localhost:3000/login
- http://localhost:3000/signup

### Vendre, partenaires, programmes

- http://localhost:3000/sell — Enregistrer son commerce (KYC)
- http://localhost:3000/partenaires/livraison
- http://localhost:3000/partenaires/paiement
- http://localhost:3000/ambassadeurs
- http://localhost:3000/events/EV-01 — Fèt Manman Sud
- http://localhost:3000/events/EV-02 — Rentrée des classes

### Centre d'aide (11 articles)

- http://localhost:3000/help
- http://localhost:3000/help/0 — Retrait en magasin
- http://localhost:3000/help/1 — Retrait en magasin
- http://localhost:3000/help/2 — Retrait en magasin
- http://localhost:3000/help/3 — Wallet et paiement
- http://localhost:3000/help/4 — Wallet et paiement
- http://localhost:3000/help/5 — Wallet et paiement
- http://localhost:3000/help/6 — Retours et litiges
- http://localhost:3000/help/7 — Retours et litiges
- http://localhost:3000/help/8 — Coins
- http://localhost:3000/help/9 — Compte
- http://localhost:3000/help/10 — Compte

### Légal et crédits

- http://localhost:3000/legal
- http://localhost:3000/legal/conditions — Conditions d'utilisation
- http://localhost:3000/legal/confidentialite — Politique de confidentialité
- http://localhost:3000/legal/mentions — Mentions légales
- http://localhost:3000/credits

### Pages techniques

- http://localhost:3000/~offline — page hors connexion de la PWA
- http://localhost:3000/robots.txt
- http://localhost:3000/style-guide — guide de style interne
- Images de partage (fiche produit, store) : adresse avec un suffixe généré par Next, à lire dans la balise `og:image` de la page.
- Page 404 : toute adresse inconnue, ex. http://localhost:3000/une-adresse-inconnue

## Espace vendeur

Accès : KYC approuvé (démo : finir le parcours de la page `/sell`, ou mettre `{"kyc":"ok"}` dans la clé `pk-demo-v1` du localStorage). Les pages de détail ci-dessous sont celles du store par défaut, **Boutik Lakay** ; le sélecteur de store de l'en-tête vendeur en montre d'autres.


### Pages

- http://localhost:3000/seller
- http://localhost:3000/seller/menu
- http://localhost:3000/seller/notifications
- http://localhost:3000/seller/products
- http://localhost:3000/seller/products/new
- http://localhost:3000/seller/stock
- http://localhost:3000/seller/orders
- http://localhost:3000/seller/orders?tab=received
- http://localhost:3000/seller/orders?tab=ready
- http://localhost:3000/seller/pickup
- http://localhost:3000/seller/disputes
- http://localhost:3000/seller/marketing
- http://localhost:3000/seller/marketing/coupons
- http://localhost:3000/seller/marketing/flash
- http://localhost:3000/seller/marketing/events
- http://localhost:3000/seller/marketing/boost
- http://localhost:3000/seller/share
- http://localhost:3000/seller/finance
- http://localhost:3000/seller/payouts
- http://localhost:3000/seller/reviews
- http://localhost:3000/seller/questions
- http://localhost:3000/seller/messages
- http://localhost:3000/seller/stats
- http://localhost:3000/seller/store
- http://localhost:3000/seller/policy
- http://localhost:3000/seller/trust
- http://localhost:3000/seller/staff
- http://localhost:3000/seller/account

### Produits du store (9)

- http://localhost:3000/seller/products/mode-0 — Robe en lin brodée
- http://localhost:3000/seller/products/mode-2 — Sandales en cuir tressé
- http://localhost:3000/seller/products/mode-4 — Jean droit taille haute
- http://localhost:3000/seller/products/mode-6 — Casquette brodée
- http://localhost:3000/seller/products/sport-0 — Ballon de football
- http://localhost:3000/seller/products/sport-2 — Maillot domicile
- http://localhost:3000/seller/products/sport-4 — Gants de gardien
- http://localhost:3000/seller/products/sp-boutik-lakay-0 — Femme — nouvelle collection
- http://localhost:3000/seller/products/sp-boutik-lakay-1 — Article sans photo conforme

### Commandes du store (10)

- http://localhost:3000/seller/orders/PK-1021
- http://localhost:3000/seller/orders/PK-980
- http://localhost:3000/seller/orders/PK-973
- http://localhost:3000/seller/orders/PK-966
- http://localhost:3000/seller/orders/PK-959
- http://localhost:3000/seller/orders/PK-952
- http://localhost:3000/seller/orders/PK-945
- http://localhost:3000/seller/orders/PK-938
- http://localhost:3000/seller/orders/PK-931
- http://localhost:3000/seller/orders/PK-924

### Litiges du store (1)

- http://localhost:3000/seller/disputes/LT-225

### Messages (3 conversations)

- http://localhost:3000/seller/messages/c0 — @lovely_509
- http://localhost:3000/seller/messages/c1 — @nadege_cayes
- http://localhost:3000/seller/messages/c2 — @jowan509

## Espace admin

Accès : http://localhost:3000/admin/login (démo : mot de passe + code à 6 chiffres ; rôles Superadmin, Support, Finance, Marketing). Les listes ci-dessous sont celles du Superadmin.


### Pages

- http://localhost:3000/admin/login
- http://localhost:3000/admin
- http://localhost:3000/admin/menu
- http://localhost:3000/admin/search
- http://localhost:3000/admin/stats
- http://localhost:3000/admin/kyc
- http://localhost:3000/admin/products
- http://localhost:3000/admin/reports
- http://localhost:3000/admin/disputes
- http://localhost:3000/admin/stores
- http://localhost:3000/admin/users
- http://localhost:3000/admin/orders
- http://localhost:3000/admin/deliveries
- http://localhost:3000/admin/partners
- http://localhost:3000/admin/banners
- http://localhost:3000/admin/notify
- http://localhost:3000/admin/coupons
- http://localhost:3000/admin/events
- http://localhost:3000/admin/growth
- http://localhost:3000/admin/finance
- http://localhost:3000/admin/categories
- http://localhost:3000/admin/team
- http://localhost:3000/admin/settings
- http://localhost:3000/admin/audit

### Dossiers KYC (6)

- http://localhost:3000/admin/kyc/KYC-0148
- http://localhost:3000/admin/kyc/KYC-0147
- http://localhost:3000/admin/kyc/KYC-0146
- http://localhost:3000/admin/kyc/KYC-0145
- http://localhost:3000/admin/kyc/KYC-0139
- http://localhost:3000/admin/kyc/KYC-0137

### Produits en modération (63)

- http://localhost:3000/admin/products/mode-0 — Robe en lin brodée
- http://localhost:3000/admin/products/mode-1 — Chemise guayabera homme
- http://localhost:3000/admin/products/mode-2 — Sandales en cuir tressé
- http://localhost:3000/admin/products/mode-3 — Sac cabas en paille
- http://localhost:3000/admin/products/mode-4 — Jean droit taille haute
- http://localhost:3000/admin/products/mode-5 — T-shirt « Lakay » coton
- http://localhost:3000/admin/products/mode-6 — Casquette brodée
- http://localhost:3000/admin/products/mode-7 — Ensemble enfant coton
- http://localhost:3000/admin/products/tech-0 — Écouteurs sans fil
- http://localhost:3000/admin/products/tech-1 — Chargeur rapide 20 W
- http://localhost:3000/admin/products/tech-2 — Coque antichoc
- http://localhost:3000/admin/products/tech-3 — Batterie externe 10 000 mAh
- http://localhost:3000/admin/products/tech-4 — Smartphone 128 Go
- http://localhost:3000/admin/products/tech-5 — Câble USB-C tressé
- http://localhost:3000/admin/products/tech-6 — Enceinte Bluetooth
- http://localhost:3000/admin/products/tech-7 — Clé USB 64 Go
- http://localhost:3000/admin/products/maison-0 — Marmite en fonte 6 L
- http://localhost:3000/admin/products/maison-1 — Ventilateur rechargeable
- http://localhost:3000/admin/products/maison-2 — Lampe solaire LED
- http://localhost:3000/admin/products/maison-3 — Set de 6 verres
- http://localhost:3000/admin/products/maison-4 — Seau et balai
- http://localhost:3000/admin/products/maison-5 — Rideau occultant
- http://localhost:3000/admin/products/maison-6 — Boîtes de conservation x5
- http://localhost:3000/admin/products/maison-7 — Fer à repasser
- http://localhost:3000/admin/products/beaute-0 — Huile de ricin noire
- http://localhost:3000/admin/products/beaute-1 — Crème hydratante karité
- http://localhost:3000/admin/products/beaute-2 — Kit de tresses
- http://localhost:3000/admin/products/beaute-3 — Parfum floral 50 ml
- http://localhost:3000/admin/products/beaute-4 — Shampoing sans sulfate
- http://localhost:3000/admin/products/beaute-5 — Rouge à lèvres mat
- http://localhost:3000/admin/products/beaute-6 — Peigne démêlant
- http://localhost:3000/admin/products/beaute-7 — Savon artisanal x3
- http://localhost:3000/admin/products/alim-0 — Café des Cayes 500 g
- http://localhost:3000/admin/products/alim-1 — Mamba (beurre d'arachide)
- http://localhost:3000/admin/products/alim-2 — Confiture de chadèque
- http://localhost:3000/admin/products/alim-3 — Clairin 750 ml
- http://localhost:3000/admin/products/alim-4 — Pikliz maison
- http://localhost:3000/admin/products/alim-5 — Cassave x6
- http://localhost:3000/admin/products/alim-6 — Riz local 5 kg
- http://localhost:3000/admin/products/alim-7 — Sirop d'orgeat
- http://localhost:3000/admin/products/enfants-0 — Sac à dos scolaire
- http://localhost:3000/admin/products/enfants-1 — Kit de crayons x24
- http://localhost:3000/admin/products/enfants-2 — Ballon junior
- http://localhost:3000/admin/products/enfants-3 — Puzzle 100 pièces
- http://localhost:3000/admin/products/enfants-4 — Cahiers x10
- http://localhost:3000/admin/products/enfants-5 — Poupée en tissu
- http://localhost:3000/admin/products/enfants-6 — Calculatrice
- http://localhost:3000/admin/products/enfants-7 — Gourde enfant
- http://localhost:3000/admin/products/sport-0 — Ballon de football
- http://localhost:3000/admin/products/sport-1 — Corde à sauter
- http://localhost:3000/admin/products/sport-2 — Maillot domicile
- http://localhost:3000/admin/products/sport-3 — Haltères 2 x 2 kg
- http://localhost:3000/admin/products/sport-4 — Gants de gardien
- http://localhost:3000/admin/products/sport-5 — Tapis de yoga
- http://localhost:3000/admin/products/auto-0 — Casque moto homologué
- http://localhost:3000/admin/products/auto-1 — Batterie moto 12 V
- http://localhost:3000/admin/products/auto-2 — Huile 4 temps 1 L
- http://localhost:3000/admin/products/auto-3 — Rétroviseurs x2
- http://localhost:3000/admin/products/auto-4 — Housse de selle
- http://localhost:3000/admin/products/auto-5 — Antivol en U
- http://localhost:3000/admin/products/mq-0 — Écouteurs Pro sans fil ANC
- http://localhost:3000/admin/products/mq-1 — Coffret soins karité x4
- http://localhost:3000/admin/products/mq-2 — Lampe torche rechargeable

### Stores (8)

- http://localhost:3000/admin/stores/boutik-lakay — Boutik Lakay
- http://localhost:3000/admin/stores/tech-sud — Tech Sud
- http://localhost:3000/admin/stores/kay-pratik — Kay Pratik
- http://localhost:3000/admin/stores/bel-soley — Bel Soley Beauté
- http://localhost:3000/admin/stores/mache-bon-pri — Mache Bon Pri
- http://localhost:3000/admin/stores/lekol-ak-jwet — Lekòl ak Jwèt
- http://localhost:3000/admin/stores/moto-pyes — Moto Pyès Sud
- http://localhost:3000/admin/stores/atelier-lagon — Atelier Lagon

### Utilisateurs (9)

- http://localhost:3000/admin/users/marckarlin — Marc-Karlin
- http://localhost:3000/admin/users/nadege_cayes — Nadège Cadet
- http://localhost:3000/admin/users/jowan509 — Jowan Michel
- http://localhost:3000/admin/users/tidodo — Théodore Dorsainvil
- http://localhost:3000/admin/users/ketia.b — Ketia Bien-Aimé
- http://localhost:3000/admin/users/ricardo_sud — Ricardo Sully
- http://localhost:3000/admin/users/mimi_ht — Mireille Hyppolite
- http://localhost:3000/admin/users/stanley.c — Stanley Clervil
- http://localhost:3000/admin/users/lovely_509 — Lovely Mompoint

### Commandes (76)

- http://localhost:3000/admin/orders/PK-1042
- http://localhost:3000/admin/orders/PK-1038
- http://localhost:3000/admin/orders/PK-1021
- http://localhost:3000/admin/orders/PK-0997
- http://localhost:3000/admin/orders/PK-980
- http://localhost:3000/admin/orders/PK-973
- http://localhost:3000/admin/orders/PK-966
- http://localhost:3000/admin/orders/PK-959
- http://localhost:3000/admin/orders/PK-952
- http://localhost:3000/admin/orders/PK-945
- http://localhost:3000/admin/orders/PK-938
- http://localhost:3000/admin/orders/PK-931
- http://localhost:3000/admin/orders/PK-924
- http://localhost:3000/admin/orders/PK-977
- http://localhost:3000/admin/orders/PK-970
- http://localhost:3000/admin/orders/PK-963
- http://localhost:3000/admin/orders/PK-956
- http://localhost:3000/admin/orders/PK-949
- http://localhost:3000/admin/orders/PK-942
- http://localhost:3000/admin/orders/PK-935
- http://localhost:3000/admin/orders/PK-928
- http://localhost:3000/admin/orders/PK-921
- http://localhost:3000/admin/orders/PK-978
- http://localhost:3000/admin/orders/PK-971
- http://localhost:3000/admin/orders/PK-964
- http://localhost:3000/admin/orders/PK-957
- http://localhost:3000/admin/orders/PK-950
- http://localhost:3000/admin/orders/PK-943
- http://localhost:3000/admin/orders/PK-936
- http://localhost:3000/admin/orders/PK-929
- http://localhost:3000/admin/orders/PK-922
- http://localhost:3000/admin/orders/PK-979
- http://localhost:3000/admin/orders/PK-972
- http://localhost:3000/admin/orders/PK-965
- http://localhost:3000/admin/orders/PK-958
- http://localhost:3000/admin/orders/PK-951
- http://localhost:3000/admin/orders/PK-944
- http://localhost:3000/admin/orders/PK-937
- http://localhost:3000/admin/orders/PK-930
- http://localhost:3000/admin/orders/PK-923
- http://localhost:3000/admin/orders/PK-976
- http://localhost:3000/admin/orders/PK-969
- http://localhost:3000/admin/orders/PK-962
- http://localhost:3000/admin/orders/PK-955
- http://localhost:3000/admin/orders/PK-948
- http://localhost:3000/admin/orders/PK-941
- http://localhost:3000/admin/orders/PK-934
- http://localhost:3000/admin/orders/PK-927
- http://localhost:3000/admin/orders/PK-920

### Litiges (10)

- http://localhost:3000/admin/disputes/LT-225
- http://localhost:3000/admin/disputes/LT-263
- http://localhost:3000/admin/disputes/LT-217
- http://localhost:3000/admin/disputes/LT-238
- http://localhost:3000/admin/disputes/LT-200
- http://localhost:3000/admin/disputes/LT-203
- http://localhost:3000/admin/disputes/LT-271
- http://localhost:3000/admin/disputes/LT-224
- http://localhost:3000/admin/disputes/LT-150
- http://localhost:3000/admin/disputes/LT-151

### Candidatures partenaires (4)

- http://localhost:3000/admin/partners/PL-0041
- http://localhost:3000/admin/partners/PL-0039
- http://localhost:3000/admin/partners/PP-0012
- http://localhost:3000/admin/partners/PP-0010
