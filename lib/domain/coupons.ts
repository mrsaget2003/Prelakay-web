// Coupons (CHANGELOG V1.x, activés dans le prototype — CLAUDE.md 10 nov. 2026) : créés par un
// vendeur pour son store (ou par Prélakay, store = null), pourcentage, seuil, dates, stock.

import { formatHTG } from "@/lib/format";

export type Coupon = {
  code: string;
  /** null = coupon Prélakay, valable dans tous les stores. */
  store: string | null;
  pct: number;
  min: number;
  /** Dates AAAA-MM-JJ incluses. */
  from: string;
  to: string;
  stock: number;
  on: boolean;
  welcome?: boolean;
};
export type CouponCtx = { store: string; subtotal: number; today: string; used: number };
export type CouponResult = { ok: true; off: number } | { ok: false; error: string };

/** Vérifie un coupon pour le sous-total d'un store ; renvoie la remise en HTG entières. */
export function couponCheck(c: Coupon | undefined, x: CouponCtx): CouponResult {
  if (!c || !c.on) return { ok: false, error: "Code inconnu." };
  if (x.today > c.to) return { ok: false, error: "Ce coupon a expiré." };
  if (x.today < c.from) return { ok: false, error: "Ce coupon n'est pas encore valable." };
  if (c.store && c.store !== x.store) return { ok: false, error: "Ce coupon ne s'applique pas à ce store." };
  if (x.used >= c.stock) return { ok: false, error: "Ce coupon est épuisé." };
  if (x.subtotal < c.min) return { ok: false, error: `Montant minimum : ${formatHTG(c.min)}.` };
  return { ok: true, off: Math.round((x.subtotal * c.pct) / 100) };
}

export type CouponInput = { code: string; pct: string; min: string; from: string; to: string; stock: string };

/** Erreurs par champ du formulaire vendeur (code vide = généré). */
export function validateCoupon(f: CouponInput): Record<string, string> {
  const e: Record<string, string> = {};
  const code = f.code.trim().toUpperCase();
  if (code && !/^[A-Z0-9]{6}$/.test(code)) e.code = "6 lettres ou chiffres (ou laissez vide).";
  const pct = Number(f.pct);
  if (!Number.isInteger(pct) || pct < 1 || pct > 90) e.pct = "Entre 1 et 90 %.";
  const min = Number(f.min || "0");
  if (!Number.isFinite(min) || min < 0) e.min = "Montant positif ou 0.";
  if (!f.from) e.from = "Date de début.";
  if (!f.to || (f.from && f.to < f.from)) e.to = "La fin doit suivre le début.";
  const st = Number(f.stock);
  if (!Number.isInteger(st) || st < 1) e.stock = "Au moins 1 utilisation.";
  return e;
}
