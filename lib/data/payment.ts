/** Logos des moyens de paiement — fichiers de `public/images/payment-method/`,
 *  fournis par Marc-Karlin. Un moyen sans logo garde simplement son libellé.
 *  `w` et `h` sont les proportions du fichier : `next/image` s'en sert pour réserver
 *  la place et servir une image redimensionnée (les PNG d'origine font 400 à 700 Ko). */
/** `dark` : fichier fait pour un fond sombre (texte blanc) — affiché sur une pastille noire. */
export type PayLogo = { src: string; alt: string; w: number; h: number; dark?: boolean };

const DIR = "/images/payment-method/";

export const PAY_LOGOS: Record<string, PayLogo> = {
  moncash: { src: `${DIR}moncash.png`, alt: "MonCash", w: 1529, h: 1029 },
  natcash: { src: `${DIR}natcash.png`, alt: "NatCash", w: 1791, h: 878, dark: true },
  sogebank: { src: `${DIR}sogebank.svg`, alt: "Sogebank", w: 800, h: 800 },
  visa: { src: `${DIR}visa@logotyp.us.svg`, alt: "Visa", w: 560, h: 400 },
  mastercard: { src: `${DIR}mastercard@logotyp.us.svg`, alt: "Mastercard", w: 560, h: 400 },
  paypal: { src: `${DIR}paypal@logotyp.us.svg`, alt: "PayPal", w: 560, h: 400 },
  payoneer: { src: `${DIR}payoneer@logotyp.us.svg`, alt: "Payoneer", w: 560, h: 400 },
  "cash-app": { src: `${DIR}cash-app@logotyp.us.svg`, alt: "Cash App", w: 560, h: 400 },
};

/** Logos d'une passerelle de recharge (clé de `GATEWAYS`). Une carte en montre deux. */
export function logosOfGateway(key: string): PayLogo[] {
  if (key === "stripe") return [PAY_LOGOS.visa, PAY_LOGOS.mastercard];
  const one = PAY_LOGOS[key];
  return one ? [one] : [];
}

/** Bandeau « moyens acceptés » (pied de page, panier) : ceux dont nous avons le logo. */
export const ACCEPTED: PayLogo[] = [
  PAY_LOGOS.moncash, PAY_LOGOS.natcash, PAY_LOGOS.sogebank,
  PAY_LOGOS.visa, PAY_LOGOS.mastercard, PAY_LOGOS.paypal, PAY_LOGOS.payoneer, PAY_LOGOS["cash-app"],
];
