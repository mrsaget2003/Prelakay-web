"use client";

// Statistiques de la plateforme 🟡 — aStats du prototype : Commandes, Acheteurs, Stores,
// Catégories, Opérations ; 7 / 30 / 90 jours ; données de démonstration. Section proposée,
// absente du PRD v1 (dashboard admin minimal) : affichée avec cette mention.

import { useState } from "react";
import { STORES } from "@/lib/data/mock/seed";
import { useDemo } from "@/lib/demo/store";
import { catsOf, storeState } from "@/lib/demo/admin";
import { hs } from "@/lib/demo/seller";
import { VZC, nfr, walk } from "@/lib/charts/vz";
import { sum } from "@/lib/charts/sellerData";
import { ZONES, pData } from "@/lib/charts/adminData";
import { formatHTG as htg } from "@/lib/format";
import { AHead } from "@/components/admin/shell";
import { OrdStatus, useActiveStores } from "@/components/admin/charts";
import { VzBubbles, VzCard, VzCohort, VzCols, VzDiverge, VzFunnel, VzHBars, VzLine, VzSeg, VzTile, VzTiles } from "@/components/charts/vz";

const TABS: [string, string][] = [["ventes", "Commandes"], ["acheteurs", "Acheteurs"], ["stores", "Stores"], ["cats", "Catégories"], ["ops", "Opérations"]];

