"use client";

// Events et offres flash (ex-V1.x, actif dans le prototype) : créer un event, valider les offres flash.

import { useState } from "react";
import { useDemo } from "@/lib/demo/store";
import { createEvent, eventsList, flashDecide } from "@/lib/demo/marketing";
import { basePrice, prodBy, storeBy } from "@/lib/data/mock/seed";
import { formatHTG as htg } from "@/lib/format";
import { useToast } from "@/components/ui/Toast";
import { AHead, useMe } from "@/components/admin/shell";
import { Countdown } from "@/components/proto/Countdown";
import { EmptyBox, FieldErr, Fi } from "@/components/proto/ui";

export default function AdminEvents() {
  const s = useDemo();
  const me = useMe();
  const toast = useToast();
  const [f, setF] = useState({ n: "", from: "2026-11-20", to: "2026-11-27", noCommission: true });
  const [err, setErr] = useState<string | null>(null);
  const flashes = s.marketing.flash;
  return (
    <>
      <AHead title="Events et flash-offers" crumb={[["Contenu"], ["Events et flash-offers"]]} />
      <div className="s-grid2">
        <div className="panel">
          <h2 className="ph-t">Offres flash</h2>
          {flashes.length ? (
            flashes.map((x) => (
              <div className="lrow st" key={x.id}>
                <Fi s="bolt" />
                <span>
                  {prodBy(x.product)?.n}
                  <span className="cap" style={{ display: "block" }}>
                    {storeBy(x.store)?.n} · {htg(x.price)} au lieu de {htg(basePrice(x.product))}
                  </span>
                </span>
                {x.st === "pending" ? (
                  <span style={{ display: "flex", gap: 6 }}>
                    <button className="btn btn-p btn-sm" onClick={() => { flashDecide(me, x.id, true); toast.show("Offre flash en ligne pour 24 h", "success"); }}>
                      Valider
                    </button>
                    <button className="btn btn-o btn-sm" onClick={() => flashDecide(me, x.id, false)}>
                      Refuser
                    </button>
                  </span>
                ) : x.st === "live" ? (
                  <Countdown ends={x.ends} />
                ) : (
                  <span className="tag tag-err">Refusée</span>
                )}
              </div>
            ))
          ) : (
            <EmptyBox icon={<Fi s="bolt" />} t="Aucune offre" p="Les stores de confiance proposent leurs offres flash depuis leur espace." />
          )}
        </div>
        <div className="panel">
          <h2 className="ph-t">Créer un event</h2>
          <form
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              const r = createEvent(me, f);
              if (!r.ok) return setErr(r.error);
              setErr(null);
              setF({ ...f, n: "" });
              toast.show(`Event ${r.id} créé : les stores peuvent participer`, "success");
            }}
          >
            <div className="fl">
              <label className="lbl" htmlFor="ev-n">Nom</label>
              <input className="field" id="ev-n" value={f.n} onChange={(e) => { setF({ ...f, n: e.target.value }); setErr(null); }} />
            </div>
            <div className="pt-grid">
              <div className="fl">
                <label className="lbl" htmlFor="ev-f">Début</label>
                <input className="field" id="ev-f" type="date" value={f.from} onChange={(e) => setF({ ...f, from: e.target.value })} />
              </div>
              <div className="fl">
                <label className="lbl" htmlFor="ev-t">Fin</label>
                <input className="field" id="ev-t" type="date" value={f.to} onChange={(e) => setF({ ...f, to: e.target.value })} />
              </div>
            </div>
            <label className="lrow st">
              <span>Sans commission pour les stores participants</span>
              <input type="checkbox" className="pf-chk" checked={f.noCommission} onChange={(e) => setF({ ...f, noCommission: e.target.checked })} />
            </label>
            <FieldErr msg={err} />
            <button className="btn btn-p btn-block">Créer l&apos;event</button>
          </form>
          <h3 style={{ marginTop: 18 }}>Events</h3>
          {eventsList(s).map((e) => (
            <div className="lrow st" key={e.id}>
              <Fi r="calendar" />
              <span>
                {e.n}
                <span className="cap" style={{ display: "block" }}>
                  {e.from} → {e.to} · {e.stores.length} store{e.stores.length > 1 ? "s" : ""}
                  {e.noCommission ? " · sans commission" : ""}
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
