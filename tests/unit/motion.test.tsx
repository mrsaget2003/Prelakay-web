import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { HoldToConfirm, Reveal } from "@/components/proto/motion";

// Vie de l'interface (spec §9) : « Maintenir pour confirmer » sur les actions irréversibles,
// apparition progressive qui respecte prefers-reduced-motion.
afterEach(() => vi.useRealTimers());

describe("HoldToConfirm", () => {
  it("relâcher avant la fin n'appelle rien ; tenir 1 200 ms confirme une fois", () => {
    vi.useFakeTimers();
    const ok = vi.fn();
    render(<HoldToConfirm label="Bannir" onConfirm={ok} />);
    const b = screen.getByRole("button", { name: /Bannir/ });
    fireEvent.pointerDown(b);
    act(() => vi.advanceTimersByTime(600));
    fireEvent.pointerUp(b);
    act(() => vi.advanceTimersByTime(1000));
    expect(ok).not.toHaveBeenCalled();
    fireEvent.pointerDown(b);
    act(() => vi.advanceTimersByTime(1200));
    expect(ok).toHaveBeenCalledTimes(1);
    fireEvent.pointerUp(b);
    expect(ok).toHaveBeenCalledTimes(1);
  });
  it("au clavier : Entrée maintenue confirme aussi", () => {
    vi.useFakeTimers();
    const ok = vi.fn();
    render(<HoldToConfirm label="Suspendre" onConfirm={ok} ms={800} />);
    const b = screen.getByRole("button", { name: /Suspendre/ });
    fireEvent.keyDown(b, { key: "Enter" });
    act(() => vi.advanceTimersByTime(800));
    expect(ok).toHaveBeenCalledTimes(1);
  });
});

describe("Reveal", () => {
  it("rend ses enfants tout de suite (contenu jamais masqué au chargement)", () => {
    render(
      <Reveal>
        <p>Produit A</p>
        <p>Produit B</p>
      </Reveal>,
    );
    expect(screen.getByText("Produit A")).toBeInTheDocument();
    expect(screen.getByText("Produit B")).toBeInTheDocument();
  });
});
