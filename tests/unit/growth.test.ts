import { describe, it, expect, beforeEach } from "vitest";
import { demo, resetDemo } from "@/lib/demo/store";
import { PLUS_PRICE, REFERRAL_COINS, ambDecide, applyAmbassador, cancelPlus, completeReferral, refLink, subscribePlus } from "@/lib/demo/growth";
import { badgesOf } from "@/lib/demo/marketing";
import type { Me } from "@/lib/demo/admin";

// Parrainage (500 Coins, anti-abus ⚠️ non implémenté), ambassadeurs étudiants, Prélakay+ (1 500 HTG / mois).
beforeEach(() => resetDemo());
const ME: Me = { e: "marketing@prelakay.ht", n: "Ketia Baptiste", role: "marketing" };

describe("Prélakay+", () => {
  it("l'abonnement débite 1 500 HTG et donne le badge Prélakay+", () => {
    expect(PLUS_PRICE).toBe(1500);
    const w = demo.get().wallet;
    expect(subscribePlus()).toBeNull();
    expect(demo.get().wallet).toBe(w - 1500);
    expect(demo.get().growth.plus).toMatchObject({ since: expect.any(String), next: expect.any(String) });
    expect(badgesOf("buyer", "", demo.get())).toContain("Prélakay+");
    expect(subscribePlus()).toBe("Vous êtes déjà abonné.");
  });
  it("solde insuffisant refusé", () => {
    demo.update((s) => { s.wallet = 1000; });
    expect(subscribePlus()).toBe("Solde insuffisant. Rechargez votre wallet.");
    expect(demo.get().growth.plus).toBeNull();
  });
  it("résilier retire l'abonnement", () => {
    subscribePlus();
    cancelPlus();
    expect(demo.get().growth.plus).toBeNull();
  });
});

describe("parrainage", () => {
  it("un parrainage terminé crédite 500 Coins une seule fois", () => {
    expect(REFERRAL_COINS).toBe(500);
    const c = demo.get().coins;
    expect(completeReferral("@ti_jan")).toBeNull();
    expect(demo.get().coins).toBe(c + 500);
    expect(completeReferral("@ti_jan")).toBe("Parrainage déjà terminé.");
    expect(demo.get().coins).toBe(c + 500);
  });
  it("lien de parrainage personnel", () => {
    expect(refLink(demo.get())).toBe("prelakay.com/r/marckarlin");
  });
});

describe("ambassadeurs étudiants", () => {
  it("candidature avec établissement obligatoire ; validation admin journalisée", () => {
    expect(applyAmbassador("  ")).toBe("Indiquez votre établissement.");
    expect(applyAmbassador("Université Notre-Dame, Les Cayes")).toBeNull();
    expect(demo.get().growth.amb).toMatchObject({ st: "recu" });
    expect(ambDecide(ME, true)).toBeNull();
    expect(demo.get().growth.amb?.st).toBe("ok");
    expect(demo.get().admin.audit[0]).toMatchObject({ a: "Ambassadeur validé" });
  });
});
