// Moyens de paiement au checkout (12 nov. 2026, Marc-Karlin : « le wallet ne doit pas être
// le seul moyen »). Règles pures, partagées démo / production.
//
// Quel que soit le moyen, l'argent est protégé de la même façon : il est gardé (escrow) et le
// store n'est payé qu'après le retrait ou la livraison.
// ⚠️ Ouvert : le remboursement d'un paiement carte ou mobile money revient-il sur le moyen
// d'origine ou sur le wallet ? En démo, il est crédité sur le wallet comme les autres.

import { normalizeHtPhone } from "./phone";

export type PayMethod = "wallet" | "moncash" | "natcash" | "card";

export const PAY_METHODS: { k: PayMethod; label: string; sub: string }[] = [
  { k: "wallet", label: "Wallet Prélakay", sub: "Payé tout de suite avec votre solde" },
  { k: "moncash", label: "MonCash", sub: "Vous validez sur votre téléphone" },
  { k: "natcash", label: "NatCash", sub: "Vous validez sur votre téléphone" },
  { k: "card", label: "Carte bancaire", sub: "Visa ou Mastercard, sur la page sécurisée de votre banque" },
];

export type PayInput = { method: PayMethod; phone?: string };

/** Erreur du moyen choisi, ou null. Le solde du wallet est vérifié à part (il dépend du total). */
export function validatePayment(p: PayInput): string | null {
  if (p.method === "moncash" || p.method === "natcash") {
    if (!normalizeHtPhone(p.phone ?? "")) return `Indiquez le numéro ${p.method === "moncash" ? "MonCash" : "NatCash"} à 8 chiffres.`;
  }
  return null;
}

export function payLabel(m: PayMethod | undefined): string {
  return PAY_METHODS.find((x) => x.k === (m ?? "wallet"))!.label;
}
