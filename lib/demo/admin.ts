"use client";

// Console admin — sélecteurs et actions de démonstration (objet AD et actions « ad-* » du
// prototype). Chaque décision est journalisée et se répercute chez l'acheteur et le vendeur.

import { DEMO_DELIVERIES, DEMO_DRIVERS } from "./delivery";
import { CATS, TINTS, catBy, everyProduct, prodBy, STORES, storeBy, type Cat, type Product } from "@/lib/data/mock/seed";
import { BANNERS, type Banner } from "@/lib/data/mock/content";
import { formatHTG } from "@/lib/format";
import { ADMINS, ROLES, type Admin, type Role } from "@/lib/domain/admin";
import { demo, type DemoState, type SellerProduct, type SDispute, type Order } from "./store";
import { BUYERS, generateStoreOrders, hs, type SellerOrder } from "./seller";
import { sellerDisputes, sellerOrders, statusOf } from "./sellerActions";

export type Me = { e: string; n: string; role: Role };

/** Vue de l'état comme si le store `id` était le store géré (sélecteurs vendeur réutilisés). */
export function asStore(s: DemoState, id: string): DemoState {
  return { ...s, seller: { ...s.seller, store: id } };
}
const isMine = (s: DemoState, id: string) => s.orders.some((o) => o.id === id);
const now = () => new Date().toTimeString().slice(0, 5);

export function audit(s: DemoState, me: Me | null, a: string, t = "") {
  s.admin.audit.unshift({ who: me ? me.n : "Système", role: me ? ROLES[me.role] : "", a, t, at: now() });
}
/** Connexion / déconnexion (journal). */
export function auditLog(me: Me, a: string, t: string) {
  demo.update((s) => audit(s, me, a, t));
}

/* ---------- commandes de tous les stores ---------- */

export type AOrder = SellerOrder;
export function allOrders(s: DemoState): AOrder[] {
  const out: AOrder[] = s.orders.map((o) => ({ ...o, buyer: `@${s.user}` }));
  const seen = new Set(out.map((o) => o.id + o.store));
  for (const st of STORES)
    for (const o of sellerOrders(asStore(s, st.id)))
      if (!seen.has(o.id + o.store) && !isMine(s, o.id)) {
        seen.add(o.id + o.store);
        out.push(o);
      }
  return out;
}
export function orderAt(s: DemoState, id: string): AOrder | undefined {
  return allOrders(s).find((o) => o.id === id);
}
/** Commande modifiable (acheteur de démo ou commandes générées du store). */
function orderRef(s: DemoState, id: string, store: string): (Order & { rel?: boolean; picked?: string }) | undefined {
  const mine = s.orders.find((o) => o.id === id);
  if (mine) return mine;
  s.seller.sorders[store] ??= generateStoreOrders(store);
  return s.seller.sorders[store].find((o) => o.id === id);
}

/* ---------- litiges ---------- */

export type ADispute = SDispute & { store: string; reply?: string; decision?: string };
function demoEscalated(s: DemoState): ADispute[] {
  const O = allOrders(s).filter((o) => o.status === "done" && !isMine(s, o.id));
  return O.slice(1, 3).map((o, i) => ({
    id: `LT-${150 + i}`, order: o.id, store: o.store, buyer: o.buyer, why: ["Article non conforme", "Article manquant"][i],
    txt: ["Ce n'est pas la couleur commandée.", "Il manquait un article dans le sac."][i], photo: i === 0, st: "escalated" as const, due: "—",
    reply: ["La couleur correspond à la photo de la fiche.", "Tout a été vérifié au comptoir avec l'acheteur."][i],
  }));
}
export function allDisputes(s: DemoState): ADispute[] {
  const out: ADispute[] = [];
  for (const st of STORES) for (const d of sellerDisputes(asStore(s, st.id))) out.push({ ...d, store: st.id });
  out.push(...demoEscalated(s));
  return out.map((d) => ({ ...d, ...(s.admin.dsp[d.id] ?? {}) }));
}

