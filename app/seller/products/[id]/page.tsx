"use client";

// Modifier un produit du store (sProductForm du prototype).

import Link from "next/link";
import { useParams } from "next/navigation";
import { useDemo } from "@/lib/demo/store";
import { myProducts } from "@/lib/demo/sellerActions";
import { ProductForm } from "@/components/seller/ProductForm";
import { SHead } from "@/components/seller/shell";
import { EmptyBox, Fi } from "@/components/proto/ui";

export default function EditProduct() {
  const { id } = useParams<{ id: string }>();
  const s = useDemo();
  const p = myProducts(s).find((x) => x.id === decodeURIComponent(id));
  if (!p)
    return (
      <>
        <SHead title="Produit introuvable" />
        <EmptyBox icon={<Fi s="box" />} t="Produit introuvable">
          <Link className="btn btn-p" href="/seller/products">
            Mes produits
          </Link>
        </EmptyBox>
      </>
    );
  return <ProductForm key={p.id} product={p} />;
}
