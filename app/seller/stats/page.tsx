"use client";

// Statistiques vendeur (Phase 10) — sStats du prototype : Ventes, Trafic, Acheteurs, Produits,
// Opérations ; période 7 / 30 / 90 jours ; données de démonstration. Objectifs affichés
// (90 % de retrait, 2 h de préparation) : à confirmer (CLAUDE.md, décisions du 7 nov.).

import Link from "next/link";
import { useState } from "react";
import { catBy } from "@/lib/data/mock/seed";
import { productImage } from "@/lib/data/mock/images";
import { useDemo } from "@/lib/demo/store";
import { myProducts, myStore, statusOf } from "@/lib/demo/sellerActions";
import { hs, stockTotal } from "@/lib/demo/seller";
import { VZC, cpt, nfr, walk } from "@/lib/charts/vz";
import { dPct, sData, sum } from "@/lib/charts/sellerData";
import { formatHTG as htg } from "@/lib/format";
import { SHead } from "@/components/seller/shell";
import { VzCard, VzCols, VzDiverge, VzFunnel, VzHBars, VzHeat, VzLine, VzMeter, VzSeg, VzSpark, VzTile, VzTiles } from "@/components/charts/vz";
import { Ph } from "@/components/proto/ui";

const TABS: [string, string][] = [["ventes", "Ventes"], ["trafic", "Trafic"], ["acheteurs", "Acheteurs"], ["produits", "Produits"], ["ops", "Opérations"]];
const fmtK = (v: number) => `${cpt(v)} HTG`;
const DAYS = ["Lun.", "Mar.", "Mer.", "Jeu.", "Ven.", "Sam.", "Dim."];
const HOURS = Array.from({ length: 14 }, (_, i) => `${i + 7} h`);

