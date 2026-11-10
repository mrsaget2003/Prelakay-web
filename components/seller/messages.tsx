"use client";

// Messagerie du store — sMessages du prototype : liste des conversations, fil, réponses rapides.

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useDemo } from "@/lib/demo/store";
import { markConvRead, sellerConvs, sendMessage } from "@/lib/demo/sellerActions";
import { SHead } from "@/components/seller/shell";
import { Fi } from "@/components/proto/ui";

const QUICK = ["Votre commande est prête.", "Merci pour votre achat !", "Oui, avec le code de retrait."];

export function SellerMessages({ cur: curId }: { cur: string | null }) {
  const s = useDemo();
  const C = sellerConvs(s);
  const cur = curId ? C.find((c) => c.id === curId) : undefined;
  const [txt, setTxt] = useState("");
  const inp = useRef<HTMLInputElement>(null);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (cur?.un) markConvRead(cur.id);
  }, [cur?.id, cur?.un]);
  const n = cur?.msgs.length ?? 0;
  useEffect(() => {
    if (box.current) box.current.scrollTop = box.current.scrollHeight;
  }, [n]);
  return (
    <>
      <SHead title="Messages" crumb={[["Messages"]]} />
      <div className={`panel msg${cur ? " has-cur" : ""}`}>
        <div className="ml">
          {C.length ? (
            C.map((c) => {
              const last = c.msgs[c.msgs.length - 1];
              return (
                <Link key={c.id} className={`mc${cur?.id === c.id ? " on" : ""}${c.un ? " un" : ""}`} href={`/seller/messages/${c.id}`}>
                  <span className="ava">{c.who[1].toUpperCase()}</span>
                  <span className="mc-t">
                    <b>{c.who}</b>
                    <span className="cap">{last ? last.t : "Nouvelle conversation"}</span>
                  </span>
                  <span className="cap">{last?.at ?? ""}</span>
                </Link>
              );
            })
          ) : (
            <p className="muted" style={{ padding: 16 }}>
              Aucune conversation.
            </p>
          )}
        </div>
        {cur ? (
          <div className="mt">
            <div className="mt-h">
              <Link className="ib mo" href="/seller/messages" aria-label="Retour">
                <Fi s="chevron-left" />
              </Link>
              <span className="ava">{cur.who[1].toUpperCase()}</span>
              <span>
                <b>{cur.who}</b>
                <span className="cap">
                  À propos de{" "}
                  <Link className="lk" href={`/seller/orders/${cur.order}`}>
                    {cur.order}
                  </Link>
                </span>
              </span>
            </div>
            <div className="mt-b" id="mtb" ref={box}>
              {cur.msgs.map((m, i) => (
                <div key={i} className={`bub${m.me ? " me" : ""}`}>
                  <p>{m.t}</p>
                  <span>{m.at}</span>
                </div>
              ))}
            </div>
            <div className="mt-q">
              {QUICK.map((t) => (
                <button
                  key={t}
                  className="chip"
                  onClick={() => {
                    setTxt(t);
                    inp.current?.focus();
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
            <form
              className="mt-f"
              onSubmit={(e) => {
                e.preventDefault();
                const v = txt.trim();
                if (!v) return;
                sendMessage(cur.id, v);
                setTxt("");
                inp.current?.focus();
              }}
            >
              <input ref={inp} placeholder="Écrire un message" aria-label="Message" autoComplete="off" value={txt} onChange={(e) => setTxt(e.target.value)} />
              <button className="btn btn-p btn-sm" aria-label="Envoyer">
                <Fi s="paper-plane" />
              </button>
            </form>
          </div>
        ) : (
          <div className="mt empty-t d-only">
            <Fi r="comments" />
            <p className="muted">Choisissez une conversation.</p>
          </div>
        )}
      </div>
    </>
  );
}
