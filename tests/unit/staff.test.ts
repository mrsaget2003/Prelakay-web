import { describe, it, expect, beforeEach } from "vitest";
import { demo, resetDemo } from "@/lib/demo/store";
import { createStaffLink, inviteStaff, removeStaff, staffInviteUrl } from "@/lib/demo/staff";
import { mailLink, smsLink, waLink } from "@/lib/proto/shareLinks";

// Employés d'un store (12 nov. 2026) : invitation par SMS, ou par lien à copier / partager.
beforeEach(() => resetDemo());

describe("invitation par SMS", () => {
  it("nom et numéro à 8 chiffres obligatoires ; pas deux fois le même numéro", () => {
    expect(inviteStaff({ n: "", tel: "37123456", role: "prep" })).toBe("Indiquez le nom de l'employé.");
    expect(inviteStaff({ n: "Rose", tel: "12", role: "prep" })).toBe("Numéro à 8 chiffres.");
    expect(inviteStaff({ n: "Rose", tel: "3712 3456", role: "prep" })).toBeNull();
    expect(inviteStaff({ n: "Rose", tel: "37123456", role: "cash" })).toBe("Ce numéro est déjà invité.");
    expect(demo.get().seller.staff[0]).toMatchObject({ n: "Rose", via: "sms", st: "invited" });
  });
});

describe("invitation par lien", () => {
  it("crée un lien vers l'espace vendeur et une invitation en attente, sans téléphone", () => {
    const { token, url } = createStaffLink("cash");
    expect(url).toBe(staffInviteUrl(token));
    expect(url).toMatch(/^https:\/\/vendeur\.prelakay\.com\/rejoindre\/.+/);
    expect(demo.get().seller.staff.at(-1)).toMatchObject({ via: "lien", role: "cash", st: "invited", tel: "", token });
  });

  it("deux liens n'ont jamais le même jeton", () => {
    const a = createStaffLink("prep");
    const b = createStaffLink("prep");
    expect(a.token).not.toBe(b.token);
  });

  it("annuler une invitation par lien la retire de l'équipe, sans toucher aux autres", () => {
    inviteStaff({ n: "Rose", tel: "37123456", role: "prep" });
    const { token } = createStaffLink("cash");
    removeStaff(token);
    expect(demo.get().seller.staff.map((m) => m.n)).toEqual(["Rose"]);
  });

  it("le lien se partage par WhatsApp, SMS et e-mail, texte compris", () => {
    const url = "https://vendeur.prelakay.com/rejoindre/abc";
    expect(waLink(url, "Rejoignez")).toBe("https://wa.me/?text=" + encodeURIComponent("Rejoignez " + url));
    expect(smsLink(url, "Rejoignez")).toBe("sms:?&body=" + encodeURIComponent("Rejoignez " + url));
    expect(mailLink(url, "Invitation")).toBe(`mailto:?subject=Invitation&body=${encodeURIComponent(url)}`);
  });
});
