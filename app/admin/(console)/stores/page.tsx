"use client";

// Stores — aStores du prototype (liste) : tous, actifs, de confiance, suspendus.

import Link from "next/link";
import { useState } from "react";
import { STORES } from "@/lib/data/mock/seed";
import { storeImage } from "@/lib/data/mock/images";
import { useDemo } from "@/lib/demo/store";
import { storeState } from "@/lib/demo/admin";
import { formatCount } from "@/lib/format";
import { AHead } from "@/components/admin/shell";
import { Ph, fr1 } from "@/components/proto/ui";

export default function Stores() {
  const s = useDemo();
  const [tab, setTab] = useState("all");
  const L = STORES.map((x) => storeState(s, x.id));
  const list = L.filter((x) => tab === "all" || (tab === "susp" ? x.suspended : tab === "trust" ? x.trust : !x.suspended));
  return (
    <>
      <AHead title="Stores" crumb={[["Stores"]]} />
      <div className="panel s-tools">
        <div className="otabs">
          {[
            ["all", `Tous (${STORES.length})`],
            ["act", "Actifs"],
            ["trust", "De confiance"],
            ["susp", "Suspendus"],
          ].map(([k, l]) => (
            <button key={k} className={tab === k ? "on" : ""} onClick={() => setTab(k)}>
              {l}
            </button>
          ))}
        </div>
      </div>
      <div className="panel tbl-w">
        <table className="tbl rsp">
          <thead>
            <tr>
              <th>Store</th>
              <th>Type</th>
              <th>Note</th>
              <th>Ventes</th>
              <th>Statut</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {list.map((x) => (
              <tr key={x.id}>
                <td data-l="Store">
                  <Link className="s-prod" href={`/admin/stores/${x.id}`}>
                    <Ph icon={x.i} tint="g4" cls="sav" img={storeImage(x.id, 120)} alt={x.n} />
                    <span>
                      <b>{x.n}</b>
                      <span className="cap">{x.addr.split(",")[0]}</span>
                    </span>
                  </Link>
                </td>
                <td data-l="Type">{x.type === "physique" ? "Physique" : "En ligne"}</td>
                <td data-l="Note">{x.rate ? fr1(x.rate) : "—"}</td>
                <td data-l="Ventes" className="tnum">
                  {formatCount(x.sold)}
                </td>
                <td data-l="Statut">
                  {x.suspended ? <span className="tag tag-err">Suspendu</span> : <span className="tag tag-ok">Actif</span>}
                  {x.trust ? <span className="tag tag-new"> Confiance</span> : null}
                </td>
                <td>
                  <Link className="btn btn-o btn-sm" href={`/admin/stores/${x.id}`}>
                    Gérer
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
