"use client";

// Page store — pageStore du prototype (03-design §9.6) : bandeau, recherche dans le
// store, onglets Accueil · Produits · Meilleures ventes · Nouveautés · Avis · À propos
// · Promos (« À venir »), tri, mini-carte, politique de retour, signalement.

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { P, STORES, storeBy, catBy, type Product } from "@/lib/data/mock/seed";
import { sortList } from "@/lib/proto/sort";
import { storeImage } from "@/lib/data/mock/images";
import { formatDistance as km, formatCount as k } from "@/lib/format";
import { ComingSoon } from "@/components/ui/ComingSoon";
import { SoonBadge } from "@/components/ui/Tag";
import { useToast } from "@/components/ui/Toast";
import { ProductCard } from "@/components/proto/cards";
import { ReportForm } from "@/components/proto/forms";
import { useModal } from "@/components/proto/modal";
import { Reviews } from "@/components/proto/reviews";
import { ShareModal, shareTitle } from "@/components/proto/share";
import { DataIcon, EmptyBox, Fi, Page404, Ph, SecHead, fr1 } from "@/components/proto/ui";

const STABS: [string, string][] = [["home", "Accueil"], ["products", "Produits"], ["top", "Meilleures ventes"], ["new", "Nouveautés"], ["reviews", "Avis"], ["about", "À propos"]];

function SortBar({ sort, base, count }: { sort: string; base: string; count?: number }) {
  const pr = sort === "price" ? "price-d" : "price";
  return (
    <div className="sortbar">
      <span className="lb">Trier par :</span>
      <div className="seg">
        {[["best", "Pertinence"], ["orders", "Commandes"], ["new", "Nouveautés"]].map(([v, l]) => (
          <Link key={v} className={sort === v ? "on" : ""} href={`${base}sort=${v}`}>
            {l}
          </Link>
        ))}
        <Link className={sort === "price" || sort === "price-d" ? "on" : ""} href={`${base}sort=${pr}`}>
          Prix {sort === "price" ? <Fi s="sort-up" /> : sort === "price-d" ? <Fi s="sort-down" /> : <Fi s="sort" />}
        </Link>
      </div>
      {count != null ? (
        <span className="cnt-r">
          {count} produit{count > 1 ? "s" : ""}
        </span>
      ) : null}
    </div>
  );
}

const grid = (L: Product[]) => (
  <div className="grid">
    {L.map((p) => (
      <ProductCard key={p.id} p={p} />
    ))}
  </div>
);

