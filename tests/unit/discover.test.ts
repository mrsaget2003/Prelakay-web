import { describe, it, expect } from "vitest";
import { P, storeBy } from "@/lib/data/mock/seed";
import { filterProducts, EMPTY_FILTERS } from "@/lib/proto/sort";

// filtered() du prototype : filtres (prix, distance, note, disponibilité, store…), tris,
// et quota « Nouveaux sur Prélakay » en pertinence : 1 nouveau toutes les 4 positions.
describe("filterProducts", () => {
  it("pertinence : 3 produits établis puis 1 « Nouveau », tant que les deux listes durent", () => {
    const L = filterProducts(P, "", EMPTY_FILTERS);
    expect(L).toHaveLength(60);
    const nNew = P.filter((p) => p.isNew).length; // 24
    const nOld = P.length - nNew; // 36
    const blocks = Math.min(nNew, Math.floor(nOld / 3)); // 12 blocs de 4
    for (let b = 0; b < blocks; b++) {
      expect(L.slice(b * 4, b * 4 + 3).every((p) => !p.isNew), `bloc ${b + 1}`).toBe(true);
      expect(L[b * 4 + 3].isNew, `position ${b * 4 + 4}`).toBe(true);
    }
    expect(L.slice(blocks * 4).every((p) => p.isNew)).toBe(true); // nouveaux restants à la suite
  });

  it("recherche dans le nom, le store et la catégorie", () => {
    expect(filterProducts(P, "café", EMPTY_FILTERS).map((p) => p.id)).toEqual(["alim-0"]);
    expect(filterProducts(P, "tech sud", EMPTY_FILTERS).every((p) => p.store === "tech-sud")).toBe(true);
  });

  it("prix min / max", () => {
    const L = filterProducts(P, "", { ...EMPTY_FILTERS, min: "1000", max: "3000" });
    expect(L.length).toBeGreaterThan(0);
    expect(L.every((p) => p.price >= 1000 && p.price <= 3000)).toBe(true);
  });

  it("distance, note, prêt à retirer, store de confiance", () => {
    const L = filterProducts(P, "", { ...EMPTY_FILTERS, dist: 1, rate: 4.5, ready: true, trust: true });
    expect(L.every((p) => storeBy(p.store)!.km <= 1 && p.rating >= 4.5 && p.ready && storeBy(p.store)!.trust)).toBe(true);
  });

  it("tris prix croissant / décroissant, commandes", () => {
    const up = filterProducts(P, "", { ...EMPTY_FILTERS, sort: "price" }).map((p) => p.price);
    expect(up).toEqual([...up].sort((a, b) => a - b));
    const down = filterProducts(P, "", { ...EMPTY_FILTERS, sort: "price-d" }).map((p) => p.price);
    expect(down).toEqual([...down].sort((a, b) => b - a));
    const sold = filterProducts(P, "", { ...EMPTY_FILTERS, sort: "orders" }).map((p) => p.sold);
    expect(sold).toEqual([...sold].sort((a, b) => b - a));
  });
});