/* ---------- KYC ---------- */

export type KycRow = { id: string; fn: string; ln: string; store: string; type: "physique" | "virtuel"; cat: string; addr: string; date: string; age: number; st: "recu" | "verif" | "ok" | "rej"; flag?: string; why?: string | null; mine?: boolean; nif?: string; ninu?: string };
const KYC_DEMO: KycRow[] = [
  { id: "KYC-0148", fn: "Wilner", ln: "Augustin", store: "Bon Pri Elektwonik", type: "physique", cat: "tech", addr: "Rue Capitale, Les Cayes", date: "6 nov. 2026", age: 34, st: "recu" },
  { id: "KYC-0147", fn: "Roseline", ln: "Charles", store: "Rose Kreyòl Couture", type: "physique", cat: "mode", addr: "Rue Nicolas, Les Cayes", date: "6 nov. 2026", age: 41, st: "recu" },
  { id: "KYC-0146", fn: "Jean-Ronel", ln: "Désir", store: "Ronel Auto Pièces", type: "physique", cat: "auto", addr: "Route de Torbeck, Les Cayes", date: "5 nov. 2026", age: 17, st: "verif", flag: "Âge inférieur à 18 ans d'après la date de naissance" },
  { id: "KYC-0145", fn: "Fabienne", ln: "Louis", store: "Fab Beauté en ligne", type: "virtuel", cat: "beaute", addr: "Store en ligne", date: "4 nov. 2026", age: 29, st: "verif" },
  { id: "KYC-0139", fn: "Patrick", ln: "Noël", store: "Kay Pratik", type: "physique", cat: "maison", addr: "Rue Capitale, Les Cayes", date: "28 oct. 2026", age: 45, st: "ok" },
  { id: "KYC-0137", fn: "Sonia", ln: "Jean", store: "Sonia Mode", type: "virtuel", cat: "mode", addr: "Store en ligne", date: "27 oct. 2026", age: 23, st: "rej", why: "Pièce d'identité illisible" },
];
export function kycList(s: DemoState): KycRow[] {
  const L = KYC_DEMO.map((k) => ({ ...k, ...(s.admin.kyc[k.id] ?? {}) }));
  if (s.kyc) {
    const d = s.kycData;
    L.unshift({ id: "KYC-0149", fn: d?.fn || s.name, ln: d?.ln || "", store: `Commerce de @${s.user}`, type: "physique", cat: "mode", addr: "Les Cayes", date: d?.date || "6 nov. 2026", age: d?.age ?? 30, st: s.kyc, why: s.kycWhy, mine: true, nif: d?.nif, ninu: d?.ninu });
  }
  return L;
}
function setKyc(s: DemoState, id: string, st: KycRow["st"], why?: string) {
  if (id === "KYC-0149") {
    s.kyc = st;
    s.kycWhy = why ?? null;
    if (st === "ok") s.notif.unshift({ i: "fa-solid fa-circle-check", t: "Dossier vendeur approuvé", p: "Votre espace vendeur est ouvert.", to: "/seller", un: true });
    if (st === "rej") s.notif.unshift({ i: "fa-solid fa-circle-exclamation", t: "Dossier vendeur refusé", p: `Motif : ${why}`, to: "/sell", un: true });
  } else s.admin.kyc[id] = { st, why };
}
export function kycTake(me: Me, id: string) {
  demo.update((s) => {
    setKyc(s, id, "verif");
    audit(s, me, "KYC pris en charge", id);
  });
}
export function kycApprove(me: Me, id: string) {
  demo.update((s) => {
    const k = kycList(s).find((x) => x.id === id)!;
    setKyc(s, id, "ok");
    audit(s, me, "KYC approuvé", `${id} · ${k.store}`);
  });
}
export function kycReject(me: Me, id: string, m: string, c: string) {
  demo.update((s) => {
    setKyc(s, id, "rej", m + (c ? ` — ${c}` : ""));
    audit(s, me, "KYC rejeté", `${id} · ${m}`);
  });
}

