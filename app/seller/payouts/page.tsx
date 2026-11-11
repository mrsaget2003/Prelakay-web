"use client";

// Retraits — sPayouts du prototype : retirer vers son compte, moyen de retrait (modale),
// historique. Frais de retrait : à confirmer (point ouvert, CLAUDE.md).

import { useState } from "react";
import { useDemo } from "@/lib/demo/store";
import { requestPayout, savePayMethod, sellerFin } from "@/lib/demo/sellerActions";
import { formatHTG as htg } from "@/lib/format";
import { useToast } from "@/components/ui/Toast";
import { useModal } from "@/components/proto/modal";
import { SHead } from "@/components/seller/shell";
import { FieldErr, Fi } from "@/components/proto/ui";

const GW = ["MonCash", "NatCash", "Sogebank"];

function PayMethodForm({ onDone }: { onDone: () => void }) {
  const toast = useToast();
  const [t, setT] = useState(GW[0]);
  const [num, setNum] = useState("");
  const [err, setErr] = useState<string | null>(null);
  return (
    <>
      <div className="gw">
        {GW.map((x) => (
          <button key={x} className={t === x ? "on" : ""} aria-pressed={t === x} onClick={() => setT(x)}>
            <b>{x}</b>
            <small>Haïti</small>
          </button>
        ))}
      </div>
      <div className="fl" style={{ marginTop: 14 }}>
        <label className="lbl" htmlFor="pmn">
          Numéro de téléphone ou de compte
        </label>
        <input className="field" id="pmn" inputMode="numeric" placeholder="Ex. 3712 3456" value={num} aria-invalid={err ? true : undefined} onChange={(e) => { setNum(e.target.value); setErr(null); }} />
      </div>
      <FieldErr msg={err} />
      <p className="cap" style={{ marginBottom: 12 }}>
        Le titulaire doit être la personne vérifiée dans le KYC.
      </p>
      <button
        className="btn btn-p btn-block"
        onClick={() => {
          const n = num.replace(/\D/g, "");
          if (n.length < 6) return setErr("Numéro trop court.");
          savePayMethod(t, n);
          onDone();
          toast.show("Moyen de retrait enregistré", "success");
        }}
      >
        Enregistrer
      </button>
    </>
  );
}

export default function Payouts() {
  const s = useDemo();
  const toast = useToast();
  const modal = useModal();
  const [amt, setAmt] = useState("");
  const F = sellerFin(s);
  const pm = s.seller.payMethod;
  const L = s.seller.payouts.filter((x) => x.store === s.seller.store);
  const openPm = () => modal.open("Moyen de retrait", <PayMethodForm onDone={modal.close} />);
  const payout = () => {
    const err = requestPayout(parseInt(amt.replace(/\D/g, ""), 10), () => {});
    if (err) return toast.show(err, "error");
    setAmt("");
    toast.show("Retrait demandé", "success");
  };
  return (
    <>
      <SHead title="Retraits" crumb={[["Finances", "/seller/finance"], ["Retraits"]]} />
      <div className="s-grid2">
        <div className="panel">
          <h2 className="ph-t">Retirer vers votre compte</h2>
          <div className="fc-in">
            <small>Disponible</small>
            <b className="tnum">{htg(F.avail)}</b>
          </div>
          <div className="fl" style={{ marginTop: 14 }}>
            <label className="lbl" htmlFor="pam">
              Montant (HTG)
            </label>
            <input className="field" id="pam" inputMode="numeric" placeholder="Ex. 25 000" disabled={!pm} value={amt} onChange={(e) => setAmt(e.target.value)} />
          </div>
          <button className="btn btn-p btn-block" disabled={!pm} onClick={payout}>
            Demander le retrait
          </button>
          <p className="cap" style={{ marginTop: 8 }}>
            Traitement sous 24 h ouvrées. Frais de retrait : à confirmer.
          </p>
        </div>
        <div className="panel">
          <h2 className="ph-t">Moyen de retrait</h2>
          {pm ? (
            <div className="lrow st">
              <Fi s="building-columns" />
              <span>
                <b>{pm.t}</b>
                <span className="cap" style={{ display: "block" }}>
                  {pm.n}
                </span>
              </span>
              <button className="lk" onClick={openPm}>
                Modifier
              </button>
            </div>
          ) : (
            <>
              <div className="info-box">
                <Fi s="circle-info" />
                <span>Ajoutez un moyen de retrait pour recevoir vos ventes.</span>
              </div>
              <button className="btn btn-p btn-sm" style={{ marginTop: 12 }} onClick={openPm}>
                <Fi s="plus" />
                Ajouter un moyen de retrait
              </button>
            </>
          )}
        </div>
      </div>
      <div className="panel">
        <h2 className="ph-t">Historique des retraits</h2>
        {L.length ? (
          <div className="tbl-w">
            <table className="tbl rsp">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Vers</th>
                  <th>Statut</th>
                  <th className="r">Montant</th>
                </tr>
              </thead>
              <tbody>
                {L.map((x, i) => (
                  <tr key={i}>
                    <td>{x.date}</td>
                    <td data-l="Vers">{x.to}</td>
                    <td data-l="Statut">
                      <span className={`tag ${x.st === "Payé" ? "tag-ok" : "tag-warn"}`}>{x.st}</span>
                    </td>
                    <td data-l="Montant" className="r tnum">
                      {htg(x.amt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="muted">Aucun retrait pour l&apos;instant.</p>
        )}
      </div>
    </>
  );
}
