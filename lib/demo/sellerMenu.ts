// Navigation de l'espace vendeur (SMENU et onglets mobiles du prototype).

type Item = [string, string, string, [string, string][] | string];
export const SMENU: Item[] = [
  ["home", "fa-solid fa-house", "Accueil", ""],
  ["products", "fa-solid fa-box", "Produits", [["products", "Gérer les produits"], ["products/new", "Ajouter un produit"], ["stock", "Stock et caractéristiques"]]],
  ["orders", "fa-solid fa-receipt", "Commandes", [["orders", "Toutes les commandes"], ["pickup", "Valider un retrait"], ["disputes", "Retours et litiges"]]],
  ["marketing", "fa-solid fa-bullhorn", "Marketing", [["marketing", "Outils marketing"], ["share", "Partager mon store"]]],
  ["finance", "fa-solid fa-wallet", "Finances", [["finance", "Solde et escrow"], ["payouts", "Retraits"]]],
  ["reviews", "fa-solid fa-star", "Avis et questions", [["reviews", "Avis"], ["questions", "Questions"]]],
  ["messages", "fa-solid fa-comment-dots", "Messages", "messages"],
  ["stats", "fa-solid fa-chart-column", "Statistiques", "stats"],
  ["store", "fa-solid fa-store", "Mon store", [["store", "Profil du store"], ["policy", "Politique de retour"], ["trust", "Store de confiance"]]],
  ["account", "fa-solid fa-gear", "Compte", [["account", "Compte et sécurité"], ["notifications", "Notifications"]]],
];

/** Onglets mobiles : Accueil · Commandes · Produits · Messages · Plus. */
export const SELLER_TABS: [string, string, string, string][] = [
  ["/seller", "home", "fa-solid fa-house", "Accueil"],
  ["/seller/orders", "orders", "fa-solid fa-receipt", "Commandes"],
  ["/seller/products", "products", "fa-solid fa-box", "Produits"],
  ["/seller/messages", "messages", "fa-solid fa-comment-dots", "Messages"],
  ["/seller/menu", "more", "fa-solid fa-bars", "Plus"],
];

/** Notifications de démonstration affichées sous celles du store (sNotifs du prototype). */
export const SELLER_NOTIF_DEMO = [
  { i: "fa-solid fa-box-open", t: "Nouvelle commande", p: "Une commande attend votre préparation.", to: "/seller/orders" },
  { i: "fa-regular fa-circle-question", t: "Nouvelle question", p: "Un acheteur a posé une question sur un produit.", to: "/seller/questions" },
  { i: "fa-solid fa-wallet", t: "Paiement libéré", p: "Les ventes retirées il y a 3 jours sont disponibles.", to: "/seller/finance" },
];
