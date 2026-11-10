"use client";

// État de démonstration de l'acheteur — même forme que l'objet S du prototype
// (prototype/prelakay-prototype.html, « ÉTAT », ligne ~1559). Vit dans le navigateur
// (localStorage), derrière les mêmes actions que l'adaptateur Supabase implémentera.
// Jamais utilisé en production (lib/config/env.ts).

import { useSyncExternalStore } from "react";
import { prodBy, setCatalogOverlay, setOptsOverlay, setStockOverlay, type Choice, type OptAxis, type Product } from "@/lib/data/mock/seed";

export type CartLine = { p: string; v: string; q: number; on: boolean };
export type OrderStatus = "received" | "prep" | "ready" | "done" | "expired" | "cancelled";
export type OrderItem = { p: string; v: string; q: number };
export type Order = {
  id: string; store: string; items: OrderItem[]; status: OrderStatus; date: string; total: number;
  code?: string; due?: string; reviewed?: boolean; time?: string;
};
export type Notif = { i: string; t: string; p: string; to: string; un: boolean };
export type Selection = { o: Choice; q: number };
export type KycStatus = null | "recu" | "verif" | "ok" | "rej";

/** Produit créé ou modifié dans l'espace vendeur (démo). */
export type SellerProduct = Product & { status: string; why?: string | null; opts: OptAxis[]; desc?: string };
export type Conv = { id: string; who: string; order: string; un: boolean; msgs: { me: boolean; t: string; at: string }[] };
export type SDispute = { id: string; order: string; buyer: string; why: string; txt: string; photo: boolean; st: "open" | "escalated" | "done"; due: string };
export type ProductForm = {
  id: string | null; n: string; cat: string; sub: string; price: string; was: string; desc: string; photos: number;
  weight: string; dims: string; axes: { k: string; v: string }[]; stock: Record<string, string>;
};
/** État de l'espace vendeur (objet SL du prototype). */
export type SellerState = {
  store: string;
  policy: null | { days: number; other: boolean; txt: string };
  payMethod: null | { t: string; n: string };
  payouts: { store: string; amt: number; to: string; date: string; st: string }[];
  stockO: Record<string, number>;
  replies: Record<string, string>;
  answers: Record<string, string>;
  convs: Record<string, Conv[]>;
  sorders: Record<string, (Order & { buyer: string; time?: string; rel?: boolean; picked?: string })[]>;
  dsp: Record<string, SDispute[]>;
  products: SellerProduct[];
  pstatus: Record<string, string>;
  extra: Record<string, boolean>;
  notif: (Notif & { store: string })[];
  seq: number;
  form: ProductForm | null;
};

export type DemoState = {
  logged: boolean; user: string; name: string; city: string;
  wallet: number; coins: number;
  cart: CartLine[]; wish: Record<string, boolean>; sel: Record<string, Selection>;
  orders: Order[]; introDone: boolean; introStep: number; kyc: KycStatus; kycWhy: string | null;
  kycData: null | { fn: string; ln: string; dob: string; age: number; nif: string; ninu: string; date: string };
  picked: Record<string, boolean>; hist: string[]; viewed: string[];
  disputes: { id: string; why: string; txt: string }[];
  reports: { id: string; type: string; target: string; reason: string; by: string; date: string; st: string }[];
  notif: Notif[];
  myRevs: { k: string; p: string; st: number; t: string }[];
  questions: { k: string; p: string; q: string }[];
  txs: [string, string, string, number, string][];
  /** Paiements déjà traités, par clé d'idempotence (Review Focus n° 5). */
  paid: Record<string, string[]>;
  seller: SellerState;
};

const DEMO_ORDERS: Omit<Order, "total">[] = [
  { id: "PK-1042", store: "bel-soley", items: [{ p: "beaute-0", v: "Format standard", q: 1 }], status: "ready", date: "5 nov. 2026", code: "482913", due: "8 nov. 2026" },
  { id: "PK-1038", store: "tech-sud", items: [{ p: "tech-1", v: "Blanc", q: 1 }], status: "prep", date: "5 nov. 2026" },
  { id: "PK-1021", store: "boutik-lakay", items: [{ p: "mode-5", v: "Lagon · M", q: 2 }], status: "done", date: "28 oct. 2026", reviewed: false },
  { id: "PK-0997", store: "mache-bon-pri", items: [{ p: "alim-0", v: "500 g", q: 1 }], status: "done", date: "15 oct. 2026", reviewed: true },
];