/* ---------- modération des produits ---------- */

const MQ: [string, string, number, string, string][] = [
  ["tech-sud", "Écouteurs Pro sans fil ANC", 4250, "tech", "il y a 2 h"],
  ["bel-soley", "Coffret soins karité x4", 3600, "beaute", "il y a 5 h"],
  ["kay-pratik", "Lampe torche rechargeable", 1150, "maison", "hier"],
];
export type ModProduct = Product & { submitted?: string };
function mqSeeds(): SellerProduct[] {
  return MQ.map(([store, n, price, cat, submitted], i) => {
    const c = catBy(cat)!;
    return { id: `mq-${i}`, n, cat, sub: c.sub[i % c.sub.length], store, price, was: 0, disc: 0, sold: 0, reviews: 0, rating: 0, icon: c.i, tint: TINTS[i + 1], isNew: true, stockLow: false, ready: true, status: "mod", why: null, opts: [], submitted } as SellerProduct;
  });
}
function ensureMod(s: DemoState) {
  if (s.admin.modSeeded) return;
  s.admin.modSeeded = true;
  s.seller.products.push(...mqSeeds());
}
/** Tous les produits avec leur statut (file de modération : prototype modQueue). */
export function modQueue(s: DemoState): ModProduct[] {
  const extra = s.admin.modSeeded ? [] : mqSeeds();
  return [...everyProduct(), ...extra];
}
export function pStatusOf(s: DemoState, p: Product): string {
  return statusOf(s, p);
}
export function modProduct(s: DemoState, id: string): ModProduct | undefined {
  return modQueue(s).find((p) => p.id === id);
}
function setStatus(s: DemoState, id: string, status: string, why: string | null) {
  ensureMod(s);
  const sp = s.seller.products.find((x) => x.id === id);
  if (sp) {
    sp.status = status;
    sp.why = why;
  } else {
    s.seller.pstatus[id] = status;
    if (why) {
      const p = prodBy(id)!;
      s.seller.products.push({ ...(p as SellerProduct), status, why });
    }
  }
}
export function productApprove(me: Me, id: string) {
  demo.update((s) => {
    const p = modProduct(s, id)!;
    setStatus(s, id, "active", null);
    s.seller.notif.unshift({ i: "fa-solid fa-circle-check", t: "Produit approuvé", p: `${p.n} est visible par les acheteurs.`, to: `/p/${p.id}`, un: true, store: p.store });
    audit(s, me, "Produit approuvé", p.n);
  });
}
export function productReject(me: Me, id: string, m: string, c: string) {
  demo.update((s) => {
    const p = modProduct(s, id)!;
    setStatus(s, id, "rejected", m + (c ? ` — ${c}` : ""));
    s.seller.notif.unshift({ i: "fa-solid fa-circle-exclamation", t: "Produit refusé", p: `${p.n} : ${m}`, to: `/seller/products/${p.id}`, un: true, store: p.store });
    audit(s, me, "Produit rejeté", `${p.n} · ${m}`);
  });
}

/* ---------- signalements ---------- */

