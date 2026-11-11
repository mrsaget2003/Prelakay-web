"use client";

// Actions acheteur du prototype (addToCart, doPay, wish, sélection SKU…),
// sur l'état de démo. Mêmes règles et mêmes messages que le prototype.

import { addrOk, deliveryFee, type DeliveryAddr, type FulfillMode } from "@/lib/domain/delivery";
import { BUSINESS } from "@/lib/config/business";
import { DEMO_DRIVERS } from "./delivery";
import { DEMO_TODAY, couponByCode, usedOf } from "./coupons";
import { couponCheck, type CouponResult } from "@/lib/domain/coupons";
import { demo, type DemoState, type Selection } from "./store";
import { prodBy, storeBy, optsOf, stockFor, defaultChoice, selLabel, type Product, type Choice } from "@/lib/data/mock/seed";
import { formatHTG } from "@/lib/format";

/** Sélection courante d'un produit (choix + quantité) ; par défaut la première combinaison en stock. */
export function selOf(p: Product, s: DemoState = demo.get()): Selection {
  return s.sel[p.id] ?? { o: defaultChoice(p), q: 1 };
}

export function setChoice(id: string, k: string, v: string) {
  const p = prodBy(id);
  if (!p) return;
  demo.update((s) => {
    const cur = selOf(p, s);
    s.sel[id] = { o: { ...cur.o, [k]: v }, q: 1 };
  });
}

export function setQty(id: string, q: number) {
  const p = prodBy(id);
  if (!p) return;
  demo.update((s) => {
    const cur = selOf(p, s);
    s.sel[id] = { o: cur.o, q: Math.max(1, q) };
  });
}

/** Ajoute au panier avec le choix courant ; fusionne une ligne au même choix. Renvoie le libellé du choix. */
export function addToCart(id: string, q?: number): string {
  const p = prodBy(id)!;
  let label = "";
  demo.update((s) => {
    const sel = selOf(p, s);
    label = selLabel(p, sel.o);
    const qty = q ?? sel.q;
    const ex = s.cart.find((c) => c.p === id && c.v === label);
    if (ex) {
      ex.q += qty;
      ex.on = true;
    } else s.cart.push({ p: id, v: label, q: qty, on: true });
  });
  return label;
}

export function cartCount(s: DemoState = demo.get()): number {
  return s.cart.reduce((a, c) => a + c.q, 0);
}

export type Line = { p: Product; c: DemoState["cart"][number]; i: number; st: NonNullable<ReturnType<typeof storeBy>>; total: number };

export function cartLines(s: DemoState = demo.get()): Line[] {
  return s.cart
    .map((c, i) => {
      const p = prodBy(c.p);
      if (!p) return null;
      return { p, c, i, st: storeBy(p.store)!, total: p.price * c.q };
    })
    .filter((l): l is Line => l !== null);
}

export function groups(lines: Line[]): Record<string, Line[]> {
  const g: Record<string, Line[]> = {};
  for (const l of lines) (g[l.st.id] ||= []).push(l);
  return g;
}

export function cartTotals(s: DemoState = demo.get()) {
  const L = cartLines(s);
  const on = L.filter((l) => l.c.on);
  return { L, on, sub: on.reduce((a, l) => a + l.total, 0), n: on.reduce((a, l) => a + l.c.q, 0) };
}

/** Choix d'une ligne retrouvé depuis son libellé (« Noir · M » → { Couleur: "Noir", Taille: "M" }). */
export function choiceFromLabel(p: Product, label: string): Choice {
  const A = optsOf(p);
  if (!A.length) return {};
  const parts = label.split(" · ");
  const o: Choice = {};
  A.forEach((a, i) => (o[a.k] = parts[i]));
  return o;
}

function nextId(s: DemoState): string {
  let m = 1042;
  for (const o of s.orders) {
    const n = +o.id.slice(3);
    if (n > m) m = n;
  }
  return "PK-" + (m + 1);
}

export type PayResult = { ok: true; ids: string[] } | { ok: false; error: string };

export const MSG_NO_FUNDS = "Solde insuffisant. Rechargez votre wallet, puis réessayez.";
export const MSG_OUT_OF_STOCK = "Cet article n'est plus disponible dans ce choix. Modifiez-le ou retirez-le.";

/** Paiement du panier (doPay) : une commande par store, wallet débité, lignes payées retirées.
 *  `key` : clé d'idempotence (double clic, réseau coupé) — un même paiement n'est traité qu'une fois. */
export type PayOpts = { modes?: Record<string, FulfillMode>; addr?: DeliveryAddr; coupon?: string };
export const MSG_NO_ADDR = "Indiquez l'adresse de livraison.";

