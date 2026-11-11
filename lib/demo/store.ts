"use client";

// État de démonstration de l'acheteur — même forme que l'objet S du prototype
// (prototype/prelakay-prototype.html, « ÉTAT », ligne ~1559). Vit dans le navigateur
// (localStorage), derrière les mêmes actions que l'adaptateur Supabase implémentera.
// Jamais utilisé en production (lib/config/env.ts).

import { useSyncExternalStore } from "react";
import { basePrice, setPriceOverlay, prodBy, setCatalogOverlay, setOptsOverlay, setStockOverlay, setStoreOverlay, type Choice, type OptAxis, type Product } from "@/lib/data/mock/seed";
import type { Banner } from "@/lib/data/mock/content";
import type { PartnerApp, PartnerStatus } from "@/lib/domain/partners";
import type { Coupon } from "@/lib/domain/coupons";
import { flashOverlay, type Boost, type Flash, type PEvent } from "@/lib/domain/marketing";

export type CartLine = { p: string; v: string; q: number; on: boolean };
export type OrderStatus = "received" | "prep" | "ready" | "done" | "expired" | "cancelled" | "handed" | "enroute" | "delivered";
export type OrderItem = { p: string; v: string; q: number };
export type Order = {
  id: string; store: string; items: OrderItem[]; status: OrderStatus; date: string; total: number;
  code?: string; due?: string; reviewed?: boolean; time?: string;
  /** Livraison (10 nov. 2026) : mode, adresse, frais, livreur, progression simulée 0-100. */
  mode?: "pickup" | "delivery"; addr?: { zone: string; mark: string; phone: string }; fee?: number;
  driver?: { n: string; tel: string }; track?: number;
  /** Coupon appliqué à cette commande et remise en HTG. */
  coupon?: string; off?: number;
};
export type Notif = { i: string; t: string; p: string; to: string; un: boolean };
export type Selection = { o: Choice; q: number };
export type KycStatus = null | "recu" | "verif" | "ok" | "rej";

