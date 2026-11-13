import { ImageResponse } from "next/og";
import { P, storeBy } from "@/lib/data/mock/seed";
import { storeImage } from "@/lib/data/mock/images";
import { OG_SIZE, StoreOg } from "@/lib/og/cards";

// Image de partage d'un store — 12 nov. 2026.
export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Store sur Prélakay";

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const s = storeBy(id);
  if (!s) return new ImageResponse(<div style={{ width: "100%", height: "100%", background: "#052a2e" }} />, size);
  return new ImageResponse(<StoreOg s={s} photo={storeImage(s.id, 440)} products={P.filter((p) => p.store === s.id).length} />, size);
}
