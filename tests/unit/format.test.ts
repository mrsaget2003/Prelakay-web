import { describe, it, expect } from "vitest";
import { formatHTG, formatDistance, formatCount, formatDate } from "@/lib/format";

// Valeurs de référence : fonctions htg, km et k du prototype (ligne ~1577).
const NB = " "; // séparateur des milliers

describe("formatHTG", () => {
  it("sépare les milliers par une espace insécable", () => {
    expect(formatHTG(450000)).toBe(`450${NB}000 HTG`);
  });
  it("arrondit à l'unité", () => {
    expect(formatHTG(1250.4)).toBe(`1${NB}250 HTG`);
  });
  it("garde les petits montants tels quels", () => {
    expect(formatHTG(250)).toBe("250 HTG");
  });
});

describe("formatDistance", () => {
  // C.4 — espace insécable : l'unité ne se retrouve jamais seule à la ligne
  it("en mètres sous 1 km", () => {
    expect(formatDistance(0.6)).toBe(`600${NB}m`);
  });
  it("en km avec virgule au-delà", () => {
    expect(formatDistance(1.2)).toBe(`1,2${NB}km`);
    expect(formatDistance(3)).toBe(`3,0${NB}km`);
  });
});

describe("formatCount", () => {
  it("abrège les milliers en « k »", () => {
    expect(formatCount(1240)).toBe("1,2 k");
    expect(formatCount(1000)).toBe("1 k");
  });
  it("laisse les nombres sous 1000", () => {
    expect(formatCount(860)).toBe("860");
  });
});

describe("formatDate", () => {
  const d = new Date(2026, 10, 7, 14, 30);
  it("format court jj/mm/aaaa", () => {
    expect(formatDate(d, "short")).toBe("07/11/2026");
  });
  it("format long en toutes lettres", () => {
    expect(formatDate(d, "long")).toBe("7 novembre 2026");
  });
});
