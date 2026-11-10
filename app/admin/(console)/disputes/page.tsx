"use client";

// Litiges — aDisputes du prototype (liste) : à trancher, chez le store, résolus.

import Link from "next/link";
import { useState } from "react";
import { storeBy } from "@/lib/data/mock/seed";
import { useDemo } from "@/lib/demo/store";
import { allDisputes, type ADispute } from "@/lib/demo/admin";
import { AHead } from "@/components/admin/shell";
import { ADTag } from "@/components/admin/ui";
import { EmptyBox, Fi } from "@/components/proto/ui";

const TABS: [string, string][] = [["esc", "À trancher"], ["open", "Chez le store"], ["done", "Résolus"], ["all", "Tous"]];
const inTab = (t: string, d: ADispute) => t === "all" || (t === "esc" ? d.st === "escalated" : t === "open" ? d.st === "open" : d.st === "done");

export default function Disputes() {
  const s = useDemo();
  const [tab, setTab] = useState("esc");
  const D = allDisputes(s);
  const list = D.filter((d) => inTab(tab, d));
  return (
    <>
      <AHead title="Litiges" crumb={[["Litiges"]]} />
      <div className="panel s-tools">
        <div className="otabs">
          {TABS.map(([k, l]) => (
            <button key={k} className={tab === k ? "on" : ""} onClick={() => setTab(k)}>
              {l} ({D.filter((d) => inTab(k, d)).length})
            </button>
          ))}
        </div>
      </div>
      {list.length ? (
        <div className="panel tbl-w">
          <table className="tbl rsp">
            <thead>
              <tr>
                <th>Litige</th>
                <th>Commande</th>
                <th>Store</th>
                <th>Motif</th>
                <th>Statut</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {list.map((d) => (
                <tr key={d.id}>
                  <td data-l="Litige">
                    <b>{d.id}</b>
                  </td>
                  <td data-l="Commande">
                    {d.order}
                    <br />
                    <span className="cap">{d.buyer}</span>
                  </td>
                  <td data-l="Store">{storeBy(d.store)?.n ?? "—"}</td>
                  <td data-l="Motif">{d.why}</td>
                  <td data-l="Statut">
                    <ADTag st={d.st} />
                  </td>
                  <td>
                    <Link className={`btn btn-${d.st === "escalated" ? "p" : "o"} btn-sm`} href={`/admin/disputes/${d.id}`}>
                      Ouvrir
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyBox icon={<Fi s="scale-balanced" />} t="Aucun litige ici" />
      )}
    </>
  );
}
