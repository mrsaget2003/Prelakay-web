"use client";

// Catégories (onglet de l'app) — pageCategories du prototype (03-design §9.2 bis) :
// colonne de catégories à gauche ; bannière, sous-catégories, stores et populaires à droite.

import Link from "next/link";
import { CATS, STORES, P, PICONS, TINTS, catBy } from "@/lib/data/mock/seed";
import { productImage, storeImage } from "@/lib/data/mock/images";
import { useProtoRoute } from "@/components/proto/shell";
import { DataIcon, Ph } from "@/components/proto/ui";

export default function CategoriesPage() {
  const r = useProtoRoute();
  const c = catBy(r.params.c || "") ?? CATS[0];
  const stores = STORES.filter((s) => P.some((p) => p.store === s.id && p.cat === c.id));
  const inCat = P.filter((p) => p.cat === c.id);
  return (
    <div className="catpage">
      <nav className="cp-l" aria-label="Catégories">
        {CATS.map((x) => (
          <Link key={x.id} href={`/categories?c=${x.id}`} className={x.id === c.id ? "on" : ""}>
            <DataIcon cls={x.i} />
            <span>{x.n}</span>
          </Link>
        ))}
      </nav>
      <div className="cp-r">
        <Link className="cp-ban" href={`/discover?cat=${c.id}`}>
          <span>
            <small>Tout {c.n.toLowerCase()}</small>
            <b>{inCat.length} produits sur Prélakay</b>
          </span>
          <DataIcon cls={c.i} />
        </Link>
        <h3>Sous-catégories</h3>
        <div className="cp-g">
          {c.sub.map((s, i) => (
            <Link key={s} href={`/discover?cat=${c.id}&sub=${encodeURIComponent(s)}`}>
              <Ph icon={PICONS[c.id][i] || c.i} tint={TINTS[i % 5]} />
              <span>{s}</span>
            </Link>
          ))}
        </div>
        {stores.length ? (
          <>
            <h3>Stores</h3>
            <div className="cp-g st">
              {stores.map((s) => (
                <Link key={s.id} href={`/store/${s.id}`}>
                  <Ph icon={s.i} tint="g4" img={storeImage(s.id, 160)} alt={s.n} />
                  <span>{s.n}</span>
                </Link>
              ))}
            </div>
          </>
        ) : null}
        <h3>Populaires</h3>
        <div className="cp-g">
          {inCat
            .slice()
            .sort((a, b) => b.sold - a.sold)
            .slice(0, 6)
            .map((p) => (
              <Link key={p.id} href={`/p/${p.id}`}>
                <Ph icon={p.icon} tint={p.tint} img={productImage(p.id, 160)} alt={p.n} />
                <span>{p.n}</span>
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
}
