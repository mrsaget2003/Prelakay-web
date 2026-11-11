"use client";

// Livraisons (10 nov. 2026, spec §6) : suivi des livraisons de la plateforme, affectation d'un
// livreur de démonstration (la PWA livreur est hors périmètre). Frais et règles : ⚠️ ouverts.

import { useState } from "react";
import { storeBy } from "@/lib/data/mock/seed";
import { useDemo } from "@/lib/demo/store";
import { assignDriver, deliveriesList } from "@/lib/demo/admin";
import { DEMO_DRIVERS } from "@/lib/demo/delivery";
import { formatHTG as htg } from "@/lib/format";
import { useToast } from "@/components/ui/Toast";
import { AHead, useMe } from "@/components/admin/shell";
import { OTag } from "@/components/proto/tags";
import { EmptyBox, Fi } from "@/components/proto/ui";

const TABS: [string, string][] = [["all", "Toutes"], ["prep", "À remettre"], ["handed", "Au livreur"], ["enroute", "En route"], ["delivered", "Livrées"]];

export default function Deliveries() {
  const s = useDemo();
  const me = useMe();
  const toast = useToast();
  const [tab, setTab] = useState("all");
  const all = deliveriesList(s);
  const list = all.filter((o) => tab === "all" || o.status === tab || (tab === "prep" && o.status === "received"));
  const live = all.filter((o) => o.status === "handed" || o.status === "enroute").length;
  return (
    <>
      <AHead title="Livraisons" crumb={[["Opérations"], ["Livraisons"]]} />
      <div className="info-box" style={{ marginBottom: 12 }}>
        <Fi s="truck" />
        <span>
          {live} livraison{live > 1 ? "s" : ""} en cours. Livreurs de démonstration ; frais, zones et paiement des livreurs à confirmer.
        </span>
      </div>
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
                <th>Commande</th>
                <th>Store</th>
                <th>Adresse</th>
                <th>Frais</th>
                <th>Statut</th>
                <th>Livreur</th>
              </tr>
            </thead>
            <tbody>
              {list.map((o) => {
                const done = o.status === "delivered" || o.status === "cancelled";
                return (
                  <tr key={o.id + o.store}>
                    <td data-l="Commande">
                      <b>{o.id}</b>
                      <br />
                      <span className="cap">
                        {o.buyer} · {o.date}
                      </span>
                    </td>
                    <td data-l="Store">{storeBy(o.store)?.n}</td>
                    <td data-l="Adresse">
                      {o.addr?.zone}
                      <br />
                      <span className="cap">{o.addr?.mark}</span>
                    </td>
                    <td data-l="Frais" className="tnum">
                      {htg(o.fee ?? 0)}
                    </td>
                    <td data-l="Statut">
                      <OTag s={o.status} />
                    </td>
                    <td data-l="Livreur">
                      {done ? (
                        o.driver?.n ?? "—"
                      ) : (
                        <select
                          className="field sm"
                          aria-label={`Livreur de ${o.id}`}
                          value={o.driver ? DEMO_DRIVERS.findIndex((d) => d.n === o.driver!.n) : -1}
                          onChange={(e) => {
                            const err = assignDriver(me, o.id, Number(e.target.value));
                            toast.show(err ?? `${DEMO_DRIVERS[Number(e.target.value)].n} affecté à ${o.id}`, err ? "error" : "success");
                          }}
                        >
                          <option value={-1} disabled>
                            Choisir
                          </option>
                          {DEMO_DRIVERS.map((d, i) => (
                            <option key={d.n} value={i}>
                              {d.n}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyBox icon={<Fi s="truck" />} t="Aucune livraison" p="Les commandes payées en livraison apparaissent ici." />
      )}
    </>
  );
}
