// Kit de graphiques du prototype — calculs (nfr, cpt, walk, niceStep, dayLabels).
// Règles : 03-design §9.13 ; en production, Recharts proposé (04-trd, à valider).

export const VZC = { a: "var(--vz-a)", c1: "var(--vz-1)", c2: "var(--vz-2)", c3: "var(--vz-3)", c4: "var(--vz-4)", mute: "var(--vz-mute)" };
export const VZCAT = [VZC.c1, VZC.c2, VZC.c3, VZC.c4];
export const VZSEQ = ["var(--color-lagon-100)", "var(--color-lagon-300)", "var(--color-lagon-500)", "var(--color-lagon-700)", "var(--color-lagon-900)"];

/** Nombre fr-FR (espace insécable des milliers). */
export function nfr(v: number, d?: number): string {
  return Number(v).toLocaleString("fr-FR", { maximumFractionDigits: d == null ? 0 : d }).replace(/[   ]/g, " ");
}
/** Nombre compact pour les axes : 12,5 k, 1,2 M. */
export function cpt(v: number): string {
  const a = Math.abs(v);
  return a >= 1e6 ? `${nfr(v / 1e6, 1)} M` : a >= 1e4 ? `${nfr(v / 1e3, a >= 1e5 ? 0 : 1)} k` : nfr(v);
}
/** Marche aléatoire déterministe (données de démonstration). */
export function walk(n: number, seed: number, start: number, vol: number, drift: number): number[] {
  const out: number[] = [];
  let x = seed >>> 0;
  let v = start;
  for (let i = 0; i < n; i++) {
    x = (x * 1103515245 + 12345) >>> 0;
    v = Math.max(0, v * (1 + drift) + ((x % 1000) / 1000 - 0.5) * vol);
    out.push(Math.round(v));
  }
  return out;
}
export function niceStep(max: number, ticks = 4): number {
  const raw = max / ticks;
  const p = Math.pow(10, Math.floor(Math.log10(raw || 1)));
  const f = raw / p;
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 && p >= 10 ? 2.5 : f <= 5 ? 5 : 10) * p;
}
const MONTHS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
/** n derniers jours jusqu'au 6 nov. 2026 (date de démonstration du prototype). */
export function dayLabels(n: number): string[] {
  const out: string[] = [];
  const d = new Date(2026, 10, 6);
  for (let i = n - 1; i >= 0; i--) {
    const x = new Date(d);
    x.setDate(d.getDate() - i);
    out.push(`${x.getDate()} ${MONTHS[x.getMonth()]}`);
  }
  return out;
}

/** Données d'une infobulle : [titre, lignes [libellé, valeur, couleur, forme]]. */
export type TipRow = [string, string, string, string];
export function tip(title: string, rows: TipRow[]) {
  return { "data-tip": JSON.stringify([title, rows]), tabIndex: 0 };
}
