// Offres flash 24 h, events et produits boostés (ex-V1.x / V2, actifs dans le prototype —
// CLAUDE.md 10 nov. 2026). Seuil de points de confiance des offres flash : ⚠️ ouvert
// (le prototype n'a que le badge « Store de confiance »).

import type { Product } from "@/lib/data/mock/seed";

export const FLASH_HOURS = 24;

export type Flash = { id: string; store: string; product: string; price: number; /** fin (ms) */ ends: number; st: "pending" | "live" | "rej" };
export type PEvent = { id: string; n: string; from: string; to: string; noCommission: boolean; stores: string[] };
export type Boost = { id: string; store: string; product: string; budget: number; on: boolean };

/** Prix flash en cours : { produit : { prix flash, ancien prix (barré) } }. */
export function flashOverlay(flashes: Flash[], now: number, priceOf: (id: string) => number): Record<string, { price: number; was: number }> {
  const out: Record<string, { price: number; was: number }> = {};
  for (const f of flashes) if (f.st === "live" && now < f.ends) out[f.product] = { price: f.price, was: priceOf(f.product) };
  return out;
}

/** Produits boostés : un sponsorisé en tête de chaque bloc de 4 positions (même règle que le quota « Nouveaux »). */
export function withSponsored(list: Product[], boosted: Set<string>, every = 4): { list: Product[]; sponsored: Set<string> } {
  if (!boosted.size) return { list, sponsored: new Set() };
  const sp = list.filter((p) => boosted.has(p.id));
  const rest = list.filter((p) => !boosted.has(p.id));
  const out: Product[] = [];
  const used = new Set<string>();
  while (rest.length || sp.length) {
    if (sp.length) {
      const x = sp.shift()!;
      out.push(x);
      used.add(x.id);
    }
    for (let i = 0; i < every - 1 && rest.length; i++) out.push(rest.shift()!);
    if (!rest.length) {
      while (sp.length) {
        const x = sp.shift()!;
        out.push(x);
        used.add(x.id);
      }
    }
  }
  return { list: out, sponsored: used };
}
