"use client";

// Candidatures de partenaires (CLAUDE.md 10 nov. 2026, spec §7) : paiement et livraison.
// Superadmin et Support voient tout ; Finance, les candidatures de paiement.

import Link from "next/link";
import { useState } from "react";
import { useDemo } from "@/lib/demo/store";
import { PARTNER_ST, partnersFor } from "@/lib/demo/partners";
import { AHead, useMe } from "@/components/admin/shell";
import { EmptyBox, Fi } from "@/components/proto/ui";

const TABS: [string, string][] = [["todo", "À traiter"], ["delivery", "Livraison"], ["payment", "Paiement"], ["done", "Traitées"]];

export default function Partners() {
  const s = useDemo();
  const me = useMe();
  const [tab, setTab] = useState("todo");
  const all = partnersFor(me.role, s);
  const list = all.filter((p) =>
    tab === "todo" ? ["recu", "verif", "docs"].includes(p.st) : tab === "done" ? ["ok", "rej"].includes(p.st) : p.kind === tab,
  );
  const tabs = me.role === "finance" ? TABS.filter(([k]) => k !== "delivery") : TABS;
  return (
    <>
      <AHead title="Partenaires" crumb={[["Validation"], ["Partenaires"]]} />
      <div className="panel s-tools">
        <div className="otabs">
          {tabs.map(([k, l]) => (
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
                <th>Dossier</th>
                <th>Candidat</th>
                <th>Type</th>
                <th>Reçu</th>
                <th>Statut</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {list.map((p) => (
                <tr key={p.id}>
                  <td data-l="Dossier">
                    <b>{p.id}</b>
                  </td>
                  <td data-l="Candidat">
                    {p.org ?? p.name}
                    <br />
                    <span className="cap">{p.org ? p.name : p.zone}</span>
                  </td>
                  <td data-l="Type">
                    <Fi s={p.kind === "delivery" ? "truck" : "wallet"} /> {p.kind === "delivery" ? "Livraison" : "Paiement"}
                  </td>
                  <td data-l="Reçu">{p.date}</td>
                  <td data-l="Statut">
                    <span className={`tag ${PARTNER_ST[p.st][0]}`}>{PARTNER_ST[p.st][1]}</span>
                  </td>
                  <td>
                    <Link className="btn btn-o btn-sm" href={`/admin/partners/${p.id}`}>
                      Ouvrir
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyBox icon={<Fi s="users" />} t="Aucune candidature" p="Les candidatures envoyées depuis les pages partenaires arrivent ici." />
      )}
    </>
  );
}
