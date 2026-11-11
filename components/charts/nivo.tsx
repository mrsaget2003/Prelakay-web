"use client";

// Tracés Nivo du kit vz (CLAUDE.md, 10 nov. 2026). Chargés côté client uniquement
// (next/dynamic dans vz.tsx) ; le résumé accessible et le tableau « Voir les données »
// restent dans vz.tsx. Infobulle : même rendu que .vz-tip du prototype.

import { ResponsiveLine } from "@nivo/line";
import { ResponsiveBar } from "@nivo/bar";
import { ResponsiveHeatMap } from "@nivo/heatmap";
import { ResponsiveFunnel } from "@nivo/funnel";
import { ResponsivePie } from "@nivo/pie";
import { useColors, useNivoTheme } from "@/lib/charts/nivoTheme";
import { Choropleth } from "@nivo/geo";
import { useEffect, useRef, useState } from "react";
import { fitMercator } from "@/lib/charts/geoFit";

type Fmt = (v: number) => string;
export type NSeries = { n: string; v: number[]; c: string; muted?: boolean };
export type TipLine = { k?: string; v: string; c?: string; shape?: "ln" | "sq" };

export function NTip({ title, rows }: { title: string; rows: TipLine[] }) {
  return (
    <div className="vz-tip on nv">
      <div className="vz-tt">{title}</div>
      {rows.map((r, i) => (
        <div className="vz-trw" key={i}>
          {r.c ? <i className={r.shape ?? "sq"} style={{ background: r.c }} /> : null}
          <b>{r.v}</b>
          {r.k ? <span>{r.k}</span> : null}
        </div>
      ))}
    </div>
  );
}

/** Une étiquette d'axe sur k, la dernière toujours visible. */
function ticks(labels: string[], max: number): string[] {
  const k = Math.max(1, Math.ceil(labels.length / max));
  return labels.filter((_, i) => i % k === 0 || i === labels.length - 1);
}

const MARGIN = { top: 10, right: 14, bottom: 26, left: 44 };

export function NLine({ labels, series, fmt, axisFmt, area, target, narrow }: { labels: string[]; series: NSeries[]; fmt: Fmt; axisFmt: Fmt; area?: boolean; target?: { v: number; label: string }; narrow: boolean }) {
  const theme = useNivoTheme();
  const cols = useColors([...series.map((s) => s.c), "var(--vz-a)"]);
  const data = series.map((s) => ({ id: s.n, data: s.v.map((y, i) => ({ x: labels[i], y })) }));
  return (
    <ResponsiveLine
      data={data}
      theme={theme}
      margin={MARGIN}
      xScale={{ type: "point" }}
      yScale={{ type: "linear", min: 0, max: "auto" }}
      curve="monotoneX"
      colors={(d) => cols[series.findIndex((s) => s.n === d.id)]}
      lineWidth={2}
      enableArea={area}
      areaOpacity={0.1}
      enablePoints={false}
      enableGridX={false}
      axisBottom={{ tickSize: 0, tickPadding: 8, tickValues: ticks(labels, narrow ? 4 : 7) }}
      axisLeft={{ tickSize: 0, tickPadding: 6, tickValues: 4, format: (v) => axisFmt(Number(v)) }}
      gridYValues={4}
      enableSlices="x"
      sliceTooltip={({ slice }) => (
        <NTip
          title={String(slice.points[0]?.data.x ?? "")}
          rows={slice.points.map((p) => ({ k: String(p.seriesId), v: fmt(Number(p.data.y)), c: p.seriesColor, shape: "ln" as const }))}
        />
      )}
      markers={target ? [{ axis: "y", value: target.v, lineStyle: { stroke: cols[cols.length - 1], strokeDasharray: "4 4", strokeWidth: 1 }, legend: target.label, legendPosition: "top-left", textStyle: { fontSize: 11, fill: cols[cols.length - 1] } }] : []}
      animate
      motionConfig="gentle"
    />
  );
}

export function NBars({ labels, series, fmt, axisFmt, stacked, hl, narrow }: { labels: string[]; series: NSeries[]; fmt: Fmt; axisFmt: Fmt; stacked?: boolean; hl?: boolean; narrow: boolean }) {
  const theme = useNivoTheme();
  const cols = useColors([...series.map((s) => s.c), "var(--vz-a)"]);
  const data = labels.map((l, i) => Object.fromEntries([["label", l], ...series.map((s) => [s.n, s.v[i]])]));
  const last = labels[labels.length - 1];
  return (
    <ResponsiveBar
      data={data}
      keys={series.map((s) => s.n)}
      indexBy="label"
      theme={theme}
      margin={MARGIN}
      padding={0.28}
      innerPadding={stacked ? 0 : 2}
      groupMode={stacked ? "stacked" : "grouped"}
      colors={(b) => (hl && b.indexValue === last ? cols[cols.length - 1] : cols[series.findIndex((s) => s.n === b.id)])}
      borderRadius={2}
      enableLabel={false}
      enableGridX={false}
      gridYValues={4}
      axisBottom={{ tickSize: 0, tickPadding: 8, tickValues: ticks(labels, narrow ? 6 : 12) }}
      axisLeft={{ tickSize: 0, tickPadding: 6, tickValues: 4, format: (v) => axisFmt(Number(v)) }}
      valueFormat={(v) => fmt(v)}
      tooltip={(b) => <NTip title={String(b.indexValue)} rows={[{ k: String(b.id), v: fmt(b.value ?? 0), c: b.color }]} />}
      motionConfig="gentle"
    />
  );
}

