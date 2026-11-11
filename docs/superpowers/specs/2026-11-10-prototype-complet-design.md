# Prototype complet : toutes les versions actives, livraison, partenaires, Nivo, Sileo, Motion

*10 nov. 2026 · Décisions de Marc-Karlin dans la conversation du 10 nov. · Suite des phases B7 (vendeur) et B8 (admin)*

## 1. Intention

Le prototype Next.js sert à **faire avancer le produit** : il doit montrer et faire marcher tout ce que Prélakay fera, pas seulement la V1. Le CHANGELOG reste la règle de **mise en production** : au branchement sur la base (Phase D), on « nettoie » en réactivant la règle « À venir » version par version. D'ici là, le prototype n'affiche plus « À venir ».

Deuxième intention : le prototype « manque de vie ». On ajoute du mouvement et des composants plus vivants, **sans casser la mise en page identique au prototype HTML**.

## 2. Décisions de Marc-Karlin (10 nov. 2026)

| # | Décision |
| --- | --- |
| D1 | Ignorer la règle « À venir » du CHANGELOG dans le prototype : construire et activer tout ce qui était bloqué. **Exclus** : application Flutter (V3), PWA livreur complète, sourcing international (bloqué par CLAUDE.md). |
| D2 | **Nivo** (nivo.rocks) pour tous les graphiques et aperçus graphiques. |
| D3 | **Admin : carte géographique des ventes**, part en % et montant par zone (ex. « Les Cayes : 10 % · 48 200 HTG »). Niveau **département du Sud** (communes) validé. |
| D4 | Mascotte (page-mascot) : **abandonnée ici**, gardée pour la landing page. |
| D5 | **Tri des toasts** : les actions déjà visibles à l'écran (ex. ajouter au panier) n'ont plus de toast. |
| D6 | **Sileo** pour les toasts. |
| D7 | **Motion** validé. Composants Spectrum UI repris (serveur MCP `spectrum-ui` ajouté), **traduits dans nos styles** : ni Tailwind ni shadcn. |
| D8 | **Livraison dès le lancement**, à côté du Click & Collect. Pied de page : « Devenir partenaire de livraison ». |
| D9 | Pages **partenaire de paiement** et **partenaire de livraison** détaillées, inspirées d'AliExpress. |
| D10 | Essayer d'autres bibliothèques ou composants pour améliorer l'interface, **sans casser le prototype**. Validées : `@number-flow/react`, `vaul`, `embla-carousel-react`. |
| D11 | **On garde le français** : pas de traduction créole dans le prototype ; l'option Créole reste « À venir ». |

D8 modifie le PRD (« Click & Collect, seul mode de fulfillment ») et CLAUDE.md : la décision est inscrite, datée, dans « Décisions récentes ».

## 3. Contraintes

- `app/proto.css` reste intact ; tout ajout va dans `app/proto-next.css` ou dans des fichiers CSS dédiés, avec les couleurs et polices de `design-prelakay.md`.
- **Garde-fou visuel** : les captures côte à côte (1280 et 360 px) doivent rester identiques au prototype **au repos**. Le mouvement n'apparaît qu'aux interactions et aux entrées d'éléments, et respecte `prefers-reduced-motion`.
- Mobile dès 360 px partout. Vouvoiement. « Escrow » jamais côté acheteur.
- Dépendances : **validées** `@nivo/*`, `sileo`, `motion`, `@number-flow/react`, `vaul`, `embla-carousel-react`. Toute autre bibliothèque est **proposée** (§9), pas installée, jusqu'au « oui » de Marc-Karlin.
- Aucune donnée de démo en production : `PRELAKAY_ENV=production` refuse toujours le mode démo.
- Les points ⚠️ / [À CONFIRMER] restent des valeurs de démonstration dans `lib/config/business.ts`, marquées comme telles. Rien n'est tranché.

## 4. Versions : tout actif dans le prototype

