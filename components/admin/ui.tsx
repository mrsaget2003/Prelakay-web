"use client";

// Éléments partagés de la console : modale de décision (motif + commentaire), étiquettes KYC et litiges.

import { useState } from "react";
import { useModal } from "@/components/proto/modal";

function DecisionForm({ label, opts, onOk }: { label: string; opts: string[]; onOk: (m: string, c: string) => void }) {
  const [m, setM] = useState(opts[0]);
  const [c, setC] = useState("");
  return (
    <>
      <div className="fl">
        <label className="lbl" htmlFor="dm">
          {label}
        </label>
        <select className="field" id="dm" value={m} onChange={(e) => setM(e.target.value)}>
          {opts.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      </div>
      <div className="fl">
        <label className="lbl" htmlFor="dc">
          Commentaire (envoyé avec la décision)
        </label>
        <textarea className="field" id="dc" rows={2} value={c} onChange={(e) => setC(e.target.value)} />
      </div>
      <button className="btn btn-p btn-block" onClick={() => onOk(m, c.trim())}>
        Confirmer
      </button>
    </>
  );
}

/** decide(titre, libellé, motifs, action) — modale « decide » du prototype. */
export function useDecide() {
  const modal = useModal();
  return (title: string, label: string, opts: string[], onOk: (m: string, c: string) => void) =>
    modal.open(
      title,
      <DecisionForm
        label={label}
        opts={opts}
        onOk={(m, c) => {
          modal.close();
          onOk(m, c);
        }}
      />,
    );
}

export const KST: Record<string, [string, string]> = { recu: ["tag-warn", "Reçu"], verif: ["tag-new", "En vérification"], ok: ["tag-ok", "Approuvé"], rej: ["tag-err", "Rejeté"] };
export function KTag({ st }: { st: string }) {
  return <span className={`tag ${KST[st][0]}`}>{KST[st][1]}</span>;
}
export const DST: Record<string, [string, string]> = { open: ["tag-warn", "Chez le store (48 h)"], escalated: ["tag-err", "À trancher"], done: ["tag-ok", "Résolu"] };
export function ADTag({ st }: { st: string }) {
  return <span className={`tag ${DST[st][0]}`}>{DST[st][1]}</span>;
}
