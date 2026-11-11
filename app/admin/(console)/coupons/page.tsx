"use client";

// Coupons de la plateforme (ex-V1.x activé dans le prototype) : tous les coupons, désactivation.

import { storeBy } from "@/lib/data/mock/seed";
import { useDemo } from "@/lib/demo/store";
import { DEMO_TODAY, allCoupons, setCouponOn, usedOf } from "@/lib/demo/coupons";
import { formatHTG as htg } from "@/lib/format";
import { AHead } from "@/components/admin/shell";

export default function AdminCoupons() {
  const s = useDemo();
  const list = allCoupons(s);
  return (
    <>
      <AHead title="Coupons" crumb={[["Contenu"], ["Coupons"]]} />
      <div className="panel tbl-w">
        <table className="tbl rsp">
          <thead>
            <tr>
              <th>Code</th>
              <th>Store</th>
              <th>Réduction</th>
              <th>Utilisés</th>
              <th>Validité</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {list.map((c) => {
              const expired = DEMO_TODAY > c.to;
              return (
                <tr key={c.code}>
                  <td data-l="Code">
                    <b className="tnum">{c.code}</b>
                  </td>
                  <td data-l="Store">{c.store ? storeBy(c.store)?.n : "Prélakay (tous les stores)"}</td>
                  <td data-l="Réduction">
                    −{c.pct} %{c.min ? ` dès ${htg(c.min)}` : ""}
                  </td>
                  <td data-l="Utilisés" className="tnum">
                    {usedOf(s, c.code)} / {c.stock}
                  </td>
                  <td data-l="Validité">{expired ? <span className="tag tag-err">Expiré</span> : `${c.from} → ${c.to}`}</td>
                  <td>
                    {expired ? null : (
                      <button className="btn btn-o btn-sm" onClick={() => setCouponOn(c.code, !c.on)}>
                        {c.on ? "Désactiver" : "Réactiver"}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
