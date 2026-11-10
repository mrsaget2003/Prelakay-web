"use client";

// Politique de retour — sPolicy du prototype : délai (3 jours minimum), cas acceptés, précisions.

import { useRouter } from "next/navigation";
import { useState } from "react";
import { demo } from "@/lib/demo/store";
import { savePolicy } from "@/lib/demo/sellerActions";
import { useToast } from "@/components/ui/Toast";
import { SHead } from "@/components/seller/shell";
import { Fi } from "@/components/proto/ui";

const CASES: [string, string][] = [["nc", "Article non conforme"], ["dmg", "Article endommagé"], ["miss", "Article manquant"], ["other", "Changement d'avis (article neuf, étiquette)"]];

export default function Policy() {
  const router = useRouter();
  const toast = useToast();
  const [P] = useState(() => demo.get().seller.policy ?? { days: 3, other: false, txt: "" });
  const [days, setDays] = useState(P.days);
  const [other, setOther] = useState(P.other);
  const [txt, setTxt] = useState(P.txt);
  return (
    <>
      <SHead title="Politique de retour" crumb={[["Mon store", "/seller/store"], ["Politique de retour"]]} />
      <div className="panel" style={{ maxWidth: 720 }}>
        <div className="info-box" style={{ marginBottom: 16 }}>
          <Fi s="circle-info" />
          <span>Règle Prélakay : l&apos;acheteur peut signaler un problème pendant 3 jours après le retrait. Remboursement toujours sur le wallet.</span>
        </div>
        <div className="fl">
          <label className="lbl" htmlFor="pd">
            Délai de retour
          </label>
          <select className="field" id="pd" value={days} onChange={(e) => setDays(+e.target.value)}>
            {[3, 5, 7].map((d) => (
              <option key={d} value={d}>
                {d} jours après le retrait{d === 3 ? " (minimum)" : ""}
              </option>
            ))}
          </select>
        </div>
        <div className="fl">
          <span className="lbl">Cas acceptés</span>
          {CASES.map(([k, l]) => (
            <label className="ck" key={k}>
              <input type="checkbox" id={`pc-${k}`} checked={k === "other" ? other : true} disabled={k !== "other"} onChange={(e) => k === "other" && setOther(e.target.checked)} />
              {l}
              {k !== "other" ? <span className="cap"> (obligatoire)</span> : null}
            </label>
          ))}
        </div>
        <div className="fl">
          <label className="lbl" htmlFor="ptx">
            Précisions (facultatif)
          </label>
          <textarea className="field" id="ptx" rows={3} placeholder="Ex. : échange possible en magasin" value={txt} onChange={(e) => setTxt(e.target.value)} />
        </div>
        <button
          className="btn btn-p"
          onClick={() => {
            savePolicy(days, other, txt);
            toast.show("Politique de retour enregistrée", "success");
            router.push("/seller");
          }}
        >
          Enregistrer la politique
        </button>
      </div>
    </>
  );
}
