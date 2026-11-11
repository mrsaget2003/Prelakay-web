"use client";

// Programme ambassadeurs étudiants (ex-V1.x, actif dans le prototype) : candidature, puis lien
// de parrainage récompensé en Coins.

import Link from "next/link";
import { useState } from "react";
import { useDemo } from "@/lib/demo/store";
import { REFERRAL_COINS, applyAmbassador } from "@/lib/demo/growth";
import { Crumb } from "@/components/proto/legal";
import { FieldErr, Fi, NeedLogin } from "@/components/proto/ui";

const STEPS: [string, string][] = [
  ["Candidature", "Indiquez votre école ou université aux Cayes."],
  ["Validation", "L'équipe Prélakay valide votre profil."],
  ["Partage", "Partagez votre lien sur le campus et sur WhatsApp."],
  ["Coins", `${REFERRAL_COINS} Coins pour chaque inscrit qui passe sa première commande.`],
];

export default function Ambassadors() {
  const s = useDemo();
  const [school, setSchool] = useState("");
  const [err, setErr] = useState<string | null>(null);
  if (!s.logged) return <NeedLogin what="Le programme ambassadeurs" next="/ambassadeurs" />;
  const a = s.growth.amb;
  return (
    <div className="wrap pt">
      <Crumb items={[["Ambassadeurs étudiants"]]} />
      <section className="pt-hero">
        <div>
          <h1>Ambassadeurs étudiants</h1>
          <p>Faites découvrir Prélakay sur votre campus et gagnez des Coins à chaque nouvel acheteur.</p>
        </div>
        <span className="pt-hi" aria-hidden="true">
          <Fi s="user-plus" />
        </span>
      </section>
      <ol className="pt-steps" style={{ marginBottom: 24 }}>
        {STEPS.map(([t, p], i) => (
          <li key={t}>
            <span className="pt-n">{i + 1}</span>
            <b>{t}</b>
            <p>{p}</p>
          </li>
        ))}
      </ol>
      <div className="panel">
        {a ? (
          <div className="pt-done" role="status">
            <span className="pt-ok">
              <Fi s={a.st === "rej" ? "circle-exclamation" : "circle-check"} />
            </span>
            <h3>{a.st === "ok" ? "Vous êtes ambassadeur" : a.st === "rej" ? "Candidature refusée" : "Candidature reçue"}</h3>
            <p>{a.school}</p>
            {a.st === "ok" ? (
              <Link className="btn btn-p" href="/invite">
                Mon lien de parrainage
              </Link>
            ) : null}
          </div>
        ) : (
          <form
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              setErr(applyAmbassador(school));
            }}
          >
            <div className="fl">
              <label className="lbl" htmlFor="amb-s">École ou université</label>
              <input className="field" id="amb-s" value={school} aria-invalid={err ? true : undefined} onChange={(e) => { setSchool(e.target.value); setErr(null); }} />
            </div>
            <FieldErr msg={err} />
            <button className="btn btn-p btn-block">Devenir ambassadeur</button>
          </form>
        )}
      </div>
    </div>
  );
}
