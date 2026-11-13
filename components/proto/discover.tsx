"use client";

// Discovery et résultats de recherche — pageDiscover / filtersHtml du prototype :
// fil d'Ariane, colonne de filtres (feuille « Filtres » sur mobile), pastilles de
// catégories ou de sous-catégories, barre de tri, grille.

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { CATS, STORES, allProducts, catBy } from "@/lib/data/mock/seed";
import { filterProducts } from "@/lib/proto/sort";
import { withSponsored } from "@/lib/domain/marketing";
import { boostedIds } from "@/lib/demo/marketing";
import { useDemo } from "@/lib/demo/store";
import { discover, useFilters } from "@/lib/proto/discoverStore";
import { ProductCard } from "./cards";
import { useModal } from "./modal";
import { EmptyBox, Fi, Stars } from "./ui";

const OPEN0: Record<string, boolean> = { cat: true, price: true, dist: true, rate: true, avail: true, store: false };

export function FiltersPanel() {
  const DF = useFilters();
  const [open, setOpen] = useState(OPEN0);
  // La colonne (bureau, cachée sur mobile) et la feuille « Filtres » coexistent dans la page :
  // des radios au même `name` formeraient un seul groupe, et le clic dans la feuille était
  // annulé. Chaque panneau a donc ses propres noms de groupe.
  const uid = useId();
  const g = (k: string, t: string, inner: React.ReactNode) => (
    <div className={`fg${open[k] ? " open" : ""}`}>
      <button className="fg-h" onClick={() => setOpen((o) => ({ ...o, [k]: !o[k] }))}>
        {t}
        <Fi s="chevron-down" />
      </button>
      <div className="fg-b">{inner}</div>
    </div>
  );
  const radio = (name: string, checked: boolean, on: () => void, label: React.ReactNode, key: string) => (
    <label className="ck" key={key}>
      <input type="radio" name={`${name}-${uid}`} checked={checked} onChange={on} />
      {label}
    </label>
  );
  return (
    <aside className="filters" aria-label="Filtres">
      {g(
        "avail",
        "Retrait et disponibilité",
        <>
          <label className="ck">
            <input type="checkbox" checked={DF.ready} onChange={(e) => discover.set({ ready: e.target.checked })} />
            Prêt à retirer aujourd&apos;hui
          </label>
          <label className="ck">
            <input type="checkbox" checked={DF.trust} onChange={(e) => discover.set({ trust: e.target.checked })} />
            Stores de confiance
          </label>
        </>,
      )}
      {g(
        "cat",
        "Catégorie",
        <>
          {radio("fcat", !DF.cat, () => discover.set({ cat: "", sub: "" }), "Toutes", "all")}
          {CATS.map((c) => radio("fcat", DF.cat === c.id, () => discover.set({ cat: c.id, sub: "" }), c.n, c.id))}
        </>,
      )}
      {g(
        "price",
        "Prix (HTG)",
        <div className="range">
          <input className="field" inputMode="numeric" placeholder="Min" value={DF.min} aria-label="Prix minimum" onChange={(e) => discover.set({ min: e.target.value.replace(/\D/g, "") })} />
          <span>–</span>
          <input className="field" inputMode="numeric" placeholder="Max" value={DF.max} aria-label="Prix maximum" onChange={(e) => discover.set({ max: e.target.value.replace(/\D/g, "") })} />
        </div>,
      )}
      {g(
        "dist",
        "Distance",
        <>
          {radio("fdist", !DF.dist, () => discover.set({ dist: 0 }), "Toutes", "0")}
          {([[1, "Moins de 1 km"], [2, "Moins de 2 km"], [5, "Moins de 5 km"]] as const).map(([d, l]) => radio("fdist", DF.dist === d, () => discover.set({ dist: d }), l, String(d)))}
        </>,
      )}
      {g(
        "rate",
        "Note",
        <>
          {radio("frate", !DF.rate, () => discover.set({ rate: 0 }), "Toutes", "0")}
          {radio("frate", DF.rate === 4, () => discover.set({ rate: 4 }), <><span className="stars"><Stars r={4} /></span> et plus</>, "4")}
          {radio("frate", DF.rate === 4.5, () => discover.set({ rate: 4.5 }), <><span className="stars"><Stars r={4.5} /></span> et plus</>, "4.5")}
        </>,
      )}
      {g(
        "store",
        "Store",
        <>
          {STORES.map((st) => radio("fstore", DF.store === st.id, () => discover.set({ store: st.id }), st.n, st.id))}
          {radio("fstore", !DF.store, () => discover.set({ store: "" }), "Tous", "all")}
        </>,
      )}
      <button className="btn btn-o btn-block" onClick={() => discover.reset()}>
        Effacer les filtres
      </button>
    </aside>
  );
}

