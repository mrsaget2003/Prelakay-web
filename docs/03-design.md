# 03 — Design System

**Statut : finalisé** — ce document est la référence unique pour toute décision visuelle sur Prélakay v1.

> **Mise à jour du 6 nov. 2026.** En cas d'écart avec `design-prelakay.md` v1.1 (couleurs, neutres, polices, ton), **`design-prelakay.md` v1.1 prévaut** : c'est lui qui est appliqué dans le prototype et dans le code. Les valeurs de couleur de ce fichier n'ont pas été modifiées. Ajouts de cette version : ton aligné sur le **vouvoiement** (§6) et nouvelle section **§9 Structure des pages**, calquée sur l'organisation d'AliExpress (règle CLAUDE.md §7), avec l'identité Prélakay. Il remplace l'ancien 00-super-prompt (identité `#0b0c10` / `#d65629` / Bricolage Grotesque / Poppins, **retirée**).

Pourquoi ce document compte : chaque composant codé, chaque couleur choisie « à l'instinct » sans passer par cette référence, c'est de la dette visuelle qu'on paiera au moment de scaler vers le PWA, le dashboard admin puis Flutter. Un design system resserré maintenant = une v1 qui a l'air d'une vraie marketplace, pas d'un prototype étudiant.

---

## 1. Identité de marque — en une phrase

Prélakay, c'est **le panier qui marche à votre place**. Le logo le dit littéralement : un panier de course posé sur une paire de jambes en mouvement. Toute la direction visuelle (couleur unique, formes arrondies, typographie chaleureuse) sert cette idée : la commodité en marche, ancrée en Haïti.

## 2. Couleurs

- ✅ Accent unique : **Bleu Lagon**, base `#0E6B74`
- ✅ Règle de répartition : 60 % blanc / 30 % noir / 10 % accent Lagon — c'est elle qui empêche l'interface de virer "app teal générique". Le Lagon doit rester rare pour rester fort : CTA principal, états actifs, liens, highlights. Jamais en fond de page.

### 2.1 Rampe Lagon (5 teintes)

Dérivée mathématiquement de la base `#0E6B74` (même teinte, luminosité ajustée), avec contrastes WCAG calculés contre blanc `#FFFFFF` et noir `#000000` :

| Token | Hex | Usage recommandé | Contraste / blanc | Contraste / noir |
|---|---|---|---|---|
| `lagon-100` | `#D0F7FB` | Fonds subtils, badges "nouveau", surbrillance douce | 1.1 (jamais comme texte) | 18.4 ✅ texte sur fond noir |
| `lagon-300` | `#58E1EF` | Hover sur fond sombre, accents décoratifs | 1.6 | 13.5 ✅ |
| `lagon-500` | `#0E6B74` **(base)** | CTA primaire, icônes actives, liens, accent 10 % | 6.2 ✅ AA sur blanc | 3.4 (déconseillé comme texte sur noir) |
| `lagon-700` | `#0D7882` | Texte lien sur fond blanc, bordures focus | 5.2 ✅ AA sur blanc | 4.0 (limite — réserver au texte large) |
| `lagon-900` | `#07373B` | Texte sur fond clair à fort contraste, mode sombre futur | 13.0 ✅ AAA sur blanc | 1.6 (à éviter sur noir) |

**Règle pratique** : si le texte est sur fond blanc → utiliser `lagon-700` ou `lagon-900` (jamais `lagon-500` seul pour du texte de petite taille, il passe AA de justesse mais reste préférable pour les CTA pleins, pas le texte courant). Si c'est un fond plein `lagon-500` avec texte dessus → texte blanc ou `lagon-100` exclusivement, jamais noir (voir §2.3).

### 2.2 Neutres

Dérivés de la même teinte (légèrement désaturés) pour garder une cohérence chromatique plutôt que des gris purs :

