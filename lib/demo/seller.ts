// Espace vendeur — règles et données de démonstration portées du prototype
// (prototype/prelakay-prototype.html, « ESPACE VENDEUR », lignes ~2183-2222).
// Fonctions pures : vérifiées par tests/unit/seller.test.ts contre le prototype.

import { P, optsOf, stockFor, defaultChoice, selLabel, type OptAxis, type Product, type Choice } from "@/lib/data/mock/seed";
import type { Order, OrderStatus } from "./store";

/** Hachage du prototype (hs) : chiffres de démonstration stables par store. */
export function hs(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

/** Toutes les combinaisons de caractéristiques d'un produit. */
export function combos(A: OptAxis[]): Choice[] {
  let out: Choice[] = [{}];
  for (const a of A) {
    const n: Choice[] = [];
    for (const o of out) for (const v of a.v) n.push({ ...o, [a.k]: v });
    out = n;
  }
  return out;
}

export function comboKey(p: Product, o: Choice): string {
  return p.id + "#" + optsOf(p).map((a) => o[a.k]).join("|");
}

/** Stock total d'un produit (toutes combinaisons). */
export function stockTotal(p: Product): number {
  const A = optsOf(p);
  if (!A.length) return stockFor(p, {});
  return combos(A).reduce((t, c) => t + stockFor(p, c), 0);
}

export type SellerOrder = Order & { buyer: string; time?: string; rel?: boolean; picked?: string };

export const BUYERS = ["@nadege_cayes", "@jowan509", "@tidodo", "@ketia.b", "@ricardo_sud", "@mimi_ht", "@stanley.c", "@lovely_509"];

/** Commandes de démonstration d'autres acheteurs pour un store (sellerOrders du prototype). */
export function generateStoreOrders(storeId: string): SellerOrder[] {
  const L = P.filter((p) => p.store === storeId);
  const h = hs(storeId);
  const statuses: OrderStatus[] = ["received", "received", "prep", "ready", "ready", "done", "done", "done", "expired"];
  const dates = ["6 nov. 2026", "6 nov. 2026", "6 nov. 2026", "5 nov. 2026", "4 nov. 2026", "3 nov. 2026", "1 nov. 2026", "29 oct. 2026", "30 oct. 2026"];
  const times = ["10:42", "09:15", "08:03", "17:20", "11:05", "15:40", "10:12", "16:55", "12:30"];
  const out: SellerOrder[] = [];
  statuses.forEach((s, i) => {
    const p = L[(h + i) % L.length];
    if (!p) return;
    const q = 1 + ((h >> i) & 1);
    const o: SellerOrder = {
      id: "PK-" + (980 - i * 7 - (h % 5)),
      store: storeId,
      buyer: BUYERS[(h + i) % BUYERS.length],
      items: [{ p: p.id, v: selLabel(p, defaultChoice(p)), q }],
      status: s,
      date: dates[i],
      time: times[i],
      total: p.price * q,
      rel: i > 5,
    };
    if (s === "ready") {
      o.code = String(100000 + ((h * (i + 3)) % 899999));
      o.due = i === 3 ? "8 nov. 2026" : "7 nov. 2026";
    }
    out.push(o);
  });
  return out;
}

export type Payout = { store: string; amt: number; to: string; date: string; st: string };

/** Finances du store (fin du prototype). Commission Prélakay : taux [À CONFIRMER], non déduite. */
export function finOf(storeId: string, orders: SellerOrder[], payouts: Payout[]) {
  const base = 60000 + (hs(storeId) % 9) * 25000;
  const released = orders.filter((o) => o.status === "done" && o.rel).reduce((a, o) => a + o.total, 0);
  const pending = orders
    .filter((o) => (o.status === "done" && !o.rel) || o.status === "ready" || o.status === "prep" || o.status === "received")
    .reduce((a, o) => a + o.total, 0);
  const paid = payouts.filter((x) => x.store === storeId).reduce((a, x) => a + x.amt, 0);
  return { avail: Math.max(0, base + released - paid), pending, paid, month: base + released + pending };
}

/** Indicateurs de démonstration sur 7 / 30 / 90 jours (kpis du prototype). */
export function kpis(storeId: string, days: number) {
  const h = hs(storeId + days);
  const f = days / 7;
  return {
    visits: Math.round((380 + (h % 240)) * f),
    views: Math.round((1150 + (h % 500)) * f),
    cart: Math.round(12 + (h % 14)),
    orders: Math.round((9 + (h % 7)) * f),
    picked: Math.round((7 + (h % 5)) * f),
    sales: Math.round((42000 + (h % 30000)) * f),
    gv: (h % 23) - 6,
    go: (h % 17) - 4,
    gs: (h % 29) - 8,
  };
}

/** Série de démonstration (series du prototype). */
export function series(n: number, seed: number, min: number, max: number): number[] {
  const out: number[] = [];
  let x = seed;
  for (let i = 0; i < n; i++) {
    x = (x * 1103515245 + 12345) >>> 0;
    out.push(Math.round(min + ((x % 1000) / 1000) * (max - min)));
  }
  return out;
}

const NEXT: Record<OrderStatus, OrderStatus[]> = {
  received: ["prep", "cancelled"],
  prep: ["ready", "cancelled"],
  ready: ["done", "expired"],
  done: [],
  expired: [],
  cancelled: [],
};

/** Cycle Reçue → En préparation → Prête → Retirée ; annulation avant « Prête » ; non-retrait après « Prête ». */
export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return NEXT[from].includes(to);
}

/** Code de retrait à 6 chiffres (BUSINESS.pickupCodeLength). */
export function nextCode(): string {
  return String(100000 + Math.floor(Math.random() * 899999));
}

export function formatCode(code: string): string {
  return code.replace(/(\d{3})(\d{3})/, "$1 $2");
}
