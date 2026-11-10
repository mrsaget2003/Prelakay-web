"use client";

// Commandes de la plateforme — aOrders du prototype (liste, 60 premières).

import Link from "next/link";
import { useState } from "react";
import { storeBy } from "@/lib/data/mock/seed";
import { useDemo } from "@/lib/demo/store";
import { allOrders } from "@/lib/demo/admin";
import { formatHTG as htg } from "@/lib/format";
import { AHead } from "@/components/admin/shell";
import { OTag } from "@/components/proto/tags";

const TABS: [string, string][] = [["all", "Toutes"], ["received", "Reçues"], ["prep", "En préparation"], ["ready", "Prêtes"], ["done", "Retirées"], ["expired", "Non retirées"], ["cancelled", "Annulées"]];

export default function Orders() {
  const s = useDemo();
  const [tab, setTab] = useState("all");
  const list = allOrders(s).filter((o) => tab === "all" || o.status === tab);
  return (
    <>
      <AHead title="Commandes" crumb={[["Commandes"]]} />
      <div className="panel s-tools">
        <div className="otabs">
          {TABS.map(([k, l]) => (
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
              <th>Commande</th>
              <th>Acheteur</th>
              <th>Store</th>
              <th>Total</th>
              <th>Statut</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {list.slice(0, 60).map((o) => (
              <tr key={o.id + o.store}>
                <td data-l="Commande">
                  <b>{o.id}</b>
                  <br />
                  <span className="cap">{o.date}</span>
                </td>
                <td data-l="Acheteur">{o.buyer}</td>
                <td data-l="Store">{storeBy(o.store)?.n}</td>
                <td data-l="Total" className="tnum">
                  {htg(o.total)}
                </td>
                <td data-l="Statut">
                  <OTag s={o.status} />
                </td>
                <td>
                  <Link className="btn btn-o btn-sm" href={`/admin/orders/${o.id}`}>
                    Ouvrir
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
