import { describe, it, expect, vi, afterEach } from "vitest";
import { screen, fireEvent, act } from "@testing-library/react";
import { ComingSoon } from "@/components/ui/ComingSoon";
import { SoonFromQuery } from "@/components/ui/SoonFromQuery";
import { useToast } from "@/components/ui/Toast";
import { renderWithToast } from "./utils";

// CHANGELOG règles 2-3 : action d'une version future → toast « À venir » 3 s,
// aucune navigation ; option d'un choix → grisée + toast.
afterEach(() => vi.useRealTimers());

describe("ComingSoon", () => {
  it("affiche « À venir » 3 s dans une région live", () => {
    vi.useFakeTimers();
    renderWithToast(<ComingSoon feature="native_app"><a href="/app">Télécharger l'app</a></ComingSoon>);
    fireEvent.click(screen.getByText("Télécharger l'app"));
    expect(screen.getByRole("status")).toHaveTextContent("À venir");
    act(() => vi.advanceTimersByTime(2999));
    expect(screen.getByRole("status")).toHaveTextContent("À venir");
    act(() => vi.advanceTimersByTime(1));
    expect(screen.queryByText("À venir")).not.toBeInTheDocument();
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
    expect(screen.queryByText("À venir")).not.toBeInTheDocument();
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

  it("le remplacement relance les 3 s", () => {
    vi.useFakeTimers();
    renderWithToast(<Demo />);
    fireEvent.click(screen.getByText("ok"));
    act(() => vi.advanceTimersByTime(2000));
    fireEvent.click(screen.getByText("ko"));
    act(() => vi.advanceTimersByTime(2000));
    expect(screen.getByRole("status")).toBeInTheDocument();
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
