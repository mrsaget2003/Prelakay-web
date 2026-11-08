import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Icon } from "@/components/ui/Icon";
import { ICONS } from "@/lib/icons/registry";

// design-prelakay §4 / 03-design §5.1 : actif = plein + pastille duotone 20 %,
// inactif = contour. Font Awesome 6 Free en attendant Iconly Pro.
describe("Icon", () => {
  it("est décorative par défaut", () => {
    const { container } = render(<Icon name="cart-shopping" />);
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });

  it("avec label, est une image nommée", () => {
    render(<Icon name="cart-shopping" label="Panier" />);
    expect(screen.getByRole("img", { name: "Panier" })).toBeInTheDocument();
  });

  it("inactif = contour, actif = plein + pastille duotone", () => {
    const { container, rerender } = render(<Icon name="heart" />);
    expect(container.querySelector("svg")).toHaveAttribute("data-prefix", "far");
    expect(container.firstChild).not.toHaveAttribute("data-active");
    rerender(<Icon name="heart" active />);
    expect(container.querySelector("svg")).toHaveAttribute("data-prefix", "fas");
    expect(container.firstChild).toHaveAttribute("data-active", "true");
  });

  it("variant force le style sans pastille (ex. étoile pleine d'une note)", () => {
    const { container } = render(<Icon name="star" variant="solid" />);
    expect(container.querySelector("svg")).toHaveAttribute("data-prefix", "fas");
    expect(container.firstChild).not.toHaveAttribute("data-active");
  });

  it("sans version contour, garde la version pleine", () => {
    const { container } = render(<Icon name="store" />);
    expect(container.querySelector("svg")).toHaveAttribute("data-prefix", "fas");
  });

  it("dessine le tracé de l'icône", () => {
    const { container } = render(<Icon name="whatsapp" size={24} />);
    const svg = container.querySelector("svg")!;
    expect(svg).toHaveAttribute("data-prefix", "fab");
    expect(svg).toHaveAttribute("width", "24");
    expect(svg.querySelector("path")?.getAttribute("d")?.length).toBeGreaterThan(10);
  });

  it("toutes les icônes du prototype sont dans le registre", () => {
    for (const k of ["cart-shopping", "store", "wallet", "qrcode", "diamond-turn-right", "star-half-stroke", "whatsapp", "google", "shirt", "bread-slice"])
      expect(ICONS, k).toHaveProperty(k);
    expect(Object.keys(ICONS).length).toBeGreaterThanOrEqual(148);
  });

  it("chaque entrée a une icône pleine", () => {
    for (const [k, v] of Object.entries(ICONS)) expect(v.solid, k).toBeDefined();
  });
});
