import { describe, it, expect, vi } from "vitest";
import { useState } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Stars } from "@/components/ui/Stars";
import { Price } from "@/components/ui/Price";
import { Tag } from "@/components/ui/Tag";
import { QtyStepper } from "@/components/ui/QtyStepper";
import { RoundCheck } from "@/components/ui/RoundCheck";
import { Modal } from "@/components/ui/Modal";
import { Tabs } from "@/components/ui/Tabs";
import { EmptyState } from "@/components/ui/EmptyState";
import { renderWithToast } from "./utils";

describe("Button", () => {
  it("désactivé : pas de clic, aria-disabled", () => {
    const onClick = vi.fn();
    render(<Button variant="primary" disabled onClick={onClick}>Payer</Button>);
    const b = screen.getByRole("button", { name: "Payer" });
    fireEvent.click(b);
    expect(onClick).not.toHaveBeenCalled();
    expect(b).toHaveAttribute("aria-disabled", "true");
  });
  it("loading : occupé et non cliquable", () => {
    const onClick = vi.fn();
    render(<Button variant="primary" loading onClick={onClick}>Payer</Button>);
    const b = screen.getByRole("button", { name: /Payer/ });
    fireEvent.click(b);
    expect(onClick).not.toHaveBeenCalled();
    expect(b).toHaveAttribute("aria-busy", "true");
  });
  it("type button par défaut (pas de soumission involontaire)", () => {
    render(<Button variant="outline">Annuler</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "button");
  });
});

describe("Field", () => {
  it("relie le label et l'erreur au champ", () => {
    render(<Field label="NIF" error="Le NIF doit contenir 10 chiffres. Vérifiez-le." />);
    const input = screen.getByLabelText("NIF");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("Le NIF doit contenir 10 chiffres. Vérifiez-le.");
  });
  it("sans erreur, l'aide sert de description", () => {
    render(<Field label="E-mail" hint="Nous ne le partageons jamais." />);
    expect(screen.getByLabelText("E-mail")).toHaveAccessibleDescription("Nous ne le partageons jamais.");
    expect(screen.getByLabelText("E-mail")).not.toHaveAttribute("aria-invalid");
  });
});

describe("Stars", () => {
  const kinds = (c: HTMLElement) => [...c.querySelectorAll("[data-star]")].map((e) => e.getAttribute("data-star"));
  it("4,6 = 4 pleines + 1 demie", () => {
    const { container } = render(<Stars value={4.6} />);
    expect(kinds(container)).toEqual(["full", "full", "full", "full", "half"]);
  });
  it("4,1 = 4 pleines + 1 vide", () => {
    const { container } = render(<Stars value={4.1} />);
    expect(kinds(container)).toEqual(["full", "full", "full", "full", "empty"]);
  });
  it("4,8 = 5 pleines (règle r >= i - 0,25)", () => {
    const { container } = render(<Stars value={4.8} />);
    expect(kinds(container)).toEqual(["full", "full", "full", "full", "full"]);
  });
  it("a un nom accessible en français", () => {
    render(<Stars value={4.6} />);
    expect(screen.getByRole("img", { name: "Note : 4,6 sur 5" })).toBeInTheDocument();
  });
});

describe("Price", () => {
  it("affiche le prix et le prix barré en HTG", () => {
    // textContent exact : Testing Library normalise l'espace insécable du DOM, pas celle du motif.
    const { container } = render(<Price amount={1250} was={1500} />);
    expect(container.querySelector("b")?.textContent).toBe("1 250 HTG");
    expect(container.querySelector("s")?.textContent).toBe("1 500 HTG");
  });
  it("n'affiche pas de prix barré s'il n'est pas supérieur", () => {
    const { container } = render(<Price amount={1250} was={1250} />);
    expect(container.querySelector("s")).toBeNull();
  });
});

describe("Tag", () => {
  it("porte son ton", () => {
    render(<Tag tone="ok">Retirée</Tag>);
    expect(screen.getByText("Retirée")).toHaveAttribute("data-tone", "ok");
  });
});

describe("QtyStepper", () => {
  function Ctl({ max = 3 }: { max?: number }) {
    const [v, setV] = useState(1);
    return <QtyStepper value={v} max={max} onChange={setV} />;
  }
  it("ne descend pas sous min", () => {
    render(<Ctl />);
    const minus = screen.getByRole("button", { name: "Retirer un" });
    expect(minus).toBeDisabled();
    fireEvent.click(minus);
    expect(screen.getByRole("spinbutton")).toHaveValue(1);
  });
  it("ne dépasse pas max", () => {
    render(<Ctl max={2} />);
    const plus = screen.getByRole("button", { name: "Ajouter un" });
    fireEvent.click(plus);
    expect(screen.getByRole("spinbutton")).toHaveValue(2);
    expect(plus).toBeDisabled();
  });
});

describe("RoundCheck", () => {
  it("est une vraie case à cocher", () => {
    const onChange = vi.fn();
    render(<RoundCheck checked={false} onChange={onChange} label="Tout" />);
    fireEvent.click(screen.getByRole("checkbox", { name: "Tout" }));
    expect(onChange).toHaveBeenCalledWith(true);
  });
});

describe("Modal", () => {
  function Demo() {
    const [open, setOpen] = useState(false);
    return (
      <>
        <button onClick={() => setOpen(true)}>Partager</button>
        <Modal open={open} onClose={() => setOpen(false)} title="Partager ce produit">
          <button>WhatsApp</button>
        </Modal>
      </>
    );
  }
  it("ferme sur Échap et rend le focus au déclencheur", () => {
    render(<Demo />);
    const trigger = screen.getByText("Partager");
    trigger.focus();
    fireEvent.click(trigger);
    const dialog = screen.getByRole("dialog", { name: "Partager ce produit" });
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog.contains(document.activeElement)).toBe(true);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(document.activeElement).toBe(trigger);
  });
  it("ferme avec le bouton Fermer", () => {
    render(<Demo />);
    fireEvent.click(screen.getByText("Partager"));
    fireEvent.click(screen.getByRole("button", { name: "Fermer" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});

describe("Tabs", () => {
  function Demo() {
    const [v, setV] = useState("all");
    return (
      <Tabs
        label="Statut"
        value={v}
        onChange={setV}
        tabs={[
          { id: "all", label: "Toutes" },
          { id: "ready", label: "Prêtes pour retrait" },
          { id: "promos", label: "Promos", feature: "native_app" },
        ]}
      />
    );
  }
  it("marque l'onglet actif et se déplace aux flèches", () => {
    renderWithToast(<Demo />);
    expect(screen.getByRole("tab", { name: "Toutes" })).toHaveAttribute("aria-selected", "true");
    fireEvent.keyDown(screen.getByRole("tab", { name: "Toutes" }), { key: "ArrowRight" });
    expect(screen.getByRole("tab", { name: "Prêtes pour retrait" })).toHaveAttribute("aria-selected", "true");
  });
  it("un onglet d'une version future affiche « À venir » sans changer l'onglet actif", () => {
    renderWithToast(<Demo />);
    fireEvent.click(screen.getByRole("tab", { name: /Promos/ }));
    expect(screen.getByRole("status")).toHaveTextContent("À venir");
    expect(screen.getByRole("tab", { name: "Toutes" })).toHaveAttribute("aria-selected", "true");
  });
});

describe("EmptyState", () => {
  it("affiche un message et une action", () => {
    render(<EmptyState icon="cart-shopping" title="Votre panier attend encore son premier article." action={<button>Découvrir</button>} />);
    expect(screen.getByText("Votre panier attend encore son premier article.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Découvrir" })).toBeInTheDocument();
  });
});
