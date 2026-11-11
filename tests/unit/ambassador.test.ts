import { describe, it, expect, beforeEach } from "vitest";
import { ambassadorSummary, validateAmbassador, type AmbassadorInput } from "@/lib/domain/ambassador";
import { applyAmbassador } from "@/lib/demo/growth";
import { demo, resetDemo } from "@/lib/demo/store";
import FACULTES from "@/lib/data/facultes.json";

// Candidature ambassadeur étudiant (11 nov. 2026) : profil étudiant complet,
// avec auto-complétion des universités et des facultés.
beforeEach(() => resetDemo());

const OK: AmbassadorInput = {
  university: "Université d'État d'Haïti",
  faculty: "Faculté des Sciences",
  year: "3e année",
  city: "Les Cayes",
  phone: "3712 3456",
  network: "Instagram",
  handle: "@marckarlin",
  followers: "500-2000",
  hours: "4-8",
  why: "Je connais beaucoup d'étudiants qui achètent déjà en ligne et je veux les aider.",
};

describe("validation de la candidature", () => {
  it("une candidature complète ne lève aucune erreur", () => {
    expect(validateAmbassador(OK)).toEqual({});
  });

  it("chaque champ obligatoire manquant est signalé", () => {
    const e = validateAmbassador({ ...OK, university: "", faculty: " ", year: "", city: "", phone: "12" });
    expect(Object.keys(e).sort()).toEqual(["city", "faculty", "phone", "university", "year"]);
  });

  it("« Aucun » réseau : ni pseudo ni nombre d'abonnés demandés", () => {
    expect(validateAmbassador({ ...OK, network: "Aucun", handle: "", followers: "" })).toEqual({});
  });

  it("un réseau déclaré sans pseudo est refusé", () => {
    expect(validateAmbassador({ ...OK, handle: "" }).handle).toBe("Indiquez votre pseudo sur ce réseau.");
  });

  it("la motivation doit dépasser quelques mots", () => {
    expect(validateAmbassador({ ...OK, why: "je veux" }).why).toMatch(/30 caractères/);
  });

  it("résumé : faculté · université · année · ville", () => {
    expect(ambassadorSummary(OK)).toBe("Faculté des Sciences · Université d'État d'Haïti · 3e année · Les Cayes");
  });
});

describe("dépôt de la candidature", () => {
  it("une candidature valide est reçue et garde le profil", () => {
    expect(applyAmbassador(OK)).toBeNull();
    const a = demo.get().growth.amb!;
    expect(a.st).toBe("recu");
    expect(a.school).toBe(ambassadorSummary(OK));
    expect(a.profile?.phone).toBe(OK.phone);
  });

  it("une candidature incomplète est refusée et rien n'est enregistré", () => {
    expect(applyAmbassador({ ...OK, city: "" })).toBe("Indiquez votre ville.");
    expect(demo.get().growth.amb).toBeNull();
  });
});

describe("liste des facultés (auto-complétion)", () => {
  it("chaque université a un nom et une liste de facultés", () => {
    expect(FACULTES.universites.length).toBeGreaterThan(0);
    for (const u of FACULTES.universites) {
      expect(u.nom.trim().length, JSON.stringify(u)).toBeGreaterThan(2);
      expect(Array.isArray(u.facultes)).toBe(true);
    }
  });

  it("aucun doublon d'université", () => {
    const noms = FACULTES.universites.map((u) => u.nom);
    expect(new Set(noms).size).toBe(noms.length);
  });
});
