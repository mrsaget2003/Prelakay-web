"use client";

// Produits du store — sProducts du prototype : onglets par statut, recherche, tableau
// (prix, stock, ventes 14 j, vendus, statut) et actions (modifier, voir, archiver, dupliquer).

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { catBy, optsOf } from "@/lib/data/mock/seed";
import { productImage } from "@/lib/data/mock/images";
import { demo, useDemo } from "@/lib/demo/store";
import { formFrom, myProducts, pStatus, setProductStatus, statusOf, whyOf } from "@/lib/demo/sellerActions";
import { combos, hs, stockTotal } from "@/lib/demo/seller";
import { walk, VZC } from "@/lib/charts/vz";
import { formatHTG as htg } from "@/lib/format";
import { useToast } from "@/components/ui/Toast";
import { SHead, BUYER_URL } from "@/components/seller/shell";
import { PTag } from "@/components/proto/tags";
import { VzSpark } from "@/components/charts/vz";
import { EmptyBox, Fi, Ph } from "@/components/proto/ui";

const TABS: [string, string][] = [["all", "Tous"], ["active", "Actifs"], ["mod", "En modération"], ["draft", "Brouillons"], ["out", "Rupture"], ["rejected", "Rejetés"], ["archived", "Archivés"]];

function Products() {
  const s = useDemo();
  const router = useRouter();
  const toast = useToast();
  const q0 = useSearchParams().get("q") ?? "";
  const [tab, setTab] = useState("all");
  const [q, setQ] = useState(q0);
  const L = myProducts(s);
  const inTab = (t: string, p: (typeof L)[number]) => (t === "all" ? statusOf(s, p) !== "archived" : pStatus(s, p) === t);
  const ql = q0.toLowerCase();
  const list = L.filter((p) => inTab(tab, p) && (!ql || p.n.toLowerCase().includes(ql)));
  const dup = (id: string) => {
    const p = L.find((x) => x.id === id)!;
    demo.update((st) => {
      st.seller.form = { ...formFrom(st, p), id: null, n: `${p.n} (copie)` };
    });
    router.push("/seller/products/new");
  };
  return (
    <>
      <SHead title="Produits" crumb={[["Produits"]]} />
      <div className="panel s-tools">
        <div className="otabs">
          {TABS.map(([k, l]) => (
            <button key={k} className={tab === k ? "on" : ""} onClick={() => setTab(k)}>
              {l} ({L.filter((p) => inTab(k, p)).length})
            </button>
          ))}
        </div>
        <div className="s-bar">
          <form
            className="osearch"
            onSubmit={(e) => {
              e.preventDefault();
              router.replace(q.trim() ? `/seller/products?q=${encodeURIComponent(q.trim())}` : "/seller/products");
            }}
          >
            <input name="q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nom du produit" aria-label="Chercher un produit" />
            <button className="btn btn-o btn-sm">Chercher</button>
          </form>
          <Link className="btn btn-p btn-sm" href="/seller/products/new">
            <Fi s="plus" />
            Ajouter un produit
          </Link>
        </div>
      </div>
      {list.length ? (
        <div className="panel tbl-w">
          <table className="tbl rsp">
            <thead>
              <tr>
                <th>Produit</th>
                <th>Prix</th>
                <th>Stock</th>
                <th>Ventes 14 j</th>
                <th>Vendus</th>
                <th>Statut</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {list.map((p) => {
                const st = statusOf(s, p);
                const stk = stockTotal(p);
                const why = whyOf(s, p.id);
                const A = optsOf(p);
                return (
                  <tr key={p.id}>
                    <td>
                      <Link className="s-prod" href={`/seller/products/${p.id}`}>
                        <Ph icon={p.icon} tint={p.tint} cls="mini" img={productImage(p.id, 120)} alt={p.n} />
                        <span>
                          <b>{p.n}</b>
                          <span className="cap">
                            {catBy(p.cat)?.n} › {p.sub}
                            {A.length ? ` · ${combos(A).length} variantes` : ""}
                          </span>
                          {why ? <span className="cap err-t">{why}</span> : null}
                        </span>
                      </Link>
                    </td>
                    <td data-l="Prix" className="tnum">
                      {htg(p.price)}
                      {p.was ? (
                        <>
                          <br />
                          <s className="cap">{htg(p.was)}</s>
                        </>
                      ) : null}
                    </td>
                    <td data-l="Stock" className={`tnum${stk <= 3 ? " low" : ""}`}>
                      {stk}
                    </td>
                    <td data-l="Ventes 14 j" className="spk-c">
                      {st === "active" ? <VzSpark v={walk(14, hs(p.id), 10, 6, 0.01)} c={VZC.a} /> : <span className="cap">—</span>}
                    </td>
                    <td data-l="Vendus" className="tnum">
                      {p.sold}
                    </td>
                    <td data-l="Statut">
                      <PTag s={pStatus(s, p)} />
                    </td>
                    <td className="acts-c">
                      <Link className="ib" href={`/seller/products/${p.id}`} title="Modifier" aria-label="Modifier">
                        <Fi r="pen-to-square" />
                      </Link>
                      {st === "active" ? (
                        <>
                          <a className="ib" href={`${BUYER_URL}/p/${p.id}`} title="Voir côté acheteur" aria-label="Voir côté acheteur">
                            <Fi r="eye" />
                          </a>
                          <button
                            className="ib"
                            title="Archiver"
                            aria-label="Archiver"
                            onClick={() => {
                              setProductStatus(p.id, "archived");
                              toast.show("Produit archivé : il n'est plus visible");
                            }}
                          >
                            <Fi s="box-archive" />
                          </button>
                        </>
                      ) : null}
                      {st === "archived" ? (
                        <button
                          className="ib"
                          title="Réactiver"
                          aria-label="Réactiver"
                          onClick={() => {
                            setProductStatus(p.id, "active");
                            toast.show("Produit réactivé", "success");
                          }}
                        >
                          <Fi s="rotate-left" />
                        </button>
                      ) : null}
                      <button className="ib" title="Dupliquer" aria-label="Dupliquer" onClick={() => dup(p.id)}>
                        <Fi r="copy" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyBox icon={<Fi s="box" />} t="Aucun produit ici" p="Ajoutez un produit ou changez d'onglet.">
          <Link className="btn btn-p" href="/seller/products/new">
            Ajouter un produit
          </Link>
        </EmptyBox>
      )}
    </>
  );
}

export default function Page() {
  return (
    <Suspense>
      <Products />
    </Suspense>
  );
}
