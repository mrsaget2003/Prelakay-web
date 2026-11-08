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
