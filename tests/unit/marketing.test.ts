import { describe, it, expect, beforeEach } from "vitest";
import { demo, resetDemo } from "@/lib/demo/store";
import { flashOverlay, withSponsored, type Flash } from "@/lib/domain/marketing";
import { badgesOf, boostProduct, createEvent, flashDecide, joinEvent, proposeFlash, eventsList } from "@/lib/demo/marketing";
import { sellerFin, setManagedStore } from "@/lib/demo/sellerActions";
import { allProducts, STORES, type Product } from "@/lib/data/mock/seed";
import type { Me } from "@/lib/demo/admin";

// Offres flash 24 h, events, produits boostés, badges (ex-V1.x / V2, actifs dans le prototype).
beforeEach(() => resetDemo());
const ME: Me = { e: "marketing@prelakay.ht", n: "Ketia Baptiste", role: "marketing" };
const H = 3_600_000;

describe("offres flash", () => {
  const F: Flash = { id: "f1", store: "boutik-lakay", product: "mode-0", price: 2500, ends: 10 * H, st: "live" };
  it("une offre en cours remplace le prix ; l'ancien prix devient le prix barré", () => {
    expect(flashOverlay([F], 5 * H, () => 3250)).toEqual({ "mode-0": { price: 2500, was: 3250 } });
  });
  it("une offre terminée ou en attente ne change rien", () => {
    expect(flashOverlay([F], 10 * H, () => 3250)).toEqual({});
    expect(flashOverlay([{ ...F, st: "pending" }], 5 * H, () => 3250)).toEqual({});
  });
  const trusted = STORES.find((s) => s.trust)!;
  const other = STORES.find((s) => !s.trust)!;
  const p = () => allProducts().find((x) => x.store === trusted.id)!;
  it("proposition réservée aux stores de confiance, prix inférieur au prix normal", () => {
    expect(proposeFlash(other.id, allProducts().find((x) => x.store === other.id)!.id, 10)).toBe("Les offres flash sont réservées aux stores de confiance (seuil de points à confirmer).");
    expect(proposeFlash(trusted.id, p().id, p().price)).toBe("Le prix flash doit être inférieur au prix actuel.");
    expect(proposeFlash(trusted.id, p().id, Math.round(p().price * 0.8))).toBeNull();
    expect(demo.get().marketing.flash[0]).toMatchObject({ store: trusted.id, product: p().id, st: "pending" });
  });
  it("l'admin valide : l'offre dure 24 h ; journalisé", () => {
    proposeFlash(trusted.id, p().id, Math.round(p().price * 0.8));
    const id = demo.get().marketing.flash[0].id;
    expect(flashDecide(ME, id, true, 1000)).toBeNull();
    expect(demo.get().marketing.flash[0]).toMatchObject({ st: "live", ends: 1000 + 24 * H });
    expect(demo.get().admin.audit[0]).toMatchObject({ a: "Offre flash validée" });
  });
});

describe("produits boostés", () => {
  const L = Array.from({ length: 10 }, (_, i) => ({ id: `p${i}` }) as Product);
  it("au plus un sponsorisé toutes les 4 positions, en tête de chaque bloc", () => {
    const r = withSponsored(L, new Set(["p7", "p8", "p9"]));
    expect(r.list.map((p) => p.id).slice(0, 9)).toEqual(["p7", "p0", "p1", "p2", "p8", "p3", "p4", "p5", "p9"]);
    expect([...r.sponsored].sort()).toEqual(["p7", "p8", "p9"]);
    expect(r.list).toHaveLength(10);
  });
  it("sans boost : liste inchangée", () => {
    expect(withSponsored(L, new Set()).list).toEqual(L);
  });
  it("booster débite le solde du store ; solde insuffisant refusé", () => {
    setManagedStore("boutik-lakay");
    const before = sellerFin(demo.get()).avail;
    expect(boostProduct("mode-0", before + 1)).toBe("Solde insuffisant pour ce budget.");
    expect(boostProduct("mode-0", 500)).toBeNull();
    expect(sellerFin(demo.get()).avail).toBe(before - 500);
    expect(demo.get().marketing.boosts[0]).toMatchObject({ product: "mode-0", budget: 500, on: true });
  });
});

describe("events", () => {
  it("l'admin crée un event ; un store y participe ; journalisé", () => {
    const r = createEvent(ME, { n: "Fèt Manman", from: "2026-11-20", to: "2026-11-27", noCommission: true });
    if (!r.ok) throw new Error(r.error);
    expect(joinEvent(r.id, "boutik-lakay")).toBeNull();
    expect(eventsList(demo.get()).find((e) => e.id === r.id)!.stores).toContain("boutik-lakay");
    expect(demo.get().admin.audit[0]).toMatchObject({ a: "Event créé" });
  });
  it("dates dans l'ordre et nom obligatoires", () => {
    expect(createEvent(ME, { n: "", from: "2026-11-20", to: "2026-11-10", noCommission: false })).toEqual({ ok: false, error: "Indiquez un nom et des dates dans l'ordre." });
  });
});

describe("badges", () => {
  it("acheteur VIP dès 3 commandes retirées (valeur de démonstration)", () => {
    expect(badgesOf("buyer", "", demo.get())).not.toContain("VIP");
    demo.update((s) => s.orders.forEach((o) => (o.status = "done")));
    expect(badgesOf("buyer", "", demo.get())).toContain("VIP");
  });
  it("store de confiance et meilleures ventes", () => {
    const t = STORES.find((s) => s.trust)!;
    expect(badgesOf("store", t.id, demo.get())).toContain("Store de confiance");
  });
});
