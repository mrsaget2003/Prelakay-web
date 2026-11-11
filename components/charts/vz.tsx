"use client";

// Kit de graphiques du prototype en composants (vzLine, vzCols, vzHBars, vzDiverge, vzHeat,
// vzCohort, vzFunnel, vzSeg, vzMeter, vzSpark, vzTile, vzBubbles) : même balisage, classes vz-*.
// Chaque graphique : infobulle au survol et au focus clavier, tableau « Voir les données ».

import { useEffect, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { Fi } from "@/components/proto/ui";
import { useIsDesk } from "@/lib/proto/useIsDesk";
import { VZC, VZCAT, VZSEQ, cpt, nfr, tip, type TipRow } from "@/lib/charts/vz";

// Tracés Nivo (CLAUDE.md, 10 nov. 2026) : courbes, colonnes, chaleur, entonnoir, anneau.
// Chargés côté client ; le cadre (role="img" + résumé) et le tableau restent rendus ici.
const NLine = dynamic(() => import("./nivo").then((m) => m.NLine), { ssr: false });
const NBars = dynamic(() => import("./nivo").then((m) => m.NBars), { ssr: false });
const NHeat = dynamic(() => import("./nivo").then((m) => m.NHeat), { ssr: false });
const NFunnel = dynamic(() => import("./nivo").then((m) => m.NFunnel), { ssr: false });
const NPie = dynamic(() => import("./nivo").then((m) => m.NPie), { ssr: false });

/** Cadre d'un tracé Nivo : hauteur fixe (pas de saut de mise en page), résumé pour les lecteurs d'écran. */
function Plot({ label, h, cls, children }: { label: string; h: number; cls?: string; children: ReactNode }) {
  return (
    <div className={`vz-nv${cls ? " " + cls : ""}`} role="img" aria-label={label} style={{ height: h }}>
      {children}
    </div>
  );
}
const axisF = (fmt?: Fmt) => (v: number) => String(fmt ? fmt(v) : cpt(v)).replace(/\s?HTG$/, "");

export type Series = { n: string; v: number[]; c: string; muted?: boolean };
type Fmt = (v: number) => string;

export function VzLegend({ series, kind }: { series: Series[]; kind: "line" | "bar" }) {
  if (series.length < 2) return null;
  return (
    <div className="vz-leg">
      {series.map((s) => (
        <span key={s.n}>
          <i className={`${kind === "line" ? "ln" : "sq"}${s.muted ? " mu" : ""}`} style={{ background: s.c }} />
          {s.n}
        </span>
      ))}
    </div>
  );
}

export function VzTable({ head, rows }: { head: string[]; rows: (string | number)[][] }) {
  return (
    <details className="vz-t">
      <summary>Voir les données</summary>
      <div className="tbl-w">
        <table className="tbl sm">
          <thead>
            <tr>
              {head.map((h, i) => (
                <th key={i} className={i ? "r" : undefined}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, j) => (
              <tr key={j}>
                {r.map((c, i) => (
                  <td key={i} className={i ? "r tnum" : undefined}>
                    {c}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}

export function VzCard({ title, sub, cls, badge, children }: { title: string; sub?: ReactNode; cls?: string; badge?: ReactNode; children: ReactNode }) {
  return (
    <section className={`panel vz${cls ? " " + cls : ""}`}>
      <header className="vz-h">
        <div>
          <h2>{title}</h2>
          {sub ? <p className="cap">{sub}</p> : null}
        </div>
        {badge}
      </header>
      {children}
    </section>
  );
}

/** Courbe (1 à 3 séries) ; une série « muted » = période précédente en gris. */
export function VzLine({ labels: L, series: S, fmt, area, target }: { labels: string[]; series: Series[]; fmt?: Fmt; area?: boolean; target?: { v: number; label: string } }) {
  const desk = useIsDesk();
  const n = L.length;
  const f = (v: number) => (fmt ? fmt(v) : nfr(v));
  const label = S.map((s) => `${s.n} : ${f(s.v[0])} le ${L[0]}, ${f(s.v[n - 1])} le ${L[n - 1]}`).join(" ; ");
  return (
    <>
      <VzLegend series={S} kind="line" />
      <Plot label={label} h={200}>
        <NLine labels={L} series={S} fmt={f} axisFmt={axisF(fmt)} area={area} target={target} narrow={!desk} />
      </Plot>
      <VzTable head={["Date", ...S.map((s) => s.n)]} rows={L.map((l, i) => [l, ...S.map((s) => f(s.v[i]))])} />
    </>
  );
}

/** Colonnes simples, groupées ou empilées. */
export function VzCols({ labels: L, series: S, fmt, stacked, hl }: { labels: string[]; series: Series[]; fmt?: Fmt; stacked?: boolean; hl?: boolean }) {
  const desk = useIsDesk();
  const n = L.length;
  const f = fmt ?? ((v: number) => nfr(v));
  const tot = L.map((_, i) => S.reduce((a, s) => a + s.v[i], 0));
  const label = `${S.map((s) => s.n).join(", ")} : ${f(tot[n - 1])} le ${L[n - 1]}`;
  return (
    <>
      <VzLegend series={S} kind="bar" />
      <Plot label={label} h={200}>
        <NBars labels={L} series={S} fmt={f} axisFmt={axisF(fmt)} stacked={stacked} hl={hl} narrow={!desk} />
      </Plot>
      <VzTable head={["Date", ...S.map((s) => s.n)]} rows={L.map((l, i) => [l, ...S.map((s) => f(s.v[i]))])} />
    </>
  );
}

/** Barres horizontales classées (une teinte), seuil facultatif. */
export function VzHBars({ items: I, max: mx, fmt, unit, head, c, hlFirst, target, targetLabel }: { items: [string, number, string?][]; max?: number; fmt?: Fmt; unit?: string; head?: string; c?: string; hlFirst?: boolean; target?: number; targetLabel?: string }) {
  const max = mx || Math.max(...I.map((x) => x[1])) || 1;
  const f = fmt ?? ((v: number) => nfr(v));
  return (
    <>
      <div className="vz-hb">
        {I.map((x, i) => (
          <div key={x[0]} className="vz-hr" {...tip(x[0], [[unit || "Valeur", f(x[1]), c || VZC.a, "sq"], ...(x[2] ? [["", x[2], "", ""] as TipRow] : [])])}>
            <span className="vz-hl">{x[0]}</span>
            <span className="vz-ht">
              <i style={{ width: `${(x[1] / max) * 100}%`, background: hlFirst && i ? VZC.mute : c || VZC.a }} />
              {target ? <em style={{ left: `${(target / max) * 100}%` }} /> : null}
            </span>
            <b className="tnum">{f(x[1])}</b>
          </div>
        ))}
      </div>
      {target ? (
        <p className="cap vz-note">
          <i className="vz-tk" />
          {targetLabel}
        </p>
      ) : null}
      <VzTable head={[head || "Élément", unit || "Valeur"]} rows={I.map((x) => [x[0], f(x[1])])} />
    </>
  );
}

/** Barres divergentes autour de zéro. */
export function VzDiverge({ items: I }: { items: [string, number][] }) {
  const m = Math.max(...I.map((x) => Math.abs(x[1]))) || 1;
  return (
    <>
      <div className="vz-dv">
        {I.map((x) => {
          const pos = x[1] >= 0;
          return (
            <div key={x[0]} className="vz-dr" {...tip(x[0], [["Variation", `${pos ? "+" : ""}${x[1]} %`, pos ? VZC.a : VZC.c2, "sq"]])}>
              <span className="vz-hl">{x[0]}</span>
              <span className="vz-dt">
                <i style={{ [pos ? "left" : "right"]: "50%", width: `${(Math.abs(x[1]) / m) * 50}%`, background: pos ? VZC.a : VZC.c2 }} />
              </span>
              <b className="tnum">
                {pos ? "+" : "−"}
                {Math.abs(x[1])} %
              </b>
            </div>
          );
        })}
      </div>
      <div className="vz-leg">
        <span>
          <i className="sq" style={{ background: VZC.a }} />
          En hausse
        </span>
        <span>
          <i className="sq" style={{ background: VZC.c2 }} />
          En baisse
        </span>
      </div>
      <VzTable head={["Élément", "Variation"]} rows={I.map((x) => [x[0], `${x[1] >= 0 ? "+" : "−"}${Math.abs(x[1])} %`])} />
    </>
  );
}

/** Carte de chaleur (rampe Lagon). */
export function VzHeat({ rows: R, cols: C, data: D, fmt, unit, lo, hi }: { rows: string[]; cols: string[]; data: number[][]; fmt?: Fmt; unit?: string; lo?: string; hi?: string }) {
  const f = fmt ?? ((v: number) => nfr(v));
  const flat = D.flat();
  const mx = Math.max(...flat);
  const ri = Math.floor(flat.indexOf(mx) / (C.length || 1));
  const ci = flat.indexOf(mx) % (C.length || 1);
  return (
    <>
      <Plot label={`Maximum : ${f(mx)} (${R[ri]} · ${C[ci]})`} h={Math.max(120, 30 + R.length * 26)}>
        <NHeat rows={R} cols={C} data={D} fmt={f} unit={unit || "Valeur"} seq={VZSEQ} />
      </Plot>
      <div className="vz-scale">
        <span>{lo || "Peu"}</span>
        {VZSEQ.map((c) => (
          <i key={c} style={{ background: c }} />
        ))}
        <span>{hi || "Beaucoup"}</span>
      </div>
      <VzTable head={["", ...C]} rows={R.map((r, ri) => [r, ...D[ri].map(f)])} />
    </>
  );
}
function RowFrag({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

/** Rétention par cohorte. */
export function VzCohort({ rows, cols: C, data }: { rows: [string, string][]; cols: string[]; data: (number | null)[][] }) {
  return (
    <>
      <div className="vz-co" style={{ ["--c" as string]: C.length }}>
        <span />
        {C.map((c) => (
          <span key={c} className="vz-hc">
            {c}
          </span>
        ))}
        {rows.map((r, ri) => (
          <RowFrag key={r[0]}>
            <span className="vz-hrl">
              {r[0]}
              <small>{r[1]}</small>
            </span>
            {C.map((_, ci) => {
              const v = data[ri][ci];
              if (v == null) return <i key={ci} className="na" />;
              const s = Math.min(4, Math.floor((v / 100) * 4.999));
              return (
                <i key={ci} style={{ background: VZSEQ[s], color: s >= 2 ? "#fffaf7" : "#0b0c10" }} {...tip(`${r[0]} · ${C[ci]}`, [["Acheteurs revenus", `${v} %`, "", ""]])}>
                  {v}
                </i>
              );
            })}
          </RowFrag>
        ))}
      </div>
      <VzTable head={["Cohorte", ...C]} rows={rows.map((r, ri) => [r[0], ...data[ri].map((v) => (v == null ? "—" : `${v} %`))])} />
    </>
  );
}

/** Entonnoir (taux de passage entre étapes). */
export function VzFunnel({ steps: S }: { steps: [string, number][] }) {
  const top = S[0][1] || 1;
  return (
    <>
      <Plot label={S.map((s) => `${s[0]} ${nfr(s[1])}`).join(", ")} h={150}>
        <NFunnel steps={S} />
      </Plot>
      <div className="vz-fn">
        {S.slice(1).map((s, i) => (
          <div className="vz-fr" key={s[0]}>
            <Fi s="arrow-down" />
            {S[i][0]} → {s[0]} : {Math.round((s[1] / (S[i][1] || 1)) * 100)} % passent à l&apos;étape suivante
          </div>
        ))}
      </div>
      <VzTable head={["Étape", "Nombre", "Part du départ"]} rows={S.map((s) => [s[0], nfr(s[1]), `${Math.round((s[1] / top) * 100)} %`])} />
    </>
  );
}

/** Barre segmentée (une totalité en ≤ 4 parts). */
export function VzSeg({ parts: P, fmt }: { parts: [string, number][]; fmt?: Fmt }) {
  const t = P.reduce((a, p) => a + p[1], 0) || 1;
  const f = fmt ?? ((v: number) => nfr(v));
  return (
    <>
      <Plot label={P.map((p) => `${p[0]} ${Math.round((p[1] / t) * 100)} %`).join(", ")} h={190} cls="pie">
        <NPie parts={P} fmt={f} colors={VZCAT} />
      </Plot>
      <div className="vz-leg">
        {P.map((p, i) => (
          <span key={p[0]}>
            <i className="sq" style={{ background: VZCAT[i] }} />
            {p[0]} · {Math.round((p[1] / t) * 100)} %
          </span>
        ))}
      </div>
      <VzTable head={["Partie", "Valeur", "Part"]} rows={P.map((p) => [p[0], f(p[1]), `${Math.round((p[1] / t) * 100)} %`])} />
    </>
  );
}

/** Jauge (seuil facultatif). */
export function VzMeter({ value, max, text, label, badge, state = "ok", target }: { value: number; max: number; text: string; label: string; badge?: string; state?: "ok" | "warn" | "err"; target?: number }) {
  const p = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="vz-me">
      <div className="vz-mh">
        <b className="tnum">{text}</b>
        {badge ? (
          <span className={`tag ${state === "ok" ? "tag-ok" : state === "warn" ? "tag-warn" : "tag-err"}`}>
            <Fi s={state === "ok" ? "circle-check" : state === "warn" ? "triangle-exclamation" : "circle-exclamation"} />
            {badge}
          </span>
        ) : null}
      </div>
      <div className="vz-mt" {...tip(label, [[label, text, "", ""]])}>
        <i style={{ width: `${p}%` }} />
        {target != null ? <em style={{ left: `${(target / max) * 100}%` }} /> : null}
      </div>
      <span className="cap">{label}</span>
    </div>
  );
}

/** Mini-courbe (sparkline). */
export function VzSpark({ v, c }: { v: number[]; c?: string }) {
  const n = v.length;
  const max = Math.max(...v);
  const min = Math.min(...v);
  const r = max - min || 1;
  const d = v.map((x, i) => `${i ? "L" : "M"}${((i / (n - 1)) * 100).toFixed(1)} ${(92 - ((x - min) / r) * 84).toFixed(1)}`).join(" ");
  return (
    <svg className="vz-sp" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <path d={d} fill="none" stroke={c || VZC.mute} strokeWidth="2" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/** Tuile : chiffre + variation vs période précédente + sparkline. */
export function VzTile({ label, value, delta, spark, goodUp = true }: { label: string; value: string; delta?: number | null; spark?: number[]; goodUp?: boolean }) {
  const up = (delta ?? 0) >= 0;
  const good = goodUp === false ? !up : up;
  return (
    <div className="vz-tile">
      <span className="cap">{label}</span>
      <b>{value}</b>
      <div className="vz-tr">
        {delta != null ? (
          <>
            <span className={`trend ${good ? "up" : "down"}`}>
              <Fi s={up ? "arrow-up" : "arrow-down"} />
              {Math.abs(delta)} %
            </span>
            <span className="cap">vs période précédente</span>
          </>
        ) : null}
      </div>
      {spark ? <VzSpark v={spark} c={VZC.a} /> : null}
    </div>
  );
}

export function VzTiles({ children }: { children: ReactNode }) {
  return <div className="vz-tiles">{children}</div>;
}

/** Carte à bulles (zones de Les Cayes). */
export function VzBubbles({ points: P, unit }: { points: { n: string; x: number; y: number; v: number }[]; unit?: string }) {
  const max = Math.max(...P.map((p) => p.v)) || 1;
  const top = P.slice().sort((a, b) => b.v - a.v).slice(0, 3);
  return (
    <>
      <div className="vz-map" role="img" aria-label="Carte des commandes par zone">
        {P.map((p) => {
          const s = 12 + Math.sqrt(p.v / max) * 44;
          return (
            <RowFrag key={p.n}>
              <span className="vz-b" style={{ left: `${p.x}%`, top: `${p.y}%`, width: s, height: s }} {...tip(p.n, [[unit || "Commandes", nfr(p.v), VZC.a, "sq"]])} />
              {top.includes(p) ? (
                <span className="vz-bl" style={{ left: `${p.x}%`, top: `${p.y}%` }}>
                  {p.n}
                </span>
              ) : null}
            </RowFrag>
          );
        })}
        <span className="vz-mnote">Fond de carte de démonstration · Google Maps en production</span>
      </div>
      <VzTable head={["Zone", unit || "Commandes"]} rows={P.slice().sort((a, b) => b.v - a.v).map((p) => [p.n, nfr(p.v)])} />
    </>
  );
}

/** Infobulle unique (survol + focus clavier) ; texte inséré avec textContent. À monter une fois par espace. */
export function VzTooltip() {
  useEffect(() => {
    const t = document.createElement("div");
    t.className = "vz-tip";
    t.setAttribute("role", "tooltip");
    document.body.appendChild(t);
    let cur: HTMLElement | null = null;
    const place = (el: HTMLElement, ev?: { clientX: number; clientY: number } | null) => {
      const r = el.getBoundingClientRect();
      const x = ev ? ev.clientX : r.left + r.width / 2;
      const y = ev ? ev.clientY : r.top;
      const left = Math.min(window.innerWidth - t.offsetWidth - 8, Math.max(8, x + 12));
      let top = y - t.offsetHeight - 12;
      if (top < 8) top = y + 16;
      t.style.left = `${left}px`;
      t.style.top = `${top}px`;
    };
    const show = (el: HTMLElement, ev?: PointerEvent | null) => {
      let d: [string, TipRow[]];
      try {
        d = JSON.parse(el.getAttribute("data-tip") || "");
      } catch {
        return;
      }
      t.textContent = "";
      const h = document.createElement("div");
      h.className = "vz-tt";
      h.textContent = d[0];
      t.appendChild(h);
      for (const r of d[1]) {
        const row = document.createElement("div");
        row.className = "vz-trw";
        if (r[2]) {
          const k = document.createElement("i");
          k.className = r[3] === "line" ? "ln" : "sq";
          k.style.background = r[2];
          row.appendChild(k);
        }
        const b = document.createElement("b");
        b.textContent = r[1];
        row.appendChild(b);
        if (r[0]) {
          const s = document.createElement("span");
          s.textContent = r[0];
          row.appendChild(s);
        }
        t.appendChild(row);
      }
      t.classList.add("on");
      cur = el;
      const area = el.closest(".vz-area");
      if (area && el.classList.contains("vz-hx")) {
        const c = area.querySelector<HTMLElement>(".vz-cross");
        if (c) {
          c.style.left = `${el.getAttribute("data-x")}%`;
          c.style.opacity = "1";
        }
      }
      place(el, ev);
    };
    const hide = () => {
      t.classList.remove("on");
      const c = cur?.closest(".vz-area")?.querySelector<HTMLElement>(".vz-cross");
      if (c) c.style.opacity = "0";
      cur = null;
    };
    const over = (e: PointerEvent) => {
      const el = (e.target as HTMLElement).closest<HTMLElement>("[data-tip]");
      if (el) show(el, e);
      else if (cur && cur !== document.activeElement) hide();
    };
    const move = (e: PointerEvent) => {
      if (cur && (e.target as HTMLElement).closest("[data-tip]") === cur) place(cur, e);
    };
    const fin = (e: FocusEvent) => {
      const el = (e.target as HTMLElement).closest?.<HTMLElement>("[data-tip]");
      if (el) show(el, null);
    };
    const fout = () => cur && hide();
    const scroll = () => {
      if (!cur) return;
      if (cur === document.activeElement) place(cur, null);
      else hide();
    };
    document.addEventListener("pointerover", over);
    document.addEventListener("pointermove", move);
    document.addEventListener("focusin", fin);
    document.addEventListener("focusout", fout);
    window.addEventListener("scroll", scroll, { passive: true });
    return () => {
      document.removeEventListener("pointerover", over);
      document.removeEventListener("pointermove", move);
      document.removeEventListener("focusin", fin);
      document.removeEventListener("focusout", fout);
      window.removeEventListener("scroll", scroll);
      t.remove();
    };
  }, []);
  return null;
}
