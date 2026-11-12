"use client";

// Thème Nivo unique (CLAUDE.md, 10 nov. 2026) : police du site, couleurs d'axe et de grille
// du kit vz (app/proto.css : --vz-axis, --vz-grid). Les couleurs de marque sont des variables
// CSS : Nivo dessine en SVG, on lit donc leur valeur calculée (et on la relit au changement
// de couleurs du site).

import { useMemo, useSyncExternalStore, type ComponentProps } from "react";
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

/** Résout une liste de couleurs (variables CSS) une fois montée : Nivo dessine en SVG et
 *  veut des couleurs littérales. (Plus de thème sombre depuis le 12 nov. 2026.) */
const noop = () => () => {};
export function useColors(list: string[]): string[] {
  const key = list.join("|");
  // rendu serveur : les variables telles quelles ; navigateur : les couleurs calculées
  const client = useSyncExternalStore(noop, () => true, () => false);
  return useMemo(() => (client ? key.split("|").map((c) => resolveColor(c)) : key.split("|")), [client, key]);
}

export function useNivoTheme(): NivoTheme {
  const [text, axis, grid] = useColors(["var(--color-black)", "var(--vz-axis)", "var(--vz-grid)"]);
  return nivoTheme({ text, axis, grid });
}