| Token | Hex | Usage |
|---|---|---|
| `neutral-0` | `#FFFFFF` | Fond principal (60 %) |
| `neutral-50` | `#F6F8F8` | Fonds de carte sur page blanche, séparation subtile |
| `neutral-200` | `#E1E6E6` | Bordures, dividers |
| `neutral-500` | `#7C8A8A` | Texte secondaire, placeholders |
| `neutral-900` | `#0F1414` | Texte principal, fond "noir" de la règle 60/30/10 (plus doux qu'un noir pur, flatte le Lagon) |

### 2.3 Couleurs fonctionnelles

| Token | Hex | Contraste / blanc | Contraste / noir | Usage |
|---|---|---|---|---|
| `success` | `#1B7F4F` | 5.0 ✅ AA | 4.2 (texte large uniquement) | Confirmation commande, paiement réussi |
| `error` | `#C7352E` | 5.3 ✅ AA | 4.0 (texte large uniquement) | Erreurs de formulaire, échec paiement |
| `warning` | `#D98A1E` | 2.8 (icône/badge seulement, pas de texte fin) | 7.6 ✅ | Stock faible, alerte non bloquante |

Ces trois couleurs restent volontairement sobres (pas de rouge/vert saturés "Bootstrap") pour ne pas entrer en compétition visuelle avec le Lagon.

## 3. Typographies

- ✅ **Surgena** — wordmark/logo uniquement, jamais en UI
- ✅ **Fraunces** — titres UI (apporte la chaleur, le côté "fait main" qui différencie Prélakay d'un clone AliExpress)
- ✅ **Onest** — corps de texte / labels (lisibilité à faible poids, performant en petite taille sur mobile)
- ✅ Polices servies en local en `.woff2` (pas de CDN Google Fonts — critique pour la performance sur les réseaux mobiles haïtiens, souvent en 3G/4G instable)

### 3.1 Échelle de tailles (standard marketplace, base 16px, ratio ~1.25)

| Niveau | Taille / interligne | Police | Usage |
|---|---|---|---|
| Display | 32px / 40px (desktop : 40px / 48px) | Fraunces SemiBold | Hero landing, titre de section marquant |
| H1 | 28px / 36px | Fraunces SemiBold | Titre de page |
| H2 | 22px / 30px | Fraunces Medium | Titre de section, nom de catégorie |
| H3 | 18px / 26px | Fraunces Medium | Titre de carte produit, sous-section |
| Body Large | 16px / 24px | Onest Regular | Description produit, contenu principal |
| Body | 14px / 20px | Onest Regular | Texte courant, listes |
| Label | 13px / 18px | Onest Medium | Labels de formulaire, boutons, tags |
| Caption | 12px / 16px | Onest Regular | Métadonnées (distance, date, prix barré) |

Poids disponibles à charger : Onest Regular/Medium/SemiBold, Fraunces Medium/SemiBold — pas plus, pour garder le bundle de polices léger.

## 4. Composants de base

Deux rayons, pas plus — ça suffit à créer une hiérarchie visuelle claire sans multiplier les variantes à maintenir :

| Token | Valeur | Usage |
|---|---|---|
| `radius-sm` | **10px** | Boutons, champs de formulaire, tags, petits contrôles |
| `radius-lg` | **20px** | Cartes produit, modales, bottom sheets, bannières |

### 4.1 Espacement

Grille 8pt (cohérente avec l'héritage mobile standard) : `4 / 8 / 12 / 16 / 24 / 32 / 48 / 64`. Le padding interne des cartes et le gap entre éléments de liste doivent toujours tomber sur une de ces valeurs.

### 4.2 Ombres

Une seule ombre fonctionnelle pour ne pas alourdir l'UI : `0 4px 12px rgba(15, 20, 20, 0.08)` — appliquée aux cartes produit et aux modales. Les boutons n'ont **pas** d'ombre (le relief vient de la couleur pleine Lagon, pas d'un effet skeuomorphe).

### 4.3 Bouton primaire

- Hauteur : 48px · Rayon : `radius-sm` (10px) · Padding horizontal : 16px
- Fond `lagon-500`, texte blanc, Label 13px Medium
- État hover/pressed : `lagon-700` · État disabled : `neutral-200` fond, `neutral-500` texte

### 4.4 Carte produit

- Rayon : `radius-lg` (20px) · Padding : 16px · Ombre : voir 4.2
- Fond `neutral-0` ou `neutral-50`

### 4.5 Champ de formulaire

- Hauteur : 48px · Rayon : `radius-sm` (10px) · Bordure 1px `neutral-200`
- État focus : bordure 2px `lagon-500` + léger halo `lagon-100` à 40 % d'opacité

### 4.6 Message d'erreur

- Fond `error` à 8 % d'opacité, texte `error` plein, icône Iconly "Danger" Duotone, rayon `radius-sm`, padding 12px — toujours accompagné d'un texte actionnable ("Réessayez" plutôt que "Erreur 500")

## 5. Iconographie

- ✅ **Iconly Pro**, styles **Duotone Rounded** (icônes actives/remplies) + **Rounded Outline** (icônes inactives/neutres) — cette paire duotone/outline est ce qui donne à l'UI son contraste d'intention (actif vs. au repos) sans dépendre uniquement de la couleur.

### 5.1 Fallback en attendant l'accès au MCP payant

Tant que l'accès Iconly Pro MCP n'est pas en place, utiliser **BoxIcon** (open-source, licence libre, même famille visuelle "rounded line icons") comme set de secours, avec un traitement pour simuler le duotone :
- État actif : icône BoxIcon pleine + calque de fond à 20 % d'opacité de la même couleur (simule l'effet "duotone")
- État inactif : icône BoxIcon en outline simple, `neutral-500`
- Mapping 1:1 à prévoir au moment du switch vers Iconly Pro (tenir une table icône-par-icône pour que le remplacement soit mécanique, pas une refonte)

## 6. Ton de marque

- ✅ Voix de marque : directe et amicale
- ✅ Tagline : « Cherchez-vous encore votre produit ? »
- ✅ Langue v1 : français uniquement (créole en v2)
- ✅ **Vouvoiement partout** (décision du 6 nov. 2026, alignée sur `design-prelakay.md` v1.1, qui remplace le tutoiement prévu ici) — y compris dans les messages d'erreur et les notifications transactionnelles
- ✅ Longueur des textes : standard (pas de micro-copy minimaliste façon Linear, ni de blocs longs façon notice légale) — une phrase, deux maximum, par message UI
- ✅ Pas d'humour dans les messages de paiement, de commande ou d'erreur — la confiance prime. *(`design-prelakay.md` v1.1 autorise un humour léger dans les états vides : il prévaut.)*

**Exemples de calibrage** (pour que l'équipe écrive dans le même registre) :
- Panier vide : *« Votre panier attend encore son premier article. »* — pas *« Oups, rien ici ! 😅 »*
- Erreur de paiement : *« Le paiement n'est pas passé. Vérifiez votre solde et réessayez. »* — pas un message technique brut
- Confirmation : *« Commande reçue. [Boutique] la prépare. »*

## 7. Logo

Le mark est un panier de course posé sur une paire de jambes en mouvement — "le panier qui marche". Six combinaisons officielles ont été produites et sont **les seules approuvées** pour la v1, chacune respectant la règle 60/30/10 à l'échelle du logo lui-même :

| Fichier | Fond | Mark |
|---|---|---|
| `logo-primary-blackbg` | Noir | Crème/blanc (usage principal sur fond sombre) |
| `logo-primary-lagonbg` | Lagon | Noir (usage principal sur fond accent) |
| `logo-secondary-blacklogo-on-lagonbg` | Lagon | Noir (variante pleine, événementiel/merch) |
| `logo-secondary-lagonlogo-on-blackbg` | Noir | Lagon (variante basse intensité, filigrane) |
| `logo-secondary-whitelogo-on-blackbg` | Noir | Blanc pur |
| `logo-secondary-whitelogo-on-lagonbg` | Lagon | Blanc pur |

### 7.1 Règles d'usage

- **Combos autorisés uniquement** : jamais de mark sur fond blanc/neutral-0 directement (aucune des 6 variantes ne le prévoit — sur fond blanc, utiliser le mark dans sa boîte de couleur, pas en flottant)
- **Zone de protection** : espace minimum autour du logo = hauteur de la boucle de l'anse du panier, sur les 4 côtés
- **Taille minimale** : 24px pour le mark seul (favicon, avatar app), 32px de hauteur minimum dès qu'il est accompagné du wordmark Surgena
- **Interdits** : ne pas recolorer en dehors des 6 combinaisons, pas d'ombre portée ni de contour ajouté, pas de rotation ni d'étirement non proportionnel, pas de pose sur photo sans superposition de fond uni (le mark perd en lisibilité sur fond complexe)
- **Favicon/app icon** : dériver du mark seul (sans wordmark) — `logo-primary-lagonbg` est le candidat par défaut pour un fond app icon cohérent avec l'accent de marque

## 8. Autres décisions de marque

- ✅ Dark mode : reporté à v1.1, pas dans le v1
- ✅ OG image : un OG par défaut (1200×630, asset statique) pour tout le site ; OG par fiche produit généré dynamiquement via template, jamais de fichiers statiques par produit
- ✅ Logo : finalisé, 6 combinaisons documentées ci-dessus (voir §7)

---

## Récapitulatif — ce qui était "À CONFIRMER" et est maintenant tranché

| Point ouvert | Décision prise dans cette version |
|---|---|
| Échelle typographique | Échelle standard marketplace définie §3.1 (Display → Caption) |
| Rayon/ombre/espacement composants | `radius-sm` 10px / `radius-lg` 20px, grille 8pt, ombre unique — §4 |
| Fallback icône Iconly Pro | BoxIcon + traitement duotone simulé, mapping prévu — §5.1 |
| Valeurs hex de la rampe + couleurs fonctionnelles | Rampe 5 teintes + success/error/warning avec contrastes WCAG calculés — §2 |
| Statut du logo | Finalisé, 6 combinaisons documentées — §7 |

Ce document est maintenant complet sur colors / typographie / composants de base / iconographie / ton / logo. Les sections Layout, Imagerie, Texture et Design System élargi restent, comme prévu, à construire séparément.

---

## 9. Structure des pages (référence AliExpress, identité Prélakay)

*Ajouté le 6 nov. 2026.* La **structure** et les **mécaniques** viennent d'AliExpress (CLAUDE.md §7) ; la **peau** vient de `design-prelakay.md` v1.1 (couleurs, Fraunces / Onest / Surgena, rayons 10 / 20 px, ombre unique, BoxIcon en attendant Iconly Pro). On ne reprend jamais le logo, les couleurs (rouge, orange), les textes, les badges commerciaux ni les programmes d'AliExpress. Prototype de référence : `prelakay-prototype.html` (acheteur, mobile + desktop).

### 9.1 Points de rupture

| Largeur | Grille produits | Navigation |
| --- | --- | --- |
| ≥ 1024 px (desktop) | 5 colonnes, conteneur 1240 px | Header AliExpress (§9.2) |
| 768 à 1023 px (tablette) | 3 colonnes | Coque de l'app (§9.2 bis) |
| < 768 px (mobile) | **2 colonnes**, comme l'app AliExpress | Coque de l'app (§9.2 bis) |

**Icônes du prototype : Font Awesome 6 Free** (remplace BoxIcons, ✅ 7 nov. 2026). En production, design-prelakay §4 prévoit Iconly Pro : *[À CONFIRMER] Font Awesome aussi en production ?*

**Règle : chaque destination n'a qu'une seule entrée par niveau de navigation (pas de doublons).**

### 9.2 Header desktop (structure du header AliExpress, relevée le 6 nov. 2026)

- **Ligne 1** (collante) : logo · *(pages internes : bouton ≡ qui ouvre « Toutes les catégories »)* · **barre de recherche** pleine (bordure 1,5 px `#0b0c10`, recherche par photo « À venir », bouton loupe noir) · à droite, 4 entrées :
  1. **Télécharger l'app** (QR) : au survol, QR code + App Store / Google Play, « À venir » (app native = V3).
  2. **Ville / langue / devise** (« Les Cayes/FR/HTG ») : au clic, *Retrait à* (pays, ville ; autres villes « bientôt »), *Langue* (Kreyòl « À venir »), *Devise* (HTG), Enregistrer.
  3. **Compte** : au survol, identité + solde wallet (ou Se connecter / Créer un compte) · Mes commandes · Mes Coins · Centre de messages (compteur) · Wallet · Wishlist · Mes coupons (« À venir ») · liens : Paramètres, Enregistrer sa Commerce, Espace vendeur, Centre d'aide, Retours et litiges, Se déconnecter. Un point `lagon-500` signale des messages non lus.
  4. **Panier** avec compteur.
  Sous 1400 px, icônes seules.
- **Ligne 2 (accueil seulement)** : « Toutes les catégories » · Nouveaux sur Prélakay (`lagon-700`) · Près de vous · Prêts à retirer · Carte des stores · 3 catégories · **Plus ▾**.
- **« Toutes les catégories »** : panneau pleine largeur au survol, fond assombri ; catégories à gauche ; à droite *Recommandé*, *Stores de la catégorie*, *Populaires*.
- **Recherche** : au focus, *Recherches récentes / populaires* + *Découvrir plus* ; à la saisie, suggestions avec la partie tapée en gras, puis les stores.
- **Rail flottant** (bord droit) : Donner votre avis · Haut de page.

### 9.2 bis Coque mobile (comme l'app AliExpress, ✅ 7 nov. 2026)

- **Barre d'onglets plate en bas** (fond blanc, icône + libellé, actif en noir) : **Accueil · Catégories · Panier · Compte**. Elle n'apparaît que sur ces 4 pages racines ; les autres pages s'ouvrent « par-dessus » avec une flèche retour. Remplace la décision du 6 nov. (pas de barre du bas) et l'ancienne pilule à panier flottant.
- **Haut de page** : Accueil = barre de recherche + bouton Chercher, puis onglets de catégories défilants ; Catégories = recherche ; Recherche/Discovery = retour + recherche ; fiche produit = boutons ronds retour · partager · panier posés sur la photo ; autres pages = retour + titre.
- **Catégories** : colonne de catégories à gauche, bannière, sous-catégories, stores, populaires à droite.
- **Barres d'action fixes** : fiche produit (Store · Wishlist · Au panier · Acheter), panier (Tout · total · Commander, au-dessus des onglets), paiement (total · Payer).
- Pas de pied de page sur mobile.

### 9.3 Accueil

Bannières (admin) → raccourcis de catégories ronds (mobile) → bande de confiance (Retrait en magasin · Paiement wallet · Argent protégé · Avis vérifiés) → **Près de vous** → **Nouveaux sur Prélakay** (quota, PRD §3) → **Prêts à retirer aujourd'hui** → **Pour vous** (grille + « Voir plus »). Les sections promotionnelles d'AliExpress (1 $, super deals…) **ne sont pas reprises**.

### 9.4 Carte produit

`radius-sm`, fond `#fffaf7`, ombre au survol. Image carrée (bandeau « Bientôt épuisé » si stock bas ; **bouton rond panier** en bas à droite) → titre 2 lignes (Onest 13 px) → **prix** (Onest 17 px gras) + prix barré → note ★ · « X vendus » → store + distance. Badge « Nouveau ».
**Bouton panier de la carte** : si le produit n'a pas de caractéristiques, ajout direct ; sinon ouverture de l'**aperçu rapide** (desktop, comme AliExpress : galerie, prix, caractéristiques, quantité, Vendu par, Ajouter au panier, Voir les détails) ou de la **feuille de caractéristiques** (mobile : photo, prix, stock, choix, quantité, Ajouter au panier).

### 9.4 bis Caractéristiques (SKU)

Chaque produit a 0 à 3 axes, avec stock par combinaison : Couleur (pastille), Taille, Pointure, **Longueur**, **Largeur**, Stockage, Capacité, Contenance, Poids, Format. Un choix épuisé est barré et non sélectionnable. Le libellé du choix (« Écru · 160 cm · 140 cm ») suit l'article jusqu'au panier, où il reste **modifiable** (puce de variante).

### 9.5 Fiche produit

- **Desktop** : galerie (miniatures verticales + image) et informations (titre, note, vendus, encadré prix, caractéristiques, quantité, stock). À droite, **panneau d'achat collant** : prix (après défilement) · *Vendu par* + Infos du store / Itinéraire · **Engagement Prélakay** · Acheter maintenant · Ajouter au panier · Partager + wishlist.
- **Ancres collantes** : Avis clients · Caractéristiques · Description · Questions · Store · Plus à découvrir. « Signaler ce produit ou ce store » en tête de la Description.
- **Avis** : note, répartition par étoiles, 3 critères, filtres (Tous, Avec photos, 5★, 4★, 3★), avis avec choix acheté, photos, réponse du store, Utile / Signaler ; « Voir les N avis » ouvre la page `#/p/:id/reviews`.
- Partage : WhatsApp en premier, copier le lien, QR code.

### 9.6 Page store (même modèle pour tous les stores)

Bandeau noir : logo rond, nom, badges (Store de confiance, physique / en ligne), note, % d'avis positifs, ventes, distance ; **recherche dans le store** ; Itinéraire, Partager. Onglets collants : **Accueil · Produits · Meilleures ventes · Nouveautés · Avis · À propos** · Promos (« À venir », coupons vendeurs v1.x). Produits : tri Pertinence · Commandes · Nouveautés · Prix ↑↓. À propos : adresse + mini-carte, horaires, depuis, catégorie, délai de paiement du store (escrow), politique de retour, Signaler ce store.

### 9.7 Panier et paiement

- Panier (AliExpress) : titre « Panier (n) », **cases rondes** (tout, par store, par article), groupe par store avec « Retrait gratuit · distance · horaires », article : photo, titre, wishlist, supprimer, **puce de caractéristiques modifiable**, prix + économie, quantité. Récapitulatif collant (articles, réductions, retrait gratuit, code promo « À venir », total estimé, **Commander (n)**) + blocs de confiance. Panier vide : appel à l'action + « Plus à découvrir ».
- Paiement : Retrait en magasin seul actif (Livraison « À venir »), point de retrait par store, paiement wallet, escrow, total, Payer.
- Confirmation : une commande par store, statut « Reçue ».

### 9.8 Compte (structure AliExpress)

- **Desktop** : fil d'Ariane, **barre latérale** (Aperçu, Commandes, Wallet, Retours et litiges, Mes avis, Paramètres, Centre de messages | Coins, Wishlist, Vus récemment, Inviter des amis « À venir » | Centre d'aide, Enregistrer sa Commerce | Se déconnecter) + carte « L'app Prélakay ».
- **Aperçu** : profil + Wishlist · Vus récemment · Coins · Coupons ; carte wallet ; **Mes commandes** (Reçues · En préparation · Prêtes pour retrait · À évaluer) + commandes en cours ; Retours et litiges ; Plus à découvrir. Mobile : en-tête dégradé, roue Paramètres, grille Services.
- **Commandes** : onglets (Toutes · Reçues · En préparation · Prêtes pour retrait · Retirées · À évaluer), recherche (n°, produit, store) + période, cartes : statut, date, n° + Copier, Détails, store, article, total, 2 actions.
- Sous-pages : Paramètres (Informations, Sécurité, Notifications, Langue et devise, Ville de retrait, Confidentialité), Centre de messages, Vus récemment, Retours et litiges, Mes avis, Centre d'aide (recherche + articles `#/help/:n`).

### 9.9 Commande prête pour retrait

Carte mise en avant : **code à 6 chiffres en grand** (Onest SemiBold 32 px, chiffres espacés), **QR code**, adresse et itinéraire du store, compte à rebours de 3 jours, rappel des frais de restockage *(montant [À CONFIRMER])*.

### 9.10 Espace vendeur (structure du Seller Center AliExpress, ✅ 7 nov. 2026)

Accès : Compte → Espace vendeur, après approbation du KYC (sinon page d'accueil vendeur avec « Enregistrer sa Commerce »). Même fichier et mêmes données que le côté acheteur : une commande payée apparaît chez le store, et chaque changement de statut côté vendeur est notifié à l'acheteur.

- **Coque desktop** : barre du haut (logo · « Espace vendeur » · Valider un retrait · Messages · Notifications · store et propriétaire · Retour aux achats) + **menu latéral** repliable : Accueil · Produits (Gérer, Ajouter, Stock et caractéristiques) · Commandes (Toutes, Valider un retrait, Retours et litiges) · Marketing (Outils, Partager mon store) · Finances (Solde et escrow, Retraits) · Avis et questions · Messages · Statistiques · Mon store (Profil, Politique de retour, Store de confiance) · Compte (Compte et sécurité, Notifications).
- **Coque mobile (app vendeur)** : barre d'onglets Accueil · Commandes · Produits · Messages · Plus (le menu complet).
- **Accueil** : checklist « Prêt à vendre » (premier produit, politique de retour, moyen de retrait) tant qu'elle n'est pas finie · **À faire** (à préparer, prêtes non retirées, questions, litiges, messages, stock bas) · solde · performances 7 jours · dernières commandes · actualités Prélakay.
- **Produits** : onglets par statut (Actifs, En modération, Brouillons, Rupture, Rejetés avec motif, Archivés), recherche, tableau, actions (modifier, voir, archiver, réactiver, dupliquer). **Formulaire** en sections : informations (titre, catégorie à 2 niveaux), photos (8 max) et vidéo, **caractéristiques** (jusqu'à 3 axes : couleur, taille, pointure, longueur, largeur…) avec **stock par combinaison**, prix et prix barré, description, poids et dimensions, remise et retour. Cycle Brouillon → En modération → Actif.
- **Commandes (fulfillment)** : Reçue (« À préparer ») → En préparation → Prête pour retrait (création du code et du QR, notification à l'acheteur) → Retirée. Annulation possible avant retrait (remboursement wallet). Non retirée après 3 jours : remboursement moins frais de restockage *[À CONFIRMER]*, stock remis à jour.
- **Valider un retrait** : saisie du code à 6 chiffres ou scan du QR ; libère le paiement selon l'escrow (3 jours, 24 h pour un store de confiance).
- **Retours et litiges** : délai de réponse 48 h ; rembourser intégralement, proposer un remboursement partiel ou contester (escalade admin).
- **Finances** : disponible, en escrow, déjà retiré, commission *(taux [À CONFIRMER])*, transactions filtrables ; **Retraits** vers MonCash, NatCash ou Sogebank (frais *[À CONFIRMER]*).
- **Avis** (réponse publique) et **Questions** (réponse publiée sur la fiche produit). **Messages** avec réponses rapides.
- **Statistiques** (Phase 10) : ventes, commandes, visites du store, % de produits dans des paniers en cours, taux de retrait, filtre 7 / 30 / 90 jours et onglets Ventes · Trafic · Acheteurs · Produits · Opérations ; détail des graphiques au §9.13.
- **Mon store** : identité (logo, bannière, nom en modération, description, catégorie, type), adresse et carte, horaires par jour, comptes (employés : V2 « À venir ») ; politique de retour (3 jours minimum) ; critères « Store de confiance » *[À CONFIRMER]*.
- **Marketing** : coupons, offres flash, événements (V1.x) et mise en avant payante (V2) affichés « À venir » ; partage du store (lien, WhatsApp, QR, affiche de vitrine) actif.

### 9.11 Espace admin (console Prélakay, ✅ 7 nov. 2026)

**Connexion (fictive dans le prototype)** : `#/admin/login`, page séparée du site (panneau de marque + formulaire). E-mail @prelakay.ht + mot de passe (afficher/masquer), « Rester connecté 8 heures », **vérification en deux étapes** (code à 6 chiffres par SMS, « Renvoyer le code »), « Mot de passe oublié » (message neutre, qui ne révèle pas si le compte existe), blocage après 5 échecs. Pas d'inscription : les comptes sont créés par un superadmin (« Demander un accès »). Toute route admin sans session renvoie vers la connexion, puis vers la page demandée.

**Rôles** (`admin_roles`) : Superadmin, Support, Finance, Marketing. Chaque rôle ne voit que ses sections ; une URL hors rôle affiche « Accès refusé ». Matrice dans Équipe et rôles.

- **Coque** : barre du haut `lagon-900` (recherche globale : commande, @utilisateur, store, produit · badge du rôle · menu du compte) + menu latéral groupé (Validation · Opérations · Contenu · Système). Mobile : barre d'onglets Accueil + 3 sections du rôle + Plus ; les tableaux deviennent des cartes.
- **Tableau de bord** : files d'attente (KYC, produits, signalements, litiges), indicateurs avec tendance, commandes par statut, progression du pilote (jauge 20 à 30 stores + courbe), activité récente, alertes. Graphiques : §9.13.
- **Statistiques** 🟡 (`#/admin/stats`, proposé, absent du PRD v1 qui prévoit un dashboard admin minimal) : onglets Commandes · Acheteurs · Stores · Catégories · Opérations (§9.13).
- **Validation** : dossiers KYC (Reçu → En vérification → Approuvé / Rejeté avec motif ; contrôles âge ≥ 18 ans, NIF, NINU, doublon ; NIF/NINU masqués) · produits à modérer (grille de contrôle, approuver / rejeter avec motif) · signalements (produit, avis, store : classer, retirer, masquer, avertir) · litiges (chez le store 48 h, à trancher, résolus ; rembourser, partiel, donner raison au store ; preuves de retrait).
- **Opérations** : stores (store de confiance, avertissement, suspension avec motif qui masque les produits), utilisateurs (bannir avec motif, lien de réinitialisation), commandes (annuler et rembourser si le store ne répond plus). Finances plateforme : V2 « À venir ».
- **Contenu** : bannières de l'accueil (créer, modifier, ordre, en ligne / masquée, dates), notifications (acheteurs, stores, un store ; app, WhatsApp, e-mail), catégories (2 niveaux + gabarit d'attributs). Events et flash-offers : V1.x « À venir ».
- **Système** : équipe et rôles (inviter, changer de rôle, retirer), paramètres (délais d'escrow, garde en magasin, Coins, litiges, quota ; commission et restockage *[À CONFIRMER]* ; modifiables par le Superadmin seulement), journal d'activité.

### 9.12 Escrow : vocabulaire réservé aux vendeurs (✅ 7 nov. 2026)

Le mot « escrow » et le montant « en escrow » n'apparaissent que dans l'espace vendeur et l'admin. Côté acheteur (wallet, paiement, commande, aide), on parle seulement d'« argent protégé » : le store est payé après le retrait, et l'acheteur est remboursé sur son wallet en cas de problème. Le wallet acheteur affiche le solde et les Coins, sans ligne « en escrow ».

### 9.13 Graphiques des dashboards (🟡 proposé le 7 nov. 2026)

Les dashboards vendeur et admin contiennent beaucoup de graphiques ; ils suivent tous les mêmes règles. Bibliothèque proposée pour la production : `04-trd.md` « Graphiques des dashboards ». **Couleurs de marque et polices inchangées.**

**Règles**
- **Un graphique répond à une question.** Un chiffre seul devient une **tuile** (valeur, variation vs période précédente, sparkline), pas un graphique.
- **Filtre de période en haut** (7 · 30 · 90 jours), sur une seule ligne, appliqué à toute la page ; onglets thématiques en dessous.
- **Un seul axe vertical** : jamais deux échelles sur le même graphique.
- **Marques fines** : colonnes de 24 px max, haut arrondi 4 px, 2 px d'écart entre segments empilés ; courbes de 2 px ; grille et axes discrets.
- **Légende dès 2 séries** ; texte toujours en couleur de texte, jamais en couleur de série.
- **Infobulle** au survol et au focus clavier ; curseur vertical sur les courbes.
- **« Voir les données »** sous chaque graphique (tableau), pour l'accessibilité et la lecture sur mobile.
- **Mobile (dès 360 px)** : une colonne, tuiles 2 par ligne, une étiquette d'axe sur deux.
- Montants en **HTG**, formats `fr-FR` (espace des milliers, « k » pour les milliers sur les axes).

**Palette des graphiques (🟡, extension de la palette, pas un changement de marque)**
- Une seule série : `lagon-500` (accent de marque).
- Séries distinctes (dans cet ordre fixe) : bleu `#2a78d6`, orange `#eb6834`, vert `#1baf7a`, jaune `#eda100`. Validée pour le daltonisme (script de contrôle des écarts de couleur) ; contraste faible du vert et du jaune compensé par la légende et le tableau. `lagon-500` n'est pas utilisé comme couleur de série : trop proche des autres pour un lecteur daltonien.
- Intensité (grille de chaleur, cohortes) : rampe `lagon-100` → `lagon-900`.
- Hausse / baisse : `lagon-500` / orange, zéro en gris.
- Période précédente et éléments secondaires : gris `#d8dada`.
- Couleurs d'état (succès, alerte, erreur) réservées aux états, toujours avec icône et texte.

**Catalogue (prototype)**

| Écran | Graphiques |
|---|---|
| Vendeur · Accueil | 4 tuiles (ventes 7 j, commandes, visites, produits dans des paniers) · colonnes des ventes sur 7 jours |
| Vendeur · Statistiques · Ventes | 4 tuiles · ventes par jour vs période précédente · commandes par statut (colonnes empilées) · ventes par sous-catégorie |
| Vendeur · Statistiques · Trafic | 4 tuiles · visites par jour (aire) · entonnoir visite → retrait · sources des visites |
| Vendeur · Statistiques · Acheteurs | qui paie (Haïti / diaspora) · répartition des notes · nouveaux et fidèles · heures de retrait (grille jour × heure) |
| Vendeur · Statistiques · Produits | meilleurs produits · évolution par produit (divergent) · stock par produit avec seuil bas · tendance par produit (sparklines) |
| Vendeur · Statistiques · Opérations | jauge du taux de retrait (objectif proposé 90 % *[À CONFIRMER]*) · jauge du délai de réponse aux questions · délai de préparation (trait « store de confiance : 2 h » *[À CONFIRMER]*) · litiges par motif |
| Vendeur · Produits | colonne « Ventes 14 j » (sparkline) |
| Vendeur · Finances | solde disponible (30 j) · libérations d'escrow prévues (7 j) · encaissements et retraits par semaine |
| Admin · Tableau de bord | 4 tuiles · commandes par statut (14 j) · jauge du pilote (trait à 20 stores) + courbe des stores actifs |
| Admin · Statistiques · Commandes 🟡 | 4 tuiles · commandes par jour · par statut · carte des commandes par zone de Les Cayes |
| Admin · Statistiques · Acheteurs 🟡 | 4 tuiles · Haïti et diaspora · rétention par cohorte · moyens de paiement · nouveaux comptes |
| Admin · Statistiques · Stores 🟡 | 4 tuiles · ventes par store · délai de préparation par store · croissance du nombre de stores (objectif 20) |
| Admin · Statistiques · Catégories 🟡 | commandes par catégorie · évolution par catégorie · recherches sans résultat |
| Admin · Statistiques · Opérations 🟡 | entonnoir KYC · issue des litiges · délais de traitement (objectif 24 h) · signalements et litiges par motif |
| Admin · Finances plateforme (V2, aperçu) | GMV · escrow en circulation · recharges et retraits · origine des fonds ; commission affichée « — » tant que le taux est ⚠️ ouvert |

Toutes les valeurs du prototype sont des **données de démonstration**. La commission, les frais de restockage et le Store Health Score restent ⚠️ ouverts : aucun graphique ne les calcule.

