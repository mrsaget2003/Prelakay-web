# Product

<!-- impeccable:product-schema 1 -->

> Résumé pour les outils de design (impeccable). La source de vérité reste `CLAUDE.md` et
> `docs/` (01-prd, 02-app-flow, 03-design, design-prelakay v1.1, CHANGELOG). En cas d'écart,
> ce sont eux qui ont raison.

## Platform

web

## Users

- **Acheteur** (`@username`) : d'abord aux Cayes, puis partout en Haïti. Découvre et achète
  dans des stores physiques ou virtuels, suit ses commandes, cumule Coins et points de fidélité.
- **Diaspora** : paie depuis l'étranger le panier d'un proche resté en Haïti.
- **Vendeur** (profil Business, nommé par son store) : accède à l'Espace vendeur après KYC
  approuvé ; gère catalogue, commandes, retraits en magasin, wallet.
- **Admin** : rôles Superadmin, Support, Finance, Marketing.

## Product Purpose

Donner à Haïti un canal d'achat en ligne structuré et fiable, là où la carte bancaire est peu
utilisée. Succès du pilote : des commandes réellement retirées ou livrées, sans litige.

## Positioning

Marketplace géolocalisée (référence de mécanique : AliExpress) dont les produits sont dans de
vraies boutiques proches : on commande en ligne, l'argent est protégé jusqu'au retrait ou à la
livraison, on récupère au comptoir avec un code ou un QR, ou on se fait livrer.

## Operating Context

- Mobile d'abord (dès 360 px), desktop aussi ; connexion parfois lente : polices locales, images
  optimisées.
- Retrait en magasin : code de retrait + QR, délai de 3 jours, rappels J+1 et J+2.
- Livraison dès le lancement (frais, zones, paiement du livreur : ouverts).
- Paiement : wallet Prélakay, MonCash, NatCash, Visa, Mastercard ; escrow quel que soit le moyen.
- Remboursement : toujours crédité sur le wallet (13 nov. 2026).

## Capabilities and Constraints

- Termes établis, à ne jamais renommer : Coins, Points de confiance, Points de fidélité,
  Store Health Score, escrow, Click & Collect, Store de confiance.
- L'acheteur ne voit jamais le mot « escrow » : seulement « argent protégé ».
- Français uniquement, vouvoiement partout ; pas de créole dans le prototype.
- Aucune nouvelle dépendance sans validation de Marc-Karlin ; pas de Tailwind ni shadcn ;
  icônes Font Awesome 6 Free en SVG local.
- Décisions ouvertes listées dans `CLAUDE.md` : ne jamais les trancher dans l'interface.

## Brand Commitments

- Nom : Prélakay (wordmark « Prelakay »). Logos dans `public/logo/`.
- Charte : `docs/design-prelakay.md` v1.1 (couleurs, polices, ton) — prévaut sur tout le reste.
- Mascotte réservée à la landing page.

## Evidence on Hand

- Photos : stand-ins Unsplash (licence libre) dans `lib/data/mock/images.ts` et
  `lib/data/mock/partnerImages.ts`, à remplacer par les photos réelles des stores.
- Aucun témoignage, aucun chiffre d'usage, aucun logo de partenaire réel : ne jamais en inventer.
  Ce qui n'est pas tranché s'annonce comme ouvert.

## Product Principles

1. Chaque produit est dans une vraie boutique, à une distance qu'on peut marcher.
2. L'argent de l'acheteur est protégé, et l'interface le dit simplement.
3. Les mécaniques connues d'AliExpress d'abord ; on s'en écarte seulement pour les adaptations
   haïtiennes documentées.
4. Rien d'inventé : ni fonctionnalité hors PRD, ni preuve sociale.

## Accessibility & Inclusion

Contraste WCAG AA (design-prelakay §7), anneau de focus Lagon 2 px, cibles tactiles ≥ 44 px,
`prefers-reduced-motion` respecté.