export function initialState(): DemoState {
  return {
    logged: true, user: "marckarlin", name: "Marc-Karlin", city: "Les Cayes", wallet: 450000, coins: 120,
    cart: [], wish: {}, sel: {},
    orders: DEMO_ORDERS.map((o) => ({ ...o, total: o.items.reduce((a, it) => a + (prodBy(it.p)?.price ?? 0) * it.q, 0) })),
    introDone: false, introStep: 0, kyc: null, kycWhy: null, kycData: null, picked: {}, hist: [], viewed: [], disputes: [], reports: [],
    notif: [
      { i: "fa-solid fa-box", t: "Commande PK-1042 prête pour retrait", p: "Bel Soley Beauté vous attend. Code : 482 913.", to: "/orders/PK-1042", un: true },
      { i: "fa-solid fa-coins", t: "+25 Coins", p: "Merci pour votre avis sur Huile de ricin noire.", to: "/coins", un: true },
      { i: "fa-solid fa-store", t: "Nouveau store près de vous", p: "Atelier Lagon vient d'ouvrir.", to: "/store/atelier-lagon", un: false },
    ],
    myRevs: [], questions: [],
    // TXS du prototype (ligne ~2047)
    txs: [
      ["fa-solid fa-cart-shopping", "Paiement PK-1042 · Bel Soley Beauté", "5 nov.", -90000, ""],
      ["fa-solid fa-circle-plus", "Recharge MonCash", "3 nov.", 250000, ""],
      ["fa-solid fa-gift", "Panier payé pour @lili_cayes", "1 nov.", -120000, ""],
      ["fa-solid fa-rotate-left", "Remboursement PK-0981", "28 oct.", 35000, ""],
    ],
    paid: {},
    seller: {
      store: "boutik-lakay", policy: null, payMethod: null, payouts: [], stockO: {}, replies: {}, answers: {}, convs: {},
      sorders: {}, dsp: {}, products: [], pstatus: {}, extra: {}, notif: [], seq: 1, form: null,
    },
  };
}

/** Répercute l'état vendeur sur le catalogue (stock, caractéristiques, produits créés, statuts). */
function syncCatalog(s: DemoState) {
  const sl = s.seller;
  setStockOverlay(sl.stockO);
  setOptsOverlay(Object.fromEntries(sl.products.map((p) => [p.id, p.opts])));
  const statuses: Record<string, string> = { ...sl.pstatus };
  for (const p of sl.products) statuses[p.id] = p.status;
  setCatalogOverlay(sl.products, statuses);
}

const KEY = "pk-demo-v1";
const SERVER = initialState();
let state: DemoState = SERVER;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

let hydrated = false;

/** Relit l'état sauvegardé une seule fois, avant toute écriture : sans cela, une écriture
 *  faite avant hydrateDemo() (ex. « vus récemment » d'une fiche ouverte directement)
 *  écraserait le panier et la wishlist enregistrés. */
function ensureHydrated(): boolean {
  if (hydrated || typeof window === "undefined") return false;
  hydrated = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      state = { ...initialState(), ...saved, seller: { ...initialState().seller, ...(saved.seller ?? {}) } };
      syncCatalog(state);
      return true;
    }
  } catch {
    /* état corrompu ou inaccessible : on garde l'état initial */
  }
  return false;
}

export const demo = {
  get: () => state,
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  /** Applique une modification sur une copie, puis publie le nouvel état. */
  update(fn: (draft: DemoState) => void) {
    ensureHydrated();
    const draft = structuredClone(state);
    fn(draft);
    state = draft;
    syncCatalog(state);
    try {
      if (typeof localStorage !== "undefined") localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* stockage indisponible (navigation privée) : l'état reste en mémoire */
    }
    emit();
  },
};

/** Recharge l'état sauvegardé (appelé une fois, après l'hydratation de la page). */
export function hydrateDemo() {
  if (ensureHydrated()) emit();
}

/** Tests : revient à l'état initial sans effacer le stockage (simule un nouveau chargement de page). */
export function __resetForTest() {
  state = SERVER;
  hydrated = false;
}

export function resetDemo() {
  state = initialState();
  syncCatalog(state);
  hydrated = true;
  try {
    if (typeof localStorage !== "undefined") localStorage.removeItem(KEY);
  } catch {
    /* rien */
  }
  emit();
}

export function useDemo(): DemoState {
  return useSyncExternalStore(demo.subscribe, demo.get, () => SERVER);
}
