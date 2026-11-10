"use client";

// Questions — sQuestions du prototype : réponses publiques sur la fiche produit.

import { useState } from "react";
import { useDemo } from "@/lib/demo/store";
import { answerQuestion, sellerQuestions } from "@/lib/demo/sellerActions";
import { useToast } from "@/components/ui/Toast";
import { SHead, BUYER_URL } from "@/components/seller/shell";
import { Fi } from "@/components/proto/ui";

export default function Questions() {
  const s = useDemo();
  const toast = useToast();
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const Q = sellerQuestions(s);
  const publish = (k: string) => {
    const t = (drafts[k] ?? "").trim();
    if (!t) return toast.show("Écrivez une réponse.", "error");
    answerQuestion(k, t);
    toast.show("Réponse publiée sur la fiche produit", "success");
  };
  return (
    <>
      <SHead title="Questions" crumb={[["Avis et questions"], ["Questions"]]} />
      <div className="info-box" style={{ marginBottom: 12 }}>
        <Fi s="circle-info" />
        <span>Vos réponses sont publiques sur la fiche produit et aident les autres acheteurs.</span>
      </div>
      <div className="panel">
        {Q.length ? (
          Q.map((x) => (
            <div className="sq" key={x.k}>
              <div className="rv-h">
                <span className="ava">{x.who[1].toUpperCase()}</span>
                <div>
                  <b>{x.q}</b>
                  <span className="cap">
                    {x.who} · {x.date} ·{" "}
                    <a className="lk" href={`${BUYER_URL}/p/${x.p.id}`}>
                      {x.p.n}
                    </a>
                  </span>
                </div>
                {x.a ? <span className="tag tag-ok">Répondu</span> : <span className="tag tag-warn">À répondre</span>}
              </div>
              {x.a ? (
                <div className="reply">
                  <b>Votre réponse :</b> {x.a}
                </div>
              ) : (
                <form
                  className="sq-f"
                  onSubmit={(e) => {
                    e.preventDefault();
                    publish(x.k);
                  }}
                >
                  <input className="field" placeholder="Votre réponse publique" aria-label="Votre réponse" value={drafts[x.k] ?? ""} onChange={(e) => setDrafts((d) => ({ ...d, [x.k]: e.target.value }))} />
                  <button className="btn btn-p btn-sm">Publier</button>
                </form>
              )}
            </div>
          ))
        ) : (
          <p className="muted">Aucune question.</p>
        )}
      </div>
    </>
  );
}
