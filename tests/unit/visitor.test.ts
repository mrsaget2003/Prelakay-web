import { describe, it, expect } from "vitest";
import { noteVisitorView, visitorBlocked, visitorLeft } from "@/lib/domain/visitor";

// Quota de fiches pour les visiteurs (12 nov. 2026) : N = 5 en démo [À CONFIRMER].
describe("quota visiteur", () => {
  it("les 5 premières fiches restent ouvertes, la 6e est bloquée", () => {
    let v: string[] = [];
    for (const id of ["a", "b", "c", "d", "e"]) {
      expect(visitorBlocked(v, id, 5), id).toBe(false);
      v = noteVisitorView(v, id);
    }
    expect(visitorBlocked(v, "f", 5)).toBe(true);
  });

  it("revenir sur une fiche déjà vue ne consomme rien et reste ouvert", () => {
    const v = noteVisitorView(noteVisitorView(["a"], "b"), "a");
    expect(v).toEqual(["a", "b"]);
    expect(visitorBlocked(["a", "b", "c", "d", "e", "f"], "c", 5)).toBe(false);
  });

  it("une fiche au-delà du quota reste bloquée même si on y revient", () => {
    expect(visitorBlocked(["a", "b", "c", "d", "e", "f"], "f", 5)).toBe(true);
  });

  it("fiches restantes", () => {
    expect(visitorLeft(["a", "b"], 5)).toBe(3);
    expect(visitorLeft(["a", "b", "c", "d", "e", "f"], 5)).toBe(0);
  });
});
