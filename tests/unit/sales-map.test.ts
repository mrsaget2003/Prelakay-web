import { describe, it, expect } from "vitest";
import { communeSales, quarterSales, shares, shareLabel } from "@/lib/charts/salesMap";
import { pData } from "@/lib/charts/adminData";
import { sum } from "@/lib/charts/sellerData";
import { ZONES } from "@/lib/charts/adminData";
import sud from "@/lib/data/geo/sud-communes.json";
import { bboxOf, fitMercator } from "@/lib/charts/geoFit";

// Carte des ventes admin (spec §8, D3) : part des ventes et montant par commune du Sud
// et par quartier des Cayes (« 10 % · 48 200 HTG »).
describe("carte des ventes", () => {
  it("les parts font 100 % à l'arrondi près", () => {
    for (const d of [7, 30, 90] as const) {
      const r = shares(communeSales(d), "amount");
      expect(Math.abs(r.reduce((a, x) => a + x.pct, 0) - 100)).toBeLessThanOrEqual(1);
    }
  });
  it("une zone sans vente vaut 0 %, jamais NaN", () => {
    const r = shares([{ id: "a", name: "A", amount: 0, orders: 0 }, { id: "b", name: "B", amount: 500, orders: 2 }], "amount");
    expect(r[0].pct).toBe(0);
    expect(r[1].pct).toBe(100);
    expect(shares([{ id: "a", name: "A", amount: 0, orders: 0 }], "amount")[0].pct).toBe(0);
  });
  it("bascule ventes / commandes", () => {
    const r = shares([{ id: "a", name: "A", amount: 900, orders: 1 }, { id: "b", name: "B", amount: 100, orders: 3 }], "orders");
    expect(r.map((x) => x.pct)).toEqual([25, 75]);
  });
  it("chaque commune de démo existe dans les contours du Sud ; certaines n'ont pas encore de vente", () => {
    const ids = new Set(sud.features.map((f) => f.id));
    const rows = communeSales(30);
    for (const c of rows) expect(ids.has(c.id), c.id).toBe(true);
    expect(rows).toHaveLength(sud.features.length);
    expect(rows.some((c) => c.amount === 0)).toBe(true);
  });
  it("le total des communes = les ventes de la plateforme sur la période ; Les Cayes en tête", () => {
    const rows = communeSales(30);
    expect(rows.reduce((a, c) => a + c.amount, 0)).toBe(sum(pData(30, 1).gmv));
    expect(shares(rows, "amount").sort((a, b) => b.pct - a.pct)[0].id).toBe("les-cayes");
  });
  it("quartiers des Cayes : un par zone du plan de démo, total = la commune des Cayes", () => {
    const q = quarterSales(30);
    expect(q.map((x) => x.name)).toEqual(ZONES.map((z) => z[0]));
    expect(q.reduce((a, x) => a + x.amount, 0)).toBe(communeSales(30).find((c) => c.id === "les-cayes")!.amount);
  });
  it("libellé : « 10 % · 48 200 HTG »", () => {
    expect(shareLabel({ id: "x", name: "X", amount: 48200, orders: 3, pct: 10 }).replace(/\s/g, " ")).toBe("10 % · 48 200 HTG");
  });
});

describe("projection de la carte", () => {
  const merc = (lat: number) => Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));
  it("les contours du Sud tiennent dans le cadre, centrés, en occupant l'un des deux côtés à 92 %", () => {
    const W = 600, H = 360;
    const f = fitMercator(sud.features, W, H);
    const b = bboxOf(sud.features);
    const s = f.scale;
    const x = (lon: number) => W / 2 + s * ((lon - (b.w + b.e) / 2) * Math.PI) / 180;
    const y = (lat: number) => f.translation[1] * H - s * merc(lat);
    const [x0, x1, y0, y1] = [x(b.w), x(b.e), y(b.n), y(b.s)];
    expect(x0).toBeGreaterThanOrEqual(0);
    expect(x1).toBeLessThanOrEqual(W);
    expect(y0).toBeGreaterThanOrEqual(0);
    expect(y1).toBeLessThanOrEqual(H);
    expect(Math.abs((y0 + y1) / 2 - H / 2)).toBeLessThan(1);
    expect(Math.max((x1 - x0) / W, (y1 - y0) / H)).toBeCloseTo(0.92, 2);
    expect(f.rotation[0]).toBeCloseTo(-(b.w + b.e) / 2, 6);
  });
});
