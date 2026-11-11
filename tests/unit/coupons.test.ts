import { describe, it, expect, beforeEach } from "vitest";
import { demo, resetDemo } from "@/lib/demo/store";
import { addToCart, payCart } from "@/lib/demo/actions";
import { couponCheck, validateCoupon, type Coupon } from "@/lib/domain/coupons";
import { allCoupons, createCoupon, couponByCode, setCouponOn } from "@/lib/demo/coupons";
import { prodBy } from "@/lib/data/mock/seed";

// Coupons (spec §5, ex-V1.x activé dans le prototype) : créés par les vendeurs (%, seuil,
// code à 6 caractères, dates, stock), appliqués au paiement.
beforeEach(() => resetDemo());

const C: Coupon = { code: "LAKAY10", store: "boutik-lakay", pct: 10, min: 2000, from: "2026-11-01", to: "2026-11-30", stock: 5, on: true };
const ctx = { store: "boutik-lakay", subtotal: 3250, today: "2026-11-06", used: 0 };

describe("règles d'un coupon", () => {
  it("remise = pct du sous-total du store, arrondie à l'HTG", () => {
    expect(couponCheck(C, ctx)).toEqual({ ok: true, off: 325 });
    expect(couponCheck({ ...C, pct: 15 }, { ...ctx, subtotal: 3333 })).toEqual({ ok: true, off: 500 });
  });
  it("un message clair pour chaque refus", () => {
    expect(couponCheck(undefined, ctx)).toEqual({ ok: false, error: "Code inconnu." });
    expect(couponCheck({ ...C, on: false }, ctx)).toEqual({ ok: false, error: "Code inconnu." });
    expect(couponCheck(C, { ...ctx, today: "2026-12-01" })).toEqual({ ok: false, error: "Ce coupon a expiré." });
    expect(couponCheck(C, { ...ctx, today: "2026-10-31" })).toEqual({ ok: false, error: "Ce coupon n'est pas encore valable." });
    expect(couponCheck(C, { ...ctx, subtotal: 1500 }).ok).toBe(false);
    expect(couponCheck(C, { ...ctx, subtotal: 1500 })).toMatchObject({ error: expect.stringMatching(/^Montant minimum : 2.000 HTG\.$/) });
    expect(couponCheck(C, { ...ctx, used: 5 })).toEqual({ ok: false, error: "Ce coupon est épuisé." });
    expect(couponCheck(C, { ...ctx, store: "tech-sud" })).toEqual({ ok: false, error: "Ce coupon ne s'applique pas à ce store." });
  });
  it("un coupon Prélakay (sans store) s'applique à tout store", () => {
    expect(couponCheck({ ...C, store: null }, { ...ctx, store: "tech-sud" }).ok).toBe(true);
  });
  it("création : pourcentage 1-90, seuil ≥ 0, dates dans l'ordre, stock ≥ 1, code à 6 caractères", () => {
    expect(validateCoupon({ code: "", pct: "10", min: "0", from: "2026-11-01", to: "2026-11-30", stock: "10" })).toEqual({});
    const e = validateCoupon({ code: "AB", pct: "95", min: "-1", from: "2026-11-30", to: "2026-11-01", stock: "0" });
    expect(Object.keys(e).sort()).toEqual(["code", "min", "pct", "stock", "to"]);
  });
});

describe("coupons dans la démo", () => {
  it("le vendeur crée un coupon (code généré si vide) ; il apparaît pour les acheteurs", () => {
    const r = createCoupon("boutik-lakay", { code: "", pct: "10", min: "1000", from: "2026-11-01", to: "2026-11-30", stock: "3" });
    if (!r.ok) throw new Error("refus");
    expect(r.code).toMatch(/^[A-Z0-9]{6}$/);
    expect(couponByCode(demo.get(), r.code)?.store).toBe("boutik-lakay");
    expect(allCoupons(demo.get()).some((c) => c.code === r.code)).toBe(true);
  });
  it("double paiement avec coupon : un seul débit, une seule utilisation", () => {
    const r0 = createCoupon("boutik-lakay", { code: "ROBE10", pct: "10", min: "0", from: "2026-11-01", to: "2026-11-30", stock: "3" });
    if (!r0.ok) throw new Error("refus");
    addToCart("mode-0", 1);
    const w0 = demo.get().wallet;
    const price = prodBy("mode-0")!.price;
    const r = payCart("k-cp", { coupon: "ROBE10" });
    if (!r.ok) throw new Error(r.error);
    const again = payCart("k-cp", { coupon: "ROBE10" });
    expect(again).toEqual(r);
    expect(demo.get().wallet).toBe(w0 - (price - Math.round(price * 0.1)));
    expect(demo.get().coupons.used.ROBE10).toBe(1);
    expect(demo.get().orders.find((o) => o.id === r.ids[0])).toMatchObject({ coupon: "ROBE10", off: Math.round(price * 0.1) });
  });
  it("coupon appliqué au panier puis épuisé avant paiement → paiement refusé", () => {
    const r0 = createCoupon("boutik-lakay", { code: "UNIQ01", pct: "10", min: "0", from: "2026-11-01", to: "2026-11-30", stock: "1" });
    if (!r0.ok) throw new Error("refus");
    demo.update((s) => { s.coupons.used.UNIQ01 = 1; });
    addToCart("mode-0", 1);
    expect(payCart("k-ep", { coupon: "UNIQ01" })).toEqual({ ok: false, error: "Ce coupon est épuisé." });
  });
  it("un coupon désactivé par l'admin n'est plus accepté", () => {
    const r0 = createCoupon("boutik-lakay", { code: "OFF001", pct: "10", min: "0", from: "2026-11-01", to: "2026-11-30", stock: "5" });
    if (!r0.ok) throw new Error("refus");
    setCouponOn("OFF001", false);
    addToCart("mode-0", 1);
    expect(payCart("k-off", { coupon: "OFF001" })).toEqual({ ok: false, error: "Code inconnu." });
  });
});
