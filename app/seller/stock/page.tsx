"use client";

// Stock et caractéristiques — sStock du prototype : stock par variante des produits actifs
// ou en modération, réglable au compteur ; Épuisé / Stock bas.

import Link from "next/link";
import { optsOf, stockFor } from "@/lib/data/mock/seed";
import { productImage } from "@/lib/data/mock/images";
import { useDemo } from "@/lib/demo/store";
import { adjustStock, myProducts, statusOf } from "@/lib/demo/sellerActions";
import { combos, comboKey, stockTotal } from "@/lib/demo/seller";
import { SHead } from "@/components/seller/shell";
import { Fi, Ph } from "@/components/proto/ui";

export default function Stock() {
  const s = useDemo();
  const L = myProducts(s).filter((p) => ["active", "mod"].includes(statusOf(s, p)));
  return (
    <>
      <SHead title="Stock et caractéristiques" crumb={[["Produits", "/seller/products"], ["Stock"]]} />
      <div className="info-box" style={{ marginBottom: 12 }}>
        <Fi s="circle-info" />
        <span>Le stock est suivi par variante. Une commande non retirée après 3 jours remet automatiquement l&apos;unité en stock.</span>
      </div>
      {L.map((p) => {
        const A = optsOf(p);
        const C = A.length ? combos(A) : [{}];
        return (
          <div className="panel" key={p.id}>
            <div className="ph-h">
              <Link className="s-prod" href={`/seller/products/${p.id}`}>
                <Ph icon={p.icon} tint={p.tint} cls="mini" img={productImage(p.id, 120)} alt={p.n} />
                <span>
                  <b>{p.n}</b>
                  <span className="cap">
                    {stockTotal(p)} en stock · {C.length} variante{C.length > 1 ? "s" : ""}
                  </span>
                </span>
              </Link>
            </div>
            <div className="tbl-w">
              <table className="tbl sm">
                <thead>
                  <tr>
                    <th>Variante</th>
                    <th>Stock</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {C.map((c) => {
                    const n = stockFor(p, c);
                    const k = comboKey(p, c);
                    return (
                      <tr key={k}>
                        <td>{A.length ? A.map((a) => c[a.k]).join(" · ") : "Modèle unique"}</td>
                        <td>
                          <span className="qty">
                            <button onClick={() => adjustStock(p, k, -1)} disabled={n <= 0} aria-label="Moins">
                              <Fi s="minus" />
                            </button>
                            <input value={n} readOnly aria-label="Stock" />
                            <button onClick={() => adjustStock(p, k, 1)} aria-label="Plus">
                              <Fi s="plus" />
                            </button>
                          </span>
                        </td>
                        <td>{n === 0 ? <span className="tag tag-err">Épuisé</span> : n <= 3 ? <span className="tag tag-warn">Stock bas</span> : null}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </>
  );
}
