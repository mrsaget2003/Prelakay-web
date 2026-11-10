"use client";

// Tous les avis d'un produit — pageReviews du prototype (#/p/:id/reviews).

import Link from "next/link";
import { useParams } from "next/navigation";
import { prodBy } from "@/lib/data/mock/seed";
import { Reviews } from "@/components/proto/reviews";
import { Fi, Page404 } from "@/components/proto/ui";

export default function ProductReviewsPage() {
  const { id } = useParams<{ id: string }>();
  const p = prodBy(id);
  if (!p) return <Page404 />;
  return (
    <div className="wrap">
      <nav className="crumb">
        <Link href="/">Accueil</Link>
        <Fi s="chevron-right" />
        <Link href={`/p/${id}`}>{p.n}</Link>
        <Fi s="chevron-right" />
        <span>Avis</span>
      </nav>
      <div className="panel">
        <h1 className="ph-t">Avis clients · {p.n}</h1>
        <Reviews rating={p.rating} reviews={p.reviews} product={p} full />
      </div>
    </div>
  );
}
