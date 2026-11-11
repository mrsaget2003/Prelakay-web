"use client";

// Enregistrer son commerce — pageSell du prototype (02-app-flow §2.2) : formulaire KYC,
// puis suivi Reçu → En vérification → Approuvé / Rejeté (motif), checklist « Prêt à vendre ».

import Link from "next/link";
import { useState } from "react";
import { KYC_TIMELINE, READY_TO_SELL } from "@/lib/data/mock/content";
import { validateKyc } from "@/lib/domain/kyc";
import { ageOn } from "@/lib/domain/kyc";
import { demo, useDemo } from "@/lib/demo/store";
import { useToast } from "@/components/ui/Toast";
import { AccLayout } from "@/components/proto/account";
import { DataIcon, Fi, IdPhoto, NeedLogin } from "@/components/proto/ui";

const TODAY = new Date(2026, 10, 6); // date de démonstration du prototype

function KycForm() {
  const toast = useToast();
  const [f, setF] = useState({ fn: "", ln: "", dob: "", nif: "", ninu: "" });
  const [files, setFiles] = useState({ recto: false, verso: false });
  const [err, setErr] = useState("");
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF((x) => ({ ...x, [k]: e.target.value }));
  const send = () => {
    const e = validateKyc({ ...f, files: +files.recto + +files.verso }, TODAY);
    if (e) return setErr(e);
    demo.update((d) => {
      d.kycData = { fn: f.fn.trim(), ln: f.ln.trim(), dob: f.dob, age: ageOn(f.dob, TODAY), nif: f.nif.trim(), ninu: f.ninu.trim(), date: "6 nov. 2026" };
      d.kyc = "recu";
    });
    toast.show("Dossier envoyé", "success");
  };
  const file = (k: "recto" | "verso", label: string) => (
    <IdPhoto label={label} on={files[k]} onPick={(on) => setFiles((x) => ({ ...x, [k]: on }))} />
  );
  return (
    <div className="panel">
      <h3>Vendez sur Prélakay</h3>
      <p className="muted" style={{ marginBottom: 14 }}>Vos informations servent seulement à vérifier votre identité. Elles ne sont jamais publiées.</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" }}>
        <div className="fl">
          <label className="lbl" htmlFor="k1">Prénom</label>
          <input className="field" id="k1" value={f.fn} onChange={set("fn")} />
        </div>
        <div className="fl">
          <label className="lbl" htmlFor="k2">Nom</label>
          <input className="field" id="k2" value={f.ln} onChange={set("ln")} />
        </div>
      </div>
      <div className="fl">
        <label className="lbl" htmlFor="k3">Date de naissance</label>
        <input className="field" id="k3" type="date" value={f.dob} onChange={set("dob")} />
        <span className="cap">Vous devez avoir au moins 18 ans.</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" }}>
        <div className="fl">
          <label className="lbl" htmlFor="k4">NIF</label>
          <input className="field" id="k4" inputMode="numeric" value={f.nif} onChange={set("nif")} />
        </div>
        <div className="fl">
          <label className="lbl" htmlFor="k5">NINU</label>
          <input className="field" id="k5" inputMode="numeric" value={f.ninu} onChange={set("ninu")} />
        </div>
      </div>
      <div className="fl">
        <label className="lbl">Pièce d&apos;identité (recto et verso)</label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {file("recto", "Recto")}
          {file("verso", "Verso")}
        </div>
      </div>
      <div className="err-box" style={{ display: err ? "flex" : "none", marginBottom: 12 }}>
        <Fi s="circle-exclamation" />
        <span>{err}</span>
      </div>
      <button className="btn btn-p btn-block" onClick={send}>
        Envoyer mon dossier
      </button>
    </div>
  );
}

export default function SellPage() {
  const s = useDemo();
  if (!s.logged) return <NeedLogin what="Enregistrer son commerce" next="/sell" />;
  let inner;
  if (s.kyc === "rej")
    inner = (
      <div className="panel">
        <h3>Votre dossier</h3>
        <div className="err-box" style={{ marginBottom: 14 }}>
          <Fi s="circle-exclamation" />
          <span>
            <b>Dossier refusé.</b> Motif : {s.kycWhy || "non précisé"}
          </span>
        </div>
        <p className="muted" style={{ marginBottom: 14 }}>Corrigez les éléments indiqués, puis renvoyez votre dossier.</p>
        <button className="btn btn-p" onClick={() => demo.update((d) => { d.kyc = null; d.kycWhy = null; })}>
          Corriger et renvoyer
        </button>
      </div>
    );
  else if (s.kyc) {
    const lv = { recu: 0, verif: 1, ok: 2 }[s.kyc];
    inner = (
      <>
        <div className="panel">
          <h3>Votre dossier</h3>
          <div className="tl kyc-st">
            {KYC_TIMELINE.map(([icon, label], i) => (
              <div key={label} className={i <= lv ? "ok" : ""}>
                <span>
                  <DataIcon cls={icon} />
                </span>
                {label}
              </div>
            ))}
          </div>
          <div className="info-box">
            <Fi s="circle-info" />
            <span>{lv < 2 ? "Les admins examinent votre dossier. Vous serez prévenu par l'app, WhatsApp et e-mail." : "Dossier approuvé. Votre espace vendeur est ouvert."}</span>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
            {lv < 2 ? (
              <button className="btn btn-s btn-sm" onClick={() => demo.update((d) => { d.kyc = d.kyc === "recu" ? "verif" : "ok"; })}>
                Prototype : étape suivante
              </button>
            ) : (
              <Link className="btn btn-p btn-sm" href="/seller">
                Ouvrir l&apos;espace vendeur
              </Link>
            )}
          </div>
        </div>
        {lv === 2 ? (
          <div className="panel">
            <h3>Prêt à vendre</h3>
            {READY_TO_SELL.map(([icon, label]) => (
              <div className="txr" key={label}>
                <span className="ic">
                  <DataIcon cls={icon} />
                </span>
                <div className="t">
                  <b>{label}</b>
                </div>
                <span style={{ fontSize: 22, color: "var(--color-neutral-300)" }}>
                  <Fi r="circle" />
                </span>
              </div>
            ))}
          </div>
        ) : null}
      </>
    );
  } else inner = <KycForm />;
  return (
    <AccLayout k="sell" title="Enregistrer son commerce">
      {inner}
    </AccLayout>
  );
}
