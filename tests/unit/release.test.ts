import { describe, it, expect } from "vitest";
import { isAvailable, notReleased, FEATURES, FUTURE_ROUTES, futureFeatureFor, releaseFor, HELD_IN_PROTOTYPE } from "@/lib/config/release";
import { BUSINESS } from "@/lib/config/business";

// CHANGELOG.md : « tout construire, n'activer que la version en cours ».
describe("release", () => {
  it("en production, la version reste 1", () => {
    expect(releaseFor("production")).toBe("1");
    expect(isAvailable("coupons", releaseFor("production"))).toBe(false);
    expect(futureFeatureFor("/admin/finance", releaseFor("production"))).toBe("platform_finance");
  });

  it("démo et développement → all", () => {
    expect(releaseFor("demo")).toBe("all");
    expect(releaseFor(undefined)).toBe("all");
  });

  it("en démo, tout est actif sauf natif, sourcing et créole", () => {
    expect(isAvailable("coupons", "all")).toBe(true);
    expect(isAvailable("platform_finance", "all")).toBe(true);
    expect([...HELD_IN_PROTOTYPE].sort()).toEqual(["creole", "native_app", "sourcing"]);
    for (const k of HELD_IN_PROTOTYPE) expect(isAvailable(k, "all")).toBe(false);
  });

  it("V1 : le cœur du pilote est actif", () => {
    for (const k of ["auth", "cart", "click_collect", "wallet_topup", "wallet_pay", "pay_for_relative", "escrow", "pickup_code", "coins", "kyc_seller", "share_links", "dispute_open"] as const)
      expect(isAvailable(k, "1"), k).toBe(true);
  });

  it("V1 : les versions suivantes sont « À venir »", () => {
    for (const k of ["coupons", "flash_offers", "events", "badges", "referral", "ambassadors", "dispute_center", "sourcing", "dark_mode", "delivery", "prelakay_plus", "creole", "phone_otp", "staff_accounts", "voice_search", "photo_search", "barcode", "boost", "platform_finance", "native_app"] as const)
      expect(isAvailable(k, "1"), k).toBe(false);
  });

  it("l'ordre est 1 < 1.x < 1.1 < 2 < 3 (pas un ordre numérique)", () => {
    expect(isAvailable("coupons", "1.x")).toBe(true);
    expect(isAvailable("sourcing", "1.x")).toBe(false);
    expect(isAvailable("sourcing", "1.1")).toBe(true);
    expect(isAvailable("delivery", "1.1")).toBe(false);
    expect(isAvailable("native_app", "3")).toBe(true);
  });

  it("couvre exactement les clés du CHANGELOG", () => {
    expect(Object.keys(FEATURES)).toHaveLength(47);
  });

  it("répond 403 feature_not_released", async () => {
    const r = notReleased();
    expect(r.status).toBe(403);
    expect(await r.json()).toEqual({ error: "feature_not_released" });
  });

  it("repère les routes d'une version future", () => {
    expect(FUTURE_ROUTES.map((r) => r.prefix)).toEqual(["/admin/finance", "/admin/events"]);
    expect(futureFeatureFor("/admin/events/12", "1")).toBe("events");
    expect(futureFeatureFor("/admin/finance", "1")).toBe("platform_finance");
    expect(futureFeatureFor("/admin/financement", "1")).toBeNull();
    expect(futureFeatureFor("/admin/kyc", "1")).toBeNull();
    expect(futureFeatureFor("/admin/finance", "all")).toBeNull();
  });
});

describe("règles chiffrées", () => {
  it("reprend les valeurs décidées", () => {
    expect(BUSINESS.escrowDays).toBe(3);
    expect(BUSINESS.escrowTrustedHours).toBe(24);
    expect(BUSINESS.pickupHoldDays).toBe(3);
    expect(BUSINESS.reminderDays).toEqual([1, 2]);
    expect(BUSINESS.coinsPerOrder).toBe(50);
    expect(BUSINESS.coinsPerReview).toBe(25);
    expect(BUSINESS.pickupCodeLength).toBe(6);
    expect(BUSINESS.minSellerAge).toBe(18);
    expect(BUSINESS.adminMaxFailures).toBe(5);
  });

  it("ne chiffre jamais un point ouvert", () => {
    expect(BUSINESS.commissionRate).toBeNull();
    expect(BUSINESS.restockFee).toBeNull();
    expect(BUSINESS.coinsWelcome).toBeNull();
    expect(BUSINESS.adminLockMinutes).toBeNull();
    expect(BUSINESS.trustedStoreCriteria).toBeNull();
  });
});
