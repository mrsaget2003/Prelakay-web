// Séries de démonstration de la plateforme (pData et ZONES du prototype).

import { hs } from "@/lib/demo/seller";
import { dayLabels, walk } from "./vz";
import { sum } from "./sellerData";

/** Zones de Les Cayes : [nom, x %, y %] sur le fond de carte de démonstration. */
export const ZONES: [string, number, number][] = [
  ["Centre-ville", 48, 52], ["Quatre Chemins", 60, 36], ["Bergeaud", 30, 28], ["Laborde", 78, 24], ["Gelée", 38, 78],
  ["Torbeck (route)", 18, 40], ["Simon", 68, 66], ["Bourdet", 84, 50], ["Camp-Perrin (route)", 12, 70],
];

export function pData(d: number, activeStores: number) {
  const L = dayLabels(d);
  const h = hs(`plateforme${d}`);
  const ord = walk(d, h, 22, 9, 0.02);
  const picked = ord.map((o, i) => Math.max(0, o - 2 - (i % 3)));
  const ready = ord.map((_, i) => 1 + (i % 3));
  const exp = ord.map((_, i) => (i % 4 === 0 ? 1 : 0));
  const prep = ord.map((o, i) => Math.max(0, o - picked[i] - ready[i] - exp[i]));
  const gmv = ord.map((o, i) => o * (2600 + ((h >> i) & 1023)));
  const hai = walk(d, h + 2, 14, 6, 0.02);
  const dia = walk(d, h + 4, 5, 3, 0.035);
  const newU = walk(d, h + 6, 30, 14, 0.015);
  const stores = ord.map((_, i) => Math.max(1, Math.round(activeStores * (0.35 + 0.65 * Math.pow(i / Math.max(1, d - 1), 1.2)))));
  return { L, ord, picked, ready, prep, exp, gmv, hai, dia, newU, stores, pickRate: Math.round((sum(picked) / Math.max(1, sum(picked) + sum(exp))) * 100) };
}
