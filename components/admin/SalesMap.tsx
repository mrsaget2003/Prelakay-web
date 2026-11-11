"use client";

// Carte des ventes (spec §8, D3) : part des ventes et montant par commune du Sud (choroplèthe
// Nivo, contours geoBoundaries ADM3, CC BY 4.0) et par quartier des Cayes (bulles sur le plan
// de démonstration). Bascule Ventes / Commandes ; la période vient de la page.

import { useState } from "react";
import dynamic from "next/dynamic";
import sud from "@/lib/data/geo/sud-communes.json";
import { ZONES } from "@/lib/charts/adminData";
import { communeSales, quarterSales, shareLabel, shares, type ShareBy, type ZoneShare } from "@/lib/charts/salesMap";
import { VZC, VZSEQ, nfr, tip } from "@/lib/charts/vz";
import { formatHTG as htg } from "@/lib/format";
import { VzCard, VzTable } from "@/components/charts/vz";

import type { GeoFeature } from "@/components/charts/nivo";

const NChoropleth = dynamic(() => import("@/components/charts/nivo").then((m) => m.NChoropleth), { ssr: false });

type Days = 7 | 30 | 90;
const FEATURES = sud.features as unknown as GeoFeature[];

function tipRows(z: ZoneShare) {
  return [
    { k: "des ventes", v: `${z.pct} %`, c: VZC.a, shape: "sq" as const },
    { k: "Montant", v: htg(z.amount) },
    { k: "Commandes", v: nfr(z.orders) },
  ];
}

function ByToggle({ by, set }: { by: ShareBy; set: (b: ShareBy) => void }) {
  return (
    <div className="otabs sm" role="group" aria-label="Mesure">
      <button className={by === "amount" ? "on" : ""} aria-pressed={by === "amount"} onClick={() => set("amount")}>
        Ventes
      </button>
      <button className={by === "orders" ? "on" : ""} aria-pressed={by === "orders"} onClick={() => set("orders")}>
        Commandes
      </button>
    </div>
  );
}

function Ranking({ rows }: { rows: ZoneShare[] }) {
  const top = rows.filter((r) => r.pct > 0).slice(0, 6);
  return (
    <ol className="sm-rank">
      {top.map((r) => (
        <li key={r.id}>
          <span>{r.name}</span>
          <b className="tnum">{shareLabel(r)}</b>
          <i style={{ width: `${Math.max(2, r.pct)}%` }} />
        </li>
      ))}
    </ol>
  );
}

/** Communes du Sud : carte + classement. `compact` : aperçu du tableau de bord. */
export function SudSalesMap({ days, compact = false }: { days: Days; compact?: boolean }) {
  const [by, setBy] = useState<ShareBy>("amount");
  const rows = shares(communeSales(days), by).sort((a, b) => b.pct - a.pct || b.amount - a.amount);
  const lead = rows[0];
  return (
    <VzCard
      title="Ventes par commune du Sud"
      sub={`${days} derniers jours · part ${by === "amount" ? "des ventes (HTG)" : "des commandes"} et montant`}
      badge={<ByToggle by={by} set={setBy} />}
    >
      <div className={`sm-g${compact ? " compact" : ""}`}>
        <div className="sm-map" role="img" aria-label={`Carte du Sud : ${rows.filter((r) => r.pct).map((r) => `${r.name} ${shareLabel(r)}`).join(", ")}`}>
          <NChoropleth features={FEATURES} areas={rows.map((r) => ({ id: r.id, name: r.name, value: r.pct, tip: tipRows(r) }))} seq={VZSEQ} />
        </div>
        <div>
          <p className="sm-lead">
            <b>{lead.name}</b> · {shareLabel(lead)}
          </p>
          <Ranking rows={rows} />
          <div className="vz-scale">
            <span>0 %</span>
            {VZSEQ.map((c) => (
              <i key={c} style={{ background: c }} />
            ))}
            <span>{lead.pct} %</span>
          </div>
        </div>
      </div>
      <VzTable head={["Commune", "Part", "Montant", "Commandes"]} rows={rows.map((r) => [r.name, `${r.pct} %`, htg(r.amount), nfr(r.orders)])} />
    </VzCard>
  );
}

/** Quartiers des Cayes : bulles proportionnelles à la part, avec le pourcentage et le montant. */
export function CayesQuarterMap({ days }: { days: Days }) {
  const [by, setBy] = useState<ShareBy>("amount");
  const rows = shares(quarterSales(days), by);
  const max = Math.max(1, ...rows.map((r) => r.pct));
  const top = rows.slice().sort((a, b) => b.pct - a.pct).slice(0, 3);
  return (
    <VzCard title="Ventes par quartier des Cayes" sub="Taille du cercle : part du quartier dans la commune des Cayes" badge={<ByToggle by={by} set={setBy} />}>
      <div className="vz-map" role="img" aria-label={rows.map((r) => `${r.name} ${shareLabel(r)}`).join(", ")}>
        {rows.map((r, i) => {
          const [, x, y] = ZONES[i];
          const s = 12 + Math.sqrt(r.pct / max) * 44;
          return (
            <span key={r.id} style={{ display: "contents" }}>
              <span className="vz-b" style={{ left: `${x}%`, top: `${y}%`, width: s, height: s }} {...tip(r.name, [["des ventes", `${r.pct} %`, VZC.a, "sq"], ["Montant", htg(r.amount), "", ""], ["Commandes", nfr(r.orders), "", ""]])} />
              {top.includes(r) ? (
                <span className="vz-bl" style={{ left: `${x}%`, top: `${y}%` }}>
                  {r.name} · {r.pct} %
                </span>
              ) : null}
            </span>
          );
        })}
        <span className="vz-mnote">Plan de démonstration des quartiers</span>
      </div>
      <VzTable head={["Quartier", "Part", "Montant", "Commandes"]} rows={rows.slice().sort((a, b) => b.pct - a.pct).map((r) => [r.name, `${r.pct} %`, htg(r.amount), nfr(r.orders)])} />
    </VzCard>
  );
}
