import { describe, it, expect } from "vitest";
import { normalizeUsername, validateLogin, validateSignup, type SignupInput } from "@/lib/domain/auth";

// Inscription et connexion (12 nov. 2026) : confirmation du mot de passe obligatoire.
const OK: SignupInput = { email: "marc@exemple.ht", username: "@Marc_Karlin", password: "lakay2026", confirm: "lakay2026" };

describe("inscription", () => {
  it("un formulaire complet ne lève aucune erreur", () => {
    expect(validateSignup(OK)).toEqual({});
  });

  it("la confirmation est obligatoire et doit être identique", () => {
    expect(validateSignup({ ...OK, confirm: "" }).confirm).toBe("Confirmez votre mot de passe.");
    expect(validateSignup({ ...OK, confirm: "lakay2025" }).confirm).toBe("Les deux mots de passe ne sont pas identiques.");
  });

  it("mot de passe de 8 caractères au minimum", () => {
    expect(validateSignup({ ...OK, password: "court", confirm: "court" }).password).toBe("8 caractères au minimum.");
  });

  it("e-mail et @username valides", () => {
    const e = validateSignup({ ...OK, email: "marc@", username: "a b" });
    expect(Object.keys(e).sort()).toEqual(["email", "username"]);
  });

  it("@username : le « @ » est facultatif, la casse est ramenée en minuscules", () => {
    expect(normalizeUsername("  @Marc_Karlin ")).toBe("marc_karlin");
  });
});

describe("connexion", () => {
  it("e-mail valide et mot de passe saisi", () => {
    expect(validateLogin({ email: "marc@exemple.ht", password: "x" })).toEqual({});
    expect(Object.keys(validateLogin({ email: "", password: "" })).sort()).toEqual(["email", "password"]);
  });
});