export default function Stats() {
  const s = useDemo();
  const [d, setD] = useState(7);
  const [tab, setTab] = useState("ventes");
  const st = myStore(s);
  const D = sData(s.seller.store, d);
  const h = D.h;
  let body: React.ReactNode = null;

  if (tab === "ventes") {
    const avg = Math.round(D.tot / Math.max(1, D.nOrd));
    const pr = Math.round((sum(D.picked) / Math.max(1, D.nOrd)) * 100);
    const subs = catBy(st.cat)!.sub;
    body = (
      <>
        <VzTiles>
          <VzTile label="Ventes" value={htg(D.tot)} delta={dPct(D.tot, D.totPrev)} spark={D.sales} />
          <VzTile label="Commandes" value={nfr(D.nOrd)} delta={(h % 17) - 4} spark={D.orders} />
          <VzTile label="Panier moyen" value={htg(avg)} delta={(h % 9) - 3} spark={D.sales.map((v, i) => v / Math.max(1, D.orders[i]))} />
          <VzTile label="Taux de retrait" value={`${pr} %`} delta={(h % 5) - 1} spark={D.picked} />
        </VzTiles>
        <VzCard title="Ventes par jour" sub="En HTG, comparées à la période précédente">
          <VzLine
            labels={D.L}
            series={[
              { n: "Cette période", v: D.sales, c: VZC.a },
              { n: "Période précédente", v: D.prev, c: VZC.mute, muted: true },
            ]}
            area
            fmt={fmtK}
          />
        </VzCard>
        <div className="vz-g2">
          <VzCard title="Commandes par statut" sub="Chaque jour">
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
          </VzCard>
          <VzCard title="Ventes par sous-catégorie" sub="Part de vos ventes sur la période">
            <VzHBars items={subs.map((x, i): [string, number] => [x, Math.round(D.tot * [0.41, 0.27, 0.19, 0.13][i % 4])]).sort((a, b) => b[1] - a[1])} fmt={fmtK} unit="Ventes" head="Sous-catégorie" />
          </VzCard>
        </div>
      </>
    );
  } else if (tab === "trafic") {
    const views = Math.round(D.nVis * 2.9);
    const adds = Math.round((views * D.cart) / 100);
    body = (
      <>
        <VzTiles>
          <VzTile label="Visites du store" value={nfr(D.nVis)} delta={(h % 23) - 6} spark={D.visits} />
          <VzTile label="Vues de produits" value={nfr(views)} delta={(h % 13) - 3} spark={D.visits.map((v) => v * 3)} />
          <VzTile label="Produits dans des paniers en cours" value={`${D.cart} %`} delta={null} />
          <VzTile label="Taux de conversion" value={`${((D.nOrd / Math.max(1, D.nVis)) * 100).toFixed(1).replace(".", ",")} %`} delta={(h % 7) - 2} spark={D.orders} />
        </VzTiles>
        <VzCard title="Visites du store par jour">
          <VzLine labels={D.L} series={[{ n: "Visites", v: D.visits, c: VZC.a }]} area />
        </VzCard>
        <div className="vz-g2">
          <VzCard title="Entonnoir de conversion" sub="De la visite au retrait">
            <VzFunnel
              steps={[
                ["Visites du store", D.nVis],
                ["Ont vu un produit", Math.round(D.nVis * 0.72)],
                ["Ont ajouté au panier", Math.min(Math.round(D.nVis * 0.72 * 0.3), adds)],
                ["Commandes", D.nOrd],
                ["Retraits", sum(D.picked)],
              ]}
            />
          </VzCard>
          <VzCard title="Sources des visites" sub="D'où viennent vos visiteurs">
            <VzHBars
              items={[
                ["Recherche Prélakay", Math.round(D.nVis * 0.38)],
                ["Carte des stores", Math.round(D.nVis * 0.21)],
                ["Liens partagés (WhatsApp…)", Math.round(D.nVis * 0.18)],
                ["Accueil « Près de vous »", Math.round(D.nVis * 0.13)],
                ["QR code de la vitrine", Math.round(D.nVis * 0.1)],
              ]}
              unit="Visites"
              head="Source"
            />
          </VzCard>
        </div>
      </>
    );
  } else if (tab === "acheteurs") {
    const hai = Math.round(D.nOrd * 0.71);
    const heat = DAYS.map((_, di) => HOURS.map((_, hi) => Math.max(0, Math.round(((hi >= 4 && hi <= 6) || (hi >= 9 && hi <= 11) ? 6 : 2) + ((h >> (di + hi)) & 3) - (di === 6 ? 2 : 0)))));
    body = (
      <>
        <div className="vz-g2">
          <VzCard title="Qui paie vos commandes" sub="Acheteurs en Haïti et diaspora (panier payé pour un proche)">
            <VzSeg parts={[["En Haïti", hai], ["Diaspora", D.nOrd - hai]]} />
          </VzCard>
          <VzCard title="Note des avis" sub={`Répartition des ${st.rate ? Math.round(st.sold / 12) : 0} avis vérifiés`}>
            <VzHBars items={[["5 étoiles", 72], ["4 étoiles", 18], ["3 étoiles", 6], ["2 étoiles", 3], ["1 étoile", 1]]} fmt={(v) => `${v} %`} unit="Part" head="Note" />
          </VzCard>
        </div>
        <VzCard title="Nouveaux et fidèles" sub="Acheteurs par jour">
          <VzLine
            labels={D.L}
            series={[
              { n: "Nouveaux acheteurs", v: D.newb, c: VZC.c1 },
              { n: "Acheteurs fidèles", v: D.ret, c: VZC.c2 },
            ]}
          />
        </VzCard>
        <VzCard title="Heures de retrait" sub="Quand les acheteurs viennent au store · nombre de retraits">
          <VzHeat rows={DAYS} cols={HOURS} data={heat} unit="Retraits" lo="Calme" hi="Affluence" />
        </VzCard>
      </>
    );
  } else if (tab === "produits") {
    const P2 = myProducts(s)
      .filter((p) => statusOf(s, p) === "active")
      .sort((a, b) => b.sold - a.sold);
    body = (
      <>
        <VzCard title="Meilleurs produits" sub="Unités vendues depuis l'ouverture">
          <VzHBars items={P2.slice(0, 6).map((p): [string, number] => [p.n, p.sold])} unit="Vendus" head="Produit" />
        </VzCard>
        <div className="vz-g2">
          <VzCard title="Évolution des ventes par produit" sub="Cette période contre la précédente">
            <VzDiverge items={P2.slice(0, 6).map((p): [string, number] => [p.n, (hs(p.id) % 41) - 15])} />
          </VzCard>
          <VzCard title="Stock par produit" sub="Unités disponibles · trait : seuil de stock bas">
            <VzHBars items={P2.slice(0, 6).map((p): [string, number] => [p.n, stockTotal(p)])} unit="En stock" head="Produit" target={3} targetLabel="Seuil de stock bas : 3 unités" />
          </VzCard>
        </div>
        <VzCard title="Tendance par produit" sub={`Ventes des ${d} derniers jours`}>
          <div className="tbl-w">
            <table className="tbl rsp">
              <thead>
                <tr>
                  <th>Produit</th>
                  <th>Tendance</th>
                  <th className="r">Vendus</th>
                  <th className="r">Note</th>
                </tr>
              </thead>
              <tbody>
                {P2.slice(0, 8).map((p) => (
                  <tr key={p.id}>
                    <td>
                      <Link className="s-prod" href={`/seller/products/${p.id}`}>
                        <Ph icon={p.icon} tint={p.tint} cls="mini" img={productImage(p.id, 120)} alt={p.n} />
                        <span>{p.n}</span>
                      </Link>
                    </td>
                    <td data-l="Tendance" className="spk-c">
                      <VzSpark v={walk(14, hs(p.id + d), 10, 6, 0.01)} c={VZC.a} />
                    </td>
                    <td data-l="Vendus" className="r tnum">
                      {p.sold}
                    </td>
                    <td data-l="Note" className="r">
                      {p.rating ? p.rating.toFixed(1).replace(".", ",") : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </VzCard>
      </>
    );
  } else {
    const prepT = walk(d, h + 21, 3.2, 1.2, -0.004).map((v) => Math.max(1, v));
    const pr2 = Math.round((sum(D.picked) / Math.max(1, D.nOrd)) * 100);
    const resp = 6 + (h % 20);
    body = (
      <>
        <div className="vz-g2">
          <VzCard title="Taux de retrait" sub="Commandes retirées dans les 3 jours">
            <VzMeter value={pr2} max={100} text={`${pr2} %`} label="Objectif proposé : 90 % (à confirmer)" target={90} state={pr2 >= 90 ? "ok" : "warn"} badge={pr2 >= 90 ? "Objectif atteint" : "Sous l'objectif"} />
          </VzCard>
          <VzCard title="Délai de réponse aux questions" sub="Moyenne sur la période">
            <VzMeter value={Math.min(48, resp)} max={48} text={`${resp} h`} label="Délai maximum conseillé : 24 h" target={24} state={resp <= 24 ? "ok" : "warn"} badge={resp <= 24 ? "Dans les temps" : "Trop lent"} />
          </VzCard>
        </div>
        <VzCard title="Délai de préparation" sub="Heures entre la commande et « Prête pour retrait »">
          <VzLine labels={D.L} series={[{ n: "Délai moyen", v: prepT, c: VZC.a }]} fmt={(v) => `${v} h`} target={{ v: 2, label: "Store de confiance : 2 h (à confirmer)" }} />
        </VzCard>
        <VzCard title="Litiges par motif" sub="Depuis l'ouverture du store">
          <VzHBars
            items={(
              [
                ["Article non conforme", 2 + (h % 3)],
                ["Article endommagé", 1 + (h % 2)],
                ["Article manquant", h % 2],
                ["Autre", 1],
              ] as [string, number][]
            ).sort((a, b) => b[1] - a[1])}
            unit="Litiges"
            head="Motif"
          />
        </VzCard>
      </>
    );
  }

  return (
    <>
      <SHead title="Statistiques" crumb={[["Statistiques"]]} />
      <div className="vz-filters">
        <div className="seg">
          {[
            [7, "7 jours"],
            [30, "30 jours"],
            [90, "90 jours"],
          ].map(([v, l]) => (
            <button key={v} className={d === v ? "on" : ""} onClick={() => setD(v as number)}>
              {l}
            </button>
          ))}
        </div>
        <span className="cap">Jusqu&apos;au 6 nov. 2026 · données de démonstration</span>
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
    </>
  );
}
