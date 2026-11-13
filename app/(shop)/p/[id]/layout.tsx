import type { Metadata } from "next";
import { P, storeBy } from "@/lib/data/mock/seed";
import { formatDistance as km, formatHTG as htg } from "@/lib/format";

// Titre et aperçu de partage d'une fiche produit (12 nov. 2026). La page est un composant
// client : ses métadonnées vivent ici. L'image vient de ./opengraph-image.tsx.
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const p = P.find((x) => x.id === id);
  const st = p ? storeBy(p.store) : null;
  if (!p || !st) return { title: "Produit introuvable · Prélakay" };
  const title = `${p.n} · ${htg(p.price)}`;
  const description = `Chez ${st.n}, à ${km(st.km)}. Commandez sur Prélakay, retirez au comptoir.`;
  return {
    title: `${title} · Prélakay`,
    description,
    openGraph: { title, description, type: "website", siteName: "Prélakay", locale: "fr_HT" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default function ProductLayout({ children }: { children: React.ReactNode }) {
  return children;
}