- `lib/config/release.ts` garde le tableau des fonctionnalités. Nouvelle valeur `CURRENT_RELEASE = "all"` utilisée **uniquement** quand `PRELAKAY_ENV=demo` ; en production, la valeur reste `"1"`.
- `<ComingSoon>`, le toast « À venir », la redirection des routes futures et l'API `403` restent dans le code (ils serviront au nettoyage), mais ne se déclenchent plus en démo.
- Restent « À venir » même en démo : `native_app` (bandeau « Télécharger l'app »), `sourcing` (« Produits du monde ») et `creole` (D11).
- CHANGELOG : ajout d'une section « Prototype (10 nov. 2026) » qui explique cette exception. Le tableau des limites n'est pas supprimé.

## 5. Fonctionnalités à activer

Pour chacune : les écrans existent déjà (construits « visibles »). Le travail consiste à les faire marcher sur l'état de démo, côté acheteur, vendeur et admin.

| Fonctionnalité | Acheteur | Vendeur | Admin |
| --- | --- | --- | --- |
| **Coupons** | Hub « Mes coupons », champ « Code promo » au paiement, onglet Promos du store, coupon de bienvenue | Créer / suspendre un coupon (%, seuil, code à 6 caractères, dates, stock) | Liste et désactivation |
| **Offres flash 24 h** | Bandeau et compte à rebours, prix flash | Proposer un produit (seuil de points de confiance) | Valider les propositions |
| **Events / promos globaux** | Page event, produits participants | Participer à un event | Page Events : créer, planifier, exonération de commission |
| **Badges** | Badge VIP acheteur, badges des stores | Badge affiché, progression | Règles de seuil (valeurs de démo) |
| **Parrainage** | « Inviter des amis » : lien, suivi, 500 Coins *(anti-abus ⚠️ : non implémenté, signalé)* | — | Suivi des parrainages |
| **Ambassadeurs étudiants** | Candidature, tableau des parrainages, Coins | — | Valider les ambassadeurs |
| **Dispute Center complet** | — | — | Toutes les étapes, messages, pièces, décision |
| **Mode sombre** | Interrupteur dans Paramètres (tokens `design-prelakay.md` §7) | idem | idem |
| **Livraison** | §6 | §6 | §6 |
| **Prelakay+** | Abonnement 1 500 HTG / mois payé par le wallet, badge or, réductions | — | Abonnés |
| **Inscription par téléphone** | Numéro + code SMS ; en démo, le code s'affiche dans le bandeau démo | — | — |
| **Comptes employés** | — | Inviter un employé, rôles (préparation, caisse) | — |
| **Recherche vocale** | API Web Speech du navigateur (pas de dépendance) ; sinon message clair | — | — |
| **Recherche par photo** | Choisir une photo → résultats de démo de la catégorie la plus proche | — | — |
| **Scan de code-barres** | `BarcodeDetector` du navigateur si présent, sinon saisie du code | Scan dans le formulaire produit | — |
| **Produits boostés** | Mention « Sponsorisé » dans les résultats | Booster un produit (budget payé par le solde) | Suivi des boosts |
| **Finances plateforme** | — | — | Page Finances : GMV, commissions *(taux ⚠️, valeur de démo)*, escrow en circulation, retraits en attente |

### 5.1 Créole

Hors périmètre (D11) : l'option reste visible, grisée, avec « À venir ».

## 6. Livraison (D8)

### Acheteur
- Au paiement, par store : **Retrait en magasin** ou **Livraison**. La livraison demande une adresse (quartier des Cayes + repère, téléphone).
- Frais de livraison : **valeur de démo** par zone, dans `BUSINESS` *[À CONFIRMER]*.
- Statuts : Reçue → En préparation → Remise au livreur → En route → Livrée. Page de suivi : frise d'étapes, nom et téléphone du livreur, position simulée sur le plan des Cayes.
- **Code de livraison** (même format que le code de retrait), à donner au livreur ; sa validation libère l'argent protégé.
- Coins : le bonus « retrait en magasin plutôt qu'une livraison » du PRD s'applique, ce qui le rend visible pour la première fois.

### Vendeur
- Formulaire produit : la ligne « Livraison » devient active (produit livrable ou non).
- Commandes en livraison : « Préparer » → « Remettre au livreur », avec le livreur affecté.
- Politique du store : zones livrées.

### Admin
- **Livraisons** : liste, statuts, affectation d'un livreur de démo, incidents.
- **Partenaires** : candidatures (§7).

### Hors périmètre
La PWA livreur (D1). Le livreur est simulé : sa progression avance toute seule en démo.

### Points ouverts, non tranchés
- ⚠️ Frais de livraison, zones couvertes, qui paie le livreur et comment.
- ⚠️ Déclencheur de libération de l'escrow à la livraison, et délai.
- ⚠️ Remboursement en cas d'échec de livraison.

## 7. Pages partenaires (D9, inspirées d'AliExpress)

Même gabarit pour les deux pages, dans le pied de page (colonne « Vendre ») : « Devenir un partenaire de paiement » (existe, à refaire) et **« Devenir partenaire de livraison »** (nouveau, route `/partenaires/livraison`).

Sections, de haut en bas :
1. **Bandeau** : titre, phrase de promesse, bouton « Déposer une candidature » (ancre vers le formulaire), visuel.
2. **Chiffres du pilote** : stores, commandes, quartiers couverts (données de démo, marquées « pilote »).
3. **Pourquoi Prélakay** : 3 à 4 avantages en cartes.
4. **Comment ça marche** : 4 étapes numérotées (candidature → vérification → intégration ou formation → premières transactions ou livraisons).
5. **Profils recherchés** : qui peut postuler et ce qu'il faut fournir.
6. **Questions fréquentes** : accordéon.
7. **Formulaire de candidature**.
8. **Contact** : e-mail partenaires.

| | Partenaire de paiement | Partenaire de livraison |
| --- | --- | --- |
| Pour qui | Opérateurs mobiles (MonCash, NatCash), banques (Sogebank…), transferts diaspora (Wise, Stripe, Meru), **points de recharge** (commerces qui encaissent du cash) | **Livreurs indépendants** (moto, vélo, voiture) et **sociétés de livraison** |
| Avantages | Volume des paiements du pilote, clientèle diaspora, intégration simple | Revenus par course, horaires libres, paiement sur le wallet, assurance *[À CONFIRMER]* |
| Exigences | Agrément, API ou réseau d'agents, conformité | 18 ans et plus, pièce d'identité (NIF / NINU), permis et véhicule, téléphone Android |
| Formulaire | Organisation, type, pays, contact, volume estimé, message | Particulier ou société, nom, téléphone, quartier, véhicule, disponibilités, pièces (recto / verso) |
| Après envoi | Écran « Candidature reçue » avec numéro de dossier | idem, et suivi dans le compte si l'utilisateur est connecté |

Les candidatures arrivent dans **Admin → Partenaires** (rôles Superadmin, Support ; Finance voit les candidatures de paiement), avec les actions Approuver, Rejeter avec motif, Demander des pièces, toutes journalisées.

## 8. Graphiques Nivo (D2, D3)

- Paquets : `@nivo/core`, `@nivo/line`, `@nivo/bar`, `@nivo/pie`, `@nivo/heatmap`, `@nivo/funnel`, `@nivo/geo` (et `@nivo/bump` ou `@nivo/radar` si un graphique le demande).
- Un **thème Nivo** unique tiré des tokens (polices, couleurs, grilles), avec ses variantes clair et sombre.
- Le kit `vz` est remplacé graphique par graphique ; ses données (`sData`, `pData`) sont gardées. Les tuiles, jauges et sparklines simples peuvent rester en SVG maison si Nivo n'apporte rien.
- **Accessibilité** : le tableau « Voir les données » reste sous chaque graphique (Nivo est peu utilisable au clavier).
- Chargement côté client uniquement (pas de rendu serveur des graphiques), avec un squelette pendant le chargement.

### Carte des ventes (admin)
- **Sud (communes)** : choroplèthe `@nivo/geo`. Couleur = part des ventes ; infobulle et légende = « 10 % · 48 200 HTG ». Les contours sont ceux de **geoBoundaries HTI ADM2** (CC BY 4.0), simplifiés et enregistrés dans le projet ; la source est créditée dans la page Crédits.
- **Les Cayes (quartiers)** : bulles proportionnelles sur le plan de démo (zones `ZONES`), avec le pourcentage et le montant.
- Filtres 7 / 30 / 90 jours ; bascule « Ventes » / « Commandes » ; classement des zones à côté de la carte.
- Placement : tableau de bord admin (aperçu) et page Statistiques (carte complète).

## 9. Toasts, mouvement et vie de l'interface (D5, D6, D7, D10)

### Tri des toasts
**Règle** : pas de toast quand le résultat se voit déjà à l'endroit de l'action.

| Sans toast | Avec toast (Sileo) |
| --- | --- |
| Ajouté au panier → le badge du panier rebondit, le bouton affiche « Ajouté ✓ » | Erreurs (solde insuffisant, paiement refusé, choix épuisé) |
| Panier mis à jour, déplacé dans la wishlist, favori | Effets invisibles ici : « l'acheteur a reçu son code », « le store est prévenu », « notification envoyée » |
| Lien copié → le bouton affiche « Copié » | Fins de parcours : commande payée, dossier envoyé, retrait demandé |
| « Ouverture de WhatsApp… » | Actions admin irréversibles (banni, suspendu) avec « Annuler » quand c'est possible |
| Erreurs de champ (« Indiquez un nom ») → message sous le champ | |

La classification de chacun des ~60 messages actuels est faite pendant la construction, selon cette règle. Les messages de validation des champs deviennent des erreurs en ligne.

### Sileo
`<Toaster>` unique ; type (succès, erreur, info) et position (haut au centre sur mobile, haut à droite sur desktop) ; styles ajustés aux tokens de la marque. L'API `toast.show` existante est conservée en façade : les appels changent peu.

### Motion et composants Spectrum UI (traduits dans nos styles)
- **Compteurs animés** : solde du wallet, Coins, tuiles des tableaux de bord.
- **Bouton J'aime** : wishlist.
- **Maintenir pour confirmer** : bannir, suspendre, annuler une commande.
- **Cloche de notifications** avec pastille animée.
- **Apparition progressive** au chargement des listes et des cartes produits, avec un léger décalage entre elles.
- **Transitions** de la feuille du bas et des modales ; onglets avec soulignement qui glisse.
- **Étapes** : frise de suivi de commande et de livraison animée.
- **Pilule « Annuler »** après une suppression (panier, bannière).

### Autres bibliothèques (D10 : validées)
- `@number-flow/react` : chiffres animés (prix, totaux, solde, Coins, tuiles).
- `vaul` : feuille du bas avec geste de glisser sur mobile (remplace l'animation de la feuille actuelle, même apparence).
- `embla-carousel-react` : carrousel de l'accueil et galerie produit avec glisser naturel.

## 10. Non-objectifs et anti-objectifs

**Non-objectifs** : application Flutter, PWA livreur, sourcing international, mascotte, Tailwind et shadcn, vrais paiements, base de données (Phase D), traduction créole (D11).

**Anti-objectifs** (échec même si ça marche) :
- la mise en page au repos s'écarte du prototype ;
- des animations qui ralentissent un téléphone d'entrée de gamme ou ignorent `prefers-reduced-motion` ;
- « escrow » visible par l'acheteur ;
- un point ⚠️ codé comme une valeur définitive.

## 11. Ordre de construction proposé

Chaque lot passe les vérifications (types, lint, Vitest, e2e aux 4 largeurs, captures) avant le suivant ; tout se fait sur une branche `feat/phase-b9-prototype-complet`.

1. **Fondations** : installation de `motion`, `sileo` et Nivo ; `CURRENT_RELEASE = "all"` en démo ; façade de toast Sileo et tri des toasts ; thème Nivo.
2. **Graphiques** : migration vendeur et admin vers Nivo ; carte des ventes Sud et Les Cayes.
3. **Livraison** : acheteur, vendeur, admin.
4. **Pages partenaires** : paiement, livraison, file Admin → Partenaires.
5. **Marketing** : coupons, offres flash, events, boost, badges.
6. **Croissance** : parrainage, ambassadeurs, Prelakay+.
7. **Comptes et recherche** : téléphone + SMS, comptes employés, recherche vocale, photo, code-barres.
8. **Admin** : Dispute Center complet, finances plateforme.
9. **Confort** : mode sombre.
10. **Vie de l'interface** : composants Motion / Spectrum sur les trois espaces.
11. Mise à jour du CHANGELOG, de CLAUDE.md et des branches `acheteur`, `vendeur`, `admin`.

## 12. Laissé au constructeur

- Le découpage exact des composants et des fichiers.
- Les données de démonstration (montants, noms, zones de livraison), cohérentes avec le seed existant.
- Le choix des graphiques Nivo pour chaque série, tant que l'information reste la même.
- La classification fine des toasts selon la règle du §9.
- L'emplacement exact des animations, dans les limites du §3.
