"use client";

// Produits à modérer — aProducts du prototype (liste : à modérer, rejetés, nouveaux actifs).

import Link from "next/link";
import { useState } from "react";
import { catBy, storeBy } from "@/lib/data/mock/seed";
import { productImage } from "@/lib/data/mock/images";
import { useDemo } from "@/lib/demo/store";
import { modQueue, pStatusOf } from "@/lib/demo/admin";
import { whyOf } from "@/lib/demo/sellerActions";
import { formatHTG as htg } from "@/lib/format";
import { AHead } from "@/components/admin/shell";
import { EmptyBox, Fi, Ph } from "@/components/proto/ui";

export default function ModProducts() {
  const s = useDemo();
  const [tab, setTab] = useState("mod");
  const L = modQueue(s);
  const st = (p: (typeof L)[number]) => pStatusOf(s, p);
  const list = L.filter((p) => (tab === "active" ? st(p) === "active" && p.isNew : st(p) === tab)).slice(0, 40);
  const nMod = L.filter((p) => st(p) === "mod").length;
  return (
    <>
      <AHead title="Produits à modérer" crumb={[["Produits à modérer"]]} />
      <div className="panel s-tools">
        <div className="otabs">
          {[
            ["mod", `À modérer (${nMod})`],
            ["rejected", "Rejetés"],
            ["active", "Actifs"],
          ].map(([k, l]) => (
            <button key={k} className={tab === k ? "on" : ""} onClick={() => setTab(k)}>
              {l}
            </button>
          ))}
        </div>
      </div>
      {list.length ? (
        <div className="panel tbl-w">
          <table className="tbl rsp">
            <thead>
              <tr>
                <th>Produit</th>
                <th>Store</th>
                <th>Prix</th>
                <th>Envoyé</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {list.map((p) => {
                const why = whyOf(s, p.id);
                return (
                  <tr key={p.id}>
                    <td data-l="Produit">
                      <Link className="s-prod" href={`/admin/products/${p.id}`}>
                        <Ph icon={p.icon} tint={p.tint} cls="mini" img={productImage(p.id, 120)} alt={p.n} />
                        <span>
                          <b>{p.n}</b>
                          <span className="cap">{catBy(p.cat)?.n}</span>
                          {why ? <span className="cap err-t">{why}</span> : null}
                        </span>
                      </Link>
                    </td>
                    <td data-l="Store">{storeBy(p.store)?.n}</td>
                    <td data-l="Prix" className="tnum">
                      {htg(p.price)}
                    </td>
                    <td data-l="Envoyé">{p.submitted || "à l'instant"}</td>
                    <td>
                      <Link className={`btn btn-${st(p) === "mod" ? "p" : "o"} btn-sm`} href={`/admin/products/${p.id}`}>
                        {st(p) === "mod" ? "Examiner" : "Voir"}
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyBox icon={<Fi s="box" />} t="File vide" p="Aucun produit en attente." />
      )}
    </>
  );
}