export type CouponPick = { ok: true; code: string; sid: string; off: number };
/** Coupon appliqué au premier store sélectionné du panier où il est valable. */
export function pickCoupon(s: DemoState, code: string): CouponPick | { ok: false; error: string } {
  const G = groups(cartTotals(s).on);
  const c = couponByCode(s, code);
  let last: CouponResult = { ok: false, error: "Code inconnu." };
  for (const sid of Object.keys(G)) {
    last = couponCheck(c, { store: sid, subtotal: G[sid].reduce((a, l) => a + l.total, 0), today: DEMO_TODAY, used: c ? usedOf(s, c.code) : 0 });
    if (last.ok) return { ok: true, code: c!.code, sid, off: last.off };
  }
  return { ok: false, error: last.ok ? "Code inconnu." : last.error };
}

export function payCart(key: string, opts: PayOpts = {}): PayResult {
  const s0 = demo.get();
  if (s0.paid[key]) return { ok: true, ids: s0.paid[key] };
  const T = cartTotals(s0);
  if (!T.n) return { ok: false, error: "Votre panier est vide." };
  for (const l of T.on) {
    if (stockFor(l.p, choiceFromLabel(l.p, l.c.v)) < l.c.q) return { ok: false, error: MSG_OUT_OF_STOCK };
  }
  const G = groups(T.on);
  const mode = (sid: string): FulfillMode => opts.modes?.[sid] ?? "pickup";
  const delivered = Object.keys(G).filter((sid) => mode(sid) === "delivery");
  if (delivered.length && !addrOk(opts.addr)) return { ok: false, error: MSG_NO_ADDR };
  const fee = delivered.length ? deliveryFee(opts.addr!.zone) : 0;
  // coupon vérifié de nouveau au paiement (stock, dates), même s'il était appliqué au panier
  let cp: CouponPick | null = null;
  if (opts.coupon?.trim()) {
    const r = pickCoupon(s0, opts.coupon);
    if (!r.ok) return { ok: false, error: r.error };
    cp = r;
  }
  const off = cp?.off ?? 0;
  if (s0.wallet < T.sub + fee * delivered.length - off) return { ok: false, error: MSG_NO_FUNDS };
  const ids: string[] = [];
  demo.update((s) => {
    for (const sid of Object.keys(G)) {
      const id = nextId(s);
      const ls = G[sid];
      const del = mode(sid) === "delivery";
      s.orders.push({
        id, store: sid, items: ls.map((l) => ({ p: l.p.id, v: l.c.v, q: l.c.q })), status: "received", date: "6 nov. 2026", total: ls.reduce((a, l) => a + l.total, 0),
        ...(del ? { mode: "delivery" as const, addr: { ...opts.addr! }, fee } : {}),
        ...(cp && cp.sid === sid ? { coupon: cp.code, off: cp.off } : {}),
      });
      ids.push(id);
    }
    s.wallet -= T.sub + fee * delivered.length - off;
    if (cp) s.coupons.used[cp.code] = (s.coupons.used[cp.code] ?? 0) + 1;
    s.cart = s.cart.filter((c) => !c.on);
    s.notif.unshift({ i: "fa-solid fa-receipt", t: `Commande ${ids.join(", ")} reçue`, p: "Le store prépare votre commande.", to: `/orders/${ids[0]}`, un: true });
    s.paid[key] = ids;
  });
  return { ok: true, ids };
}

/** Démo : le store passe la commande « En préparation » (4 s) puis « Prête pour retrait » (12 s). */
export function simulateStoreProgress(ids: string[], onReady?: (id: string) => void) {
  ids.forEach((id, i) => {
    setTimeout(() => {
      demo.update((s) => {
        const o = s.orders.find((x) => x.id === id);
        if (o && o.status === "received") o.status = "prep";
      });
    }, 4000 + i * 500);
    setTimeout(() => {
      let ready = false;
      demo.update((s) => {
        const o = s.orders.find((x) => x.id === id);
        if (!o || o.status !== "prep" || o.mode === "delivery") return; // livraison : simulateDelivery
        o.status = "ready";
        o.code = String(100000 + Math.floor(Math.random() * 899999));
        o.due = "9 nov. 2026";
        s.notif.unshift({ i: "fa-solid fa-box", t: `Commande ${id} prête pour retrait`, p: `${storeBy(o.store)!.n} vous attend.`, to: `/orders/${id}`, un: true });
        ready = true;
      });
      if (ready) onReady?.(id);
    }, 12000 + i * 500);
  });
}

