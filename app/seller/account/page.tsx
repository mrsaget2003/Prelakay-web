"use client";

// Compte et sécurité — sAccount du prototype : dossier KYC (données masquées), connexion, alertes.

import { useDemo } from "@/lib/demo/store";
import { SHead, BUYER_URL } from "@/components/seller/shell";
import { Fi } from "@/components/proto/ui";

const ALERTS: [string, string][] = [
  ["Nouvelle commande", "app, WhatsApp"],
  ["Acheteur arrivé / retrait validé", "app"],
  ["Nouvelle question ou nouvel avis", "app, e-mail"],
  ["Litige ouvert", "app, WhatsApp, e-mail"],
  ["Retrait de fonds", "app, e-mail"],
];

export default function Account() {
  const s = useDemo();
  return (
    <>
      <SHead title="Compte et sécurité" crumb={[["Compte"]]} />
      <div className="s-grid2">
        <div className="panel">
          <h2 className="ph-t">Dossier KYC</h2>
          <div className="lrow st">
            <Fi s="circle-check" className="ok-c" />
            <span>
              Identité vérifiée
              <span className="cap" style={{ display: "block" }}>
                Approuvé par l&apos;équipe Prélakay
              </span>
            </span>
            <span className="tag tag-ok">Approuvé</span>
          </div>
          <dl className="kv" style={{ marginTop: 12 }}>
            <dt>Titulaire</dt>
            <dd>{s.name}</dd>
            <dt>NIF</dt>
            <dd>•••• •••• (masqué)</dd>
            <dt>NINU</dt>
            <dd>•••• •••• (masqué)</dd>
            <dt>Pièce d&apos;identité</dt>
            <dd>Recto et verso reçus</dd>
          </dl>
          <p className="cap" style={{ marginTop: 12 }}>
            Ces informations ne sont jamais publiées.
          </p>
        </div>
        <div className="panel">
          <h2 className="ph-t">Connexion et alertes</h2>
          <div className="lrow st">
            <Fi r="envelope" />
            <span>marc@exemple.ht</span>
          </div>
          <a className="lrow" href={`${BUYER_URL}/settings/secu`}>
            <Fi s="lock" />
            <span>Mot de passe et connexion</span>
            <Fi s="chevron-right" />
          </a>
          {ALERTS.map(([t, c]) => (
            <label className="tgl" key={t}>
              <span>
                {t}
                <span className="cap" style={{ display: "block" }}>
                  {c}
                </span>
              </span>
              <input type="checkbox" defaultChecked />
              <i />
            </label>
          ))}
        </div>
      </div>
    </>
  );
}
