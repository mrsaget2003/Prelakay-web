"use client";

// Catégories (onglet de l'app) — pageCategories du prototype (03-design §9.2 bis).
// 13 nov. 2026 : structure de l'écran « Catégories » d'AliExpress mobile (captures C(1), C(2)) :
// colonne de libellés à gauche (fond gris, catégorie active sur blanc), à droite deux onglets
// « Tout » / « Offres », une grille de photos en 3 colonnes avec une tuile « Tout voir »,
// les stores de la catégorie, puis le fil des produits en cartes. Le bandeau « Tout mode ·
// N produits » est retiré : la tuile « Tout voir » mène au même endroit.

import Link from "next/link";
import { useState } from "react";
import { CATS, STORES, P, PICONS, TINTS, catBy, type Product } from "@/lib/data/mock/seed";
import { productImage, storeImage } from "@/lib/data/mock/images";
import { useProtoRoute } from "@/components/proto/shell";
import { ProductCard } from "@/components/proto/cards";
import { ScrollFadeList } from "@/components/proto/scrollfade";
import { Fi, Ph } from "@/components/proto/ui";

type Tab = "all" | "deals";

export default function CategoriesPage() {
  const r = useProtoRoute();
  const c = catBy(r.params.c || "") ?? CATS[0];
  return <CatView key={c.id} c={c} />;
}

function CatView({ c }: { c: (typeof CATS)[number] }) {
  const [tab, setTab] = useState<Tab>("all");
  const stores = STORES.filter((s) => P.some((p) => p.store === s.id && p.cat === c.id));
  const inCat = P.filter((p) => p.cat === c.id);
  const deals = inCat.filter((p) => p.disc > 0).sort((a, b) => b.disc - a.disc);
  const popular = inCat.slice().sort((a, b) => b.sold - a.sold);
  const all = `/discover?cat=${c.id}`;

  return (
    <div className="catpage">
      <ScrollFadeList
        className="cp-l"
        label="Catégories"
        items={CATS}
        getKey={(x) => x.id}
        renderItem={(x) => (
          <Link href={`/categories?c=${x.id}`} className={x.id === c.id ? "on" : ""} aria-current={x.id === c.id ? "page" : undefined}>
            {x.n}
          </Link>
        )}
      />
      <div className="cp-r">
        {deals.length ? (
          <div className="cp-tabs" role="tablist" aria-label={`Affichage de ${c.n}`}>
            <button role="tab" aria-selected={tab === "all"} className={tab === "all" ? "on" : ""} onClick={() => setTab("all")}>
              Tout
            </button>
            <button role="tab" aria-selected={tab === "deals"} className={tab === "deals" ? "on" : ""} onClick={() => setTab("deals")}>
              <Fi s="percent" />
              Offres
            </button>
          </div>
        ) : null}

        {tab === "all" ? (
          <div className="cp-g">
            {c.sub.map((s, i) => (
              <Link key={s} href={`/discover?cat=${c.id}&sub=${encodeURIComponent(s)}`}>
                <Ph icon={PICONS[c.id][i] || c.i} tint={TINTS[i % 5]} img={inCat.filter((p) => p.sub === s).map((p) => productImage(p.id, 240)).find(Boolean)} alt={s} sizes="(max-width: 767px) 30vw, 140px" />
                <span>{s}</span>
              </Link>
            ))}
            <Link href={all} className="cp-more">
              <span className="cp-more-i">
                <Fi s="arrow-right" />
              </span>
              <span>Tout voir ({inCat.length})</span>
            </Link>
          </div>
        ) : (
          <div className="cp-g deals">
            {deals.map((p) => (
              <DealTile key={p.id} p={p} />
            ))}
          </div>
        )}

        {stores.length ? (
          <>
            <h3>Stores</h3>
            <div className="cp-st">
              {stores.map((s) => (
                <Link key={s.id} href={`/store/${s.id}`}>
                  <Ph icon={s.i} tint="g4" img={storeImage(s.id, 160)} alt={s.n} sizes="64px" />
                  <span>{s.n}</span>
                </Link>
              ))}
            </div>
          </>
        ) : null}

        <h3>Populaires</h3>
        <div className="cp-feed">
          {popular.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      </div>
    </div>
  );
}

function DealTile({ p }: { p: Product }) {
  return (
    <Link href={`/p/${p.id}`}>
      <span className="cp-deal">
        <Ph icon={p.icon} tint={p.tint} img={productImage(p.id, 240)} alt={p.n} sizes="(max-width: 767px) 30vw, 140px" />
        <span className="cp-off tnum">−{p.disc} %</span>
      </span>
      <span>{p.n}</span>
    </Link>
  );
}
