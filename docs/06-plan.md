# 06 — Plan d'implémentation

✅ **Ordre de construction révisé (29 oct 2026)** — le PWA passe devant la landing page complète, avec un garde-fou pour ne pas perdre la capacité de générer des leads pendant la construction :

1. **Landing page v1 "ads"** — version rapide, vibecodée avec Claude Code, uniquement pour capter des emails et pouvoir lancer des publicités pendant que le PWA se construit. Ne bloque rien d'autre.
2. **PWA complet** (Discovery + Click & Collect + Wallet) — **deadline : fin décembre**. C'est désormais la priorité absolue du planning.
3. **Dashboard admin minimal** — en parallèle du début du PWA, comme prévu.
4. **Landing page finale** (version soignée, preuve sociale, témoignages dynamiques) — après le PWA, une fois qu'il y a un vrai produit à montrer.
5. Dashboard vendeur complet → App Flutter (dernière), inchangé.

*Pourquoi ce changement est le bon choix :* une landing page polie sans produit derrière ne convertit pas des vendeurs pilotes — elle ne fait que collecter des emails qui refroidissent en attendant. Inverser l'ordre raccourcit le chemin vers la première commande réelle (le vrai critère de succès du pilote, §5 du PRD), tout en gardant un canal d'acquisition actif via la landing v1.

Chaque étape tient en une session et se termine par quelque chose de vérifiable dans le navigateur. Une fois une étape terminée, elle est figée — toute modification passe par une nouvelle étape, jamais par une retouche en passant.

## Phase 0 — Préparation
1. Figer le TRD (04-trd.md) et créer le projet Supabase (région Europe) + repo Next.js. **Vérifiable :** déploiement "Hello Prelakay" en ligne sur Netlify/Vercel.
2. Design tokens de base (couleurs Bleu Lagon, typographies Fraunces/Onest/Surgena en `.woff2`, composants bouton/carte), **valeurs de `design-prelakay.md` v1.1**. **Vérifiable :** page de style guide affichant les tokens.
2bis. Fichier de versions `src/config/release.ts` (`CURRENT_RELEASE`, version de chaque fonctionnalité), helper `isAvailable()`, composant « À venir » et protection des routes et de l'API (voir `CHANGELOG.md`). **Vérifiable :** un bouton d'une version future affiche le toast « À venir » et son API répond 403.

## Phase 1 — Landing page v1 "ads" (rapide, vibecodée)
3. Une seule session, vibecodée avec Claude Code : hero + proposition de valeur + liste d'attente (formulaire email), sans témoignages ni contenu dynamique Supabase — ce n'est pas la version finale. **Vérifiable :** un email de test s'enregistre en base, site en ligne sur prelakay.com, prêt à recevoir du trafic publicitaire.

