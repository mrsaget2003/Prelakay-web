"use client";

// Graphiques de la console (03-design §9.13) : tableau de bord (aDashCharts du prototype)
// et colonnes « commandes par statut » partagées avec les statistiques.

import Link from "next/link";
import { STORES } from "@/lib/data/mock/seed";
import { useDemo } from "@/lib/demo/store";
import { storeState } from "@/lib/demo/admin";
import { VZC, nfr } from "@/lib/charts/vz";
import { sum } from "@/lib/charts/sellerData";
import { pData } from "@/lib/charts/adminData";
import { VzCard, VzCols, VzLine, VzMeter, VzTile, VzTiles } from "@/components/charts/vz";
import { SudSalesMap } from "./SalesMap";

export function useActiveStores() {
  const s = useDemo();
  return STORES.filter((x) => !storeState(s, x.id).suspended).length;
}

export function OrdStatus({ D }: { D: ReturnType<typeof pData> }) {
  return (
    <VzCols
      labels={D.L}
      stacked
      series={[
        { n: "Retirées", v: D.picked, c: VZC.c1 },
        { n: "Prêtes", v: D.ready, c: VZC.c2 },
        { n: "En préparation", v: D.prep, c: VZC.c3 },
        { n: "Non retirées", v: D.exp, c: VZC.c4 },
      ]}
    />
  );
}

export function AdminDashCharts() {
  const act = useActiveStores();
  const D = pData(14, act);
  return (
    <>
      <VzTiles>
        <VzTile label="Commandes · 14 jours" value={nfr(sum(D.ord))} delta={12} spark={D.ord} />
        <VzTile label="Taux de retrait" value={`${D.pickRate} %`} delta={2} spark={D.picked} />
        <VzTile label="Nouveaux comptes" value={nfr(sum(D.newU))} delta={18} spark={D.newU} />
        <VzTile label="Stores actifs" value={`${act} / 30`} delta={null} spark={D.stores} />
      </VzTiles>
      <div className="vz-g2">
        <VzCard
          title="Commandes par statut"
          sub="14 derniers jours"
          badge={
            <Link className="lk" href="/admin/stats">
              Statistiques
            </Link>
          }
        >
          <OrdStatus D={D} />
        </VzCard>
        <VzCard title="Pilote Les Cayes" sub="Objectif PRD : 20 à 30 stores actifs">
          <VzMeter value={act} max={30} text={`${act} stores actifs`} label="Trait : 20 stores, le minimum visé" target={20} state={act >= 20 ? "ok" : "warn"} badge={act >= 20 ? "Objectif atteint" : "Sous l'objectif"} />
          <VzLine labels={D.L} series={[{ n: "Stores actifs", v: D.stores, c: VZC.a }]} />
        </VzCard>
      </div>
      <SudSalesMap days={30} compact />
    </>
  );
}
