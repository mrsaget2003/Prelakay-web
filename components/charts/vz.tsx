"use client";

// Kit de graphiques du prototype en composants (vzLine, vzCols, vzHBars, vzDiverge, vzHeat,
// vzCohort, vzFunnel, vzSeg, vzMeter, vzSpark, vzTile, vzBubbles) : même balisage, classes vz-*.
// Chaque graphique : infobulle au survol et au focus clavier, tableau « Voir les données ».

import { useEffect, useRef, type ReactNode } from "react";
import { Fi } from "@/components/proto/ui";
import { VZC, VZCAT, VZSEQ, cpt, nfr, niceStep, tip, type TipRow } from "@/lib/charts/vz";

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

function XLabels({ labels, pts }: { labels: string[]; pts?: boolean }) {
  const n = labels.length;
  const dk = Math.max(1, Math.ceil(n / (pts ? 7 : 12)));
  const mk = Math.max(1, Math.ceil(n / (pts ? 4 : 6)));
  return (
    <div className={`vz-x${pts ? " pts" : ""}`}>
      {labels.map((l, i) => {
        const last = i === n - 1;
        const near = (k: number) => !last && n - 1 - i < k * (pts ? 0.6 : 1);
        const hd = (i % dk || near(dk)) && !last;
        const hm = (i % mk || near(mk)) && !last;
        const cls = `${hd ? "dh " : ""}${hm ? "mh" : ""}${pts && i === 0 ? " f" : ""}${pts && last ? " l" : ""}`.trim();
        return (
          <span key={i} className={cls || undefined} style={pts ? { left: `${n < 2 ? 50 : (i / (n - 1)) * 100}%` } : undefined}>
            {l}
          </span>
        );
      })}
    </div>
  );
}

function yAxis(max: number, fmt?: Fmt) {
  const st = niceStep(max);
  const top = Math.ceil(max / st) * st || 1;
  const ticks: number[] = [];
  for (let v = 0; v <= top + 1e-9; v += st) ticks.push(v);
  const node = (
    <>
      <div className="vz-y">
        {ticks.map((v) => (
          <span key={v} style={{ bottom: `${(v / top) * 100}%` }}>
            {String(fmt ? fmt(v) : cpt(v)).replace(/\s?HTG$/, "")}
          </span>
        ))}
      </div>
      <div className="vz-grid">
        {ticks.map((v) => (
          <i key={v} style={{ bottom: `${(v / top) * 100}%` }} />
        ))}
      </div>
    </>
  );
  return { top, node };
}

/** Courbe (1 à 3 séries) ; une série « muted » = période précédente en gris. */
export function VzLine({ labels: L, series: S, fmt, area, target }: { labels: string[]; series: Series[]; fmt?: Fmt; area?: boolean; target?: { v: number; label: string } }) {
  const n = L.length;
  const max = Math.max(...S.flatMap((s) => s.v), ...(target ? [target.v] : [])) || 1;
  const Y = yAxis(max * 1.05, fmt);
  const fx = (i: number) => (n < 2 ? 50 : (i / (n - 1)) * 100);
  const fy = (v: number) => 100 - (v / Y.top) * 100;
  const cross = useRef<HTMLElement>(null);
  const main = S.find((s) => !s.muted) ?? S[0];
  const lastV = main.v[n - 1];
  const f = (v: number) => (fmt ? fmt(v) : nfr(v));
  return (
    <>
      <VzLegend series={S} kind="line" />
      <div className="vz-plot">
        {Y.node}
        <div className="vz-area">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            {S.map((s, k) => {
              const d = s.v.map((v, i) => `${i ? "L" : "M"}${fx(i).toFixed(2)} ${fy(v).toFixed(2)}`).join(" ");
              return (
                <g key={s.n}>
                  {area && k === 0 && !s.muted ? <path d={`${d} L100 100 L0 100 Z`} fill={s.c} opacity=".1" /> : null}
                  <path d={d} fill="none" stroke={s.c} strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
                </g>
              );
            })}
          </svg>
          {target ? (
            <div className="vz-tgt" style={{ bottom: `${(target.v / Y.top) * 100}%` }}>
              <span>{target.label}</span>
            </div>
          ) : null}
          <span className="vz-dot" style={{ left: `${fx(n - 1)}%`, top: `${fy(lastV)}%`, background: main.c }} />
          <span className="vz-end" style={{ top: `${fy(lastV)}%` }}>
            {fmt ? fmt(lastV) : cpt(lastV)}
          </span>
          <i className="vz-cross" ref={cross} />
          {L.map((l, i) => {
            const w = 100 / Math.max(1, n - 1);
            const lo = Math.max(0, fx(i) - w / 2);
            const hi = Math.min(100, fx(i) + w / 2);
            return <span key={i} className="vz-hx" style={{ left: `${lo}%`, width: `${hi - lo}%` }} data-x={fx(i)} {...tip(l, S.map((s): TipRow => [s.n, f(s.v[i]), s.c, "line"]))} />;
          })}
        </div>
      </div>
      <XLabels labels={L} pts />
      <VzTable head={["Date", ...S.map((s) => s.n)]} rows={L.map((l, i) => [l, ...S.map((s) => f(s.v[i]))])} />
    </>
  );
}

