// Coupons de la démo : coupons de démonstration + coupons créés dans l'espace vendeur.

import { validateCoupon, type Coupon, type CouponInput } from "@/lib/domain/coupons";
import { demo, type DemoState } from "./store";

/** Date du jour de la démo (le prototype est figé au 6 nov. 2026). */
export const DEMO_TODAY = "2026-11-06";

export const DEMO_COUPONS: Coupon[] = [
  { code: "BYENVI", store: null, pct: 10, min: 1000, from: "2026-11-01", to: "2026-12-31", stock: 500, on: true, welcome: true },
  { code: "LAKAY5", store: "boutik-lakay", pct: 5, min: 2000, from: "2026-11-01", to: "2026-11-30", stock: 50, on: true },
  { code: "SOLEY8", store: "bel-soley", pct: 8, min: 3000, from: "2026-11-01", to: "2026-11-20", stock: 30, on: true },
  { code: "TECH12", store: "tech-sud", pct: 12, min: 5000, from: "2026-10-01", to: "2026-10-31", stock: 20, on: true },
];

export function allCoupons(s: DemoState): Coupon[] {
  return [...s.coupons.list, ...DEMO_COUPONS].map((c) => (c.code in s.coupons.off ? { ...c, on: !s.coupons.off[c.code] } : c));
}
export function couponByCode(s: DemoState, code: string): Coupon | undefined {
  const k = code.trim().toUpperCase();
  return allCoupons(s).find((c) => c.code === k);
}
export function couponsOfStore(s: DemoState, store: string): Coupon[] {
  return allCoupons(s).filter((c) => c.store === store);
}
export function usedOf(s: DemoState, code: string): number {
  return s.coupons.used[code] ?? 0;
}

function genCode(s: DemoState): string {
  const A = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let x = 7 + s.coupons.list.length * 131;
  let out = "";
  for (let i = 0; i < 6; i++) {
    x = (x * 1103515245 + 12345) >>> 0;
    out += A[x % A.length];
  }
  return out;
}

export function createCoupon(store: string, f: CouponInput): { ok: true; code: string } | { ok: false; errors: Record<string, string> } {
  const errors = validateCoupon(f);
  const s0 = demo.get();
  const code = f.code.trim().toUpperCase() || genCode(s0);
  if (!errors.code && couponByCode(s0, code)) errors.code = "Ce code existe déjà.";
  if (Object.keys(errors).length) return { ok: false, errors };
  demo.update((s) => {
    s.coupons.list.unshift({ code, store, pct: Number(f.pct), min: Number(f.min || "0"), from: f.from, to: f.to, stock: Number(f.stock), on: true });
  });
  return { ok: true, code };
}

/** Suspendre / réactiver (vendeur pour ses coupons, admin pour tous). */
export function setCouponOn(code: string, on: boolean) {
  demo.update((s) => {
    s.coupons.off[code] = !on;
  });
}

/** « Mes coupons » : l'acheteur garde un coupon pour plus tard. */
export function claimCoupon(code: string) {
  demo.update((s) => {
    if (!s.coupons.mine.includes(code)) s.coupons.mine.push(code);
  });
}
