"use client";

// Connexion / inscription par téléphone + code SMS (ex-V2, active dans le prototype).
// Démonstration : le code s'affiche dans un encadré « Démo » au lieu d'être envoyé par SMS.

import { useState } from "react";
import { demo } from "@/lib/demo/store";
import { demoOtp, normalizeHtPhone, otpOk } from "@/lib/domain/phone";
import { FieldErr, Fi } from "./ui";

export function PhoneAuth({ mode, onDone }: { mode: "login" | "link"; onDone: () => void }) {
  const [step, setStep] = useState<"num" | "code">("num");
  const [raw, setRaw] = useState("");
  const [code, setCode] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const tel = normalizeHtPhone(raw);
  if (step === "num")
    return (
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          if (!tel) return setErr("Numéro haïtien à 8 chiffres.");
          setErr(null);
          setStep("code");
        }}
      >
        <div className="fl">
          <label className="lbl" htmlFor="ph-n">Numéro de téléphone</label>
          <div className="ph-in">
            <span>+509</span>
            <input className="field" id="ph-n" inputMode="tel" autoComplete="tel-national" placeholder="3712 3456" value={raw} aria-invalid={err ? true : undefined} onChange={(e) => { setRaw(e.target.value); setErr(null); }} />
          </div>
        </div>
        <FieldErr msg={err} />
        <button className="btn btn-p btn-block">Recevoir le code par SMS</button>
      </form>
    );
  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        if (!tel || !otpOk(tel, code)) return setErr("Code incorrect.");
        demo.update((s) => {
          s.phone = tel;
          if (mode === "login") s.logged = true;
        });
        onDone();
      }}
    >
      <p className="cap" style={{ marginBottom: 10 }}>
        Code envoyé au +509 {tel?.replace(/(\d{4})(\d{4})/, "$1 $2")}.{" "}
        <button type="button" className="lk" onClick={() => setStep("num")}>
          Modifier
        </button>
      </p>
      <div className="info-box" style={{ marginBottom: 12 }}>
        <Fi s="circle-info" />
        <span>
          Démo : votre code est <b className="tnum">{tel ? demoOtp(tel) : ""}</b> (aucun SMS n&apos;est envoyé).
        </span>
      </div>
      <div className="fl">
        <label className="lbl" htmlFor="ph-c">Code à 6 chiffres</label>
        <input className="field" id="ph-c" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} aria-invalid={err ? true : undefined} onChange={(e) => { setCode(e.target.value); setErr(null); }} />
      </div>
      <FieldErr msg={err} />
      <button className="btn btn-p btn-block">{mode === "login" ? "Continuer" : "Relier ce numéro"}</button>
    </form>
  );
}
