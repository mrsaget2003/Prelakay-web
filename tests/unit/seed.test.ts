import { describe, it, expect } from "vitest";
import golden from "../fixtures/proto-catalog.json";
import { CATS, STORES, P, optsOf, stockFor, prodBy, storeBy, catBy, selLabel } from "@/lib/data/mock/seed";

// Le seed TypeScript doit produire exactement les données du prototype
// (référence générée en exécutant le code du prototype : tests/fixtures/proto-catalog.json).
describe("seed (données du prototype)", () => {
  it("catégories et stores identiques", () => {
    expect(CATS).toEqual(golden.CATS);
    expect(STORES).toEqual(golden.STORES);
  });

  it("60 produits identiques (prix, ventes, notes, nouveautés, stock bas, prêt à retirer)", () => {
    expect(P).toHaveLength(60);
    expect(P).toEqual(golden.P);
  });

  it("mêmes caractéristiques (SKU) par produit", () => {
    expect(P.map((p) => [p.id, optsOf(p)])).toEqual(golden.opts);
  });

  it("même stock par combinaison", () => {
    const got = P.map((p) => {
      const o: Record<string, string> = {};
      for (const a of optsOf(p)) o[a.k] = a.v[0];
      return [p.id, stockFor(p, o)];
    });
    expect(got).toEqual(golden.stock);
  });

  it("accesseurs", () => {
    expect(prodBy("mode-0")?.n).toBe("Robe en lin brodée");
    expect(storeBy("bel-soley")?.n).toBe("Bel Soley Beauté");
    expect(catBy("alim")?.n).toBe("Épicerie");
    expect(prodBy("nope")).toBeNull();
  });

  it("libellé du choix : « Écru · 160 cm · 140 cm », « Standard » sans axe", () => {
    const rideau = P.find((p) => p.n === "Rideau occultant")!;
    expect(selLabel(rideau, { "Couleur": "Écru", "Longueur": "160 cm", "Largeur": "140 cm" })).toBe("Écru · 160 cm · 140 cm");
    const sansAxe = P.find((p) => optsOf(p).length === 0)!;
    expect(selLabel(sansAxe, {})).toBe("Standard");
  });
});
