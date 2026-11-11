import type { FeatureKey } from "@/lib/config/release";
// Contenu de démonstration du prototype : bannières de l'accueil (gérées par l'admin,
// 03-design §9.11 Contenu). Portées à l'identique (ligne ~1758 du prototype).

export type Banner = { id: string; on: boolean; c: string; k: string; h: string; b: string; href: string; i: string; from: string; to: string };

export const BANNERS: Banner[] = [
  { id: "b1", on: true, c: "s1", k: "Retrait en magasin", h: "Commandez en ligne, récupérez en 2 heures", b: "Voir les stores", href: "/map", i: "fa-solid fa-store", from: "1 nov. 2026", to: "31 déc. 2026" },
  { id: "b2", on: true, c: "s2", k: "Wallet Prélakay", h: "Payez le panier d'un proche, même depuis l'étranger", b: "Découvrir le wallet", href: "/wallet", i: "fa-solid fa-wallet", from: "1 nov. 2026", to: "31 déc. 2026" },
  { id: "b3", on: true, c: "s3", k: "Nouveaux sur Prélakay", h: "Les stores pilotes de Les Cayes sont là", b: "Voir les nouveautés", href: "/discover?sort=new", i: "fa-solid fa-rocket", from: "1 nov. 2026", to: "30 nov. 2026" },
];

/** Avis de démonstration (REVS du prototype) : [@auteur, note, texte, réponse du store, avec photos]. */
export const REVS: [string, number, string, string, boolean][] = [
  ["@nadege_cayes", 5, "Produit conforme, retiré en 1 heure. Le store est très accueillant.", "Merci Nadège, à bientôt !", true],
  ["@jowan509", 4, "Bonne qualité. J'aurais aimé plus de couleurs.", "", false],
  ["@tidodo", 5, "Payé avec le wallet depuis Miami pour ma sœur, elle a récupéré le jour même.", "Merci pour votre confiance !", true],
  ["@ketia.b", 4, "Bon rapport qualité-prix. Le code de retrait a marché du premier coup.", "", false],
  ["@ricardo_sud", 3, "Correct, mais il a fallu attendre un peu au comptoir.", "Désolé pour l'attente, nous avons ajouté une caisse.", false],
  ["@mimi_ht", 5, "Exactement comme sur les photos.", "", true],
];

/** Menu latéral du compte (ACC du prototype) : [clé, icône, libellé, lien, fonctionnalité d'une version future ?] ; "-" = séparateur.
 *  La fonctionnalité sert au « À venir » hors prototype (lib/config/release.ts). */
export const ACC: ([string, string, string, string, FeatureKey?] | ["-"])[] = [
  ["account", "fa-solid fa-table-cells-large", "Aperçu", "/account"],
  ["orders", "fa-solid fa-receipt", "Commandes", "/orders"],
  ["wallet", "fa-solid fa-wallet", "Wallet", "/wallet"],
  ["disputes", "fa-solid fa-rotate-left", "Retours et litiges", "/disputes"],
  ["myreviews", "fa-regular fa-star", "Mes avis", "/myreviews"],
  ["settings", "fa-solid fa-gear", "Paramètres", "/settings"],
  ["notifications", "fa-regular fa-bell", "Centre de messages", "/notifications"],
  ["-"],
  ["coins", "fa-solid fa-coins", "Coins", "/coins"],
  ["wishlist", "fa-regular fa-heart", "Wishlist", "/wishlist"],
  ["viewed", "fa-solid fa-clock-rotate-left", "Vus récemment", "/viewed"],
  ["coupons", "fa-solid fa-ticket", "Mes coupons", "/account/coupons", "coupons"],
  ["invite", "fa-solid fa-user-plus", "Inviter des amis", "/invite", "referral"],
  ["plus", "fa-solid fa-crown", "Prélakay+", "/plus", "prelakay_plus"],
  ["-"],
  ["help", "fa-solid fa-circle-question", "Centre d'aide", "/help"],
  ["sell", "fa-solid fa-store", "Enregistrer son commerce", "/sell"],
];