export type Report = { id: string; type: string; target: string; reason: string; by: string; date: string; st: string; decision?: string };
const REPORTS_DEMO: Report[] = [
  { id: "SG-381", type: "produit", target: "tech-2", reason: "Contrefaçon", by: "@stanley.c", date: "5 nov. 2026", st: "open" },
  { id: "SG-377", type: "avis", target: "beaute-0", reason: "Avis abusif ou faux", by: "@ketia.b", date: "4 nov. 2026", st: "open" },
  { id: "SG-370", type: "store", target: "moto-pyes", reason: "Prix trompeur", by: "@jowan509", date: "2 nov. 2026", st: "done", decision: "Classé sans suite" },
];
export function reportsList(s: DemoState): Report[] {
  return [...s.reports, ...REPORTS_DEMO].map((r) => ({ ...r, ...(s.admin.reports[r.id] ?? {}) }));
}
export function reportDecide(me: Me, id: string, v: "dismiss" | "remove" | "hide" | "warn") {
  demo.update((s) => {
    const r = reportsList(s).find((x) => x.id === id)!;
    let decision = "Classé sans suite";
    if (v === "remove") {
      if (prodBy(r.target)) setStatus(s, r.target, "rejected", `Retiré après signalement : ${r.reason}`);
      decision = "Produit retiré";
    } else if (v === "hide") decision = "Avis masqué";
    else if (v === "warn") {
      const store = r.type === "store" ? r.target : prodBy(r.target)?.store;
      if (store) s.seller.notif.unshift({ i: "fa-solid fa-triangle-exclamation", t: "Avertissement Prélakay", p: `Suite à un signalement : ${r.reason}`, to: "/seller", un: true, store });
      decision = "Store averti";
    }
    s.admin.reports[id] = { st: "done", decision };
    audit(s, me, "Signalement traité", `${id} · ${decision}`);
  });
  return reportsList(demo.get()).find((x) => x.id === id)!.decision!;
}

/** Files d'attente du tableau de bord. */
export function queues(s: DemoState) {
  return {
    kyc: kycList(s).filter((k) => k.st === "recu" || k.st === "verif").length,
    products: modQueue(s).filter((p) => statusOf(s, p) === "mod").length,
    reports: reportsList(s).filter((r) => r.st === "open").length,
    disputes: allDisputes(s).filter((d) => d.st === "escalated").length,
  };
}

/** Décision sur un litige : remboursement total, partiel, raison au store, ou reprise en main. */
export function disputeDecide(me: Me, id: string, v: "buyer" | "part" | "store" | "esc", amount = 0): string | null {
  const s0 = demo.get();
  const d = allDisputes(s0).find((x) => x.id === id);
  if (!d) return "Litige introuvable.";
  const o = orderAt(s0, d.order)!;
  if (v === "part" && (!(amount > 0) || amount > o.total)) return "Montant invalide.";
  demo.update((s) => {
    if (v === "esc") {
      s.admin.dsp[id] = { st: "escalated" };
      audit(s, me, "Litige repris", id);
      return;
    }
    let decision: string;
    if (v === "part") {
      if (isMine(s, o.id)) s.wallet += amount;
      decision = `Remboursement partiel de ${formatHTG(amount)}`;
    } else if (v === "buyer") {
      if (isMine(s, o.id)) s.wallet += o.total;
      decision = "Acheteur remboursé";
    } else {
      const ref = orderRef(s, o.id, o.store);
      if (ref) ref.rel = true;
      decision = "Raison donnée au store";
    }
    s.admin.dsp[id] = { st: "done", decision };
    // le store voit le litige résolu dans son espace
    const list = (s.seller.dsp[d.store] ??= sellerDisputes(asStore(s, d.store)));
    const sd = list.find((x) => x.id === id);
    if (sd) sd.st = "done";
    if (isMine(s, o.id)) s.notif.unshift({ i: "fa-solid fa-scale-balanced", t: `Litige ${id} tranché`, p: `${decision}.`, to: `/orders/${o.id}`, un: true });
    s.seller.notif.unshift({ i: "fa-solid fa-scale-balanced", t: `Litige ${id} tranché par Prélakay`, p: decision, to: "/seller/disputes", un: true, store: o.store });
    audit(s, me, "Litige tranché", `${id} · ${decision}`);
  });
  return null;
}

/* ---------- stores ---------- */

