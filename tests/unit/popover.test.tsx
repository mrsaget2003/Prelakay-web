import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MenuProvider, Popover } from "@/components/proto/popover";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

// Parité avec le prototype (03-design §9.2) : « Télécharger l'app », « Compte » et « Plus »
// s'ouvrent au survol — par la règle CSS `.dd.hov:hover > .ddp`, donc sans attendre le
// JavaScript ; « Ville / langue / devise » s'ouvre au clic seulement.
function Menu({ hover }: { hover?: boolean }) {
  return (
    <MenuProvider>
      <Popover id="m" cls="accm" label="Mon compte" hover={hover} trigger={<button className="hi">Compte</button>}>
        <span>Mes commandes</span>
      </Popover>
    </MenuProvider>
  );
}

const dd = () => document.querySelector("[data-menu=m]")!;

describe("menus du header", () => {
  it("un menu ouvrable au survol porte la classe `hov` du prototype : le CSS seul l'ouvre", () => {
    render(<Menu />);
    expect(dd().className.split(" ")).toContain("hov");
  });

  it("un menu au clic seulement ne porte pas `hov`", () => {
    render(<Menu hover={false} />);
    expect(dd().className.split(" ")).not.toContain("hov");
  });

  it("le panneau n'est pas annoncé comme une boîte de dialogue", () => {
    render(<Menu />);
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.getByRole("group", { name: "Mon compte" })).toBeInTheDocument();
  });

  it("le déclencheur garde aria-expanded et aria-controls", () => {
    render(<Menu />);
    const t = screen.getByRole("button", { name: "Compte" });
    expect(t).toHaveAttribute("aria-expanded", "false");
    expect(t).toHaveAttribute("aria-controls", "pop-m");
  });
});
