// Finances de la plateforme (ex-V2, actif dans le prototype) : GMV, commissions, escrow en circulation,
// retraits en attente. Taux de commission ⚠️ ouvert (BUSINESS.commissionRate = null) : jamais calculé.

import { BUSINESS } from "@/lib/config/business";
import { allOrders } from "@/lib/demo/admin";
import type { DemoState } from "@/lib/demo/store";
import { pData } from "./adminData";
import { sum } from "./sellerData";

const HELD = ["received", "prep", "ready", "handed", "enroute"];

/** Escrow en circulation : commandes payées dont l'argent n'est pas encore libéré au store (frais compris). */
export function escrowOf(s: DemoState): number {
  return allOrders(s)
    .filter((o) => HELD.includes(o.status) || ((o.status === "done" || o.status === "delivered") && !o.rel))
    .reduce((a, o) => a + o.total + (o.fee ?? 0), 0);
}

/** Retraits demandés par les stores, pas encore payés (démo : retraits de l'espace vendeur + base fixe). */
export function payoutsPendingOf(s: DemoState): number {
  return 38500 + s.seller.payouts.filter((p) => p.st !== "Payé").reduce((a, p) => a + p.amt, 0);
}

export function platformFinance(s: DemoState, d: 7 | 30 | 90) {
  const D = pData(d, 1);
  const gmv = sum(D.gmv);
  const rate = BUSINESS.commissionRate as number | null;
  return {
    L: D.L,
    gmvSeries: D.gmv,
    gmv,
    commission: rate == null ? null : Math.round(gmv * rate),
    escrow: escrowOf(s),
    payoutsPending: payoutsPendingOf(s),
    haiti: D.hai,
    diaspora: D.dia,
  };
}
