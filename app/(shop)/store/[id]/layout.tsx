import type { Metadata } from "next";
import { P, storeBy } from "@/lib/data/mock/seed";
import { formatDistance as km } from "@/lib/format";

// Titre et aperçu de partage d'un store (12 nov. 2026). L'image vient de ./opengraph-image.tsx,
// partagée par tous les onglets du store.
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const s = storeBy(id);
  if (!s) return { title: "Store introuvable · Prélakay" };
  const n = P.filter((p) => p.store === s.id).length;
  const title = s.n;
  const description =
    s.type === "physique"
      ? `${n} produits, à ${km(s.km)} (${s.addr.split(",")[0]}). Commandez sur Prélakay, retirez au comptoir.`
      : `${n} produits. Store en ligne sur Prélakay, retrait au point Prélakay.`;
  return {
    title: `${title} · Prélakay`,
    description,
    openGraph: { title, description, type: "website", siteName: "Prélakay", locale: "fr_HT" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return children;
}
