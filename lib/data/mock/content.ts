// Contenu de démonstration du prototype : bannières de l'accueil (gérées par l'admin,
// 03-design §9.11 Contenu). Portées à l'identique (ligne ~1758 du prototype).

export type Banner = { id: string; on: boolean; c: string; k: string; h: string; b: string; href: string; i: string; from: string; to: string };

export const BANNERS: Banner[] = [
  { id: "b1", on: true, c: "s1", k: "Retrait en magasin", h: "Commandez en ligne, récupérez en 2 heures", b: "Voir les stores", href: "/map", i: "fa-solid fa-store", from: "1 nov. 2026", to: "31 déc. 2026" },
  { id: "b2", on: true, c: "s2", k: "Wallet Prélakay", h: "Payez le panier d'un proche, même depuis l'étranger", b: "Découvrir le wallet", href: "/wallet", i: "fa-solid fa-wallet", from: "1 nov. 2026", to: "31 déc. 2026" },
  { id: "b3", on: true, c: "s3", k: "Nouveaux sur Prélakay", h: "Les stores pilotes de Les Cayes sont là", b: "Voir les nouveautés", href: "/discover?sort=new", i: "fa-solid fa-rocket", from: "1 nov. 2026", to: "30 nov. 2026" },
];