*Cette étape remplace temporairement les anciennes étapes 3-5 (déplacées en Phase 11bis, après le PWA, une fois qu'il y a un produit réel à montrer).*

## Phase 2 — Authentification & comptes (début du PWA)
6. Auth : **BetterAuth** (ou équivalent self-hosted — 🟡 bibliothèque exacte à confirmer), choisi explicitement pour ne pas avoir à acheter un domaine dédié au service d'authentification. Email + mot de passe, Google. **Vérifiable :** création de compte et connexion réelles, aucun domaine supplémentaire acheté.
7. Profil user minimal (`@username`, avatar, Coins à 0). **Vérifiable :** la page Compte affiche le profil créé.

## Phase 3 — Dashboard admin minimal (en parallèle)
8. Login admin + rôles de base. **Vérifiable :** connexion admin réussie, accès refusé à un compte user normal.
9. File d'approbation KYC vendeur (lecture dossier + approuver/rejeter). **Vérifiable :** un dossier test passe de "Reçu" à "Approuvé".
10. Création d'un banner/event simple. **Vérifiable :** le banner apparaît côté PWA.

## Phase 4 — Catalogue & fiche produit
11. Arbre de catégories (2 niveaux) + gabarit d'attributs par catégorie. **Vérifiable :** 2 catégories test avec des champs différents.
12. Formulaire d'ajout produit vendeur (titre, photos, prix, variantes/stock). **Vérifiable :** un produit test passe par le cycle Brouillon → Actif.
13. Fiche produit acheteur (galerie, variantes, avis vides, Q&A vide). **Vérifiable :** la fiche s'affiche correctement sur mobile.

## Phase 5 — Discovery
14. Recherche + autocomplete basique (produits/catégories). **Vérifiable :** la recherche d'un produit test le retrouve.
15. Filtres (prix, distance, note) + tri. **Vérifiable :** filtrer par prix réduit bien la liste affichée.
16. Algorithme de classement v1 (pertinence + quota "Nouveaux sur Prelakay"). **Vérifiable :** un produit récent apparaît en tête même sans ventes.

## Phase 6 — Panier & Wallet
17. Panier multi-store (ajout/suppression/tri). **Vérifiable :** le panier persiste après rafraîchissement.
18. Recharge wallet (une passerelle d'abord, ex. MonCash sandbox). **Vérifiable :** le solde wallet augmente après une recharge test.
19. Paiement panier via wallet → fonds en escrow. **Vérifiable :** commande créée, solde débité, escrow visible.

## Phase 7 — Click & Collect (cœur du pilote)
20. Checkout avec mode "Retrait en magasin" (store par store). **Vérifiable :** commande créée avec statut "Reçue".
21. Fulfillment vendeur (Reçue → En préparation → Prête pour retrait) + génération code/QR. **Vérifiable :** le code est visible côté acheteur et vendeur.
22. Validation du retrait (scan/saisie code) → statut "Retiré" + libération d'escrow programmée. **Vérifiable :** la commande passe à "Retiré", un reçu est généré.
23. Rappels J+1/J+2 + non-retrait après 3 jours (remboursement partiel, stock débloqué). **Vérifiable :** un cas test de non-retrait déclenche le remboursement.

## Phase 8 — Confiance
24. Avis vérifiés (uniquement après commande retirée), notes multi-critères. **Vérifiable :** impossible de laisser un avis sans commande liée.
25. Signalement produit + file de modération admin. **Vérifiable :** un signalement test apparaît dans le dashboard admin.

## Phase 9 — Coins, liens partageables, coupons
26. Coins (commande, avis) + Coins de bienvenue. **Vérifiable :** le solde Coins augmente après une commande test.
27. Liens partageables (produit, panier mode consultation, profil) + bouton WhatsApp. **Vérifiable :** un lien ouvert sur un autre appareil affiche bien le contenu attendu.
28. Coupons vendeur (création, application au checkout). **Vérifiable :** un code coupon réduit le total du panier.

## Phase 10 — Dashboard vendeur complet
29. Stats (visites du profil, % de produits dans les paniers en cours, croissance). **Vérifiable :** chiffres réels affichés, pas statiques.
30. Centre financier vendeur (solde disponible/en attente, historique des retraits). **Vérifiable :** le solde correspond aux commandes réellement retirées.

## Phase 11 — Lancement pilote Les Cayes
31. Onboarding des 20-30 stores pilotes dans le dashboard vendeur, avant ouverture publique du PWA. **Vérifiable :** X stores avec au moins 1 produit actif chacun.
32. Ouverture publique du PWA aux acheteurs de Les Cayes. **Vérifiable :** une première commande réelle de bout en bout (achat → retrait → avis).

## Phase 11bis — Landing page finale
33. Reprendre les anciennes étapes "Landing page (Mois 1)" avec le vrai produit comme preuve : structure + hero + liste d'attente, sections "Comment ça marche" par rôle avec témoignages tirés de Supabase (plus de contenu en dur), déploiement final sur prelakay.com. **Vérifiable :** site en ligne, contenu dynamique, formulaire fonctionnel de bout en bout — avec un vrai PWA à montrer derrière.

## Phase 12 — Plus tard (hors plan détaillé ici)
- Dispute Center complet, events/promos avec exonération, flash-offers, badges
- Dashboard financier plateforme (GMV, commissions)
- Livraison Prelakay (PWA livreur, KYC chauffeurs, tracking)
- Prelakay+ (abonnement)
- Application Flutter
- **v1.1 — Sourcing international (nouveau, voir 01-prd.md §3 et 05-backend.md)** : achat pour le compte du client sur Shein/Amazon/Temu, facturé produit + taxes + livraison vers Haïti, visible dans son historique de commandes une fois reçu. Hors scope du plan détaillé ci-dessus car postérieur au pilote Les Cayes.
