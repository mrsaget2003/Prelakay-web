// Carte des ventes admin (spec §8, D3) : part des ventes et montant par commune du Sud,
// puis par quartier des Cayes. Données de démonstration, cohérentes avec pData (même total).

import { hs } from "@/lib/demo/seller";
import { formatHTG } from "@/lib/format";
import { ZONES, pData } from "./adminData";
import { sum } from "./sellerData";

export type ZoneSale = { id: string; name: string; amount: number; orders: number };
export type ZoneShare = ZoneSale & { pct: number };
export type ShareBy = "amount" | "orders";

/** Communes du Sud (identifiants de lib/data/geo/sud-communes.json) et poids de démonstration. */
const COMMUNES: [string, string, number][] = [
  ["les-cayes", "Les Cayes", 0.58], ["torbeck", "Torbeck", 0.09], ["camp-perrin", "Camp-Perrin", 0.07], ["chantal", "Chantal", 0.05],
  ["cavaillon", "Cavaillon", 0.04], ["maniche", "Maniche", 0.04], ["ile-a-vache", "Île-à-Vache", 0.03], ["aquin", "Aquin", 0.03],
  ["port-salut", "Port-Salut", 0.025], ["saint-louis-du-sud", "Saint-Louis-du-Sud", 0.02], ["saint-jean-du-sud", "Saint-Jean-du-Sud", 0.015],
  ["arniquet", "Arniquet", 0.01], ["coteaux", "Côteaux", 0.005], ["port-a-piment", "Port-à-Piment", 0.005],
  // pas encore de vente pendant le pilote
  ["roche-a-bateau", "Roche-à-Bateau", 0], ["chardonnieres", "Chardonnières", 0], ["les-anglais", "Les Anglais", 0], ["tiburon", "Tiburon", 0],
];
/** Quartiers des Cayes (ZONES du prototype), même ordre. */
const QUARTERS = [0.34, 0.16, 0.12, 0.09, 0.08, 0.06, 0.07, 0.05, 0.03];

/** Répartit un entier selon des poids, sans perte : la somme des parts vaut exactement `total` (plus forts restes). */
function split(total: number, weights: number[]): number[] {
  const t = weights.reduce((a, w) => a + w, 0);
  if (!t || total <= 0) return weights.map(() => 0);
  const raw = weights.map((w) => (w / t) * total);
  const out = raw.map(Math.floor);
  let left = total - out.reduce((a, v) => a + v, 0);
  const order = raw.map((v, i) => [v - Math.floor(v), i] as const).sort((a, b) => b[0] - a[0]);
  for (const [, i] of order) {
    if (left <= 0) break;
    if (weights[i] > 0) {
      out[i] += 1;
      left -= 1;
    }
  }
  return out;
}

/** Variation de démonstration par période (± 15 %), qui garde à zéro une commune sans vente. */
function jitter(weights: number[], seed: number): number[] {
  return weights.map((w, i) => (w ? w * (0.85 + 0.3 * (((seed >> (i % 16)) & 255) / 255)) : 0));
}

export function communeSales(d: 7 | 30 | 90): ZoneSale[] {
  const p = pData(d, 1);
  const w = jitter(COMMUNES.map((c) => c[2]), hs(`carte${d}`));
  const amt = split(sum(p.gmv), w);
  const ord = split(sum(p.ord), w);
  return COMMUNES.map(([id, name], i) => ({ id, name, amount: amt[i], orders: ord[i] }));
}

export function quarterSales(d: 7 | 30 | 90): ZoneSale[] {
  const cayes = communeSales(d)[0];
  const w = jitter(QUARTERS, hs(`quartiers${d}`));
  const amt = split(cayes.amount, w);
  const ord = split(cayes.orders, w);
  return ZONES.map(([name], i) => ({ id: name, name, amount: amt[i], orders: ord[i] }));
}

/** Parts entières en % (somme 100 dès qu'il y a une vente ; 0 % partout sinon). */
export function shares(rows: ZoneSale[], by: ShareBy): ZoneShare[] {
  const pct = split(100, rows.map((r) => r[by]));
  return rows.map((r, i) => ({ ...r, pct: pct[i] }));
}

/** « 10 % · 48 200 HTG » */
export function shareLabel(z: ZoneShare): string {
  return `${z.pct} % · ${formatHTG(z.amount)}`;
}
