"use client";

// Croissance (ex-V1.x / V2, actifs dans le prototype) : parrainages, ambassadeurs, abonnés Prélakay+.
// Anti-abus du parrainage : ⚠️ point ouvert, non implémenté.

import { useDemo } from "@/lib/demo/store";
import { PLUS_PRICE, REFERRAL_COINS, ambDecide } from "@/lib/demo/growth";
import { formatHTG as htg } from "@/lib/format";
import { AHead, useMe } from "@/components/admin/shell";
import { VzTile, VzTiles } from "@/components/charts/vz";
import { Fi } from "@/components/proto/ui";

/** Abonnés de démonstration (en plus de l'acheteur de démo s'il s'abonne). */
const DEMO_SUBSCRIBERS = 37;

export default function Growth() {
  const s = useDemo();
  const me = useMe();
  const done = s.growth.referrals.filter((r) => r.st === "done").length;
  const subs = DEMO_SUBSCRIBERS + (s.growth.plus ? 1 : 0);
  return (
    <>
      <AHead title="Croissance" crumb={[["Contenu"], ["Croissance"]]} />
      <VzTiles>
        <VzTile label="Parrainages terminés" value={String(done)} delta={null} />
        <VzTile label="Coins de parrainage versés" value={String(done * REFERRAL_COINS)} delta={null} />
        <VzTile label="Abonnés Prélakay+" value={String(subs)} delta={null} />
        <VzTile label="Revenu mensuel Prélakay+" value={htg(subs * PLUS_PRICE)} delta={null} />
      </VzTiles>
      <div className="err-box" style={{ margin: "12px 0" }}>
        <Fi s="triangle-exclamation" />
        <span>Protection anti-abus du parrainage (500 Coins) : point ouvert, aucune règle appliquée dans le prototype.</span>
      </div>
      <div className="s-grid2">
        <div className="panel">
          <h2 className="ph-t">Parrainages</h2>
          {s.growth.referrals.map((r) => (
            <div className="lrow st" key={r.u}>
              <Fi s="user-plus" />
              <span>
                @{s.user} → {r.u}
                <span className="cap" style={{ display: "block" }}>{r.date}</span>
              </span>
              <span className={`tag ${r.st === "done" ? "tag-ok" : "tag-warn"}`}>{r.st === "done" ? "Terminé" : "En attente"}</span>
            </div>
          ))}
        </div>
        <div className="panel">
          <h2 className="ph-t">Ambassadeurs</h2>
          {s.growth.amb ? (
            <div className="lrow st">
              <Fi s="user" />
              <span>
                @{s.user}
                <span className="cap" style={{ display: "block" }}>{s.growth.amb.school}</span>
              </span>
              {s.growth.amb.st === "recu" ? (
                <span style={{ display: "flex", gap: 6 }}>
                  <button className="btn btn-p btn-sm" onClick={() => ambDecide(me, true)}>
                    Valider
                  </button>
                  <button className="btn btn-o btn-sm" onClick={() => ambDecide(me, false)}>
                    Refuser
                  </button>
                </span>
              ) : (
                <span className={`tag ${s.growth.amb.st === "ok" ? "tag-ok" : "tag-err"}`}>{s.growth.amb.st === "ok" ? "Validé" : "Refusé"}</span>
              )}
            </div>
          ) : (
            <p className="muted">Aucune candidature en attente.</p>
          )}
        </div>
      </div>
    </>
  );
}
