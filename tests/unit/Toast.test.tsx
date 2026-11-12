import { describe, it, expect, vi, afterEach } from "vitest";
import { screen, fireEvent, act } from "@testing-library/react";
import { ComingSoon } from "@/components/ui/ComingSoon";
import { SoonFromQuery } from "@/components/ui/SoonFromQuery";
import { TOAST_MS, useToast } from "@/components/ui/Toast";
import { renderWithToast } from "./utils";

// CHANGELOG règles 2-3 : action d'une version future → toast « À venir » (TOAST_MS, 1,8 s),
// aucune navigation ; option d'un choix → grisée + toast.
afterEach(() => vi.useRealTimers());

describe("ComingSoon", () => {
  it("affiche « À venir » pendant TOAST_MS dans une région live", () => {
    vi.useFakeTimers();
    renderWithToast(<ComingSoon feature="native_app"><a href="/app">{"Télécharger l'app"}</a></ComingSoon>);
    fireEvent.click(screen.getByText("Télécharger l'app"));
    expect(screen.getByRole("status")).toHaveTextContent("À venir");
    act(() => vi.advanceTimersByTime(TOAST_MS - 1));
    expect(screen.getByRole("status")).toHaveTextContent("À venir");
    act(() => vi.advanceTimersByTime(1));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("empêche l'action et la navigation", () => {
    const onClick = vi.fn();
    renderWithToast(<ComingSoon feature="sourcing"><button onClick={onClick}>X</button></ComingSoon>);
    const ev = new MouseEvent("click", { bubbles: true, cancelable: true });
    act(() => { screen.getByText("X").dispatchEvent(ev); });
    expect(onClick).not.toHaveBeenCalled();
    expect(ev.defaultPrevented).toBe(true);
  });

  it("laisse passer une fonctionnalité disponible", () => {
    const onClick = vi.fn();
    renderWithToast(<ComingSoon feature="cart"><button onClick={onClick}>X</button></ComingSoon>);
    fireEvent.click(screen.getByText("X"));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("option grisée (asOption) : aria-disabled + toast", () => {
    renderWithToast(<ComingSoon feature="creole" asOption><button>Créole</button></ComingSoon>);
    const opt = screen.getByText("Créole");
    expect(opt).toHaveAttribute("aria-disabled", "true");
    fireEvent.click(opt);
    expect(screen.getByRole("status")).toHaveTextContent("À venir");
  });
});

describe("useToast", () => {
  function Demo() {
    const t = useToast();
    return (
      <>
        <button onClick={() => t.show("Ajouté au panier", "success")}>ok</button>
        <button onClick={() => t.show("Le paiement n'est pas passé. Vérifiez votre solde et réessayez.", "error")}>ko</button>
      </>
    );
  }

  it("un seul toast à la fois : le suivant remplace le précédent", () => {
    renderWithToast(<Demo />);
    fireEvent.click(screen.getByText("ok"));
    fireEvent.click(screen.getByText("ko"));
    expect(screen.getAllByRole("status")).toHaveLength(1);
    expect(screen.getByRole("status")).toHaveTextContent("Le paiement n'est pas passé");
    expect(screen.getByRole("status")).toHaveAttribute("data-kind", "error");
  });

  it("le remplacement relance le délai", () => {
    vi.useFakeTimers();
    renderWithToast(<Demo />);
    fireEvent.click(screen.getByText("ok"));
    act(() => vi.advanceTimersByTime(TOAST_MS - 400));
    fireEvent.click(screen.getByText("ko"));
    act(() => vi.advanceTimersByTime(TOAST_MS - 400));
    expect(screen.getByRole("status")).toBeInTheDocument();
  });
});

describe("Sileo", () => {
  function One() {
    const t = useToast();
    return <button onClick={() => t.show("Commande payée", "success")}>go</button>;
  }
  it("le toast est dessiné par Sileo (visuel) et annoncé par la région live", async () => {
    renderWithToast(<One />);
    fireEvent.click(screen.getByText("go"));
    expect(screen.getByRole("status")).toHaveTextContent("Commande payée");
    await vi.waitFor(() => expect(document.querySelector("[data-sileo-toast] [data-sileo-title]")?.textContent).toBe("Commande payée"));
  });
});

describe("SoonFromQuery", () => {
  it("affiche « À venir » quand l'URL porte ?soon=", () => {
    renderWithToast(<SoonFromQuery search="?soon=events" />);
    expect(screen.getByRole("status")).toHaveTextContent("À venir");
  });
  it("ne fait rien sans paramètre", () => {
    renderWithToast(<SoonFromQuery search="" />);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});

describe("durée", () => {
  it("un toast disparaît en moins de 2 s (12 nov. 2026 : « trop long »)", () => {
    expect(TOAST_MS).toBeLessThanOrEqual(2000);
  });
});
