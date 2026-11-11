"use client";

// Offres flash 24 h (ex-V1.x, actif dans le prototype) : le store de confiance propose un prix,
// Prélakay valide, l'offre dure 24 h.

import { useState } from "react";
import { useDemo } from "@/lib/demo/store";
import { myProducts, myStore } from "@/lib/demo/sellerActions";
import { proposeFlash } from "@/lib/demo/marketing";
import { basePrice, prodBy } from "@/lib/data/mock/seed";
import { formatHTG as htg } from "@/lib/format";
import { useToast } from "@/components/ui/Toast";
import { SHead } from "@/components/seller/shell";
import { Countdown } from "@/components/proto/Countdown";
import { EmptyBox, FieldErr, Fi } from "@/components/proto/ui";

const ST: Record<string, [string, string]> = { pending: ["tag-warn", "En validation"], live: ["tag-ok", "En ligne"], rej: ["tag-err", "Refusée"] };

export default function SellerFlash() {
  const s = useDemo();
  const toast = useToast();
  const st = myStore(s);
  const mine = myProducts(s);
  const [pid, setPid] = useState(mine[0]?.id ?? "");
  const [price, setPrice] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const list = s.marketing.flash.filter((f) => f.store === st.id);
  return (
    <>
      <SHead title="Offres flash 24 h" crumb={[["Marketing", "/seller/marketing"], ["Offres flash"]]} />
      {!st.trust ? (
        <div className="info-box" style={{ marginBottom: 12 }}>
          <Fi s="circle-info" />
          <span>Les offres flash sont réservées aux stores de confiance (seuil de points de confiance à confirmer).</span>
        </div>
      ) : null}
      <div className="s-grid2">
        <div className="panel">
          <h2 className="ph-t">Proposer une offre</h2>
          <form
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              const r = proposeFlash(st.id, pid, Number(price));
              setErr(r);
              if (!r) {
                setPrice("");
                toast.show("Offre envoyée à Prélakay pour validation", "success");
              }
            }}
          >
            <div className="fl">
              <label className="lbl" htmlFor="fl-p">Produit</label>
              <select className="field" id="fl-p" value={pid} onChange={(e) => setPid(e.target.value)}>
                {mine.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.n} · {htg(basePrice(p.id))}
                  </option>
                ))}
              </select>
            </div>
            <div className="fl">
              <label className="lbl" htmlFor="fl-x">Prix flash (HTG)</label>
              <input className="field" id="fl-x" inputMode="numeric" value={price} aria-invalid={err ? true : undefined} onChange={(e) => { setPrice(e.target.value); setErr(null); }} />
            </div>
            <FieldErr msg={err} />
            <button className="btn btn-p btn-block" disabled={!st.trust}>
              <Fi s="bolt" />
              Proposer l&apos;offre
            </button>
          </form>
        </div>
        <div className="panel">
          <h2 className="ph-t">Mes offres</h2>
          {list.length ? (
            list.map((f) => (
              <div className="lrow st" key={f.id}>
                <Fi s="bolt" />
                <span>
                  {prodBy(f.product)?.n}
                  <span className="cap" style={{ display: "block" }}>
                    {htg(f.price)} au lieu de {htg(basePrice(f.product))}
                  </span>
                </span>
                {f.st === "live" ? <Countdown ends={f.ends} /> : <span className={`tag ${ST[f.st][0]}`}>{ST[f.st][1]}</span>}
              </div>
            ))
          ) : (
            <EmptyBox icon={<Fi s="bolt" />} t="Aucune offre" p="Proposez un prix flash : Prélakay le met en avant 24 h sur l'accueil." />
          )}
        </div>
      </div>
    </>
  );
}
