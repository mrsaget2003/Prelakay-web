"use client";

// Sélecteurs et actions de l'espace vendeur (prototype : sellerOrders, todo, sellerDisputes,
// sellerReviews, sellerQuestions, sellerConvs et les actions « sl-* »). Les commandes de
// l'acheteur de démo apparaissent chez le store ; chaque changement de statut le prévient.

import { DEMO_DRIVERS } from "./delivery";
import { CATS, TINTS, catBy, everyProduct, optsOf, prodBy, stockFor, storeBy, type OptAxis, type Product } from "@/lib/data/mock/seed";
import { REVS } from "@/lib/data/mock/content";
import { formatHTG } from "@/lib/format";
import { demo, type DemoState, type Order, type ProductForm, type SDispute, type SellerProduct, type Conv } from "./store";
import { BUYERS, canTransition, combos, comboKey, finOf, formatCode, generateStoreOrders, hs, nextCode, stockTotal, type SellerOrder } from "./seller";

export const myStore = (s: DemoState) => storeBy(s.seller.store)!;

/* ---------- produits ---------- */

/** Produits de démonstration supplémentaires du store (brouillon, refusé) — ensureExtra du prototype. */
function extraFor(storeId: string): SellerProduct[] {
  const st = storeBy(storeId)!;
  const cat = catBy(st.cat)!;
  return [
    { n: `${cat.sub[0]} — nouvelle collection`, status: "draft" },
    { n: "Article sans photo conforme", status: "rejected", why: "Photos floues : ajoutez 3 photos nettes du produit réel." },
  ].map((x, i) => ({
    id: `sp-${storeId}-${i}`, n: x.n, cat: st.cat, sub: cat.sub[i % cat.sub.length], store: storeId, price: 1500 + i * 500, was: 0, disc: 0,
    sold: 0, reviews: 0, rating: 0, icon: cat.i, tint: TINTS[i], isNew: true, stockLow: false, ready: false, status: x.status, why: x.why ?? null, opts: [],
  }));
}

function ensureStore(s: DemoState) {
  const id = s.seller.store;
  if (!s.seller.extra[id]) {
    s.seller.extra[id] = true;
    s.seller.products.push(...extraFor(id));
  }
  if (!s.seller.sorders[id]) s.seller.sorders[id] = generateStoreOrders(id);
}

export function statusOf(s: DemoState, p: Product): string {
  const sp = s.seller.products.find((x) => x.id === p.id);
  return sp ? sp.status : s.seller.pstatus[p.id] ?? (p as SellerProduct).status ?? "active";
}
/** Statut affiché : « Rupture » quand un produit actif n'a plus de stock. */
export function pStatus(s: DemoState, p: Product): string {
  const st = statusOf(s, p);
  return st === "active" && stockTotal(p) === 0 ? "out" : st;
}
export function myProducts(s: DemoState): Product[] {
  const id = s.seller.store;
  const extras = s.seller.extra[id] ? [] : extraFor(id);
  return [...everyProduct().filter((p) => p.store === id), ...extras];
}
export function whyOf(s: DemoState, id: string): string | null {
  const sp = s.seller.products.find((x) => x.id === id) ?? (s.seller.extra[s.seller.store] ? undefined : extraFor(s.seller.store).find((x) => x.id === id));
  return sp?.why ?? null;
}

/* ---------- commandes ---------- */

export function sellerOrders(s: DemoState): SellerOrder[] {
  const id = s.seller.store;
  const mine = s.orders.filter((o) => o.store === id).map((o) => ({ ...o, buyer: `@${s.user}` }));
  return [...mine, ...(s.seller.sorders[id] ?? generateStoreOrders(id))];
}
export function orderById(s: DemoState, id: string): SellerOrder | undefined {
  return sellerOrders(s).find((o) => o.id === id);
}
const isMine = (s: DemoState, id: string) => s.orders.some((o) => o.id === id);

