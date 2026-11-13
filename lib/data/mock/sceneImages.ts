// Photos des écrans de passage (connexion, inscription, vente, accueil vendeur) — 13 nov. 2026.
//
// Même convention que `partnerImages.ts` : identifiants Unsplash, licence Unsplash (usage
// libre, sans attribution obligatoire), servies depuis `images.unsplash.com` — jamais
// `plus.unsplash.com` (licence payante). Regardées une à une le 13 nov. 2026.
// Les photos des produits ne sont pas ici : elles restent dans `images.ts`.

import type { Photo } from "./partnerImages";

export const SCENE_PHOTOS = {
  /** Connexion : le comptoir où l'on retire sa commande. */
  login: { id: "1687422808311-a776f467a468", alt: "Une commerçante au comptoir de sa boutique" },
  /** Inscription. */
  signup: { id: "1603767311691-fa1943d078c0", alt: "Une marchande de fruits sur un marché de Port-au-Prince" },
  /** Enregistrer son commerce (KYC). */
  sell: { id: "1773858440885-361caff45fa3", alt: "Une commerçante devant sa boutique" },
  /** Page introuvable : « perdue en chemin ». */
  lost: { id: "1623930376524-ead3734be423", alt: "Une rue calme bordée de palmiers, une moto au loin" },
  /** Panier vide, rien à payer. */
  emptyCart: { id: "1749197654431-02b2364ef650", alt: "Un étal de fruits sur un marché animé" },
  /** Accueil vendeur : vignettes des actualités Prélakay. */
  newsPilot: { id: "1603767868273-d59d712c8188", alt: "Maisons colorées à flanc de colline en Haïti" },
  newsPickup: { id: "1687422809654-579d81c29d32", alt: "Une commerçante à son étal, téléphone à la main" },
  newsOffers: { id: "1749197654431-02b2364ef650", alt: "Un étal de fruits sur un marché animé" },
} as const satisfies Record<string, Photo>;
