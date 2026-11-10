"use client";

// Store de confiance — sTrust du prototype. Formule exacte du Store Health Score : point ouvert
// (CLAUDE.md) ; les seuils restent « à confirmer ».

import { useDemo } from "@/lib/demo/store";
import { myStore } from "@/lib/demo/sellerActions";
import { hs } from "@/lib/demo/seller";
import { SHead } from "@/components/seller/shell";
import { Fi, fr1 } from "@/components/proto/ui";

export default function Trust() {
  const s = useDemo();
  const st = myStore(s);
  const h = hs(st.id);
  const C: [string, string, string][] = [
    ["Taux de retrait", `${90 + (h % 9)} %`, "≥ seuil à confirmer"],
    ["Note moyenne", `${fr1(st.rate || 0)} / 5`, "≥ 4,5 proposé"],
    ["Préparation", `En moyenne ${2 + (h % 5)} h`, "≤ seuil à confirmer"],
    ["Litiges perdus", String(h % 2), "0 sur 90 jours proposé"],
    ["Ancienneté", `Depuis ${st.since}`, "à confirmer"],
  ];
  return (
    <>
      <SHead title="Store de confiance" crumb={[["Mon store", "/seller/store"], ["Store de confiance"]]} />
      <div className="s-grid2">
        <div className={`panel trust-c${st.trust ? " on" : ""}`}>
          <span className="sg-i">
            <Fi s="circle-check" />
          </span>
          <h2>{st.trust ? "Vous êtes Store de confiance" : "Pas encore Store de confiance"}</h2>
          <p className="muted">{st.trust ? "Votre badge est visible sur votre store et vos produits." : "Les critères exacts (Store Health Score) sont à confirmer. Voici où vous en êtes."}</p>
        </div>
        <div className="panel">
          <h3>Avantages</h3>
          <ul className="rules">
            <li>Paiement libéré 24 h après le retrait (au lieu de 3 jours).</li>
            <li>Badge « Store de confiance » sur le store et les produits.</li>
            <li>Accès prioritaire aux offres flash (V1.x).</li>
          </ul>
        </div>
      </div>
      <div className="panel">
        <h2 className="ph-t">Critères</h2>
        <div className="tbl-w">
          <table className="tbl">
            <thead>
              <tr>
                <th>Critère</th>
                <th>Votre store</th>
                <th>Objectif</th>
              </tr>
            </thead>
            <tbody>
              {C.map((c) => (
                <tr key={c[0]}>
                  <td>{c[0]}</td>
                  <td>
                    <b>{c[1]}</b>
                  </td>
                  <td className="cap">{c[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