export function DiscoverView({ q, params }: { q: string; params: Record<string, string> }) {
  const DF = useFilters();
  const modal = useModal();
  const key = JSON.stringify(params);
  useEffect(() => {
    discover.applyQuery(JSON.parse(key));
  }, [key]);
  const demoS = useDemo();
  // produits boostés : un « Sponsorisé » en tête de chaque bloc de 4, en tri par pertinence (spec §5)
  const ranked = filterProducts(allProducts(), q, DF);
  const flashOnly = params.flash === "1";
  const live = new Set(demoS.marketing.flash.filter((f) => f.st === "live").map((f) => f.product));
  const sp = DF.sort === "best" && !flashOnly ? withSponsored(ranked, boostedIds(demoS)) : { list: ranked, sponsored: new Set<string>() };
  const list = flashOnly ? sp.list.filter((p) => live.has(p.id)) : sp.list;
  const c = DF.cat ? catBy(DF.cat) : null;
  const nf = (DF.cat ? 1 : 0) + (DF.min || DF.max ? 1 : 0) + (DF.dist ? 1 : 0) + (DF.rate ? 1 : 0) + (DF.ready ? 1 : 0) + (DF.trust ? 1 : 0) + (DF.store ? 1 : 0);
  const pr = DF.sort === "price" ? "price-d" : "price";
  return (
    <div className="wrap">
      <nav className="crumb">
        <Link href="/">Accueil</Link>
        <Fi s="chevron-right" />
        {q ? (
          <span>Résultats pour « {q} »</span>
        ) : c ? (
          <>
            <Link href={`/discover?cat=${c.id}`}>{c.n}</Link>
            {DF.sub ? (
              <>
                <Fi s="chevron-right" />
                <span>{DF.sub}</span>
              </>
            ) : null}
          </>
        ) : (
          <span>Tous les produits</span>
        )}
      </nav>
      <div className="disc">
        <FiltersPanel />
        <div className="disc-r">
          {q ? (
            <h1 className="res-h">
              {list.length} résultat{list.length > 1 ? "s" : ""} pour « {q} »
            </h1>
          ) : params.photo === "1" ? (
            <h1 className="res-h">
              <Fi s="camera" /> Résultats proches de votre photo
            </h1>
          ) : null}
          {c ? (
            <div className="pills">
              {["", ...c.sub].map((sb) => (
                <button key={sb || "all"} className={`chip ${DF.sub === sb ? "on" : ""}`} onClick={() => discover.set({ sub: DF.sub === sb ? "" : sb })}>
                  {sb || "Tout"}
                </button>
              ))}
            </div>
          ) : (
            <div className="pills">
              {[{ id: "", n: "Pour vous" }, ...CATS].map((x) => (
                <button key={x.id || "fy"} className={`chip ${DF.cat === x.id ? "on" : ""}`} onClick={() => discover.set({ cat: x.id, sub: "" })}>
                  {x.n}
                </button>
              ))}
            </div>
          )}
          <div className="sortbar">
            <span className="lb d-only">Trier par :</span>
            <div className="seg">
              {[["best", "Pertinence"], ["orders", "Commandes"], ["near", "Plus proches"], ["new", "Nouveautés"]].map(([v, l]) => (
                <button key={v} className={`${DF.sort === v ? "on" : ""}${v === "near" || v === "new" ? " mh-hide" : ""}`} onClick={() => discover.set({ sort: v })}>
                  {l}
                </button>
              ))}
              <button className={DF.sort === "price" || DF.sort === "price-d" ? "on" : ""} onClick={() => discover.set({ sort: pr })}>
                Prix {DF.sort === "price" ? <Fi s="sort-up" /> : DF.sort === "price-d" ? <Fi s="sort-down" /> : <Fi s="sort" />}
              </button>
            </div>
            <button className="fbtn mo" onClick={() => modal.open("Filtres", <FiltersPanel />)}>
              <Fi s="sliders" />
              Filtres{nf ? ` (${nf})` : ""}
            </button>
            <span className="cnt-r d-only">
              {list.length} produit{list.length > 1 ? "s" : ""}
            </span>
          </div>
          {list.length ? (
            <div className="grid">
              {list.map((p) => (
                <ProductCard key={p.id} p={p} badge={sp.sponsored.has(p.id) ? "Sponsorisé" : live.has(p.id) ? "Flash" : undefined} />
              ))}
            </div>
          ) : (
            <EmptyBox icon={<Fi s="magnifying-glass" />} t="Aucun produit ne correspond" p="Élargissez la distance ou retirez un filtre.">
              <button className="btn btn-p" onClick={() => discover.reset()}>
                Effacer les filtres
              </button>
            </EmptyBox>
          )}
        </div>
      </div>
    </div>
  );
}
