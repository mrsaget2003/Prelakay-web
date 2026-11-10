// Tris du prototype (sortList, page store) et filtrage Discovery (filtered).

import { storeBy, catBy, type Product } from "@/lib/data/mock/seed";
import { BUSINESS } from "@/lib/config/business";

export function sortList(L: Product[], sort: string): Product[] {
  const l = L.slice();
  if (sort === "orders") l.sort((a, b) => b.sold - a.sold);
  else if (sort === "new") l.sort((a, b) => +b.isNew - +a.isNew || a.sold - b.sold);
  else if (sort === "price") l.sort((a, b) => a.price - b.price);
  else if (sort === "price-d") l.sort((a, b) => b.price - a.price);
  else l.sort((a, b) => b.sold + b.rating * 80 - (a.sold + a.rating * 80));
  return l;
}

/** Filtres de Discovery (objet DF du prototype). */
export type Filters = {
  cat: string; sub: string; min: string; max: string; dist: number; rate: number;
  ready: boolean; trust: boolean; store: string; sort: string;
};
export const EMPTY_FILTERS: Filters = { cat: "", sub: "", min: "", max: "", dist: 0, rate: 0, ready: false, trust: false, store: "", sort: "best" };

/** filtered() du prototype : recherche, filtres, tri ; en pertinence, quota
 *  « Nouveaux sur Prélakay » de 1 nouveau toutes les 4 positions (BUSINESS.newcomerEvery). */
export function filterProducts(all: Product[], q: string, DF: Filters): Product[] {
  let list = all.filter((p) => {
    const st = storeBy(p.store)!;
    if (q && `${p.n} ${st.n} ${catBy(p.cat)!.n}`.toLowerCase().indexOf(q.toLowerCase()) < 0) return false;
    if (DF.cat && p.cat !== DF.cat) return false;
    if (DF.sub && p.sub !== DF.sub) return false;
    if (DF.min && p.price < +DF.min) return false;
    if (DF.max && p.price > +DF.max) return false;
    if (DF.dist && st.km > DF.dist) return false;
    if (DF.rate && p.rating < DF.rate) return false;
    if (DF.ready && !p.ready) return false;
    if (DF.trust && !st.trust) return false;
    if (DF.store && p.store !== DF.store) return false;
    return true;
  });
  const s = DF.sort;
  list.sort((a, b) => {
    if (s === "price") return a.price - b.price;
    if (s === "price-d") return b.price - a.price;
    if (s === "near") return storeBy(a.store)!.km - storeBy(b.store)!.km;
    if (s === "rate") return b.rating - a.rating;
    if (s === "orders") return b.sold - a.sold;
    if (s === "new") return +b.isNew - +a.isNew || a.sold - b.sold;
    return b.sold + b.rating * 80 - (a.sold + a.rating * 80);
  });
  if (s === "best") {
    const nw = list.filter((p) => p.isNew);
    const old = list.filter((p) => !p.isNew);
    const out: Product[] = [];
    const every = BUSINESS.newcomerEvery - 1;
    while (old.length || nw.length) {
      for (let i = 0; i < every && old.length; i++) out.push(old.shift()!);
      if (nw.length) out.push(nw.shift()!);
    }
    list = out;
  }
  return list;
}
