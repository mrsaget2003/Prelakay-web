// Livraison (CLAUDE.md 10 nov. 2026, spec §6), à côté du Click & Collect.
// ⚠️ Ouverts : frais, zones couvertes, paiement du livreur, libération de l'escrow à la livraison,
// remboursement en cas d'échec. Valeurs de démonstration dans BUSINESS (demoDelivery*).

import { BUSINESS } from "@/lib/config/business";
import type { OrderStatus } from "@/lib/demo/store";

export type FulfillMode = "pickup" | "delivery";
export type DeliveryAddr = { zone: string; mark: string; phone: string };

export const DELIVERY_STEPS = ["received", "prep", "handed", "enroute", "delivered"] as const satisfies readonly OrderStatus[];

/** Frais de livraison de démonstration du quartier. */
export function deliveryFee(zone: string): number {
  const t = BUSINESS.demoDeliveryFee as Record<string, number>;
  return t[zone] ?? BUSINESS.demoDeliveryFeeDefault;
}

export function nextDeliveryStatus(s: OrderStatus): OrderStatus | null {
  const i = (DELIVERY_STEPS as readonly OrderStatus[]).indexOf(s);
  return i >= 0 && i < DELIVERY_STEPS.length - 1 ? DELIVERY_STEPS[i + 1] : null;
}

/** Adresse complète : quartier, repère, téléphone haïtien à 8 chiffres. */
export function addrOk(a: DeliveryAddr | undefined): a is DeliveryAddr {
  return !!a && !!a.zone.trim() && !!a.mark.trim() && a.phone.replace(/\D/g, "").length === 8;
}
