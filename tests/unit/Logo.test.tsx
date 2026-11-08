import { describe, it, expect } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { Logo } from "@/components/brand/Logo";

// Plan §2.4 : full = icône + wordmark (full-logo-*), mark = icône seule (secondary-logo-*).
describe("Logo", () => {
  it("full lagon pointe vers le logo complet, proportions du viewBox", () => {
    render(<Logo variant="full" tone="lagon" height={40} />);
    const img = screen.getByAltText("Prélakay");
    expect(img).toHaveAttribute("src", expect.stringContaining("full-logo-lagon.svg"));
    expect(img).toHaveAttribute("width", String(Math.round((40 * 2324.17) / 772.09)));
    expect(img).toHaveAttribute("height", "40");
  });

  it("full white pour les fonds sombres", () => {
    render(<Logo variant="full" tone="white" />);
    expect(screen.getByAltText("Prélakay")).toHaveAttribute("src", expect.stringContaining("full-logo-white.svg"));
  });

  it("mark utilise le logo secondary", () => {
    render(<Logo variant="mark" tone="white" height={32} />);
    expect(screen.getByAltText("Prélakay")).toHaveAttribute("src", expect.stringContaining("secondary-logo-white.svg"));
    cleanup();
    render(<Logo variant="mark" tone="lagon" />);
    expect(screen.getByAltText("Prélakay")).toHaveAttribute("src", expect.stringContaining("secondary-logo-lagon.svg"));
  });

  it("respecte les tailles minimales (03-design §7.1)", () => {
    render(<Logo variant="full" tone="lagon" height={20} />);
    expect(screen.getByAltText("Prélakay")).toHaveAttribute("height", "32");
    cleanup();
    render(<Logo variant="mark" tone="lagon" height={10} />);
    expect(screen.getByAltText("Prélakay")).toHaveAttribute("height", "24");
  });

  it("avec href, rend un lien accessible", () => {
    render(<Logo variant="full" tone="lagon" href="/" />);
    expect(screen.getByRole("link", { name: "Prélakay, accueil" })).toHaveAttribute("href", "/");
  });
});