/** Modifie une commande (de l'acheteur de démo ou d'un autre acheteur). */
function withOrder(s: DemoState, id: string, fn: (o: Order & { buyer?: string; picked?: string; rel?: boolean }) => void) {
  ensureStore(s);
  const o = s.orders.find((x) => x.id === id) ?? s.seller.sorders[s.seller.store].find((x) => x.id === id);
  if (o) fn(o);
}
function buyerNotif(s: DemoState, orderId: string, t: string, p: string) {
  if (isMine(s, orderId)) s.notif.unshift({ i: "fa-solid fa-box", t, p, to: `/orders/${orderId}`, un: true });
}
export function sNotif(s: DemoState, i: string, t: string, p: string, to: string) {
  s.seller.notif.unshift({ i, t, p, to, un: true, store: s.seller.store });
}

export function prepOrder(id: string) {
  demo.update((s) => {
    withOrder(s, id, (o) => {
      if (!canTransition(o.status, "prep")) return;
      o.status = "prep";
    });
    buyerNotif(s, id, `Commande ${id} en préparation`, `${myStore(s).n} prépare votre commande.`);
  });
}
export function readyOrder(id: string) {
  demo.update((s) => {
    let code = "";
    withOrder(s, id, (o) => {
      if (!canTransition(o.status, "ready") || o.mode === "delivery") return;
      o.status = "ready";
      o.code = code = nextCode();
      o.due = "9 nov. 2026";
    });
    if (code) buyerNotif(s, id, `Commande ${id} prête pour retrait`, `${myStore(s).n} vous attend. Code : ${formatCode(code)}.`);
  });
}
export function cancelOrder(id: string) {
  demo.update((s) => {
    let total = 0;
    withOrder(s, id, (o) => {
      if (!canTransition(o.status, "cancelled")) return;
      o.status = "cancelled";
      total = o.total + (o.fee ?? 0);
    });
    if (total && isMine(s, id)) s.wallet += total;
    if (total) buyerNotif(s, id, `Commande ${id} annulée par le store`, `${formatHTG(total)} remboursés sur votre wallet.`);
  });
}
/** Livraison : la commande préparée est remise au livreur (le code de livraison est créé ici). */
export function handToDriver(id: string): string | null {
  const o = orderById(demo.get(), id);
  if (!o) return "Commande introuvable.";
  if (o.mode !== "delivery") return "Cette commande est un retrait en magasin.";
  if (o.status !== "prep") return "Préparez d'abord la commande.";
  demo.update((s) => {
    let driver = "";
    withOrder(s, id, (x) => {
      x.status = "handed";
      x.driver = DEMO_DRIVERS[(Number(id.replace(/\D/g, "")) || 0) % DEMO_DRIVERS.length];
      x.code = nextCode();
      x.track = 5;
      driver = x.driver.n;
    });
    if (isMine(s, id)) s.notif.unshift({ i: "fa-solid fa-truck", t: `Commande ${id} remise au livreur`, p: `${driver} part de ${myStore(s).n}.`, to: `/orders/${id}`, un: true });
  });
  return null;
}

/** Non retirée après 3 jours : statut « Non retirée », unités remises en stock. */
export function noShow(id: string) {
  demo.update((s) => {
    withOrder(s, id, (o) => {
      if (!canTransition(o.status, "expired")) return;
      o.status = "expired";
      for (const it of o.items) {
        const p = prodBy(it.p);
        if (!p) continue;
        const c: Record<string, string> = {};
        optsOf(p).forEach((ax, j) => (c[ax.k] = it.v.split(" · ")[j]));
        s.seller.stockO[comboKey(p, c)] = stockFor(p, c) + it.q;
      }
    });
    buyerNotif(s, id, `Commande ${id} non retirée`, "Remboursement sur votre wallet, moins les frais de restockage (montant à confirmer).");
  });
}

