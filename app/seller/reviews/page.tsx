"use client";

// Avis — sReviews du prototype : note du store, filtres, réponse publique (modale).

import { useState } from "react";
import { useDemo } from "@/lib/demo/store";
import { myStore, replyReview, sellerReviews } from "@/lib/demo/sellerActions";
import { useToast } from "@/components/ui/Toast";
import { useModal } from "@/components/proto/modal";
import { SHead, BUYER_URL } from "@/components/seller/shell";
import { FieldErr, Fi, Ph, Stars, fr1 } from "@/components/proto/ui";

function ReplyForm({ k, onDone }: { k: string; onDone: () => void }) {
  const toast = useToast();
  const [t, setT] = useState("");
  const [err, setErr] = useState<string | null>(null);
  return (
    <>
      <p className="cap" style={{ marginBottom: 10 }}>
        Votre réponse est publique, sous l&apos;avis.
      </p>
      <div className="fl">
        <label className="lbl" htmlFor="rp">
          Votre réponse
        </label>
        <textarea className="field" id="rp" rows={3} value={t} aria-invalid={err ? true : undefined} onChange={(e) => { setT(e.target.value); setErr(null); }} />
      </div>
      <FieldErr msg={err} />
      <button
        className="btn btn-p btn-block"
        onClick={() => {
          if (!t.trim()) return setErr("Écrivez une réponse.");
          replyReview(k, t.trim());
          onDone();
          toast.show("Réponse publiée", "success");
        }}
      >
        Publier la réponse
      </button>
    </>
  );
}

export default function Reviews() {
  const s = useDemo();
  const modal = useModal();
  const [tab, setTab] = useState("all");
  const R = sellerReviews(s);
  const st = myStore(s);
  const L = R.filter((x) => tab === "all" || (tab === "todo" && !x.reply) || (tab === "low" && x.st <= 3));
  return (
    <>
      <SHead title="Avis" crumb={[["Avis et questions"], ["Avis"]]} />
      <div className="fin">
        <div className="panel fc">
          <small>Note du store</small>
          <b>{st.rate ? fr1(st.rate) : "—"} / 5</b>
          <span className="stars">
            <Stars r={st.rate || 0} />
          </span>
        </div>
        <div className="panel fc">
          <small>Avis</small>
          <b>{R.length}</b>
          <span className="cap">Uniquement des achats retirés</span>
        </div>
        <div className="panel fc">
          <small>Sans réponse</small>
          <b>{R.filter((x) => !x.reply).length}</b>
          <span className="cap">Répondre améliore la confiance</span>
        </div>
      </div>
      <div className="panel">
        <div className="pills">
          {[
            ["all", "Tous"],
            ["todo", "Sans réponse"],
            ["low", "3 ★ et moins"],
          ].map(([k, l]) => (
            <button key={k} className={`chip ${tab === k ? "on" : ""}`} aria-pressed={tab === k} onClick={() => setTab(k)}>
              {l}
            </button>
          ))}
        </div>
        {L.length ? (
          L.map((x) => (
            <article className="rv" key={x.k}>
              <div className="rv-h">
                <span className="ava">{x.who[1].toUpperCase()}</span>
                <div>
                  <b>{x.who}</b>
                  <span className="cap">
                    {x.date} ·{" "}
                    <a className="lk" href={`${BUYER_URL}/p/${x.p.id}`}>
                      {x.p.n}
                    </a>
                  </span>
                </div>
                <span className="stars">
                  <Stars r={x.st} />
                </span>
              </div>
              <p>{x.t}</p>
              {x.photo ? (
                <div className="rv-ph">
                  <Ph icon={<Fi r="image" />} tint="g1" />
                </div>
              ) : null}
              {x.reply ? (
                <div className="reply">
                  <b>Votre réponse :</b> {x.reply}
                </div>
              ) : (
                <button className="btn btn-o btn-sm" onClick={() => modal.open("Répondre à l'avis", <ReplyForm k={x.k} onDone={modal.close} />)}>
                  Répondre
                </button>
              )}
            </article>
          ))
        ) : (
          <p className="muted" style={{ padding: "16px 0" }}>
            Aucun avis dans ce filtre.
          </p>
        )}
      </div>
    </>
  );
}