export default function AdminStats() {
  const s = useDemo();
  const act = useActiveStores();
  const [d, setD] = useState(30);
  const [tab, setTab] = useState("ventes");
  const D = pData(d, act);
  const h = hs("plateforme");
  let body: React.ReactNode;
  if (tab === "ventes") {
    body = (
      <>
        <VzTiles>
          <VzTile label="Commandes" value={nfr(sum(D.ord))} delta={11} spark={D.ord} />
          <VzTile label="Retraits validés" value={nfr(sum(D.picked))} delta={9} spark={D.picked} />
          <VzTile label="Taux de retrait" value={`${D.pickRate} %`} delta={2} />
          <VzTile label="Panier moyen" value={htg(Math.round(sum(D.gmv) / Math.max(1, sum(D.ord))))} delta={4} />
        </VzTiles>
        <VzCard title="Commandes par jour" sub="Comparées à la période précédente">
          <VzLine
            labels={D.L}
            series={[
              { n: "Cette période", v: D.ord, c: VZC.a },
              { n: "Période précédente", v: walk(d, h + 50, 18, 8, 0.01), c: VZC.mute, muted: true },
            ]}
            area
          />
        </VzCard>
        <VzCard title="Commandes par statut" sub="Chaque jour">
          <OrdStatus D={D} />
        </VzCard>
        <VzCard title="Commandes par zone de Les Cayes" sub="Taille du cercle : nombre de commandes retirées dans la zone">
          <VzBubbles points={ZONES.map(([n, x, y], i) => ({ n, x, y, v: Math.round(sum(D.picked) * [0.24, 0.18, 0.12, 0.09, 0.1, 0.07, 0.09, 0.06, 0.05][i]) }))} unit="Commandes" />
        </VzCard>
      </>
    );
  } else if (tab === "acheteurs") {
    const weeks = ["14 oct.", "21 oct.", "28 oct.", "4 nov."];
    body = (
      <>
        <VzTiles>
          <VzTile label="Nouveaux comptes" value={nfr(sum(D.newU))} delta={18} spark={D.newU} />
          <VzTile label="Acheteurs actifs" value={nfr(sum(D.hai) + sum(D.dia))} delta={13} spark={D.hai} />
          <VzTile label="Part diaspora" value={`${Math.round((sum(D.dia) / (sum(D.hai) + sum(D.dia))) * 100)} %`} delta={6} spark={D.dia} />
          <VzTile label="Acheteurs revenus (S+1)" value="49 %" delta={3} />
        </VzTiles>
        <VzCard title="Acheteurs en Haïti et dans la diaspora" sub="Acheteurs ayant payé une commande, par jour">
          <VzLine
            labels={D.L}
            series={[
              { n: "En Haïti", v: D.hai, c: VZC.c1 },
              { n: "Diaspora", v: D.dia, c: VZC.c2 },
            ]}
          />
        </VzCard>
        <div className="vz-g2">
          <VzCard title="Rétention par cohorte" sub="Part des acheteurs d'une semaine qui reviennent les semaines suivantes">
            <VzCohort
              cols={["S0", "S+1", "S+2", "S+3"]}
              rows={weeks.map((w, i): [string, string] => [`Sem. du ${w}`, `${[312, 355, 401, 428][i]} acheteurs`])}
              data={[
                [100, 46, 38, 31],
                [100, 49, 40, null],
                [100, 52, null, null],
                [100, null, null, null],
              ]}
            />
          </VzCard>
          <VzCard title="Paiement des commandes" sub="Comment les acheteurs ont rechargé leur wallet">
            <VzHBars items={[["MonCash", 46], ["NatCash", 21], ["Wise (diaspora)", 13], ["Carte (Stripe)", 9], ["Sogebank", 7], ["Meru", 4]]} fmt={(v) => `${v} %`} unit="Part des recharges" head="Passerelle" />
          </VzCard>
        </div>
        <VzCard title="Nouveaux comptes par jour">
          <VzCols labels={D.L} series={[{ n: "Nouveaux comptes", v: D.newU, c: VZC.mute }]} hl />
        </VzCard>
      </>
    );
  } else if (tab === "stores") {
    body = (
      <>
        <VzTiles>
          <VzTile label="Stores actifs" value={`${act} / 30`} delta={null} spark={D.stores} />
          <VzTile label="Stores de confiance" value={String(STORES.filter((x) => storeState(s, x.id).trust).length)} delta={null} />
          <VzTile label="Dossiers KYC approuvés" value="82 %" delta={5} />
          <VzTile label="Délai de préparation moyen" value="3,1 h" delta={-8} spark={walk(14, h + 60, 3.4, 0.6, -0.01)} goodUp={false} />
        </VzTiles>
        <div className="vz-g2">
          <VzCard title="Ventes par store" sub="Unités vendues depuis l'ouverture">
            <VzHBars items={STORES.map((x): [string, number] => [x.n, x.sold]).sort((a, b) => b[1] - a[1])} unit="Vendus" head="Store" />
          </VzCard>
          <VzCard title="Délai de préparation par store" sub="Heures en moyenne · trait : 2 h (store de confiance, à confirmer)">
            <VzHBars
              items={STORES.map((x): [string, number] => [x.n, Math.round((1.2 + (hs(x.id) % 40) / 10) * 10) / 10]).sort((a, b) => a[1] - b[1])}
              fmt={(v) => `${nfr(v, 1)} h`}
              unit="Délai moyen"
              head="Store"
              target={2}
              targetLabel="Objectif store de confiance : 2 h (à confirmer)"
            />
          </VzCard>
        </div>
        <VzCard title="Croissance du nombre de stores" sub="Stores actifs chaque jour">
          <VzLine labels={D.L} series={[{ n: "Stores actifs", v: D.stores, c: VZC.a }]} target={{ v: 20, label: "Objectif minimum : 20" }} />
        </VzCard>
      </>
    );
  } else if (tab === "cats") {
    const C = catsOf(s);
    body = (
      <>
        <div className="vz-g2">
          <VzCard title="Commandes par catégorie" sub="Sur la période">
            <VzHBars items={C.map((c, i): [string, number] => [c.n, Math.round(sum(D.ord) * [0.22, 0.19, 0.13, 0.16, 0.12, 0.08, 0.06, 0.04][i % 8])]).sort((a, b) => b[1] - a[1])} unit="Commandes" head="Catégorie" />
          </VzCard>
          <VzCard title="Évolution par catégorie" sub="Commandes, comparées à la période précédente">
            <VzDiverge items={C.map((c): [string, number] => [c.n, (hs(c.id + d) % 45) - 14]).sort((a, b) => b[1] - a[1])} />
          </VzCard>
        </div>
        <VzCard title="Recherches sans résultat" sub="Ce que les acheteurs cherchent et ne trouvent pas : des produits à recruter">
          <VzHBars items={[["Panneau solaire", 64], ["Glacière", 41], ["Uniforme scolaire taille 16", 33], ["Pièces Haojue", 28], ["Gaz propane", 22]]} unit="Recherches" head="Recherche" />
        </VzCard>
      </>
    );
  } else {
    body = (
      <>
        <div className="vz-g2">
          <VzCard title="Dossiers KYC" sub="Du dépôt à l'approbation, sur la période">
            <VzFunnel steps={[["Dossiers reçus", 58], ["Pris en charge", 54], ["Approuvés", 44], ["Store ouvert (1er produit)", 39]]} />
          </VzCard>
          <VzCard title="Issue des litiges" sub="Litiges clos sur la période">
            <VzSeg parts={[["Remboursé", 11], ["Remboursement partiel", 6], ["Raison au store", 8], ["Annulé par l'acheteur", 3]]} />
          </VzCard>
        </div>
        <VzCard title="Délai de traitement" sub="Heures entre la demande et la décision">
          <VzLine
            labels={D.L}
            series={[
              { n: "Dossiers KYC", v: walk(d, h + 70, 20, 6, -0.01), c: VZC.c1 },
              { n: "Produits à modérer", v: walk(d, h + 72, 9, 4, -0.005), c: VZC.c2 },
            ]}
            fmt={(v) => `${v} h`}
            target={{ v: 24, label: "Objectif : 24 h" }}
          />
        </VzCard>
        <div className="vz-g2">
          <VzCard title="Signalements par motif">
            <VzHBars items={[["Prix trompeur", 9], ["Photos non conformes", 7], ["Contrefaçon", 4], ["Avis abusif", 3], ["Produit interdit", 1]]} unit="Signalements" head="Motif" />
          </VzCard>
          <VzCard title="Litiges par motif">
            <VzHBars items={[["Article non conforme", 12], ["Article endommagé", 9], ["Article manquant", 5], ["Autre", 2]]} unit="Litiges" head="Motif" />
          </VzCard>
        </div>
      </>
    );
  }
  return (
    <>
      <AHead title="Statistiques" crumb={[["Statistiques"]]} />
      <div className="vz-filters">
        <div className="seg">
          {[7, 30, 90].map((v) => (
            <button key={v} className={d === v ? "on" : ""} onClick={() => setD(v)}>
              {v} jours
            </button>
          ))}
        </div>
        <span className="cap">Pilote Les Cayes · jusqu&apos;au 6 nov. 2026 · données de démonstration</span>
      </div>
      <div className="panel s-tools vz-tabs">
        <div className="otabs">
          {TABS.map(([k, l]) => (
            <button key={k} className={tab === k ? "on" : ""} onClick={() => setTab(k)}>
              {l}
            </button>
          ))}
        </div>
      </div>
      {body}
      <p className="cap">Section 🟡 proposée : les statistiques admin ne figurent pas encore dans le PRD v1 (dashboard admin minimal).</p>
    </>
  );
}