export function storeState(s: DemoState, id: string) {
  const st = storeBy(id)!;
  const o = s.admin.stores[id] ?? {};
  return { ...st, trust: o.trust ?? st.trust, suspended: !!o.suspended, why: o.why ?? "" };
}
export function storeTrust(me: Me, id: string, on: boolean) {
  demo.update((s) => {
    s.admin.stores[id] = { ...(s.admin.stores[id] ?? {}), trust: on };
    audit(s, me, on ? "Store de confiance accordé" : "Store de confiance retiré", storeBy(id)!.n);
  });
}
export function storeSuspend(me: Me, id: string, why: string | null) {
  demo.update((s) => {
    s.admin.stores[id] = { ...(s.admin.stores[id] ?? {}), suspended: !!why, why: why ?? "" };
    audit(s, me, why ? "Store suspendu" : "Store réactivé", storeBy(id)!.n + (why ? ` · ${why}` : ""));
  });
}
export function storeWarn(me: Me, id: string, m: string, c: string) {
  demo.update((s) => {
    s.seller.notif.unshift({ i: "fa-solid fa-triangle-exclamation", t: "Avertissement Prélakay", p: m + (c ? ` — ${c}` : ""), to: "/seller", un: true, store: id });
    audit(s, me, "Avertissement envoyé", `${storeBy(id)!.n} · ${m}`);
  });
}

/* ---------- utilisateurs ---------- */

export type UserRow = { u: string; name: string; city: string; since: string; orders: number; wallet: number; st: "active" | "banned"; why: string; me?: boolean };
const NAMES = ["Nadège Cadet", "Jowan Michel", "Théodore Dorsainvil", "Ketia Bien-Aimé", "Ricardo Sully", "Mireille Hyppolite", "Stanley Clervil", "Lovely Mompoint"];
const SINCE = ["oct.", "oct.", "nov.", "oct.", "sept.", "oct.", "nov.", "oct."];
export function usersList(s: DemoState): UserRow[] {
  const demoUsers = BUYERS.map((u, i): UserRow => {
    const h = hs(u);
    const base: UserRow = { u, name: NAMES[i], city: i % 3 ? "Les Cayes" : "Miami (diaspora)", since: `${SINCE[i]} 2026`, orders: 2 + (h % 9), wallet: (h % 40) * 2500, st: i === 6 ? "banned" : "active", why: i === 6 ? "Fraude au remboursement" : "" };
    return { ...base, ...(s.admin.users[u] ?? {}) };
  });
  return [{ u: `@${s.user}`, name: s.name, city: s.city, since: "oct. 2026", orders: s.orders.length, wallet: s.wallet, st: "active", why: "", me: true }, ...demoUsers];
}
export function userBan(me: Me, u: string, why: string | null) {
  demo.update((s) => {
    s.admin.users[u] = { st: why ? "banned" : "active", why: why ?? "" };
    audit(s, me, why ? "Utilisateur banni" : "Bannissement levé", u + (why ? ` · ${why}` : ""));
  });
}

/* ---------- commandes ---------- */

/* ---------- livraisons (10 nov. 2026) ---------- */

export function deliveriesList(s: DemoState): AOrder[] {
  const mine = allOrders(s).filter((o) => o.mode === "delivery");
  const demoRows = DEMO_DELIVERIES.map((o) => (s.admin.drivers[o.id] != null ? { ...o, driver: { ...DEMO_DRIVERS[s.admin.drivers[o.id]] } } : o));
  return [...mine, ...demoRows];
}
/** Affecte (ou remplace) le livreur d'une livraison ; l'acheteur le voit sur sa commande. */
export function assignDriver(me: Me, id: string, driver: number): string | null {
  const d = DEMO_DRIVERS[driver];
  const o = deliveriesList(demo.get()).find((x) => x.id === id);
  if (!d || !o) return "Livraison introuvable.";
  if (["delivered", "cancelled"].includes(o.status)) return "Cette livraison est terminée.";
  if (!isMine(demo.get(), id)) {
    demo.update((s) => {
      s.admin.drivers[id] = driver;
      audit(s, me, "Livreur affecté", `${id} · ${d.n}`);
    });
    return null;
  }
  demo.update((s) => {
    const ref = orderRef(s, id, o.store);
    if (ref) ref.driver = { ...d };
    if (isMine(s, id)) s.notif.unshift({ i: "fa-solid fa-truck", t: `Livreur affecté à ${id}`, p: `${d.n} · ${d.tel}`, to: `/orders/${id}`, un: true });
    audit(s, me, "Livreur affecté", `${id} · ${d.n}`);
  });
  return null;
}

