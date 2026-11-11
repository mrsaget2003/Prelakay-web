// Photos des pages partenaires et ambassadeurs (11 nov. 2026).
//
// Même convention que `images.ts` : identifiants Unsplash, licence Unsplash (usage libre,
// sans attribution obligatoire). Toutes vérifiées en réponse 200 le 11 nov. 2026 et
// servies depuis `images.unsplash.com` — **jamais** `plus.unsplash.com`, qui est la
// licence Unsplash+ payante.
//
// ⚠️ Claude n'a pas pu regarder ces images : seul le texte alternatif d'Unsplash a servi
// à les choisir. Marc-Karlin doit les ouvrir une fois et remplacer celles qui ne vont pas.
// C'est le seul fichier à modifier : `id` = la partie après « photo- » dans l'adresse.

export type Photo = { id: string; alt: string };

const U = (id: string, w: number, h: number) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&auto=format&q=70`;

export const photoUrl = (p: Photo, w: number, h: number) => U(p.id, w, h);

export const PARTNER_PHOTOS = {
  /** Livraison : quelqu'un qui livre à vélo. */
  deliveryHero: { id: "1682773083899-0948e4e7d8d3", alt: "Un livreur à vélo, son porte-bagages chargé" },
  deliveryWork: { id: "1601979107569-731e84cee3e8", alt: "Un livreur à vélo en chemin" },
  /** Paiement : un commerce qui encaisse au téléphone. */
  paymentHero: { id: "1687422809654-579d81c29d32", alt: "Une commerçante à son étal, téléphone à la main" },
  paymentShop: { id: "1761370980657-22586ea44093", alt: "Une commerçante souriante derrière son étal de fruits" },
  /** Ambassadeurs : des étudiants. */
  ambassadorHero: { id: "1620829813573-7c9e1877706f", alt: "Des étudiants sur un campus" },
  ambassadorCampus: { id: "1536337005238-94b997371b40", alt: "Des étudiants qui échangent" },
  /** Communauté. */
  community: { id: "1742095228943-1b0ceb0fd82e", alt: "Une fête de quartier, vêtements colorés" },
  storeOwner: { id: "1773858440885-361caff45fa3", alt: "Une commerçante devant sa boutique" },
} as const satisfies Record<string, Photo>;
