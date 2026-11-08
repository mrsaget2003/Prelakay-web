// Tris du prototype (sortList, page store) et filtrage Discovery (filtered).

import type { Product } from "@/lib/data/mock/seed";

export function sortList(L: Product[], sort: string): Product[] {
  const l = L.slice();
  if (sort === "orders") l.sort((a, b) => b.sold - a.sold);
  else if (sort === "new") l.sort((a, b) => +b.isNew - +a.isNew || a.sold - b.sold);
  else if (sort === "price") l.sort((a, b) => a.price - b.price);
  else if (sort === "price-d") l.sort((a, b) => b.price - a.price);
  else l.sort((a, b) => b.sold + b.rating * 80 - (a.sold + a.rating * 80));
  return l;
}
