"use client";

// Finances plateforme (ex-V2, actif dans le prototype) : GMV, commissions, escrow en circulation,
// retraits en attente. Taux de commission ⚠️ ouvert : affiché « — », jamais calculé.

import { useState } from "react";
import { useDemo } from "@/lib/demo/store";
import { platformFinance } from "@/lib/charts/financeData";
import { VZC, cpt } from "@/lib/charts/vz";
import { formatHTG as htg } from "@/lib/format";
import { AHead } from "@/components/admin/shell";
import { VzCard, VzLine, VzSeg, VzTile, VzTiles } from "@/components/charts/vz";
import { Fi } from "@/components/proto/ui";

export default function PlatformFinance() {
  const s = useDemo();
  const [d, setD] = useState<7 | 30 | 90>(30);
  const F = platformFinance(s, d);
  return (
    <>
      <AHead title="Finances plateforme" crumb={[["Opérations"], ["Finances plateforme"]]} />
      <div className="vz-filters">
        <div className="seg">
          {([7, 30, 90] as const).map((v) => (
            <button key={v} className={d === v ? "on" : ""} onClick={() => setD(v)}>
              {v} jours
            </button>
          ))}
        </div>
        <span className="cap">Pilote Les Cayes · données de démonstration</span>
      </div>
      <VzTiles>
        <VzTile label="Volume d'affaires (GMV)" value={htg(F.gmv)} delta={null} spark={F.gmvSeries} />
        <VzTile label="Commissions" value={F.commission == null ? "—" : htg(F.commission)} delta={null} />
        <VzTile label="Escrow en circulation" value={htg(F.escrow)} delta={null} />
        <VzTile label="Retraits en attente" value={htg(F.payoutsPending)} delta={null} />
      </VzTiles>
      {F.commission == null ? (
        <div className="err-box" style={{ margin: "12px 0" }}>
          <Fi s="triangle-exclamation" />
          <span>Taux de commission ⚠️ à confirmer (fourchette 5-10 %) : les commissions ne sont pas calculées.</span>
        </div>
      ) : null}
      <div className="vz-g2">
        <VzCard title="Volume d'affaires par jour" sub="En HTG, toutes les commandes payées">
          <VzLine labels={F.L} series={[{ n: "GMV", v: F.gmvSeries, c: VZC.a }]} area fmt={(v) => cpt(v)} />
        </VzCard>
        <VzCard title="Acheteurs payants" sub="Haïti et diaspora, sur la période">
          <VzSeg parts={[["Haïti", F.haiti.reduce((a, x) => a + x, 0)], ["Diaspora", F.diaspora.reduce((a, x) => a + x, 0)]]} />
        </VzCard>
      </div>
    </>
  );
}
