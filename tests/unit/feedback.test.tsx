import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { useFlash } from "@/components/ui/Feedback";

// Tri des toasts (spec §9) : le retour se voit sur le bouton (« Ajouté ✓ », « Copié »).
afterEach(() => vi.useRealTimers());

function Btn() {
  const [on, flash] = useFlash();
  return <button onClick={flash}>{on ? "Ajouté" : "Ajouter"}</button>;
}

describe("useFlash", () => {
  it("vrai juste après l'appel, faux après 1 600 ms", () => {
    vi.useFakeTimers();
    render(<Btn />);
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByRole("button")).toHaveTextContent("Ajouté");
    act(() => vi.advanceTimersByTime(1599));
    expect(screen.getByRole("button")).toHaveTextContent("Ajouté");
    act(() => vi.advanceTimersByTime(1));
    expect(screen.getByRole("button")).toHaveTextContent("Ajouter");
  });
  it("un second appel relance la durée", () => {
    vi.useFakeTimers();
    render(<Btn />);
    fireEvent.click(screen.getByRole("button"));
    act(() => vi.advanceTimersByTime(1000));
    fireEvent.click(screen.getByRole("button"));
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.getByRole("button")).toHaveTextContent("Ajouté");
  });
});