export function orderCancel(me: Me, id: string, m: string) {
  demo.update((s) => {
    const o = orderAt(s, id)!;
    const ref = orderRef(s, id, o.store);
    if (!ref || !["received", "prep", "ready", "handed"].includes(ref.status)) return;
    ref.status = "cancelled";
    if (isMine(s, id)) {
      s.wallet += o.total + (o.fee ?? 0);
      s.notif.unshift({ i: "fa-solid fa-circle-exclamation", t: `Commande ${id} annulée`, p: `${formatHTG(o.total)} remboursés sur votre wallet.`, to: `/orders/${id}`, un: true });
    }
    audit(s, me, "Commande annulée et remboursée", `${id} · ${m}`);
  });
}

/* ---------- bannières (visibles sur l'accueil acheteur) ---------- */

export function bannersOf(s: DemoState): Banner[] {
  return s.admin.banners ?? BANNERS;
}
export function bannerSave(me: Me, b: Banner, isNew: boolean) {
  demo.update((s) => {
    const L = (s.admin.banners ??= structuredClone(BANNERS));
    const i = L.findIndex((x) => x.id === b.id);
    if (i >= 0) L[i] = b;
    else L.push(b);
    audit(s, me, isNew ? "Bannière créée" : "Bannière modifiée", b.h);
  });
}
export function bannerMove(me: Me, id: string, d: -1 | 1) {
  demo.update((s) => {
    const L = (s.admin.banners ??= structuredClone(BANNERS));
    const i = L.findIndex((x) => x.id === id);
    const j = i + d;
    if (i < 0 || j < 0 || j >= L.length) return;
    [L[i], L[j]] = [L[j], L[i]];
    audit(s, me, "Ordre des bannières modifié", L[j].h);
  });
}
/** Masquer / mettre en ligne ; refuse de masquer la dernière bannière en ligne. */
export function bannerToggle(me: Me, id: string, on: boolean): string | null {
  if (!on && bannersOf(demo.get()).filter((x) => x.on).length < 2) return "Gardez au moins une bannière en ligne.";
  demo.update((s) => {
    const L = (s.admin.banners ??= structuredClone(BANNERS));
    const b = L.find((x) => x.id === id)!;
    b.on = on;
    audit(s, me, on ? "Bannière mise en ligne" : "Bannière masquée", b.h);
  });
  return null;
}
export function bannerDelete(me: Me, id: string): string | null {
  if (bannersOf(demo.get()).length < 2) return "Gardez au moins une bannière.";
  demo.update((s) => {
    const L = (s.admin.banners ??= structuredClone(BANNERS));
    const i = L.findIndex((x) => x.id === id);
    audit(s, me, "Bannière supprimée", L[i].h);
    L.splice(i, 1);
  });
  return null;
}

/* ---------- notifications ---------- */

export function notifySend(me: Me, n: { to: string; toLabel: string; t: string; p: string; link: string; wa: boolean; mail: boolean }) {
  demo.update((s) => {
    const ch = ["App", ...(n.wa ? ["WhatsApp"] : []), ...(n.mail ? ["E-mail"] : [])].join(", ");
    if (n.to === "buyers" || n.to === "me") s.notif.unshift({ i: "fa-solid fa-bullhorn", t: n.t, p: n.p, to: n.link, un: true });
    if (n.to === "stores") for (const st of STORES) s.seller.notif.unshift({ i: "fa-solid fa-bullhorn", t: n.t, p: n.p, to: n.link, un: true, store: st.id });
    else if (n.to.startsWith("store:")) s.seller.notif.unshift({ i: "fa-solid fa-bullhorn", t: n.t, p: n.p, to: n.link, un: true, store: n.to.slice(6) });
    s.admin.sent.unshift({ t: n.t, to: n.toLabel, ch, at: now() });
    audit(s, me, "Notification envoyée", `${n.t} → ${n.toLabel}`);
  });
}

