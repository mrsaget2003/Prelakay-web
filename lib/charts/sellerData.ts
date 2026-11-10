// Séries de démonstration des statistiques vendeur (sData du prototype) : déterministes par store.

import { hs } from "@/lib/demo/seller";
import { dayLabels, walk } from "./vz";

export const sum = (a: number[]) => a.reduce((x, y) => x + y, 0);
export const dPct = (a: number, b: number) => (b ? Math.round(((a - b) / b) * 100) : 0);

export function sData(store: string, d: number) {
  const h = hs(store);
  const L = dayLabels(d);
  const sales = walk(d, h, 6000 + (h % 5000), 3800, 0.004);
  const prev = walk(d, h + 7, 5200 + (h % 4000), 3600, 0.002);
  const orders = sales.map((v) => Math.max(1, Math.round(v / 2600)));
  const picked = orders.map((o, i) => Math.max(0, o - ((h + i) % 3 === 0 ? 1 : 0)));
  const ready = orders.map((_, i) => ((h + i) % 4 === 0 ? 1 : 0));
  const prep = orders.map((_, i) => ((h + i) % 5 === 0 ? 1 : 0));
  const exp = orders.map((_, i) => ((h + i) % 9 === 0 ? 1 : 0));
  const visits = walk(d, h + 3, 60 + (h % 40), 30, 0.006);
  const newb = walk(d, h + 11, 4 + (h % 3), 3, 0.01);
  const ret = walk(d, h + 13, 2 + (h % 2), 2, 0.02);
  return { h, L, sales, prev, orders, picked, ready, prep, exp, visits, newb, ret, tot: sum(sales), totPrev: sum(prev), nOrd: sum(orders), nVis: sum(visits), cart: 12 + (h % 14) };
}
