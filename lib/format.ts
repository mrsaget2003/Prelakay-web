// Formats fr-FR partagés par les trois espaces (acheteur, vendeur, admin).
// Valeurs de référence : fonctions htg, km et k du prototype.

const NBSP = " ";
const integer = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });

/** Intl fr-FR sépare les milliers par une espace fine insécable (U+202F) :
 *  on la normalise en espace insécable (U+00A0), comme le prototype. */
function groupThousands(n: number): string {
  return integer.format(n).replace(/[   ]/g, NBSP);
}

/** Montant en gourdes entières : 450000 → « 450 000 HTG ». */
export function formatHTG(amount: number): string {
  return `${groupThousands(Math.round(amount))} HTG`;
}

/** Distance : 0.6 → « 600 m », 1.2 → « 1,2 km » (espace insécable : jamais d'unité seule à la ligne). */
export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)}${NBSP}m`;
  return `${km.toFixed(1).replace(".", ",")}${NBSP}km`;
}

/** Compteur abrégé : 1240 → « 1,2 k », 1000 → « 1 k », 860 → « 860 ». */
export function formatCount(n: number): string {
  if (n < 1000) return String(n);
  return `${(n / 1000).toFixed(1).replace(".0", "").replace(".", ",")} k`;
}

const dateShort = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
const dateLong = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" });

/** Date : « 07/11/2026 » (short) ou « 7 novembre 2026 » (long). */
export function formatDate(d: Date, style: "short" | "long"): string {
  return (style === "short" ? dateShort : dateLong).format(d);
}
