import { ImageResponse } from "next/og";
import { P, storeBy } from "@/lib/data/mock/seed";
import { productImage } from "@/lib/data/mock/images";
import { OG_SIZE, ProductOg } from "@/lib/og/cards";

// Image de partage d'une fiche produit (WhatsApp, Facebook…) — 12 nov. 2026.
export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Produit sur Prélakay";

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // catalogue de base (les prix flash de démonstration dépendent de l'appareil)
  const p = P.find((x) => x.id === id);
  const st = p ? storeBy(p.store) : null;
  if (!p || !st) return new ImageResponse(<div style={{ width: "100%", height: "100%", background: "#052a2e" }} />, size);
  const photo = productImage(p.id, 600)?.replace("&h=600", "&h=630");
  return new ImageResponse(<ProductOg p={p} st={st} photo={photo} />, size);
}
