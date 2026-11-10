import { describe, it, expect } from "vitest";
import { can, canEdit, sectionOf, loginStep, maskId, type LoginState } from "@/lib/domain/admin";
import { BUSINESS } from "@/lib/config/business";

// Console admin (03-design §9.11, plan B8) : rôles, permissions, connexion.
describe("permissions par rôle (PERM du prototype)", () => {
  it("Marketing n'a pas accès aux dossiers KYC ; Support oui", () => {
    expect(can("marketing", "kyc")).toBe(false);
    expect(can("support", "kyc")).toBe(true);
  });
  it("Finance lit les paramètres sans pouvoir les modifier ; seul Superadmin modifie", () => {
    expect(can("finance", "settings")).toBe(true);
    expect(canEdit("finance", "settings")).toBe(false);
    expect(canEdit("super", "settings")).toBe(true);
  });
  it("l'équipe et le journal sont réservés au Superadmin", () => {
    for (const r of ["support", "finance", "marketing"] as const) {
      expect(can(r, "team")).toBe(false);
      expect(can(r, "audit")).toBe(false);
    }
    expect(can("super", "team")).toBe(true);
  });
  it("section d'une route admin", () => {
    expect(sectionOf("/admin")).toBe("dash");
    expect(sectionOf("/admin/kyc/KYC-0148")).toBe("kyc");
    expect(sectionOf("/admin/search")).toBe("search");
  });
});

describe("connexion (mot de passe puis code à 6 chiffres)", () => {
  const S0: LoginState = { fails: 0, lockUntil: 0 };
  const creds = { password: "pw-demo", otp: "135790" };
  it("bon mot de passe d'un membre actif → étape du code", () => {
    const r = loginStep(S0, { email: "Support@prelakay.ht", password: "pw-demo" }, creds, 1000);
    expect(r).toMatchObject({ ok: true, email: "support@prelakay.ht" });
  });
  it("le 5e échec bloque la connexion ; une tentative pendant le blocage est refusée", () => {
    let st = S0;
    for (let i = 1; i < BUSINESS.adminMaxFailures; i++) {
      const r = loginStep(st, { email: "support@prelakay.ht", password: "faux" }, creds, 1000);
      expect(r.ok).toBe(false);
      if (!r.ok) {
        expect(r.locked).toBe(false);
        expect(r.left).toBe(BUSINESS.adminMaxFailures - i);
        st = r.state;
      }
    }
    const last = loginStep(st, { email: "support@prelakay.ht", password: "faux" }, creds, 1000);
    expect(last.ok).toBe(false);
    if (last.ok) return;
    expect(last.locked).toBe(true);
    const during = loginStep(last.state, { email: "support@prelakay.ht", password: "pw-demo" }, creds, 1001);
    expect(during).toMatchObject({ ok: false, locked: true });
  });
  it("adresse hors équipe → refus (même message qu'un mauvais mot de passe)", () => {
    const r = loginStep(S0, { email: "inconnu@gmail.com", password: "pw-demo" }, creds, 1000);
    expect(r.ok).toBe(false);
  });
});

describe("données sensibles", () => {
  it("NIF et NINU masqués dans les listes", () => {
    expect(maskId("0041234521", "nif")).toBe("004 ••• ••21");
    expect(maskId("1234567888", "ninu")).toBe("12 ••• •••88");
  });
});