export type PickupResult = { ok: true; order: SellerOrder } | { ok: false; error: string };
/** Validation du retrait par le code à 6 chiffres (ou le QR). */
export function validatePickup(raw: string): PickupResult {
  const code = raw.replace(/\D/g, "");
  const s0 = demo.get();
  const o = sellerOrders(s0).find((x) => x.status === "ready" && x.code === code);
  if (!o) return { ok: false, error: "Code invalide ou commande déjà retirée. Vérifiez les 6 chiffres avec l'acheteur." };
  demo.update((s) => {
    withOrder(s, o.id, (x) => {
      x.status = "done";
      x.picked = "6 nov. 2026";
      x.rel = false;
    });
    if (isMine(s, o.id)) {
      s.coins += 50;
      s.notif.unshift({ i: "fa-solid fa-circle-check", t: `Commande ${o.id} retirée`, p: "+50 Coins. Laissez un avis pour en gagner 25 de plus.", to: `/orders/${o.id}`, un: true });
    }
    sNotif(s, "fa-solid fa-circle-check", `Retrait validé · ${o.id}`, `${formatHTG(o.total)} en escrow, libéré ${myStore(s).trust ? "dans 24 h" : "dans 3 jours"}.`, `/seller/orders/${o.id}`);
  });
  return { ok: true, order: o };
}

/* ---------- tâches, finances ---------- */

export function sellerFin(s: DemoState) {
  const f = finOf(s.seller.store, sellerOrders(s), s.seller.payouts);
  // budgets de boost (10 nov. 2026) payés par le solde disponible
  const boosts = (s.marketing?.boosts ?? []).filter((b) => b.store === s.seller.store).reduce((a, b) => a + b.budget, 0);
  return { ...f, avail: Math.max(0, f.avail - boosts), boosts };
}

export function todo(s: DemoState) {
  const O = sellerOrders(s);
  return {
    toPrep: O.filter((o) => o.status === "received").length,
    prep: O.filter((o) => o.status === "prep").length,
    ready: O.filter((o) => o.status === "ready").length,
    q: sellerQuestions(s).filter((q) => !q.a).length,
    d: sellerDisputes(s).filter((d) => d.st === "open").length,
    m: sellerConvs(s).filter((c) => c.un).length,
    low: myProducts(s).filter((p) => statusOf(s, p) === "active" && stockTotal(p) <= 3).length,
  };
}

/* ---------- litiges ---------- */

function demoDisputes(s: DemoState): SDispute[] {
  const id = s.seller.store;
  const h = hs(id);
  const O = sellerOrders(s).filter((o) => o.status === "done" && !isMine(s, o.id));
  return O.length ? [{ id: `LT-${200 + (h % 90)}`, order: O[0].id, buyer: O[0].buyer, why: "Article endommagé", txt: "La couture du côté gauche est déchirée.", photo: true, st: "open", due: "8 nov. 2026 à 18 h" }] : [];
}
export function sellerDisputes(s: DemoState): SDispute[] {
  const id = s.seller.store;
  const mine = s.disputes
    .filter((d) => s.orders.find((o) => o.id === d.id)?.store === id)
    .map((d, i): SDispute => ({ id: `LT-${300 + i}`, order: d.id, buyer: `@${s.user}`, why: d.why, txt: d.txt, photo: /endommagé|conforme/.test(d.why), st: "open", due: "9 nov. 2026 à 18 h" }));
  const local = s.seller.dsp[id] ?? demoDisputes(s);
  // un litige de l'acheteur garde la décision enregistrée sous le même identifiant
  return [...mine.map((d) => local.find((x) => x.id === d.id) ?? d), ...local.filter((x) => !mine.some((m) => m.id === x.id))];
}
export function resolveDispute(id: string, how: "full" | "part" | "esc", amount = 0): string | null {
  const s0 = demo.get();
  const D = sellerDisputes(s0).find((x) => x.id === id);
  if (!D) return "Litige introuvable.";
  const o = orderById(s0, D.order)!;
  if (how === "part" && (!(amount > 0) || amount > o.total)) return `Montant invalide (entre 1 et ${formatHTG(o.total)}).`;
  demo.update((s) => {
    const sid = s.seller.store;
    const list = (s.seller.dsp[sid] ??= sellerDisputes(s));
    if (!list.some((x) => x.id === id)) list.push(D);
    const ref = list.find((x) => x.id === id)!;
    if (how === "esc") ref.st = "escalated";
    else {
      ref.st = "done";
      const amt = how === "full" ? o.total : amount;
      if (isMine(s, o.id)) s.wallet += amt;
      buyerNotif(s, o.id, `Litige ${id} : ${how === "full" ? "remboursé" : "remboursement partiel"}`, `${formatHTG(amt)} recrédités sur votre wallet.`);
    }
  });
  return null;
}