/** Raccourcis « Services » du compte mobile. */
export const SERVICES: [string, string, string, FeatureKey?][] = [
  ["/notifications", "fa-regular fa-bell", "Messages"],
  ["/myreviews", "fa-regular fa-star", "Mes avis"],
  ["/help", "fa-solid fa-circle-question", "Aide"],
  ["/sell", "fa-solid fa-store", "Vendre"],
  ["/invite", "fa-solid fa-user-plus", "Inviter des amis", "referral"],
  ["/plus", "fa-solid fa-crown", "Prélakay+", "prelakay_plus"],
  ["/settings", "fa-solid fa-gear", "Paramètres"],
  ["/map", "fa-solid fa-map", "Carte des stores"],
];

/** Statuts de commande de l'aperçu du compte. */
export const ORDER_SHORTCUTS: [string, string, string][] = [
  ["received", "fa-solid fa-receipt", "Reçues"],
  ["prep", "fa-solid fa-box", "En préparation"],
  ["ready", "fa-solid fa-store", "Prêtes pour retrait"],
  ["review", "fa-regular fa-star", "À évaluer"],
];

/** Frise de suivi d'une commande. */
export const ORDER_TIMELINE: [string, string][] = [["fa-solid fa-receipt", "Reçue"], ["fa-solid fa-box", "En préparation"], ["fa-solid fa-store", "Prête"], ["fa-solid fa-check", "Retirée"]];
export const DELIVERY_TIMELINE: [string, string][] = [["fa-solid fa-receipt", "Reçue"], ["fa-solid fa-box", "En préparation"], ["fa-solid fa-box-open", "Au livreur"], ["fa-solid fa-truck", "En route"], ["fa-solid fa-check", "Livrée"]];
export const KYC_TIMELINE: [string, string][] = [["fa-solid fa-receipt", "Reçu"], ["fa-solid fa-magnifying-glass", "En vérification"], ["fa-solid fa-circle-check", "Approuvé"]];
export const READY_TO_SELL: [string, string][] = [["fa-solid fa-box", "Ajouter votre premier produit"], ["fa-solid fa-rotate-left", "Définir votre politique de retour"], ["fa-regular fa-credit-card", "Ajouter un moyen de paiement pour vos retraits"]];

/** Passerelles de recharge (GW) : [clé, libellé, origine]. Actives au lancement : [À CONFIRMER]. */
export const GATEWAYS: [string, string, string][] = [["moncash", "MonCash", "Haïti"], ["natcash", "NatCash", "Haïti"], ["sogebank", "Sogebank", "Haïti"], ["wise", "Wise", "Diaspora"], ["stripe", "Carte (Stripe)", "Diaspora"], ["meru", "Meru", "Diaspora"]];

/** Gains de Coins (50 / commande, 25 / avis ; bienvenue et bonus retrait : à confirmer). */
export const COINS_EARN: [string, string, string][] = [
  ["fa-solid fa-cart-shopping", "Chaque commande retirée", "+50"],
  ["fa-regular fa-star", "Chaque avis vérifié", "+25"],
  ["fa-solid fa-gift", "Bienvenue", "montant à confirmer"],
  ["fa-solid fa-store", "Bonus retrait en magasin", "à confirmer"],
  ["fa-solid fa-user-plus", "Inviter un ami", "+500"],
];
export const COINS_HISTORY: [string, string, string, string][] = [
  ["fa-regular fa-star", "Avis · Huile de ricin noire", "4 nov.", "+25"],
  ["fa-solid fa-cart-shopping", "Commande PK-0997 retirée", "15 oct.", "+50"],
  ["fa-solid fa-gift", "Bienvenue sur Prélakay", "10 oct.", "+45"],
];

