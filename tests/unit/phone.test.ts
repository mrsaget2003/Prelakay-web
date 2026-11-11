import { describe, it, expect, beforeEach } from "vitest";
import { normalizeHtPhone, demoOtp, otpOk } from "@/lib/domain/phone";
import { startDictation } from "@/lib/ui/speech";
import { photoSearchCategory } from "@/lib/ui/photoSearch";
import { CATS } from "@/lib/data/mock/seed";
import { demo, resetDemo } from "@/lib/demo/store";
import { inviteStaff, removeStaff } from "@/lib/demo/staff";

// Inscription par téléphone + code SMS, recherches vocale et par photo, comptes employés
// (ex-V2, actifs dans le prototype — CLAUDE.md 10 nov. 2026).
beforeEach(() => resetDemo());

describe("téléphone haïtien", () => {
  it("8 chiffres, préfixe +509 facultatif, espaces et tirets ignorés", () => {
    expect(normalizeHtPhone("+509 3712-3456")).toBe("37123456");
    expect(normalizeHtPhone("509 37123456")).toBe("37123456");
    expect(normalizeHtPhone("3712 3456")).toBe("37123456");
    expect(normalizeHtPhone("1234")).toBeNull();
    expect(normalizeHtPhone("371234567")).toBeNull();
  });
  it("code SMS de démonstration à 6 chiffres, vérifié tel quel", () => {
    const c = demoOtp("37123456");
    expect(c).toMatch(/^\d{6}$/);
    expect(demoOtp("37123456")).toBe(c);
    expect(otpOk("37123456", c)).toBe(true);
    expect(otpOk("37123456", "000000")).toBe(c === "000000");
  });
});

describe("recherches du navigateur", () => {
  it("dictée : null quand le navigateur n'a pas la reconnaissance vocale (jsdom)", () => {
    expect(startDictation(() => {})).toBeNull();
  });
  it("photo : catégorie de démonstration stable pour un même fichier", () => {
    const a = photoSearchCategory("robe-bleue.jpg");
    expect(CATS.map((c) => c.id)).toContain(a);
    expect(photoSearchCategory("robe-bleue.jpg")).toBe(a);
  });
});

describe("comptes employés", () => {
  it("inviter : nom et téléphone haïtien obligatoires ; pas de doublon ; retirer", () => {
    expect(inviteStaff({ n: "", tel: "3712 3456", role: "prep" })).toBe("Indiquez le nom de l'employé.");
    expect(inviteStaff({ n: "Rose", tel: "12", role: "prep" })).toBe("Numéro à 8 chiffres.");
    expect(inviteStaff({ n: "Rose", tel: "3712 3456", role: "prep" })).toBeNull();
    expect(inviteStaff({ n: "Rose B.", tel: "+509 37123456", role: "cash" })).toBe("Ce numéro est déjà invité.");
    expect(demo.get().seller.staff).toEqual([{ n: "Rose", tel: "37123456", role: "prep", st: "invited" }]);
    removeStaff("37123456");
    expect(demo.get().seller.staff).toEqual([]);
  });
});
