import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PartnerPage } from "@/components/proto/partners";
import { resetDemo } from "@/lib/demo/store";

// Parité avec le formulaire vendeur `/sell` : la pièce d'identité se dépose par un vrai
// sélecteur de fichier, recto et verso, et non par un bouton qui bascule un état.
beforeEach(() => resetDemo());

const png = () => new File([new Uint8Array([1])], "piece.png", { type: "image/png" });
const files = () => screen.getAllByLabelText(/Recto|Verso/).filter((e) => e.getAttribute("type") === "file") as HTMLInputElement[];

describe("candidature partenaire de livraison : pièce d'identité", () => {
  it("deux sélecteurs de fichier, recto et verso, qui n'acceptent que des images", () => {
    render(<PartnerPage kind="delivery" />);
    const fs = files();
    expect(fs).toHaveLength(2);
    for (const i of fs) expect(i.accept).toBe("image/*");
  });

  it("une seule face ne suffit pas : le champ reste en erreur", () => {
    render(<PartnerPage kind="delivery" />);
    fireEvent.change(files()[0], { target: { files: [png()] } });
    fireEvent.click(screen.getByRole("button", { name: "Déposer ma candidature" }));
    expect(screen.getByText("Ajoutez votre pièce d'identité (recto et verso).")).toBeInTheDocument();
  });

  it("recto et verso déposés : chaque face le dit, et le champ n'est plus en erreur", () => {
    render(<PartnerPage kind="delivery" />);
    for (const i of files()) fireEvent.change(i, { target: { files: [png()] } });
    expect(screen.getAllByText("Ajoutée ✓")).toHaveLength(2);
    fireEvent.click(screen.getByRole("button", { name: "Déposer ma candidature" }));
    expect(screen.queryByText("Ajoutez votre pièce d'identité (recto et verso).")).toBeNull();
  });

  it("partenaire de paiement : aucune pièce d'identité demandée", () => {
    render(<PartnerPage kind="payment" />);
    expect(screen.queryAllByLabelText(/Recto|Verso/)).toHaveLength(0);
  });
});
