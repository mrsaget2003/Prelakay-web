import { describe, it, expect } from "vitest";
import golden from "../fixtures/proto-seller.json";
import { STORES, prodBy, optsOf } from "@/lib/data/mock/seed";
import { combos, finOf, generateStoreOrders, kpis, stockTotal, nextCode, canTransition } from "@/lib/demo/seller";

// Espace vendeur : mêmes commandes de démo, finances et indicateurs que le prototype
// (référence générée en exécutant son code : tests/fixtures/proto-seller.json).
type G = Record<string, { orders: unknown[]; fin: unknown; k7: unknown; k30: unknown; stock: [string, number, number][] }>;
const g = golden as unknown as G;

describe("données vendeur (identiques au prototype)", () => {
  it("commandes de démonstration de chaque store", () => {
    for (const s of STORES) {
      // la référence n'exporte pas le champ store (toujours égal au store courant)
      const got = generateStoreOrders(s.id).map(({ store, ...o }) => (expect(store).toBe(s.id), o));
      expect(got, s.id).toEqual(g[s.id].orders);
    }
  });
  it("finances : disponible, en escrow, retiré, mois", () => {
    for (const s of STORES) expect(finOf(s.id, generateStoreOrders(s.id), []), s.id).toEqual(g[s.id].fin);
  });
  it("indicateurs 7 et 30 jours", () => {
    for (const s of STORES) {
      expect(kpis(s.id, 7)).toEqual(g[s.id].k7);
      expect(kpis(s.id, 30)).toEqual(g[s.id].k30);
    }
  });
  it("stock total et nombre de variantes par produit", () => {
    for (const s of STORES)
      for (const [id, total, n] of g[s.id].stock) {
        const p = prodBy(id)!;
        expect(stockTotal(p), id).toBe(total);
        expect(combos(optsOf(p)).length, id).toBe(n);
      }
  });
});

describe("règles du fulfillment", () => {
  it("transitions autorisées seulement", () => {
    expect(canTransition("received", "prep")).toBe(true);
    expect(canTransition("prep", "ready")).toBe(true);
    expect(canTransition("ready", "done")).toBe(true);
    expect(canTransition("ready", "expired")).toBe(true);
    expect(canTransition("received", "cancelled")).toBe(true);
    expect(canTransition("prep", "cancelled")).toBe(true);
    expect(canTransition("done", "cancelled")).toBe(false);
    expect(canTransition("received", "done")).toBe(false);
    expect(canTransition("ready", "cancelled")).toBe(false);
  });
  it("code de retrait à 6 chiffres", () => {
    for (let i = 0; i < 20; i++) expect(nextCode()).toMatch(/^\d{6}$/);
  });
  it("les retraits déjà payés réduisent le disponible", () => {
    const O = generateStoreOrders("boutik-lakay");
    const f = finOf("boutik-lakay", O, [{ store: "boutik-lakay", amt: 10000, to: "MonCash •••• 3456", date: "6 nov. 2026", st: "Payé" }]);
    expect(f.paid).toBe(10000);
    expect(f.avail).toBe((g["boutik-lakay"].fin as { avail: number }).avail - 10000);
  });
});