export default function StorePage() {
  const { id, tab: tabParam } = useParams<{ id: string; tab?: string[] }>();
  const search = useSearchParams();
  const router = useRouter();
  const toast = useToast();
  const modal = useModal();
  const s = storeBy(id);
  const q = search.get("q") || "";
  const sort = search.get("sort") || "best";
  const [sq, setSq] = useState(q);
  if (!s) return <Page404 />;
  const tab = tabParam?.[0] || "home";
  const L = P.filter((p) => p.store === s.id);
  const reviews = L.reduce((a, p) => a + p.reviews, 0);
  const pos = s.rate ? Math.round(70 + (s.rate - 4) * 30) : 0;
  const base = `/store/${id}/`;
  const route = () => toast.show(`Itinéraire vers ${s.n} (${km(s.km)})`);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const v = sq.trim();
    router.push(`${base}products${v ? `?q=${encodeURIComponent(v)}` : ""}`);
  };

  let body;
  if (q) {
    const QL = sortList(L.filter((p) => p.n.toLowerCase().includes(q.toLowerCase())), sort);
    body = (
      <>
        <SortBar sort={sort} base={`${base}products?q=${encodeURIComponent(q)}&`} count={QL.length} />
        {QL.length ? (
          grid(QL)
        ) : (
          <EmptyBox icon={<Fi s="magnifying-glass" />} t={`Aucun produit pour « ${q} » dans ce store`} p="Essayez un autre mot ou parcourez tous les produits.">
            <Link className="btn btn-p" href={`${base}products`}>
              Tous les produits
            </Link>
          </EmptyBox>
        )}
      </>
    );
  } else if (tab === "home") {
    const top = sortList(L, "orders").slice(0, 5);
    const nw = L.filter((p) => p.isNew);
    body = (
      <>
        <div className="sbanner">
          <div>
            <small>{s.type === "physique" ? "Retrait en magasin" : "Retrait au point Prélakay"}</small>
            <h2>
              {s.n}, à {km(s.km)} de vous
            </h2>
            <p>
              {s.addr} · {s.hours}
            </p>
            <Link className="btn btn-p btn-sm" href={`${base}products`}>
              Voir les {L.length} produits
            </Link>
          </div>
          <DataIcon cls={s.i} />
        </div>
        <section className="sec">
          <SecHead title="Meilleures ventes" href={`${base}top`} />
          <div className="rail">
            {top.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        </section>
        {nw.length ? (
          <section className="sec">
            <SecHead title="Nouveautés" href={`${base}new`} />
            {grid(nw.slice(0, 5))}
          </section>
        ) : null}
        <section className="sec">
          <SecHead title="Tous les produits" href={`${base}products`} />
          {grid(sortList(L, "best"))}
        </section>
      </>
    );
  } else if (tab === "products" || tab === "top" || tab === "new") {
    const LL = sortList(tab === "new" ? L.filter((p) => p.isNew) : L, tab === "top" ? "orders" : sort);
    body = (
      <>
        {tab === "products" ? (
          <SortBar sort={sort} base={`${base}products?`} count={LL.length} />
        ) : (
          <div className="sortbar">
            <span className="cnt-r">
              {LL.length} produit{LL.length > 1 ? "s" : ""}
            </span>
          </div>
        )}
        {LL.length ? grid(LL) : <EmptyBox icon={<Fi s="box" />} t="Pas encore de nouveauté" p="Le store ajoute régulièrement des produits." />}
      </>
    );
  } else if (tab === "reviews") {
    body = L.some((p) => p.reviews) ? (
      <div className="panel">
        <Reviews rating={s.rate || 4.5} reviews={reviews} full />
      </div>
    ) : (
      <EmptyBox icon={<Fi r="star" />} t="Pas encore d'avis" p="Les avis apparaissent après les premiers retraits." />
    );
  } else if (tab === "about") {
    body = (
      <div className="about">
        <div className="panel">
          <h3>Adresse et retrait</h3>
          <div className="mini-map">
            {STORES.map((x) => (
              <span key={x.id} className={`mp${x.id === id ? " on" : ""}`} style={{ left: `${x.x}%`, top: `${x.y}%` }} />
            ))}
          </div>
          <p style={{ marginTop: 10 }}>
            <b>{s.addr}</b>
            <br />
            <span className="muted">
              {km(s.km)} de vous · {s.hours}
            </span>
          </p>
          <button className="btn btn-s btn-sm" style={{ marginTop: 10 }} onClick={route}>
            <Fi s="diamond-turn-right" />
            Itinéraire
          </button>
        </div>
        <div className="panel">
          <h3>Le store</h3>
          <dl className="kv">
            <dt>Sur Prélakay depuis</dt>
            <dd>{s.since}</dd>
            <dt>Type</dt>
            <dd>{s.type === "physique" ? "Store physique" : "Store en ligne"}</dd>
            <dt>Catégorie</dt>
            <dd>{catBy(s.cat)!.n}</dd>
            <dt>Produits</dt>
            <dd>{L.length}</dd>
            <dt>Ventes</dt>
            <dd>{k(s.sold)}</dd>
            <dt>Paiement du store</dt>
            <dd>{s.trust ? "24 h après le retrait (store de confiance)" : "3 jours après le retrait"}</dd>
          </dl>
        </div>
        <div className="panel">
          <h3>Politique de retour</h3>
          <p>
            Retour sous <b>3 jours</b> après le retrait si l&apos;article est non conforme ou endommagé (photo obligatoire). Remboursement sur le wallet Prélakay.
          </p>
          <button className="lk" style={{ marginTop: 12 }} onClick={() => modal.open("Signaler ce store", <ReportForm id={s.id} kind="store" />)}>
            <Fi r="flag" /> Signaler ce store
          </button>
        </div>
      </div>
    );
  } else return <Page404 />;

  return (
    <>
      <section className="shead">
        <div className="wrap">
          <div className="sh-in">
            <Ph icon={s.i} tint="g4" cls="slogo" img={storeImage(s.id)} alt={s.n} />
            <div className="sh-t">
              <h1>{s.n}</h1>
              <div className="sh-b">
                {s.trust ? (
                  <span className="sbadge">
                    <Fi s="circle-check" />
                    Store de confiance
                  </span>
                ) : null}
                <span className="sbadge ghost">
                  {s.type === "physique" ? <Fi s="store" /> : <Fi s="globe" />}
                  {s.type === "physique" ? "Store physique" : "Store en ligne"}
                </span>
              </div>
              <div className="sh-m">
                <span>
                  <b>{s.rate ? fr1(s.rate) : "—"}</b> note
                </span>
                <span>
                  <b>{pos ? `${pos} %` : "—"}</b> d&apos;avis positifs
                </span>
                <span>
                  <b>{k(s.sold)}</b> ventes
                </span>
                <span>
                  <b>{km(s.km)}</b>
                </span>
              </div>
            </div>
            <div className="sh-a">
              <form className="ssearch" role="search" onSubmit={submit}>
                <input name="q" placeholder="Chercher dans ce store" value={sq} onChange={(e) => setSq(e.target.value)} aria-label="Chercher dans ce store" />
                <button aria-label="Chercher">
                  <Fi s="magnifying-glass" />
                </button>
              </form>
              <div className="sh-btn">
                <button className="btn btn-light btn-sm" onClick={route}>
                  <Fi s="diamond-turn-right" />
                  Itinéraire
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => modal.open(shareTitle("store"), <ShareModal kind="store" id={s.id} />)}>
                  <Fi s="share-nodes" />
                  Partager
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
      <nav className="snav">
        <div className="wrap">
          {STABS.map(([v, l]) => (
            <Link key={v} className={tab === v && !q ? "on" : ""} href={base + v}>
              {l}
            </Link>
          ))}
          <ComingSoon feature="coupons">
            <button>
              Promos <SoonBadge />
            </button>
          </ComingSoon>
        </div>
      </nav>
      <div className="wrap sbody">{body}</div>
    </>
  );
}
