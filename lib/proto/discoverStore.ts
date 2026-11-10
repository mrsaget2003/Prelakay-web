"use client";

// Filtres de Discovery (objet DF du prototype) : gardés d'une page à l'autre comme dans
// le prototype, partagés entre la colonne de filtres (desktop) et la feuille « Filtres » (mobile).

import { useSyncExternalStore } from "react";
import { EMPTY_FILTERS, type Filters } from "./sort";

let DF: Filters = { ...EMPTY_FILTERS };
const ls = new Set<() => void>();

export const discover = {
  get: () => DF,
  set(patch: Partial<Filters>) {
    DF = { ...DF, ...patch };
    ls.forEach((l) => l());
  },
  reset() {
    DF = { ...DF, cat: "", sub: "", min: "", max: "", dist: 0, rate: 0, ready: false, trust: false, store: "" };
    ls.forEach((l) => l());
  },
  /** applyQuery du prototype : l'adresse fixe la catégorie, la sous-catégorie, le tri et « prêt à retirer ». */
  applyQuery(params: Record<string, string>) {
    discover.set({ cat: params.cat || "", sub: params.sub || "", ready: params.ready === "1", ...(params.sort ? { sort: params.sort } : {}) });
  },
  subscribe(l: () => void) {
    ls.add(l);
    return () => ls.delete(l);
  },
};

export function useFilters(): Filters {
  return useSyncExternalStore(discover.subscribe, discover.get, discover.get);
}
