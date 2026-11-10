import { describe, it, expect } from "vitest";
import { ageOn, isAdult, validateKyc } from "@/lib/domain/kyc";

// KYC vendeur (PRD §3) : date de naissance ≥ 18 ans, champs et pièce recto / verso obligatoires.
describe("âge", () => {
  it("18 ans la veille de l'anniversaire : refusé ; le jour même : accepté", () => {
    const today = new Date(2026, 10, 6);
    expect(isAdult("2008-11-07", today)).toBe(false);
    expect(isAdult("2008-11-06", today)).toBe(true);
    expect(ageOn("2008-11-07", today)).toBe(17);
  });
  it("né un 29 février", () => {
    expect(ageOn("2008-02-29", new Date(2026, 1, 28))).toBe(17);
    expect(ageOn("2008-02-29", new Date(2026, 2, 1))).toBe(18);
  });
});

describe("validateKyc", () => {
  const ok = { fn: "Marc", ln: "Saget", dob: "1990-05-02", nif: "0123456789", ninu: "1234567890", files: 2 };
  const today = new Date(2026, 10, 6);
  it("dossier complet : aucune erreur", () => {
    expect(validateKyc(ok, today)).toBeNull();
  });
  it("champ manquant", () => {
    expect(validateKyc({ ...ok, nif: " " }, today)).toBe("Complétez tous les champs.");
  });
  it("pièce incomplète", () => {
    expect(validateKyc({ ...ok, files: 1 }, today)).toBe("Ajoutez le recto et le verso de votre pièce.");
  });
  it("mineur", () => {
    expect(validateKyc({ ...ok, dob: "2010-01-01" }, today)).toBe("Vous devez avoir au moins 18 ans pour vendre sur Prélakay.");
  });
});