export function NHeat({ rows, cols: C, data, fmt, unit, seq }: { rows: string[]; cols: string[]; data: number[][]; fmt: Fmt; unit: string; seq: string[] }) {
  const theme = useNivoTheme();
  const S = useColors(seq);
  const max = Math.max(...data.flat()) || 1;
  const step = (v: number) => Math.min(S.length - 1, Math.floor((v / max) * (S.length - 0.001)));
  return (
    <ResponsiveHeatMap
      data={rows.map((r, ri) => ({ id: r, data: C.map((c, ci) => ({ x: c, y: data[ri][ci] })) }))}
      theme={theme}
      margin={{ top: 22, right: 4, bottom: 4, left: 40 }}
      xInnerPadding={0.08}
      yInnerPadding={0.12}
      borderRadius={3}
      colors={(cell) => S[step(Number(cell.value ?? 0))]}
      enableLabels={false}
      axisTop={{ tickSize: 0, tickPadding: 6, tickValues: C.filter((_, i) => i % 2 === 0) }}
      axisLeft={{ tickSize: 0, tickPadding: 6 }}
      axisRight={null}
      axisBottom={null}
      hoverTarget="cell"
      tooltip={({ cell }) => <NTip title={`${cell.serieId} · ${cell.data.x}`} rows={[{ k: unit, v: fmt(Number(cell.value ?? 0)) }]} />}
      animate={false}
    />
  );
}

export function NFunnel({ steps }: { steps: [string, number][] }) {
  const theme = useNivoTheme();
  const [a] = useColors(["var(--vz-a)"]);
  const top = steps[0]?.[1] || 1;
  return (
    <ResponsiveFunnel
      data={steps.map(([id, value]) => ({ id, value, label: id }))}
      theme={theme}
      margin={{ top: 6, right: 6, bottom: 6, left: 6 }}
      direction="horizontal"
      shapeBlending={0.6}
      spacing={4}
      colors={[a]}
      fillOpacity={0.9}
      borderWidth={0}
      labelColor="#fffaf7"
      valueFormat={(v) => `${Math.round((Number(v) / top) * 100)} %`}
      enableBeforeSeparators={false}
      enableAfterSeparators={false}
      currentPartSizeExtension={6}
      tooltip={({ part }) => <NTip title={String(part.data.label)} rows={[{ k: "Nombre", v: String(part.data.value) }, { k: "Part du départ", v: `${Math.round((part.data.value / top) * 100)} %` }]} />}
      motionConfig="gentle"
    />
  );
}

export function NPie({ parts, fmt, colors }: { parts: [string, number][]; fmt: Fmt; colors: string[] }) {
  const theme = useNivoTheme();
  const C = useColors(colors);
  const t = parts.reduce((a, p) => a + p[1], 0) || 1;
  return (
    <ResponsivePie
      data={parts.map(([id, value]) => ({ id, label: id, value }))}
      theme={theme}
      margin={{ top: 8, right: 8, bottom: 8, left: 8 }}
      innerRadius={0.62}
      padAngle={1.2}
      cornerRadius={3}
      colors={(d) => C[parts.findIndex((p) => p[0] === d.id)]}
      enableArcLinkLabels={false}
      arcLabel={(d) => `${Math.round((d.value / t) * 100)} %`}
      arcLabelsSkipAngle={30}
      arcLabelsTextColor="#fffaf7"
      activeOuterRadiusOffset={5}
      tooltip={({ datum }) => <NTip title={String(datum.label)} rows={[{ k: "Part", v: `${Math.round((datum.value / t) * 100)} %`, c: datum.color }, { k: "Valeur", v: fmt(datum.value) }]} />}
      motionConfig="gentle"
    />
  );
}

/* ---------- Carte (choroplèthe) ---------- */


export type GeoArea = { id: string; name: string; value: number; tip: TipLine[] };
export type GeoFeature = { id: string; properties: { name: string }; geometry: { type: string; coordinates: unknown } };

/** Choroplèthe des zones : couleur = part (domaine 0 → max), zone sans valeur en gris neutre. */
export function NChoropleth({ features, areas, seq, onPick }: { features: GeoFeature[]; areas: GeoArea[]; seq: string[]; onPick?: (id: string) => void }) {
  const theme = useNivoTheme();
  const S = useColors([...seq, "var(--color-neutral-100)", "var(--color-white)"]);
  const box = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setSize({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    setSize({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, []);
  const max = Math.max(1, ...areas.map((a) => a.value));
  const byId = new Map(areas.map((a) => [a.id, a]));
  const fit = size.w ? fitMercator(features, size.w, size.h) : null;
  return (
    <div ref={box} style={{ width: "100%", height: "100%" }}>
      {fit ? (
        <Choropleth
          width={size.w}
          height={size.h}
          features={features}
          data={areas.filter((a) => a.value > 0).map((a) => ({ id: a.id, value: a.value }))}
          domain={[0, max]}
          colors={S.slice(0, seq.length)}
          unknownColor={S[seq.length]}
          label="properties.name"
          projectionType="mercator"
          projectionScale={fit.scale}
          projectionTranslation={fit.translation}
          projectionRotation={fit.rotation}
          borderWidth={0.8}
          borderColor={S[seq.length + 1]}
          theme={theme}
          onClick={(f) => onPick?.(String((f.data as { id?: string })?.id ?? (f as unknown as { id: string }).id))}
          tooltip={({ feature }) => {
            const a = byId.get(String((feature as unknown as { id: string }).id));
            return <NTip title={feature.label} rows={a ? a.tip : [{ v: "Pas encore de vente" }]} />;
          }}
        />
      ) : null}
    </div>
  );
}
