"use client";

// Utilisateurs — aUsers du prototype (liste) : tous, actifs, bannis.

import Link from "next/link";
import { useState } from "react";
import { useDemo } from "@/lib/demo/store";
import { usersList } from "@/lib/demo/admin";
import { formatHTG as htg } from "@/lib/format";
import { AHead } from "@/components/admin/shell";

export default function Users() {
  const s = useDemo();
  const [tab, setTab] = useState("all");
  const list = usersList(s).filter((u) => tab === "all" || (tab === "banned" ? u.st === "banned" : u.st !== "banned"));
  return (
    <>
      <AHead title="Utilisateurs" crumb={[["Utilisateurs"]]} />
      <div className="panel s-tools">
        <div className="otabs">
          {[
            ["all", "Tous"],
            ["act", "Actifs"],
            ["banned", "Bannis"],
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
              <th>Utilisateur</th>
              <th>Ville</th>
              <th>Commandes</th>
              <th>Wallet</th>
              <th>Statut</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {list.map((u) => (
              <tr key={u.u}>
                <td data-l="Utilisateur">
                  <b>{u.u}</b>
                  {u.me ? <span className="tag tag-new"> Démo</span> : null}
                  <br />
                  <span className="cap">{u.name}</span>
                </td>
                <td data-l="Ville">{u.city}</td>
                <td data-l="Commandes">{u.orders}</td>
                <td data-l="Wallet" className="tnum">
                  {htg(u.wallet)}
                </td>
                <td data-l="Statut">{u.st === "banned" ? <span className="tag tag-err">Banni</span> : <span className="tag tag-ok">Actif</span>}</td>
                <td>
                  <Link className="btn btn-o btn-sm" href={`/admin/users/${encodeURIComponent(u.u.slice(1))}`}>
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