/** Démo livraison : remise au livreur (12 s), en route (20 s) puis progression jusqu'à 90 % ; la dernière étape attend le code. */
export function simulateDelivery(ids: string[], onEnroute?: (id: string) => void) {
  ids.forEach((id, i) => {
    const o0 = demo.get().orders.find((x) => x.id === id);
    if (!o0 || o0.mode !== "delivery") return;
    setTimeout(() => {
      demo.update((s) => {
        const o = s.orders.find((x) => x.id === id);
        if (!o || o.status !== "prep") return;
        o.status = "handed";
        o.driver = DEMO_DRIVERS[(Number(id.replace(/\D/g, "")) || i) % DEMO_DRIVERS.length];
        o.code = String(100000 + Math.floor(Math.random() * 899999));
        o.track = 5;
        s.notif.unshift({ i: "fa-solid fa-truck", t: `Commande ${id} remise au livreur`, p: `${o.driver.n} part de ${storeBy(o.store)!.n}.`, to: `/orders/${id}`, un: true });
      });
    }, 12000 + i * 500);
    setTimeout(() => {
      let go = false;
      demo.update((s) => {
        const o = s.orders.find((x) => x.id === id);
        if (!o || o.status !== "handed") return;
        o.status = "enroute";
        o.track = 15;
        go = true;
        s.notif.unshift({ i: "fa-solid fa-truck", t: `Commande ${id} en route`, p: "Donnez votre code de livraison au livreur.", to: `/orders/${id}`, un: true });
      });
      if (!go) return;
      onEnroute?.(id);
      const tick = setInterval(() => {
        let more = false;
        demo.update((s) => {
          const o = s.orders.find((x) => x.id === id);
          if (!o || o.status !== "enroute") return;
          o.track = Math.min(90, (o.track ?? 15) + 15);
          more = o.track < 90;
        });
        if (!more) clearInterval(tick);
      }, 3000);
    }, 20000 + i * 500);
  });
}

export function toggleWish(id: string): boolean {
  let on = false;
  demo.update((s) => {
    if (s.wish[id]) delete s.wish[id];
    else s.wish[id] = true;
    on = !!s.wish[id];
  });
  return on;
}

export function unread(s: DemoState = demo.get()): number {
  return s.notif.filter((n) => n.un).length;
}

export function pushHistory(q: string) {
  demo.update((s) => {
    s.hist = [q, ...s.hist.filter((x) => x !== q)].slice(0, 8);
  });
}

export function markViewed(id: string) {
  if (demo.get().viewed[0] === id) return;
  demo.update((s) => {
    if (s.viewed.indexOf(id) < 0) s.viewed = [id, ...s.viewed].slice(0, 30);
  });
}

export function topUp(amount: number, gatewayLabel: string) {
  demo.update((s) => {
    s.wallet += amount;
    s.txs.unshift(["fa-solid fa-circle-plus", `Recharge ${gatewayLabel}`, "6 nov.", amount, ""]);
  });
  return `Wallet rechargé de ${formatHTG(amount)}`;
}

/** Payer le panier d'un proche (PRD §3) : débit du wallet, ligne d'historique. */
export function payForRelative(user: string, total: number) {
  demo.update((s) => {
    s.wallet -= total;
    s.txs.unshift(["fa-solid fa-gift", `Panier payé pour @${user}`, "6 nov.", -total, ""]);
  });
}

/** Démo : simule le retrait en magasin (statut « Retirée », +50 Coins, message). */
export function simulatePickup(id: string) {
  demo.update((d) => {
    const o = d.orders.find((y) => y.id === id);
    if (!o) return;
    o.status = "done";
    o.date = "6 nov. 2026";
    d.coins += 50;
    d.notif.unshift({ i: "fa-solid fa-circle-check", t: `Commande ${id} retirée`, p: "+50 Coins. Laissez un avis pour en gagner 25 de plus.", to: `/orders/${id}`, un: true });
  });
}

export function logout() {
  demo.update((d) => { d.logged = false; });
}
export function login() {
  demo.update((d) => { d.logged = true; });
}

/** Livraison : l'acheteur donne son code au livreur ; le bon code passe la commande « Livrée ». */
export function validateDelivery(id: string, code: string): string | null {
  const o = demo.get().orders.find((x) => x.id === id);
  if (!o || o.mode !== "delivery") return "Commande introuvable.";
  if (o.status !== "enroute") return "La commande n'est pas encore en route.";
  if (code.replace(/\s/g, "") !== o.code) return "Code incorrect.";
  demo.update((s) => {
    const x = s.orders.find((y) => y.id === id)!;
    x.status = "delivered";
    x.track = 100;
    s.coins += BUSINESS.coinsPerOrder;
    s.notif.unshift({ i: "fa-solid fa-truck", t: `Commande ${id} livrée`, p: `+${BUSINESS.coinsPerOrder} Coins. Merci !`, to: `/orders/${id}`, un: true });
  });
  return null;
}
