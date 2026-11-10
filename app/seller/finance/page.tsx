"use client";

// Solde et escrow — sFinance du prototype : 4 cartes, graphiques, transactions filtrables.

import Link from "next/link";
import { useState } from "react";
import { useDemo } from "@/lib/demo/store";
import { myStore, sellerFin, sellerOrders } from "@/lib/demo/sellerActions";
import { formatHTG as htg } from "@/lib/format";
import { SHead } from "@/components/seller/shell";
import { SellerFinanceCharts } from "@/components/seller/charts";

const TABS: [string, string][] = [["all", "Toutes"], ["esc", "En escrow"], ["rel", "Libérées"], ["out", "Retraits"]];
const TAG: Record<string, string> = { Libéré: "tag-ok", Retrait: "tag-neu", "En escrow": "tag-new" };

export default function Finance() {
  const s = useDemo();
  const [tab, setTab] = useState("all");
  const F = sellerFin(s);
  const st = myStore(s);
  let tx: [string, string, string, number][] = [
    ...sellerOrders(s)
      .filter((o) => o.status !== "received")
      .map((o): [string, string, string, number] => [
        o.status === "done" ? (o.rel ? "Libéré" : "En escrow") : o.status === "expired" ? "Restockage" : o.status === "cancelled" ? "Remboursé" : "En escrow",
        `${o.id} · ${o.buyer}`,
        o.date,
        o.status === "cancelled" ? 0 : o.total,
      ]),
    ...s.seller.payouts.filter((x) => x.store === s.seller.store).map((x): [string, string, string, number] => ["Retrait", x.to, x.date, -x.amt]),
  ];
  if (tab !== "all") tx = tx.filter((t) => (tab === "esc" ? t[0] === "En escrow" : tab === "rel" ? t[0] === "Libéré" : t[0] === "Retrait"));
  return (
    <>
      <SHead title="Solde et escrow" crumb={[["Finances"]]} />
      <div className="fin">
        <div className="panel fc dark">
          <small>Solde disponible</small>
          <b className="tnum">{htg(F.avail)}</b>
          <Link className="btn btn-p btn-sm" href="/seller/payouts">
            Retirer
          </Link>
        </div>
        <div className="panel fc">
          <small>En escrow</small>
          <b className="tnum">{htg(F.pending)}</b>
          <span className="cap">Libéré {st.trust ? "24 h" : "3 jours"} après chaque retrait, sans litige</span>
        </div>
        <div className="panel fc">
          <small>Déjà retiré</small>
          <b className="tnum">{htg(F.paid)}</b>
          <span className="cap">Vers {s.seller.payMethod ? s.seller.payMethod.t : "aucun moyen enregistré"}</span>
        </div>
        <div className="panel fc">
          <small>Commission Prélakay</small>
          <b>—</b>
          <span className="cap">Taux à confirmer</span>
        </div>
      </div>
      <SellerFinanceCharts />
      <div className="panel">
        <div className="ph-h">
          <h2>Transactions</h2>
          <div className="seg">
            {TABS.map(([k, l]) => (
              <button key={k} className={tab === k ? "on" : ""} onClick={() => setTab(k)}>
                {l}
              </button>
            ))}
          </div>
        </div>
        {tx.length ? (
          <div className="tbl-w">
            <table className="tbl rsp">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Détail</th>
                  <th>Date</th>
                  <th className="r">Montant</th>
                </tr>
              </thead>
              <tbody>
                {tx.map((t, i) => (
                  <tr key={i}>
                    <td>
                      <span className={`tag ${TAG[t[0]] ?? "tag-err"}`}>{t[0]}</span>
                    </td>
                    <td data-l="Détail">{t[1]}</td>
                    <td data-l="Date">{t[2]}</td>
                    <td data-l="Montant" className={`r tnum${t[3] < 0 ? "" : " pos"}`}>
                      {t[3] < 0 ? "−" : "+"}
                      {htg(Math.abs(t[3]))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="muted">Aucune transaction.</p>
        )}
      </div>
    </>
  );
}
