"use client";

// Suivi de livraison acheteur (spec §6) : livreur, code de livraison, position simulée
// sur le plan des quartiers des Cayes (la PWA livreur est hors périmètre).

import { useState } from "react";
import { ZONES } from "@/lib/charts/adminData";
import { storeBy } from "@/lib/data/mock/seed";
import { validateDelivery } from "@/lib/demo/actions";
import type { Order } from "@/lib/demo/store";
import { FieldErr, Fi } from "./ui";

/** Point de départ du store sur le plan : Centre-ville (les stores pilotes y sont regroupés). */
const START = ZONES[0];

export function DeliveryTrack({ o }: { o: Order }) {
  const [code, setCode] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const st = storeBy(o.store)!;
  const dest = ZONES.find((z) => z[0] === o.addr?.zone) ?? ZONES[1];
  const t = Math.max(0, Math.min(100, o.track ?? 0)) / 100;
  const x = START[1] + (dest[1] - START[1]) * t;
  const y = START[2] + (dest[2] - START[2]) * t;
  const enroute = o.status === "enroute";
  return (
    <div className="dl-card">
      <div className="dl-h">
        <div>
          <h3>{enroute ? "Votre commande est en route" : "Remise au livreur"}</h3>
          <p className="cap">
            {o.driver ? (
              <>
                {o.driver.n} ·{" "}
                <a className="lk" href={`tel:+509${o.driver.tel.replace(/\s/g, "")}`}>
                  <Fi s="phone" /> {o.driver.tel}
                </a>
              </>
            ) : (
              "Un livreur va prendre la commande."
            )}
          </p>
        </div>
        <div className="dl-code" aria-label="Code de livraison">
          <small>Code de livraison</small>
          <b className="tnum">{(o.code ?? "").replace(/(\d{3})(\d{3})/, "$1 $2")}</b>
        </div>
      </div>
      <div className="vz-map dl-map" role="img" aria-label={`Livraison de ${st.n} vers ${dest[0]} : ${Math.round(t * 100)} % du trajet`}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <line x1={START[1]} y1={START[2]} x2={dest[1]} y2={dest[2]} />
        </svg>
        <span className="dl-pt from" style={{ left: `${START[1]}%`, top: `${START[2]}%` }} title={st.n}>
          <Fi s="store" />
        </span>
        <span className="dl-pt to" style={{ left: `${dest[1]}%`, top: `${dest[2]}%` }} title={dest[0]}>
          <Fi s="house" />
        </span>
        <span className="dl-pt me" style={{ left: `${x}%`, top: `${y}%` }}>
          <Fi s="truck" />
        </span>
        <span className="vz-mnote">Position simulée · {o.addr?.zone}</span>
      </div>
      {enroute ? (
        <form
          className="dl-f"
          onSubmit={(e) => {
            e.preventDefault();
            setErr(validateDelivery(o.id, code || (o.code ?? "")));
          }}
        >
          <p className="cap">À l&apos;arrivée, donnez ce code au livreur. Démo : le livreur le saisit ici.</p>
          <div className="cp">
            <input className="field" inputMode="numeric" aria-label="Code saisi par le livreur" placeholder={o.code} value={code} onChange={(e) => { setCode(e.target.value); setErr(null); }} />
            <button className="btn btn-p btn-sm">Valider la livraison</button>
          </div>
          <FieldErr msg={err} />
        </form>
      ) : null}
    </div>
  );
}
