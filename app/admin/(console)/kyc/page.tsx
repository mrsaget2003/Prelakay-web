"use client";

// Dossiers KYC — aKyc du prototype (liste).

import Link from "next/link";
import { useState } from "react";
import { catBy } from "@/lib/data/mock/seed";
import { useDemo } from "@/lib/demo/store";
import { kycList } from "@/lib/demo/admin";
import { AHead } from "@/components/admin/shell";
import { KTag } from "@/components/admin/ui";
import { EmptyBox, Fi } from "@/components/proto/ui";

const TABS: [string, string][] = [["todo", "À traiter"], ["ok", "Approuvés"], ["rej", "Rejetés"], ["all", "Tous"]];

export default function Kyc() {
  const s = useDemo();
  const [tab, setTab] = useState("todo");
  const list = kycList(s).filter((k) => tab === "all" || (tab === "todo" ? k.st === "recu" || k.st === "verif" : k.st === tab));
  return (
    <>
      <AHead title="Dossiers KYC" crumb={[["Dossiers KYC"]]} />
      <div className="panel s-tools">
        <div className="otabs">
          {TABS.map(([k, l]) => (
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
                <th>Demandeur</th>
                <th>Store</th>
                <th>Reçu</th>
                <th>Statut</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {list.map((k) => (
                <tr key={k.id}>
                  <td data-l="Dossier">
                    <b>{k.id}</b>
                    {k.mine ? <span className="tag tag-new"> Vous</span> : null}
                    {k.flag ? (
                      <span title={k.flag}>
                        {" "}
                        <Fi s="triangle-exclamation" className="err-t" label={k.flag} />
                      </span>
                    ) : null}
                  </td>
                  <td data-l="Demandeur">
                    {k.fn} {k.ln}
                  </td>
                  <td data-l="Store">
                    {k.store}
                    <br />
                    <span className="cap">{catBy(k.cat)?.n}</span>
                  </td>
                  <td data-l="Reçu">{k.date}</td>
                  <td data-l="Statut">
                    <KTag st={k.st} />
                  </td>
                  <td>
                    <Link className="btn btn-o btn-sm" href={`/admin/kyc/${k.id}`}>
                      Ouvrir
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyBox icon={<Fi s="id-card" />} t="Aucun dossier ici" />
      )}
    </>
  );
}