/* ---------- catégories ---------- */

export function catsOf(s: DemoState): Cat[] {
  return s.admin.cats ?? CATS;
}
function editCats(s: DemoState) {
  return (s.admin.cats ??= structuredClone(CATS));
}
export function catCreate(me: Me, n: string): string {
  const id = `c${Date.now() % 10000}`;
  demo.update((s) => {
    editCats(s).push({ id, n, i: "fa-solid fa-tag", sub: [] });
    s.admin.attrs[id] = [];
    audit(s, me, "Catégorie créée", n);
  });
  return id;
}
export function subAdd(me: Me, cat: string, n: string): string | null {
  const c = catsOf(demo.get()).find((x) => x.id === cat)!;
  if (c.sub.includes(n)) return "Cette sous-catégorie existe déjà.";
  demo.update((s) => {
    const cc = editCats(s).find((x) => x.id === cat)!;
    cc.sub.push(n);
    audit(s, me, "Sous-catégorie ajoutée", `${cc.n} › ${n}`);
  });
  return null;
}
export function subDelete(me: Me, cat: string, i: number) {
  demo.update((s) => {
    const cc = editCats(s).find((x) => x.id === cat)!;
    const [n] = cc.sub.splice(i, 1);
    audit(s, me, "Sous-catégorie supprimée", `${cc.n} › ${n}`);
  });
}
export function attrAdd(me: Me, cat: string, a: string) {
  demo.update((s) => {
    (s.admin.attrs[cat] ??= []).push(a);
    audit(s, me, "Attribut ajouté", `${catsOf(s).find((x) => x.id === cat)!.n} · ${a}`);
  });
}
export function attrDelete(cat: string, i: number) {
  demo.update((s) => {
    s.admin.attrs[cat]?.splice(i, 1);
  });
}

/* ---------- équipe, paramètres ---------- */

export function teamOf(s: DemoState): Admin[] {
  return s.admin.team ?? ADMINS;
}
export function teamInvite(me: Me, e: string, role: Role): string | null {
  const email = e.trim().toLowerCase();
  if (!/@prelakay\.ht$/.test(email)) return "Utilisez une adresse @prelakay.ht.";
  if (teamOf(demo.get()).some((x) => x.e === email)) return "Ce membre existe déjà.";
  demo.update((s) => {
    (s.admin.team ??= structuredClone(ADMINS)).push({ e: email, n: email.split("@")[0], role, last: "—", pending: true });
    audit(s, me, "Invitation envoyée", `${email} · ${ROLES[role]}`);
  });
  return null;
}
export function teamRole(me: Me, e: string, role: Role) {
  demo.update((s) => {
    const m = (s.admin.team ??= structuredClone(ADMINS)).find((x) => x.e === e)!;
    m.role = role;
    audit(s, me, "Rôle modifié", `${e} → ${ROLES[role]}`);
  });
}
export function teamRemove(me: Me, e: string) {
  demo.update((s) => {
    s.admin.team = (s.admin.team ?? structuredClone(ADMINS)).filter((x) => x.e !== e);
    audit(s, me, "Membre retiré", e);
  });
}
export function settingsSave(me: Me, v: DemoState["admin"]["settings"]) {
  demo.update((s) => {
    s.admin.settings = v;
    audit(s, me, "Paramètres modifiés", "Plateforme");
  });
}

/** Suspension appliquée côté acheteur : produits du store masqués. */
export { isSuspended } from "@/lib/data/mock/seed";
