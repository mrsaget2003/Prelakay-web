"use client";

// Litige — aDisputes(r.sub) du prototype : versions de l'acheteur et du store, preuves,
// décision (rembourser, partiel, raison au store, reprendre la main), règles.

import { useParams } from "next/navigation";
import { useState } from "react";
import { prodBy, storeBy } from "@/lib/data/mock/seed";
import { productImage } from "@/lib/data/mock/images";
import { demo, useDemo } from "@/lib/demo/store";
import { allDisputes, disputeDecide, orderAt } from "@/lib/demo/admin";
import { formatHTG as htg } from "@/lib/format";
import { useToast } from "@/components/ui/Toast";
import { AHead, useMe } from "@/components/admin/shell";
import { ADTag } from "@/components/admin/ui";
import { DisputeThread } from "@/components/admin/DisputeThread";
import { Fi, Page404, Ph } from "@/components/proto/ui";

export default function AdminDispute() {
  const { id } = useParams<{ id: string }>();
  const s = useDemo();
  const me = useMe();
  const toast = useToast();
  const [amt, setAmt] = useState("");
  const d = allDisputes(s).find((x) => x.id === decodeURIComponent(id));
  const o = d ? orderAt(s, d.order) : undefined;
  if (!d || !o) return <Page404 />;
  const p = prodBy(o.items[0].p)!;
  const st = storeBy(o.store)!;
  const S2 = s.admin.settings;
  const dec = (v: "buyer" | "part" | "store" | "esc") => {
    const err = disputeDecide(me, d.id, v, parseInt(amt.replace(/\D/g, ""), 10));
    if (err) return toast.show(err, "error");
    toast.show(v === "esc" ? "Vous avez la main sur ce litige" : allDisputes(demo.get()).find((x) => x.id === d.id)?.decision ?? "Décision enregistrée", "success");
  };
  return (
    <>
      <AHead title={`Litige ${d.id}`} crumb={[["Litiges", "/admin/disputes"], [d.id]]} />
      <div className="s-grid2 wide">
        <div>
          <div className="panel">
            <div className="ph-h">
              <h2>{d.why}</h2>
              <ADTag st={d.st} />
            </div>
            <div className="s-orow st">
              <Ph icon={p.icon} tint={p.tint} cls="mini" img={productImage(p.id, 120)} alt={p.n} />
              <span>
                <b>{p.n}</b>
                <span className="cap">
                  {o.id} · {htg(o.total)} · {st.n}
                </span>
              </span>
            </div>
            <div className="hr" />
            <h3 style={{ marginBottom: 6 }}>Acheteur {d.buyer}</h3>
            <p>{d.txt || "(aucun texte)"}</p>
            {d.photo ? (
              <div className="rv-ph">
                <Ph icon={<Fi r="image" />} tint="g1" />
                <Ph icon={<Fi r="image" />} tint="g5" />
              </div>
            ) : (
              <p className="cap">Pas de photo.</p>
            )}
            <div className="hr" />
            <h3 style={{ marginBottom: 6 }}>Store {st.n}</h3>
            <p>{d.reply || (d.st === "open" ? `Pas encore de réponse (délai : ${d.due}).` : "Le store conteste la demande.")}</p>
          </div>
          <DisputeThread id={d.id} me={me} open={d.st !== "done"} />
          <div className="panel">
            <h2 className="ph-t">Preuves</h2>
            <div className="lrow st">
              <Fi s="qrcode" />
              <span>
                Retrait validé par code
                <span className="cap" style={{ display: "block" }}>
                  {o.picked || o.date} · {st.n}
                </span>
              </span>
              <span className="tag tag-ok">Vérifié</span>
            </div>
            <div className="lrow st">
              <Fi r="comment-dots" />
              <span>
                Messages entre l&apos;acheteur et le store
                <span className="cap" style={{ display: "block" }}>
                  2 messages · consultables par l&apos;admin
                </span>
              </span>
            </div>
            <div className="lrow st">
              <Fi s="lock" />
              <span>
                Paiement du store
                <span className="cap" style={{ display: "block" }}>
                  Bloqué en escrow pendant l&apos;examen
                </span>
              </span>
            </div>
          </div>
        </div>
        <div>
          {d.st !== "done" ? (
            <div className="panel">
              <h3>Décision</h3>
              <button className="opt" onClick={() => dec("buyer")}>
                <Fi s="rotate-left" className="big" />
                <span>
                  <b>Rembourser l&apos;acheteur</b>
                  <small>{htg(o.total)} sur son wallet</small>
                </span>
              </button>
              <div className="opt" style={{ flexWrap: "wrap" }}>
                <Fi s="percent" className="big" />
                <span style={{ flex: 1 }}>
                  <b>Remboursement partiel</b>
                </span>
                <div className="row-b" style={{ width: "100%", margin: "6px 0 0 38px" }}>
                  <input className="field" id="adpart" inputMode="numeric" placeholder="Montant (HTG)" aria-label="Montant du remboursement partiel (HTG)" style={{ maxWidth: 160, height: 36 }} value={amt} onChange={(e) => setAmt(e.target.value)} />
                  <button className="btn btn-o btn-sm" onClick={() => dec("part")}>
                    Appliquer
                  </button>
                </div>
              </div>
              <button className="opt" onClick={() => dec("store")}>
                <Fi s="store" className="big" />
                <span>
                  <b>Donner raison au store</b>
                  <small>Le paiement est libéré</small>
                </span>
              </button>
              {d.st === "open" ? (
                <button className="btn btn-o btn-sm btn-block" style={{ marginTop: 6 }} onClick={() => dec("esc")}>
                  Prendre la main maintenant
                </button>
              ) : null}
            </div>
          ) : (
            <div className="info-box">
              <Fi s="circle-check" />
              <span>Litige résolu{d.decision ? ` : ${d.decision}` : ""}.</span>
            </div>
          )}
          <div className="panel">
            <h3>Règles</h3>
            <ul className="rules">
              <li>Litige ouvert dans les {S2.disputeDays} jours après le retrait.</li>
              <li>Photo obligatoire si non conforme ou endommagé.</li>
              <li>Le store a {S2.storeReply} h pour répondre, sinon escalade automatique.</li>
              <li>Remboursement uniquement sur le wallet.</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}