/* ---------- avis, questions, messages ---------- */

export type SReview = { k: string; p: Product; who: string; st: number; t: string; photo: boolean; date: string; reply: string };
export function sellerReviews(s: DemoState): SReview[] {
  const L = myProducts(s).filter((p) => p.reviews);
  const out: SReview[] = [];
  L.slice(0, 4).forEach((p, i) => {
    const r = REVS[(i * 2 + hs(p.id)) % REVS.length];
    const k = `${p.id}-${i}`;
    out.push({ k, p, who: r[0], st: r[1], t: r[2], photo: r[4], date: `il y a ${i * 3 + 1} jours`, reply: s.seller.replies[k] ?? (i % 2 ? r[3] : "") });
  });
  s.myRevs
    .filter((x) => prodBy(x.p)?.store === s.seller.store)
    .forEach((x) => out.unshift({ k: x.k, p: prodBy(x.p)!, who: `@${s.user}`, st: x.st, t: x.t || "(sans commentaire)", photo: false, date: "aujourd'hui", reply: s.seller.replies[x.k] || "" }));
  return out;
}
export type SQuestion = { k: string; p: Product; who: string; q: string; a: string; date: string };
export function sellerQuestions(s: DemoState): SQuestion[] {
  const L = myProducts(s).filter((p) => statusOf(s, p) === "active");
  const demoQ = ["Est-ce que vous avez la taille au-dessus ?", "Vous êtes ouverts le dimanche ?", "Le prix est-il négociable en magasin ?"];
  const out: SQuestion[] = L.slice(0, 3).map((p, i) => {
    const k = `q-${p.id}`;
    return { k, p, who: BUYERS[(i + 3) % BUYERS.length], q: demoQ[i], a: s.seller.answers[k] || (i === 2 ? "Non, le prix est le même en ligne et en magasin." : ""), date: `il y a ${i + 1} j` };
  });
  s.questions
    .filter((x) => prodBy(x.p)?.store === s.seller.store)
    .forEach((x) => out.unshift({ k: x.k, p: prodBy(x.p)!, who: `@${s.user}`, q: x.q, a: s.seller.answers[x.k] || "", date: "aujourd'hui" }));
  return out;
}
function demoConvs(s: DemoState): Conv[] {
  const O = sellerOrders(s).filter((o) => !isMine(s, o.id));
  return O.slice(0, 3).map((o, i) => ({
    id: `c${i}`, who: o.buyer, order: o.id, un: i < 2,
    msgs: [{ me: false, t: ["Bonjour, ma commande sera prête à quelle heure ?", "Je peux envoyer ma sœur récupérer à ma place ?", "Merci, très bon service !"][i], at: ["10:48", "09:20", "Hier"][i] }, ...(i === 2 ? [{ me: true, t: "Merci à vous, à bientôt !", at: "Hier" }] : [])],
  }));
}
export function sellerConvs(s: DemoState): Conv[] {
  return s.seller.convs[s.seller.store] ?? demoConvs(s);
}
function convsOf(s: DemoState): Conv[] {
  return (s.seller.convs[s.seller.store] ??= demoConvs(s));
}
export function markConvRead(id: string) {
  if (!sellerConvs(demo.get()).find((c) => c.id === id)?.un) return;
  demo.update((s) => {
    const c = convsOf(s).find((x) => x.id === id);
    if (c) c.un = false;
  });
}
export function sendMessage(id: string, t: string) {
  demo.update((s) => {
    convsOf(s).find((x) => x.id === id)?.msgs.push({ me: true, t, at: "maintenant" });
  });
}
/** Ouvre (ou crée) la conversation avec un acheteur à propos d'une commande ; renvoie son id. */
export function openChat(who: string, order: string): string {
  let id = "";
  demo.update((s) => {
    const C = convsOf(s);
    let c = C.find((x) => x.who === who && x.order === order);
    if (!c) {
      c = { id: `c${C.length + s.seller.seq++}`, who, order, un: false, msgs: [] };
      C.unshift(c);
    }
    id = c.id;
  });
  return id;
}
export function replyReview(k: string, t: string) {
  demo.update((s) => { s.seller.replies[k] = t; });
}
export function answerQuestion(k: string, t: string) {
  demo.update((s) => { s.seller.answers[k] = t; });
}

