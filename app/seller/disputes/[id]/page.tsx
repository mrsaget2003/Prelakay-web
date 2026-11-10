"use client";

// Détail d'un litige — sDisputes(r.sub) du prototype : motif, preuve, réponse du store
// (remboursement total, partiel, contestation) et règles.

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { prodBy } from "@/lib/data/mock/seed";
import { productImage } from "@/lib/data/mock/images";
import { useDemo } from "@/lib/demo/store";
import { openChat, orderById, resolveDispute, sellerDisputes } from "@/lib/demo/sellerActions";
import { formatHTG as htg } from "@/lib/format";
import { useToast } from "@/components/ui/Toast";
import { SHead } from "@/components/seller/shell";
import { DTag } from "@/components/proto/tags";
import { Fi, Page404, Ph } from "@/components/proto/ui";

export default function Dispute() {
  const { id } = useParams<{ id: string }>();
  const s = useDemo();
  const router = useRouter();
  const toast = useToast();
  const [amt, setAmt] = useState("");
  const d = sellerDisputes(s).find((x) => x.id === decodeURIComponent(id));
  const o = d ? orderById(s, d.order) : undefined;
  if (!d || !o) return <Page404 />;
  const p = prodBy(o.items[0].p)!;
  const res = (how: "full" | "part" | "esc") => {
    const err = resolveDispute(d.id, how, parseInt(amt.replace(/\D/g, ""), 10));
    if (err) return toast.show(err, "error");
    if (how === "esc") toast.show("Litige transmis à un admin Prélakay");
    else toast.show(how === "full" ? "Acheteur remboursé intégralement" : "Remboursement partiel envoyé", "success");
  };
  return (
    <>
      <SHead title={`Litige ${d.id}`} crumb={[["Commandes", "/seller/orders"], ["Retours et litiges", "/seller/disputes"], [d.id]]} />
      <div className="s-grid2 wide">
        <div>
          <div className="panel">
            <div className="ph-h">
              <h2>{d.why}</h2>
              <DTag st={d.st} />
            </div>
            {d.st === "open" ? (
              <div className="err-box" style={{ marginBottom: 12 }}>
                <Fi r="clock" />
                <span>Répondez avant le {d.due}. Sans réponse, le litige est transmis à un admin.</span>
              </div>
            ) : null}
            <div className="s-orow st">
              <Ph icon={p.icon} tint={p.tint} cls="mini" img={productImage(p.id, 120)} alt={p.n} />
              <span>
                <b>{p.n}</b>
                <span className="cap">
                  {d.order} · {d.buyer} · {htg(o.total)}
                </span>
              </span>
            </div>
            <div className="hr" />
            <p>
              <b>Message de l&apos;acheteur :</b> {d.txt || "(aucun texte)"}
            </p>
            {d.photo ? (
              <div className="rv-ph">
                <Ph icon={<Fi r="image" />} tint="g1" />
                <Ph icon={<Fi r="image" />} tint="g5" />
              </div>
            ) : null}
          </div>
          {d.st === "open" ? (
            <div className="panel">
              <h2 className="ph-t">Votre réponse</h2>
              <button className="opt" onClick={() => res("full")}>
                <Fi s="rotate-left" className="big" />
                <span>
                  <b>Rembourser intégralement</b>
                  <small>{htg(o.total)} recrédités sur le wallet de l&apos;acheteur</small>
                </span>
              </button>
              <div className="opt" style={{ flexWrap: "wrap" }}>
                <Fi s="percent" className="big" />
                <span style={{ flex: 1 }}>
                  <b>Proposer un remboursement partiel</b>
                  <small>L&apos;acheteur garde l&apos;article</small>
                </span>
                <div className="row-b" style={{ width: "100%", margin: "6px 0 0 38px" }}>
                  <input className="field" id="dpart" inputMode="numeric" placeholder="Montant (HTG)" aria-label="Montant du remboursement partiel (HTG)" style={{ maxWidth: 180, height: 36 }} value={amt} onChange={(e) => setAmt(e.target.value)} />
                  <button className="btn btn-o btn-sm" onClick={() => res("part")}>
                    Proposer
                  </button>
                </div>
              </div>
              <button className="opt" onClick={() => res("esc")}>
                <Fi s="scale-balanced" className="big" />
                <span>
                  <b>Contester</b>
                  <small>Un admin tranche avec la preuve de retrait, les photos et vos messages</small>
                </span>
              </button>
            </div>
          ) : null}
        </div>
        <div>
          <div className="panel">
            <h3>Règles</h3>
            <ul className="rules">
              <li>3 jours après le retrait pour ouvrir un litige.</li>
              <li>Photo obligatoire si non conforme ou endommagé.</li>
              <li>48 heures pour répondre.</li>
              <li>Remboursement toujours sur le wallet, jamais en espèces.</li>
              <li>Votre paiement reste bloqué pendant l&apos;examen.</li>
            </ul>
          </div>
          <div className="panel">
            <button className="btn btn-o btn-block" onClick={() => router.push(`/seller/messages/${openChat(d.buyer, d.order)}`)}>
              <Fi r="comment-dots" />
              Écrire à l&apos;acheteur
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