/** Centre d'aide (HELP) et réponses (FAQ). */
export const HELP: [string, string, string[]][] = [
  ["fa-solid fa-store", "Retrait en magasin", ["Comment récupérer ma commande ?", "Que se passe-t-il si je ne viens pas dans les 3 jours ?", "Quelqu'un d'autre peut-il retirer pour moi ?"]],
  ["fa-solid fa-wallet", "Wallet et paiement", ["Comment recharger mon wallet ?", "Comment mon argent est-il protégé ?", "Comment payer le panier d'un proche ?"]],
  ["fa-solid fa-rotate-left", "Retours et litiges", ["Comment signaler un problème ?", "Où va mon remboursement ?"]],
  ["fa-solid fa-coins", "Coins", ["Comment gagner des Coins ?"]],
  ["fa-regular fa-user", "Compte", ["Comment changer mon @username ?", "Comment devenir vendeur ?"]],
];
export const FAQ: Record<string, string> = {
  "Comment récupérer ma commande ?": "Quand le store a préparé votre commande, vous recevez un code de retrait (4 à 6 chiffres) et un QR code. Présentez-les au store : il scanne, et la commande passe à « Retirée ».",
  "Que se passe-t-il si je ne viens pas dans les 3 jours ?": "Vous recevez un rappel à J+1 et à J+2. Après 3 jours, la commande est annulée et remboursée sur votre wallet, moins des frais de restockage (montant à confirmer).",
  "Quelqu'un d'autre peut-il retirer pour moi ?": "Oui : partagez-lui le code de retrait. C'est aussi comme ça que fonctionne le paiement du panier d'un proche.",
  "Comment recharger mon wallet ?": "Depuis Wallet → Recharger : MonCash, NatCash ou Sogebank en Haïti ; Wise, carte (Stripe) ou Meru depuis l'étranger.",
  "Comment mon argent est-il protégé ?": "Prélakay garde votre paiement jusqu'au retrait en magasin. Si le store annule, si la commande n'est pas prête ou si l'article pose problème, vous êtes remboursé sur votre wallet.",
  "Comment payer le panier d'un proche ?": "Votre proche vous partage son panier par lien ou WhatsApp. Ouvrez-le, puis payez avec votre wallet. Il retire avec le code.",
  "Comment signaler un problème ?": "Dans la commande retirée : « Signaler un problème ». Pour un article non conforme ou endommagé, une photo est obligatoire. Vous avez 3 jours.",
  "Où va mon remboursement ?": "Toujours sur votre wallet Prélakay, jamais en espèces.",
  "Comment gagner des Coins ?": "50 Coins par commande retirée, 25 par avis vérifié. Le bonus de bienvenue et les règles d'utilisation sont à confirmer.",
  "Comment changer mon @username ?": "Mon compte → Paramètres → Informations personnelles.",
  "Comment devenir vendeur ?": "Mon compte → Enregistrer son commerce. Les admins vérifient votre identité (KYC) avant l'ouverture du store.",
};
/** Toutes les questions d'aide, dans l'ordre : l'index sert d'identifiant d'article (#/help/:n). */
export const HELP_ALL: [string, string][] = HELP.flatMap(([, cat, qs]) => qs.map((q): [string, string] => [cat, q]));

/** Paramètres (SETS) : [section, icône, titre]. */
export const SETS: [string, string, string][] = [
  ["profil", "fa-regular fa-user", "Informations personnelles"],
  ["secu", "fa-solid fa-lock", "Sécurité et connexion"],
  ["notifs", "fa-solid fa-bell", "Notifications"],
  ["lang", "fa-solid fa-globe", "Langue et devise"],
  ["ville", "fa-solid fa-location-dot", "Ville de retrait"],
  ["privacy", "fa-solid fa-shield", "Confidentialité"],
];
export const NOTIF_PREFS = ["Commande prête pour retrait", "Rappels de retrait (J+1, J+2)", "Wallet et remboursements", "Réponses à vos questions", "Nouveautés des stores près de vous"];
export const CITIES = ["Les Cayes", "Port-au-Prince", "Cap-Haïtien", "Jacmel", "Jérémie"];

/** Intro (3 écrans max, « Passer » dès le premier — 02-app-flow §2.1). */
export const INTRO: [string, string, string, string][] = [
  ["fa-solid fa-location-dot", "g1", "Les stores de votre ville, sur une carte", "Trouvez un produit, voyez à quelle distance il est, et allez le chercher."],
  ["fa-solid fa-wallet", "g5", "Payez avec votre wallet", "MonCash, NatCash, Sogebank, ou depuis l'étranger. Votre argent reste protégé jusqu'au retrait."],
  ["fa-solid fa-coins", "g0", "Gagnez des Coins", "À chaque commande retirée et à chaque avis."],
];
