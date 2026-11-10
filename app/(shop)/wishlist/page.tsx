"use client";

// Wishlist — pageWishlist du prototype.

import Link from "next/link";
import { P } from "@/lib/data/mock/seed";
import { useDemo } from "@/lib/demo/store";
import { useIsDesk } from "@/lib/proto/useIsDesk";
import { AccLayout } from "@/components/proto/account";
import { ProductCard } from "@/components/proto/cards";
import { Fi, NeedLogin } from "@/components/proto/ui";

export default function WishlistPage() {
  const s = useDemo();
  const desk = useIsDesk();
  if (!s.logged) return <NeedLogin what="Votre wishlist" next="/wishlist" />;
  const l = P.filter((p) => s.wish[p.id]);
  return (
    <AccLayout k="wishlist" title="Wishlist">
      {l.length ? (
        <div className="grid" style={{ ["--cols" as string]: desk ? 4 : 2 }}>
          {l.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      ) : (
        <div className="empty">
          <Fi r="heart" />
          <b>Votre wishlist est vide</b>
          <p className="muted">Touchez le cœur d&apos;un produit pour le garder ici.</p>
          <Link className="btn btn-p" href="/discover">
            Découvrir
          </Link>
        </div>
      )}
    </AccLayout>
  );
}
