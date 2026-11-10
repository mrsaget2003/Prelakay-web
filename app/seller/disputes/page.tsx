"use client";

// Retours et litiges — sDisputes du prototype (liste).

import Link from "next/link";
import { useDemo } from "@/lib/demo/store";
import { sellerDisputes } from "@/lib/demo/sellerActions";
import { SHead } from "@/components/seller/shell";
import { DTag } from "@/components/seller/ui";
import { EmptyBox, Fi } from "@/components/proto/ui";

export default function Disputes() {
  const s = useDemo();
  const D = sellerDisputes(s);
  return (
    <>
      <SHead title="Retours et litiges" crumb={[["Commandes", "/seller/orders"], ["Retours et litiges"]]} />
      {D.length ? (
        <div className="panel tbl-w">
          <table className="tbl rsp">
            <thead>
              <tr>
                <th>Litige</th>
                <th>Commande</th>
                <th>Motif</th>
                <th>Échéance</th>
                <th>Statut</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {D.map((d) => (
                <tr key={d.id}>
                  <td>
                    <b>{d.id}</b>
                  </td>
                  <td data-l="Commande">
                    {d.order} · {d.buyer}
                  </td>
                  <td data-l="Motif">{d.why}</td>
                  <td data-l="Échéance">{d.st === "open" ? d.due : "—"}</td>
                  <td data-l="Statut">
                    <DTag st={d.st} short />
                  </td>
                  <td>
                    <Link className="btn btn-o btn-sm" href={`/seller/disputes/${d.id}`}>
                      Ouvrir
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyBox icon={<Fi s="scale-balanced" />} t="Aucun litige" p="Tant mieux ! Les signalements des acheteurs arrivent ici." />
      )}
    </>
  );
}
