// Recherche par photo (ex-V2, active dans le prototype) : démonstration — la catégorie « la plus
// proche » est déduite du nom du fichier (aucune analyse d'image dans le prototype).

import { CATS } from "@/lib/data/mock/seed";

export function photoSearchCategory(fileName: string): string {
  const n = fileName.toLowerCase();
  const hit = CATS.find((c) => n.includes(c.id) || n.includes(c.n.toLowerCase().split(" ")[0]));
  if (hit) return hit.id;
  let h = 0;
  for (const ch of n) h = (h * 33 + ch.charCodeAt(0)) >>> 0;
  return CATS[h % CATS.length].id;
}
