import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { VzCols, VzLine, VzSeg, VzHeat, VzFunnel } from "@/components/charts/vz";
import { nivoTheme } from "@/lib/charts/nivoTheme";

// Graphiques Nivo (CLAUDE.md, 10 nov. 2026) : même API que le kit vz, tracé par Nivo,
// tableau « Voir les données » et résumé accessible conservés.
const L = ["1 nov.", "2 nov.", "3 nov."];

describe("graphiques Nivo", () => {
  it("courbe : zone Nivo résumée pour les lecteurs d'écran + tableau des valeurs", () => {
    render(<VzLine labels={L} series={[{ n: "Ventes", v: [10, 20, 30], c: "var(--vz-a)" }]} />);
    const img = screen.getByRole("img");
    expect(img).toHaveClass("vz-nv");
    expect(img.getAttribute("aria-label")).toContain("Ventes");
    expect(img.getAttribute("aria-label")).toContain("30");
    expect(screen.getByText("Voir les données")).toBeInTheDocument();
    expect(screen.getAllByRole("row")).toHaveLength(4);
  });
  it("colonnes : zone Nivo + tableau", () => {
    render(<VzCols labels={L} series={[{ n: "Commandes", v: [1, 2, 3], c: "var(--vz-1)" }]} />);
    expect(screen.getByRole("img")).toHaveClass("vz-nv");
    expect(screen.getAllByRole("row")).toHaveLength(4);
  });
  it("répartition : anneau Nivo, parts en % dans le résumé", () => {
    render(<VzSeg parts={[["Retirées", 3], ["Annulées", 1]]} />);
    expect(screen.getByRole("img").getAttribute("aria-label")).toBe("Retirées 75 %, Annulées 25 %");
  });
  it("carte de chaleur et entonnoir : zone Nivo + tableau", () => {
    const { unmount } = render(<VzHeat rows={["Lun"]} cols={["8 h", "9 h"]} data={[[1, 4]]} />);
    expect(screen.getByRole("img")).toHaveClass("vz-nv");
    unmount();
    render(<VzFunnel steps={[["Visites", 100], ["Panier", 40], ["Achat", 10]]} />);
    expect(screen.getByRole("img")).toHaveClass("vz-nv");
    expect(screen.getByRole("img").getAttribute("aria-label")).toContain("Achat 10");
  });
});

describe("thème Nivo", () => {
  it("reprend la police du site et les couleurs d'axe et de grille", () => {
    const t = nivoTheme({ text: "#0b0c10", axis: "rgba(11,12,16,.22)", grid: "rgba(11,12,16,.07)" });
    expect(t.text?.fontFamily).toBe("inherit");
    expect(t.text?.fill).toBe("#0b0c10");
    expect(t.grid?.line?.stroke).toBe("rgba(11,12,16,.07)");
    expect(t.axis?.domain?.line?.stroke).toBe("rgba(11,12,16,.22)");
  });
});
