# 05 — Schéma back-end (synthèse)

⚠️ Document de **synthèse**, basé sur les entités mentionnées dans les spécifications produit. Le schéma détaillé champ par champ reste volontairement le dernier livrable, comme indiqué dans le prompt d'origine : « ce sera le dernier à être livré vu que je dois faire le schéma pour vous. » Ce fichier sert de point de départ pour cette session de modélisation, pas de version finale.

## Entités principales (déduites des specs)
- `users` — profil user : `@username`, email, coins, points de fidélité
- `businesses` — profil business : nom, type physique/virtuel, lat/lng si physique, statut KYC, Store Health Score, politique du store
- `business_owners` — lien user ↔ business (un seul propriétaire/login en v1 ; comptes staff reportés v2)
- `categories` — arbre à 2 niveaux minimum, gabarit d'attributs par catégorie
- `products` — titre, catégorie, description, photos/vidéo, prix, prix barré, poids/dimensions, tags, politique de retour, statut (brouillon / en modération / actif / rupture / archivé / rejeté)
- `product_variants` — variante (ex. "Rouge / M"), stock indépendant par variante
- `orders` — acheteur, store(s), mode (retrait magasin v1 / livraison phase 2 / **sourcing international v1.1 🟡 — proposé le 29 oct 2026, [À CONFIRMER]**), statut, montant, lien escrow
- `order_items` — produit/variante, quantité, prix au moment de l'achat
- `pickup_codes` — code 4-6 chiffres + QR, lié à une commande en retrait
- `wallet_transactions` — recharge, paiement, retrait, passerelle utilisée
- `escrow` — montant, statut (retenu/libéré), date de libération prévue
- `reviews` — commande liée (avis vérifié obligatoire), notes multi-critères
- `coupons` — créés par store : pourcentage, seuil min/max, code à 6 chiffres
- `events_promos` — global, stores participants, dates début/fin, exonération de commission
- `flash_offers` — 24h, seuil de points de confiance requis
- `coins_transactions` — gain/dépense, source (commande/avis/parrainage/partage)
- `referrals` — parrain, filleul, statut du bonus, anti-abus **[À CONFIRMER]**
- `disputes` — commande liée, motif, preuves, statut, décision
- `reported_products` / `reported_reviews` — file de modération
- `delivery_riders` — phase 2, hors périmètre v1
- `sourcing_orders` 🟡 **[À CONFIRMER]** — v1.1, proposé le 29 oct 2026 : détail d'une commande de sourcing international (plateforme source, prix produit, taxes, frais de livraison vers Haïti, délai estimé) ; structure exacte à définir avec Marc-Karlin — dépend du mécanisme d'achat réel (voir 01-prd.md §3)
- `admin_roles` — support/finance/marketing/superadmin, permissions par rôle
- `notifications`
- `shareable_links` — type (produit/panier/profil), identifiant unique de tracking d'attribution

## Droits par table (principe général, à formaliser en RLS Supabase)
- `users` : lecture de son propre profil + profils publics (`@username`) ; écriture limitée à son propre profil
- `businesses` : lecture publique du profil ; écriture par le propriétaire (`business_owners`) + admin
- `products` : lecture publique si statut "actif" ; écriture par le store propriétaire ; validation/rejet réservés à l'admin (modération)
- `orders`, `wallet_transactions`, `escrow` : lecture strictement limitée à l'acheteur concerné, au store concerné, et aux admins — jamais public
- `reviews` : écriture limitée à l'acheteur d'une commande vérifiée ; lecture publique
- `disputes` : lecture/écriture réservées à l'acheteur et au vendeur concernés + admin

**[À CONFIRMER]** règles RLS exactes, table par table — à écrire avec Marc-Karlin lors de la construction du schéma final.

## Données personnelles identifiées

| Donnée | Pourquoi collectée | Peut-on s'en passer ? |
|---|---|---|
| Nom, prénom | KYC vendeur, identification | Non (obligation anti-fraude) |
| Date de naissance | Vérifier ≥18 ans (KYC vendeur) | Non |
| NIF / NINU | Identification fiscale du vendeur | Non (KYC) |
| Pièce d'identité (passeport/CIN) | KYC vendeur | Non |
| Email | Authentification, notifications | Non |
| Numéro de téléphone (v2) | OTP, notifications WhatsApp | Oui en v1 (non implémenté) |
| Adresse de livraison | Demandée à la première commande, jamais à l'inscription | Non, mais collecte différée au bon moment |
| Géolocalisation GPS (store physique) | Carte, Click & Collect, filtre distance | Non pour un store physique |

## Agrégats pour les graphiques (🟡 proposé le 7 nov. 2026, accord requis)
Les dashboards (03-design §9.13) lisent des agrégats, jamais les tables brutes côté client. Proposition, **à valider avant toute création** (changement de base de données, CLAUDE.md règle 5) :
- vues ou fonctions RPC par jour : commandes par statut, ventes (HTG), retraits, visites du store, nouveaux comptes ;
- par store : ventes, délai de préparation, taux de retrait, litiges par motif ;
- par catégorie : commandes, variation vs période précédente ; recherches sans résultat ;
- droits : un vendeur ne lit que les agrégats de son store (RLS) ; l'admin lit tout selon son rôle.
Les visites et les recherches sans résultat supposent un suivi d'événements qui n'existe pas encore dans le schéma **[À CONFIRMER]**.

## Stockage & région
- Supabase, région Europe (cohérent avec app.prelakay.com existant)
- Médias produit : Supabase Storage, même région

## Durée de conservation
**[À CONFIRMER]** — aucune durée n'est précisée dans les documents produit fournis. À définir avec la base légale (CGU / politique de confidentialité), elle-même marquée ⚠️ Ouverte dans la spécification Confiance & Sécurité, et non couverte par aucune spécification actuelle.
