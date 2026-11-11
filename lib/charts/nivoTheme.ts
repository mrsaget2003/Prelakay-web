"use client";

// Thème Nivo unique (CLAUDE.md, 10 nov. 2026) : police du site, couleurs d'axe et de grille
// du kit vz (app/proto.css : --vz-axis, --vz-grid). Les couleurs de marque sont des variables
// CSS : Nivo dessine en SVG, on lit donc leur valeur calculée (et on la relit au changement
// de thème clair / sombre, attribut data-theme de <html>).

import { useEffect, useState, type ComponentProps } from "react";
import type { ResponsiveLine } from "@nivo/line";

export type NivoTheme = NonNullable<ComponentProps<typeof ResponsiveLine>["theme"]>;
export type ThemeColors = { text: string; axis: string; grid: string };

export function nivoTheme(c: ThemeColors): NivoTheme {
  return {
    text: { fontFamily: "inherit", fontSize: 11, fill: c.text },
    axis: {
      domain: { line: { stroke: c.axis, strokeWidth: 1 } },
      ticks: { line: { stroke: c.axis, strokeWidth: 1 }, text: { fontFamily: "inherit", fontSize: 11, fill: c.text, opacity: 0.6 } },
      legend: { text: { fontFamily: "inherit", fontSize: 11, fill: c.text } },
    },
    grid: { line: { stroke: c.grid, strokeWidth: 1 } },
    crosshair: { line: { stroke: c.axis, strokeWidth: 1, strokeOpacity: 1 } },
    tooltip: { container: { background: "transparent", boxShadow: "none", padding: 0 } },
  };
}

/** Valeur calculée d'une couleur : « var(--vz-1) » → « #2a78d6 » ; une couleur littérale est rendue telle quelle. */
export function resolveColor(c: string, root?: Element | null): string {
  const m = /^var\((--[\w-]+)\)$/.exec(c.trim());
  if (!m || typeof window === "undefined") return c;
  const v = getComputedStyle(root ?? document.documentElement).getPropertyValue(m[1]).trim();
  return v || c;
}

/** Résout une liste de couleurs (variables CSS) et la relit quand le thème change. */
export function useColors(list: string[]): string[] {
  const key = list.join("|");
  const [out, setOut] = useState<string[]>(list);
  useEffect(() => {
    const read = () => setOut(key.split("|").map((c) => resolveColor(c)));
    read();
    const mo = new MutationObserver(read);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "class"] });
    return () => mo.disconnect();
  }, [key]);
  return out;
}

export function useNivoTheme(): NivoTheme {
  const [text, axis, grid] = useColors(["var(--color-black)", "var(--vz-axis)", "var(--vz-grid)"]);
  return nivoTheme({ text, axis, grid });
}