/* ---------- produits : actions ---------- */

function upsertProduct(s: DemoState, p: Product, patch: Partial<SellerProduct>) {
  const i = s.seller.products.findIndex((x) => x.id === p.id);
  if (i >= 0) Object.assign(s.seller.products[i], patch);
  else if (p.id.startsWith("np-") || p.id.startsWith("sp-")) s.seller.products.push({ ...(p as SellerProduct), ...patch });
  else if (patch.status) s.seller.pstatus[p.id] = patch.status;
}
export function setProductStatus(id: string, status: "active" | "archived") {
  demo.update((s) => {
    ensureStore(s);
    const p = prodBy(id) ?? s.seller.products.find((x) => x.id === id);
    if (p) upsertProduct(s, p, { status });
  });
}
export function adjustStock(p: Product, key: string, d: number) {
  demo.update((s) => {
    const parts = key.split("#")[1]?.split("|") ?? [];
    const c: Record<string, string> = {};
    optsOf(p).forEach((ax, j) => (c[ax.k] = parts[j]));
    s.seller.stockO[key] = Math.max(0, stockFor(p, c) + d);
  });
}

export const AXES = ["Couleur", "Taille", "Pointure", "Longueur", "Largeur", "Stockage", "Capacité", "Contenance", "Poids", "Format"];

export function formFrom(s: DemoState, p: Product | null): ProductForm {
  const f: ProductForm = {
    id: p ? p.id : null, n: p ? p.n : "", cat: p ? p.cat : myStore(s).cat, sub: p ? p.sub : "", price: p ? String(p.price) : "", was: p && p.was ? String(p.was) : "",
    desc: (p && (p as SellerProduct).desc) || "", photos: p ? 4 : 0, weight: "", dims: "", deliverable: p ? (p as SellerProduct).deliverable !== false : true,
    axes: p ? optsOf(p).map((a) => ({ k: a.k, v: a.v.join(", ") })) : [], stock: {},
  };
  if (p) {
    const A = optsOf(p);
    if (A.length) for (const c of combos(A)) f.stock[A.map((a) => c[a.k]).join("|")] = String(stockFor(p, c));
    else f.stock[""] = String(stockFor(p, {}));
  }
  return f;
}
/** Axes saisis dans le formulaire (fCombos du prototype). */
export function formAxes(F: ProductForm): OptAxis[] {
  return F.axes
    .filter((a) => a.k && a.v.trim())
    .map((a) => ({ k: a.k, t: a.k === "Couleur" ? "color" : "text", v: a.v.split(",").map((x) => x.trim()).filter(Boolean) }));
}
/** Message de la première erreur du formulaire, ou null. */
export function formError(F: ProductForm, mode: "draft" | "mod"): string | null {
  const A = formAxes(F);
  const C = A.length ? combos(A) : [{}];
  if (!F.n.trim()) return "Ajoutez un titre.";
  if (!F.sub) return "Choisissez une sous-catégorie.";
  if (!(+F.price > 0)) return "Indiquez un prix de vente.";
  if (F.was && +F.was <= +F.price) return "Le prix barré doit être plus élevé que le prix de vente.";
  if (mode === "mod" && F.photos < 1) return "Ajoutez au moins une photo.";
  if (mode === "mod" && C.some((c) => { const v = F.stock[A.map((a) => c[a.k]).join("|")]; return v === "" || v == null; })) return "Indiquez le stock de chaque variante.";
  return null;
}
/** Enregistre le produit : brouillon, mise à jour (produit actif) ou envoi en modération. */
export function saveProduct(F: ProductForm, mode: "draft" | "mod"): { id: string; result: "draft" | "updated" | "mod" } {
  const A = formAxes(F);
  const C = A.length ? combos(A) : [{}];
  let out = { id: "", result: "mod" as "draft" | "updated" | "mod" };
  demo.update((s) => {
    ensureStore(s);
    const existing = F.id ? prodBy(F.id) ?? s.seller.products.find((x) => x.id === F.id) ?? null : null;
    const cat = catBy(F.cat) ?? CATS[0];
    const wasActive = existing ? statusOf(s, existing) === "active" : false;
    const id = existing ? existing.id : `np-${s.seller.seq++}`;
    const price = Math.round(+F.price);
    const was = +F.was || 0;
    const base: SellerProduct = {
      ...(existing ?? { id, store: s.seller.store, sold: 0, reviews: 0, rating: 0, icon: cat.i, tint: TINTS[s.seller.seq % 5], isNew: true, stockLow: false, ready: myStore(s).type === "physique" }),
      id, n: F.n.trim(), cat: F.cat, sub: F.sub, price, was, disc: was ? Math.round((1 - price / was) * 100) : 0, desc: F.desc, opts: A, why: null, deliverable: F.deliverable !== false,
      status: mode === "draft" ? "draft" : wasActive ? "active" : "mod",
    } as SellerProduct;
    const i = s.seller.products.findIndex((x) => x.id === id);
    if (i >= 0) s.seller.products[i] = base;
    else s.seller.products.push(base);
    delete s.seller.pstatus[id];
    for (const c of C) s.seller.stockO[`${id}#${A.map((a) => c[a.k]).join("|")}`] = Math.max(0, parseInt(F.stock[A.map((a) => c[a.k]).join("|")], 10) || 0);
    delete s.sel[id];
    s.seller.form = null;
    out = { id, result: mode === "draft" ? "draft" : wasActive ? "updated" : "mod" };
  });
  return out;
}
/** Démo : la modération approuve le produit après quelques secondes. */
export function simulateModeration(id: string, onDone: (name: string) => void) {
  setTimeout(() => {
    let name = "";
    demo.update((s) => {
      const p = s.seller.products.find((x) => x.id === id);
      if (!p || p.status !== "mod") return;
      p.status = "active";
      name = p.n;
      sNotif(s, "fa-solid fa-circle-check", "Produit approuvé", `${p.n} est visible par les acheteurs.`, `/p/${p.id}`);
    });
    if (name) onDone(name);
  }, 6000);
}

