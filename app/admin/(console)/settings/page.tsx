"use client";

// Paramètres de la plateforme — aSettings du prototype. Finance : lecture seule ; seul le
// Superadmin modifie. Commission, frais de restockage, Coins de bienvenue : [À CONFIRMER].

import { useState } from "react";
import { demo, type AdminSettings } from "@/lib/demo/store";
import { settingsSave } from "@/lib/demo/admin";
import { canEdit } from "@/lib/domain/admin";
import { useToast } from "@/components/ui/Toast";
import { AHead, useMe } from "@/components/admin/shell";
import { Fi } from "@/components/proto/ui";

type K = keyof AdminSettings;
const ESCROW: [string, K, string, string, string?][] = [
  ["se1", "escrow", "Libération du paiement", "jours", "Après le retrait, sans litige"],
  ["se2", "escrowTrust", "Libération pour un store de confiance", "heures"],
  ["se3", "hold", "Durée de garde en magasin", "jours", "Rappels à J+1 et J+2"],
  ["se4", "restock", "Frais de restockage", "HTG", "[À CONFIRMER]"],
  ["se5", "commission", "Commission Prélakay", "%", "[À CONFIRMER]"],
];
const COINS: [string, K, string, string, string?][] = [
  ["sc1", "coinsOrder", "Coins par commande retirée", "Coins"],
  ["sc2", "coinsReview", "Coins par avis vérifié", "Coins"],
  ["sc3", "coinsWelcome", "Coins de bienvenue", "Coins", "[À CONFIRMER] · 20 à 30 proposé"],
  ["sc4", "disputeDays", "Délai pour ouvrir un litige", "jours"],
  ["sc5", "storeReply", "Délai de réponse du store", "heures"],
];

export default function Settings() {
  const me = useMe();
  const toast = useToast();
  const ro = !canEdit(me.role, "settings");
  const [v, setV] = useState<AdminSettings>(() => demo.get().admin.settings);
  const field = ([id, k, l, unit, note]: [string, K, string, string, string?]) => (
    <div className="fl" key={id}>
      <label className="lbl" htmlFor={id}>
        {l}
      </label>
      <div className="unit">
        <input className="field" id={id} inputMode="numeric" placeholder="à confirmer" disabled={ro} value={v[k]} onChange={(e) => setV((x) => ({ ...x, [k]: e.target.value }))} />
        <span>{unit}</span>
      </div>
      {note ? <span className="cap">{note}</span> : null}
    </div>
  );
  return (
    <>
      <AHead title="Paramètres de la plateforme" crumb={[["Paramètres"]]} />
      {ro ? (
        <div className="info-box" style={{ marginBottom: 12 }}>
          <Fi s="lock" />
          <span>Lecture seule : seul un superadmin modifie ces valeurs.</span>
        </div>
      ) : null}
      <div className="s-grid2">
        <div className="panel">
          <h2 className="ph-t">Retrait et escrow</h2>
          {ESCROW.map(field)}
        </div>
        <div className="panel">
          <h2 className="ph-t">Coins, litiges, classement</h2>
          {COINS.map(field)}
          <div className="fl">
            <label className="lbl" htmlFor="sc6">
              Quota « Nouveaux sur Prélakay »
            </label>
            <div className="unit">
              <input className="field" id="sc6" disabled value={`1 sur ${v.quota}`} readOnly />
              <span>positions</span>
            </div>
          </div>
        </div>
      </div>
      {ro ? null : (
        <div className="pf-foot in">
          <button
            className="btn btn-p"
            onClick={() => {
              settingsSave(me, Object.fromEntries(Object.entries(v).map(([k, x]) => [k, String(x).trim()])) as AdminSettings);
              toast.show("Paramètres enregistrés", "success");
            }}
          >
            Enregistrer
          </button>
        </div>
      )}
    </>
  );
}
