"use client";

// Mettre en avant un produit (ex-V2, actif dans le prototype) : budget payé par le solde du store ;
// le produit apparaît « Sponsorisé » en tête des résultats (au plus 1 toutes les 4 positions).

import { useState } from "react";
import { useDemo } from "@/lib/demo/store";
import { myProducts, myStore, sellerFin } from "@/lib/demo/sellerActions";
import { boostProduct, stopBoost } from "@/lib/demo/marketing";
import { prodBy } from "@/lib/data/mock/seed";
import { formatHTG as htg } from "@/lib/format";
import { useToast } from "@/components/ui/Toast";
import { SHead } from "@/components/seller/shell";
import { EmptyBox, FieldErr, Fi } from "@/components/proto/ui";

export default function SellerBoost() {
  const s = useDemo();
  const toast = useToast();
  const st = myStore(s);
  const mine = myProducts(s);
  const [pid, setPid] = useState(mine[0]?.id ?? "");
  const [budget, setBudget] = useState("1000");
  const [err, setErr] = useState<string | null>(null);
  const list = s.marketing.boosts.filter((b) => b.store === st.id);
  const fin = sellerFin(s);
  return (
    <>
      <SHead title="Mettre en avant un produit" crumb={[["Marketing", "/seller/marketing"], ["Mise en avant"]]} />
      <div className="s-grid2">
        <div className="panel">
          <h2 className="ph-t">Nouveau boost</h2>
          <p className="cap" style={{ marginBottom: 10 }}>
            Solde disponible : <b className="tnum">{htg(fin.avail)}</b>. Tarif au clic ou à l&apos;affichage : à confirmer.
          </p>
          <form
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              const r = boostProduct(pid, Number(budget));
              setErr(r);
              if (!r) toast.show("Produit mis en avant dans les résultats", "success");
            }}
          >
            <div className="fl">
              <label className="lbl" htmlFor="bo-p">Produit</label>
              <select className="field" id="bo-p" value={pid} onChange={(e) => setPid(e.target.value)}>
                {mine.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.n}
                  </option>
                ))}
              </select>
            </div>
            <div className="fl">
              <label className="lbl" htmlFor="bo-b">Budget (HTG)</label>
              <input className="field" id="bo-b" inputMode="numeric" value={budget} aria-invalid={err ? true : undefined} onChange={(e) => { setBudget(e.target.value); setErr(null); }} />
            </div>
            <FieldErr msg={err} />
            <button className="btn btn-p btn-block">
              <Fi s="rocket" />
              Lancer le boost
            </button>
          </form>
        </div>
        <div className="panel">
          <h2 className="ph-t">Mes boosts</h2>
          {list.length ? (
            list.map((b) => (
              <div className="lrow st" key={b.id}>
                <Fi s="rocket" />
                <span>
                  {prodBy(b.product)?.n}
                  <span className="cap" style={{ display: "block" }}>Budget {htg(b.budget)}</span>
                </span>
                {b.on ? (
                  <button className="btn btn-o btn-sm" onClick={() => stopBoost(b.id)}>
                    Arrêter
                  </button>
                ) : (
                  <span className="tag tag-neu">Arrêté</span>
                )}
              </div>
            ))
          ) : (
            <EmptyBox icon={<Fi s="rocket" />} t="Aucun boost" p="Un produit boosté apparaît « Sponsorisé » en tête des résultats." />
          )}
        </div>
      </div>
    </>
  );
}