/* ---------- compte vendeur ---------- */

export function setManagedStore(id: string) {
  demo.update((s) => {
    s.seller.store = id;
    s.seller.form = null;
  });
}
export function approveKyc() {
  demo.update((s) => { s.kyc = "ok"; });
}
export function savePayMethod(t: string, num: string) {
  demo.update((s) => { s.seller.payMethod = { t, n: `•••• ${num.slice(-4)}` }; });
}
export function requestPayout(amt: number, onPaid: () => void): string | null {
  const s0 = demo.get();
  if (!(amt > 0)) return "Indiquez un montant.";
  if (amt > sellerFin(s0).avail) return "Montant supérieur au solde disponible.";
  const pm = s0.seller.payMethod!;
  const to = `${pm.t} ${pm.n}`;
  demo.update((s) => { s.seller.payouts.unshift({ store: s.seller.store, amt, to, date: "6 nov. 2026", st: "En traitement" }); });
  setTimeout(() => {
    demo.update((s) => {
      const po = s.seller.payouts.find((x) => x.to === to && x.amt === amt && x.st === "En traitement");
      if (!po) return;
      po.st = "Payé";
      sNotif(s, "fa-solid fa-wallet", "Retrait payé", `${formatHTG(amt)} envoyés vers ${to}.`, "/seller/payouts");
    });
    onPaid();
  }, 5000);
  return null;
}
export function savePolicy(days: number, other: boolean, txt: string) {
  demo.update((s) => { s.seller.policy = { days, other, txt }; });
}
export function sellerUnread(s: DemoState): number {
  return s.seller.notif.filter((n) => n.un && n.store === s.seller.store).length;
}
export function markSellerNotifsRead() {
  demo.update((s) => s.seller.notif.forEach((n) => (n.un = false)));
}
/** Ouvre une notification du store : elle passe en lu (sl-nopen du prototype). */
export function readSellerNotif(i: number) {
  demo.update((s) => {
    const n = s.seller.notif[i];
    if (n) n.un = false;
  });
}