/** Produit créé ou modifié dans l'espace vendeur (démo). */
export type SellerProduct = Product & { status: string; why?: string | null; opts: OptAxis[]; desc?: string; deliverable?: boolean };
export type Conv = { id: string; who: string; order: string; un: boolean; msgs: { me: boolean; t: string; at: string }[] };
export type SDispute = { id: string; order: string; buyer: string; why: string; txt: string; photo: boolean; st: "open" | "escalated" | "done"; due: string };
export type ProductForm = {
  id: string | null; n: string; cat: string; sub: string; price: string; was: string; desc: string; photos: number;
  weight: string; dims: string; axes: { k: string; v: string }[]; stock: Record<string, string>;
  /** Livraison à domicile proposée pour ce produit (10 nov. 2026) ; absent = oui. */
  deliverable?: boolean;
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

/** Console admin (objet AD du prototype) : décisions qui se répercutent chez l'acheteur et le vendeur. */
export type AdminSettings = { escrow: string; escrowTrust: string; hold: string; commission: string; restock: string; coinsOrder: string; coinsReview: string; coinsWelcome: string; quota: string; disputeDays: string; storeReply: string };
export type AdminMember = { e: string; n: string; role: "super" | "support" | "finance" | "marketing"; last: string; pending?: boolean };
export type AdminState = {
  /** Dossiers KYC de démonstration : statut et motif modifiés par l'admin. */
  kyc: Record<string, { st: "recu" | "verif" | "ok" | "rej"; why?: string }>;
  users: Record<string, { st: "active" | "banned"; why: string }>;
  stores: Record<string, { trust?: boolean; suspended?: boolean; why?: string }>;
  /** Litiges : décision de l'admin (par identifiant). */
  dsp: Record<string, { st: "open" | "escalated" | "done"; decision?: string }>;
  /** Signalements : décision de l'admin (par identifiant). */
  reports: Record<string, { st: "open" | "done"; decision?: string }>;
  /** Produits de démonstration envoyés en modération par d'autres stores (déjà ajoutés au catalogue). */
  modSeeded: boolean;
  banners: Banner[] | null;
  sent: { t: string; to: string; ch: string; at: string }[];
  cats: { id: string; n: string; i: string; sub: string[] }[] | null;
  attrs: Record<string, string[]>;
  team: AdminMember[] | null;
  settings: AdminSettings;
  audit: { who: string; role: string; a: string; t: string; at: string }[];
  /** Livreur affecté par l'admin aux livraisons de démonstration (indice dans DEMO_DRIVERS). */
  drivers: Record<string, number>;
  /** Décisions sur les candidatures de partenaires (par identifiant). */
  partners: Record<string, { st: PartnerStatus; why?: string }>;
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
  admin: AdminState;
  /** Candidatures envoyées depuis les pages partenaires (10 nov. 2026). */
  partners: PartnerApp[];
  /** Coupons (10 nov. 2026) : créés par les vendeurs, gardés par l'acheteur, utilisations, suspensions. */
  coupons: { list: Coupon[]; mine: string[]; used: Record<string, number>; off: Record<string, boolean> };
  /** Offres flash, events (créés et participations), boosts. */
  marketing: { flash: Flash[]; events: PEvent[]; joined: Record<string, string[]>; boosts: Boost[] };
  /** Parrainage, ambassadeurs, Prelakay+ (lot 10). */
  growth: { referrals: { u: string; st: "pending" | "done"; date: string }[]; amb: null | { st: "recu" | "ok" | "rej"; school: string }; plus: null | { since: string; next: string } };
};

const DEMO_ORDERS: Omit<Order, "total">[] = [
  { id: "PK-1042", store: "bel-soley", items: [{ p: "beaute-0", v: "Format standard", q: 1 }], status: "ready", date: "5 nov. 2026", code: "482913", due: "8 nov. 2026" },
  { id: "PK-1038", store: "tech-sud", items: [{ p: "tech-1", v: "Blanc", q: 1 }], status: "prep", date: "5 nov. 2026" },
  { id: "PK-1021", store: "boutik-lakay", items: [{ p: "mode-5", v: "Lagon · M", q: 2 }], status: "done", date: "28 oct. 2026", reviewed: false },
  { id: "PK-0997", store: "mache-bon-pri", items: [{ p: "alim-0", v: "500 g", q: 1 }], status: "done", date: "15 oct. 2026", reviewed: true },
];

/** Fin de l'offre flash de démonstration : 18 h après le chargement de la page (fixée une fois). */
const DEMO_FLASH_ENDS = Date.now() + 18 * 3_600_000;

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
    partners: [],
    coupons: { list: [], mine: ["BYENVI"], used: {}, off: {} },
    // une offre flash de démonstration en cours (18 h restantes au chargement)
    marketing: { flash: [{ id: "FL-000", store: "tech-sud", product: "tech-3", price: Math.round((prodBy("tech-3")?.price ?? 2000) * 0.75), ends: DEMO_FLASH_ENDS, st: "live" }], events: [], joined: {}, boosts: [{ id: "BO-0", store: "bel-soley", product: "beaute-2", budget: 1500, on: true }] },
    growth: { referrals: [{ u: "@lili_cayes", st: "done", date: "2 nov. 2026" }, { u: "@ti_jan", st: "pending", date: "5 nov. 2026" }], amb: null, plus: null },
    seller: {
      store: "boutik-lakay", policy: null, payMethod: null, payouts: [], stockO: {}, replies: {}, answers: {}, convs: {},
      sorders: {}, dsp: {}, products: [], pstatus: {}, extra: {}, notif: [], seq: 1, form: null,
    },
    admin: {
      kyc: {}, users: {}, stores: {}, dsp: {}, reports: {}, modSeeded: false, banners: null, sent: [], cats: null,
      attrs: { mode: ["Couleur", "Taille"], tech: ["Couleur", "Stockage"], maison: ["Couleur", "Longueur", "Largeur"], beaute: ["Format"], alim: ["Poids"], enfants: ["Couleur"], sport: ["Couleur", "Taille"], auto: ["Couleur"] },
      team: null,
      // valeurs du prototype ; vides = [À CONFIRMER] (commission, restockage, Coins de bienvenue)
      settings: { escrow: "3", escrowTrust: "24", hold: "3", commission: "", restock: "", coinsOrder: "50", coinsReview: "25", coinsWelcome: "", quota: "4", disputeDays: "3", storeReply: "48" },
      audit: [],
      drivers: {},
      partners: {},
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
  setStoreOverlay(s.admin.stores);
  setPriceOverlay(flashOverlay(s.marketing.flash, Date.now(), basePrice));
}

const KEY = "pk-demo-v1";
const SERVER = initialState();
let state: DemoState = SERVER;
// overlays du catalogue (offre flash de démonstration…) appliqués dès le chargement, serveur et client
syncCatalog(SERVER);
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

let hydrated = false;

/** Ancien état sauvegardé : chaque tranche objet (seller, admin, et les suivantes) est complétée par ses valeurs par défaut. */
function mergeSaved(init: DemoState, saved: Partial<DemoState>): DemoState {
  const out = { ...init, ...saved } as Record<string, unknown>;
  for (const [k, v] of Object.entries(init)) {
    const sv = (saved as Record<string, unknown>)[k];
    if (v && typeof v === "object" && !Array.isArray(v) && sv && typeof sv === "object" && !Array.isArray(sv)) out[k] = { ...v, ...sv };
  }
  return out as DemoState;
}

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
      const init = initialState();
      state = mergeSaved(init, saved);
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
