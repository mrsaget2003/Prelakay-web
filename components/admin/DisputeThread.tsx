"use client";

// Dispute Center complet (ex-V1.x, actif dans le prototype) : fil du litige, message à l'acheteur
// ou au store, demande de pièces. Chaque action est journalisée.

import { useState } from "react";
import { useDemo } from "@/lib/demo/store";
import { disputeMessage, disputeRequest, disputeThread, type Me } from "@/lib/demo/admin";
import { FieldErr, Fi } from "@/components/proto/ui";

const WHO = { admin: "Prélakay", buyer: "Acheteur", store: "Store" } as const;

export function DisputeThread({ id, me, open }: { id: string; me: Me; open: boolean }) {
  const s = useDemo();
  const [to, setTo] = useState<"buyer" | "store">("store");
  const [t, setT] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const th = disputeThread(s, id);
  return (
    <div className="panel">
      <h2 className="ph-t">Fil du litige</h2>
      <ol className="dt">
        {th.map((m, i) => (
          <li key={i} className={`dt-${m.from}${m.kind === "request" ? " req" : ""}`}>
            <b>
              {WHO[m.from]}
              {m.to ? ` → ${WHO[m.to].toLowerCase()}` : ""}
              {m.who ? ` · ${m.who}` : ""}
            </b>
            <span className="cap"> · {m.at}</span>
            <p>
              {m.kind === "request" ? <Fi s="upload" /> : null} {m.t}
            </p>
          </li>
        ))}
      </ol>
      {open ? (
        <form
          className="dt-f"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            const r = disputeMessage(me, id, to, t);
            setErr(r);
            if (!r) setT("");
          }}
        >
          <div className="otabs sm" role="group" aria-label="Destinataire">
            <button type="button" className={to === "store" ? "on" : ""} aria-pressed={to === "store"} onClick={() => setTo("store")}>
              Au store
            </button>
            <button type="button" className={to === "buyer" ? "on" : ""} aria-pressed={to === "buyer"} onClick={() => setTo("buyer")}>
              À l&apos;acheteur
            </button>
          </div>
          <label className="lbl" htmlFor="dt-t">Message</label>
          <textarea className="field" id="dt-t" rows={3} value={t} onChange={(e) => { setT(e.target.value); setErr(null); }} />
          <FieldErr msg={err} />
          <div className="row-b" style={{ marginTop: 8 }}>
            <button className="btn btn-p btn-sm">Envoyer</button>
            <button type="button" className="btn btn-o btn-sm" onClick={() => disputeRequest(me, id, to)}>
              Demander des pièces
            </button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