/** Colonnes simples, groupées ou empilées. */
export function VzCols({ labels: L, series: S, fmt, stacked, hl }: { labels: string[]; series: Series[]; fmt?: Fmt; stacked?: boolean; hl?: boolean }) {
  const n = L.length;
  const tot = L.map((_, i) => S.reduce((a, s) => a + s.v[i], 0));
  const max = stacked ? Math.max(...tot) : Math.max(...S.flatMap((s) => s.v));
  const Y = yAxis(max || 1, fmt);
  const f = fmt ?? ((v: number) => nfr(v));
  return (
    <>
      <VzLegend series={S} kind="bar" />
      <div className="vz-plot">
        {Y.node}
        <div className="vz-area vz-cols" style={{ ["--n" as string]: n }}>
          {L.map((l, i) => (
            <div key={i} className={`vz-c${hl && i === n - 1 ? " hl" : ""}`} {...tip(l, [...S.map((s): TipRow => [s.n, f(s.v[i]), s.c, "sq"]), ...(stacked && S.length > 1 ? [["Total", f(tot[i]), "", ""] as TipRow] : [])])}>
              {stacked ? (
                <div className="vz-stk" style={{ height: `${(tot[i] / Y.top) * 100}%` }}>
                  {S.map((s) => (s.v[i] ? <i key={s.n} style={{ flex: s.v[i], background: s.c }} /> : null))}
                </div>
              ) : (
                <div className="vz-grp">
                  {S.map((s) => (
                    <i key={s.n} style={{ height: `${(s.v[i] / Y.top) * 100}%`, background: hl && i === n - 1 ? VZC.a : s.c }} />
                  ))}
                </div>
              )}
            </div>
          ))}
          {hl ? (
            <span className="vz-cap" style={{ bottom: `${(tot[n - 1] / Y.top) * 100}%` }}>
              {f(tot[n - 1])}
            </span>
          ) : null}
        </div>
      </div>
      <XLabels labels={L} />
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
  const max = Math.max(...D.flat()) || 1;
  const f = fmt ?? ((v: number) => nfr(v));
  const step = (v: number) => Math.min(4, Math.floor((v / max) * 4.999));
  return (
    <>
      <div className="vz-hm" style={{ ["--c" as string]: C.length }}>
        <span />
        {C.map((c, i) => (
          <span key={c + i} className={`vz-hc${i % 2 ? " mh" : ""}`}>
            {c}
          </span>
        ))}
        {R.map((r, ri) => (
          <RowFrag key={r}>
            <span className="vz-hrl">{r}</span>
            {D[ri].map((v, ci) => (
              <i key={ci} style={{ background: VZSEQ[step(v)] }} {...tip(`${r} · ${C[ci]}`, [[unit || "Valeur", f(v), "", ""]])} />
            ))}
          </RowFrag>
        ))}
      </div>
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
      <div className="vz-fn">
        {S.map((s, i) => {
          const w = Math.max(2, Math.min(100, (s[1] / top) * 100));
          const rate = i ? Math.round((s[1] / (S[i - 1][1] || 1)) * 100) : null;
          return (
            <RowFrag key={s[0]}>
              {i ? (
                <div className="vz-fr">
                  <Fi s="arrow-down" />
                  {rate} % passent à l&apos;étape suivante
                </div>
              ) : null}
              <div className="vz-fs" {...tip(s[0], [["Nombre", nfr(s[1]), VZC.a, "sq"], ["Part du départ", `${Math.round((s[1] / top) * 100)} %`, "", ""]])}>
                <span className="vz-hl">{s[0]}</span>
                <span className="vz-ft">
                  <i style={{ width: `${w}%` }} />
                </span>
                <b className="tnum">{nfr(s[1])}</b>
              </div>
            </RowFrag>
          );
        })}
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
      <div className="vz-sg" role="img" aria-label={P.map((p) => `${p[0]} ${Math.round((p[1] / t) * 100)} %`).join(", ")}>
        {P.map((p, i) => {
          const sh = Math.round((p[1] / t) * 100);
          return p[1] ? (
            <i key={p[0]} style={{ flex: p[1], background: VZCAT[i], color: i === 3 ? "#0b0c10" : "#fffaf7" }} {...tip(p[0], [["Part", `${sh} %`, VZCAT[i], "sq"], ["Valeur", f(p[1]), "", ""]])}>
              {sh >= 12 ? `${sh} %` : ""}
            </i>
          ) : null;
        })}
      </div>
      <div className="vz-leg">
        {P.map((p, i) => (
          <span key={p[0]}>
            <i className="sq" style={{ background: VZCAT[i] }} />
            {p[0]}
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
