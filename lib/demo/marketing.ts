// Marketing de la démo : offres flash, events, boosts, badges.

import { FLASH_HOURS, type PEvent } from "@/lib/domain/marketing";
import { BUSINESS } from "@/lib/config/business";
import { STORES, prodBy, storeBy } from "@/lib/data/mock/seed";
import { audit, type Me } from "./admin";
import { demo, type DemoState } from "./store";
import { sellerFin } from "./sellerActions";

/** Events de démonstration. */
export const DEMO_EVENTS: PEvent[] = [
  { id: "EV-01", n: "Fèt Manman Sud", from: "2026-11-20", to: "2026-11-27", noCommission: true, stores: ["bel-soley", "boutik-lakay"] },
  { id: "EV-02", n: "Rentrée des classes", from: "2026-09-01", to: "2026-09-15", noCommission: false, stores: ["tech-sud"] },
];

export function eventsList(s: DemoState): PEvent[] {
  return [...s.marketing.events, ...DEMO_EVENTS].map((e) => ({ ...e, stores: [...new Set([...e.stores, ...(s.marketing.joined[e.id] ?? [])])] }));
}

export function proposeFlash(store: string, product: string, price: number): string | null {
  const st = storeBy(store);
  if (!st?.trust) return "Les offres flash sont réservées aux stores de confiance (seuil de points à confirmer).";
  const p = prodBy(product);
  if (!p || p.store !== store) return "Produit introuvable.";
  if (!(price > 0) || price >= p.price) return "Le prix flash doit être inférieur au prix actuel.";
  demo.update((s) => {
    s.marketing.flash.unshift({ id: `FL-${String(s.marketing.flash.length + 1).padStart(3, "0")}`, store, product, price: Math.round(price), ends: 0, st: "pending" });
  });
  return null;
}

/** Validation admin : l'offre est en ligne pendant 24 h à partir de maintenant. */
export function flashDecide(me: Me, id: string, ok: boolean, now = Date.now()): string | null {
  const f = demo.get().marketing.flash.find((x) => x.id === id);
  if (!f || f.st !== "pending") return "Offre introuvable.";
  demo.update((s) => {
    const x = s.marketing.flash.find((y) => y.id === id)!;
    x.st = ok ? "live" : "rej";
    if (ok) x.ends = now + FLASH_HOURS * 3_600_000;
    audit(s, me, ok ? "Offre flash validée" : "Offre flash refusée", `${id} · ${prodBy(x.product)?.n}`);
    s.seller.notif.unshift({ i: "fa-solid fa-bolt", t: ok ? "Offre flash en ligne" : "Offre flash refusée", p: `${prodBy(x.product)?.n}${ok ? " · 24 h" : ""}`, to: "/seller/marketing/flash", un: true, store: x.store });
  });
  return null;
}

export function createEvent(me: Me, e: { n: string; from: string; to: string; noCommission: boolean }): { ok: true; id: string } | { ok: false; error: string } {
  if (!e.n.trim() || !e.from || !e.to || e.to < e.from) return { ok: false, error: "Indiquez un nom et des dates dans l'ordre." };
  let id = "";
  demo.update((s) => {
    id = `EV-${String(s.marketing.events.length + DEMO_EVENTS.length + 1).padStart(2, "0")}`;
    s.marketing.events.unshift({ id, n: e.n.trim(), from: e.from, to: e.to, noCommission: e.noCommission, stores: [] });
    audit(s, me, "Event créé", `${id} · ${e.n.trim()}`);
  });
  return { ok: true, id };
}

export function joinEvent(id: string, store: string): string | null {
  if (!eventsList(demo.get()).some((e) => e.id === id)) return "Event introuvable.";
  demo.update((s) => {
    const j = (s.marketing.joined[id] ??= []);
    if (!j.includes(store)) j.push(store);
  });
  return null;
}

/** Booster un produit : budget débité du solde disponible du store. */
export function boostProduct(product: string, budget: number): string | null {
  const s0 = demo.get();
  const p = prodBy(product);
  if (!p || p.store !== s0.seller.store) return "Produit introuvable.";
  if (!(budget >= 100)) return "Budget minimum : 100 HTG.";
  if (budget > sellerFin(s0).avail) return "Solde insuffisant pour ce budget.";
  demo.update((s) => {
    s.marketing.boosts.unshift({ id: `BO-${s.marketing.boosts.length + 1}`, store: s.seller.store, product, budget: Math.round(budget), on: true });
  });
  return null;
}
export function stopBoost(id: string) {
  demo.update((s) => {
    const b = s.marketing.boosts.find((x) => x.id === id);
    if (b) b.on = false;
  });
}
export function boostedIds(s: DemoState): Set<string> {
  return new Set(s.marketing.boosts.filter((b) => b.on).map((b) => b.product));
}

/** Badges (valeurs de démonstration ; seuils de points de confiance : ⚠️ ouverts). */
export function badgesOf(kind: "buyer" | "store", id: string, s: DemoState): string[] {
  const out: string[] = [];
  if (kind === "buyer") {
    const done = s.orders.filter((o) => o.status === "done" || o.status === "delivered").length;
    if (done >= BUSINESS.demoVipOrders) out.push("VIP");
    if (s.growth?.plus) out.push("Prélakay+");
    return out;
  }
  const st = STORES.find((x) => x.id === id);
  if (!st) return out;
  if (st.trust) out.push("Store de confiance");
  if (st.sold >= BUSINESS.demoTopSellerSold) out.push("Meilleures ventes");
  return out;
}
