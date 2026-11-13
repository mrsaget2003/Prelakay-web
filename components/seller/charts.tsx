"use client";

// Graphiques de l'espace vendeur (03-design §9.13) — sHomeCharts et sFinanceCharts du prototype.

import Link from "next/link";
import { useDemo } from "@/lib/demo/store";
import { sellerFin } from "@/lib/demo/sellerActions";
import { hs, series } from "@/lib/demo/seller";
import { VZC, cpt, dayLabels, nfr, walk } from "@/lib/charts/vz";
import { dPct, sData } from "@/lib/charts/sellerData";
import { formatHTG as htg } from "@/lib/format";
import { VzCard, VzCols, VzLine, VzTile, VzTiles } from "@/components/charts/vz";

const fmtK = (v: number) => `${cpt(v)} HTG`;

export function SellerHomeCharts() {
  const s = useDemo();
  const D = sData(s.seller.store, 7);
  const h = D.h;
  return (
    <>
      <VzTiles>
        <VzTile label="Ventes · 7 jours" value={htg(D.tot)} delta={dPct(D.tot, D.totPrev)} />
        <VzTile label="Commandes" value={nfr(D.nOrd)} delta={(h % 17) - 4} />
        <VzTile label="Visites du store" value={nfr(D.nVis)} delta={(h % 23) - 6} />
        <VzTile label="Produits dans des paniers" value={`${D.cart} %`} delta={null} />
      </VzTiles>
      <VzCard
        title="Ventes des 7 derniers jours"
        sub="En HTG · aujourd'hui en couleur"
        badge={
          <Link className="lk" href="/seller/stats">
            Statistiques
          </Link>
        }
      >
        <VzCols labels={D.L} series={[{ n: "Ventes", v: D.sales, c: VZC.mute }]} hl fmt={fmtK} />
      </VzCard>
    </>
  );
}

export function SellerFinanceCharts() {
  const s = useDemo();
  const h = hs(s.seller.store);
  const F = sellerFin(s);
  const L30 = dayLabels(30);
  const raw = walk(30, h + 31, F.avail * 0.6, F.avail * 0.08, 0.012);
  const bal = raw.map((v) => Math.round((v * F.avail) / (raw[29] || 1)));
  const next = ["7 nov.", "8 nov.", "9 nov.", "10 nov.", "11 nov.", "12 nov.", "13 nov."];
  const rel = series(7, h + 5, 0, 9000).map((v, i) => (i === 0 ? Math.round(F.pending * 0.3) : v));
  const wk = ["S41", "S42", "S43", "S44", "S45"];
  const inc = walk(5, h + 41, 42000, 9000, 0.03);
  const out = [0, 0, 0, 0, F.paid || 0];
  return (
    <>
      <VzCard title="Solde disponible" sub="30 derniers jours, en HTG">
        <VzLine labels={L30} series={[{ n: "Solde", v: bal, c: VZC.a }]} area fmt={fmtK} />
      </VzCard>
      <div className="vz-g2">
        <VzCard title="Libérations d'escrow prévues" sub="7 prochains jours, en HTG">
          <VzCols labels={next} series={[{ n: "À libérer", v: rel, c: VZC.a }]} fmt={fmtK} />
        </VzCard>
        <VzCard title="Encaissements et retraits" sub="Par semaine, en HTG">
          <VzCols
            labels={wk}
            series={[
              { n: "Encaissements", v: inc, c: VZC.c1 },
              { n: "Retraits vers vos comptes", v: out, c: VZC.c2 },
            ]}
            fmt={fmtK}
          />
        </VzCard>
      </div>
    </>
  );
}
