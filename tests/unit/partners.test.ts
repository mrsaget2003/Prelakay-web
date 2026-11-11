import { describe, it, expect, beforeEach } from "vitest";
import { demo, resetDemo } from "@/lib/demo/store";
import { validatePartner, type PartnerInput } from "@/lib/domain/partners";
import { partnerDecide, partnersFor, submitPartner } from "@/lib/demo/partners";
import type { Me } from "@/lib/demo/admin";

// Pages « Devenir partenaire de paiement / de livraison » (spec §7) et file Admin → Partenaires.
beforeEach(() => resetDemo());
const ME: Me = { e: "support@prelakay.ht", n: "Nadège Pierre", role: "support" };

const DRIVER: PartnerInput = {
  kind: "delivery", who: "person", name: "Wilfrid Augustin", phone: "3712 3456", email: "", dob: "1998-04-12",
  zone: "Bergeaud", vehicle: "moto", avail: "Soirs et week-ends", docs: true, msg: "",
};
const PAY: PartnerInput = {
  kind: "payment", who: "company", name: "Jean Paul", phone: "2810 0000", email: "partenariat@banque.ht",
  org: "Banque du Sud", orgType: "bank", volume: "500 000 HTG / mois", docs: false, msg: "",
};

describe("validation des candidatures", () => {
  it("livreur sans véhicule : refusé, champ en erreur", () => {
    expect(validatePartner({ ...DRIVER, vehicle: "" }, new Date("2026-11-10"))).toEqual({ vehicle: "Indiquez votre véhicule." });
  });
  it("livreur de moins de 18 ans refusé ; téléphone haïtien à 8 chiffres", () => {
    const e = validatePartner({ ...DRIVER, dob: "2010-01-01", phone: "123" }, new Date("2026-11-10"));
    expect(e.dob).toBe("Il faut avoir au moins 18 ans.");
    expect(e.phone).toBe("Numéro à 8 chiffres.");
  });
  it("livreur : pièce d'identité recto / verso obligatoire", () => {
    expect(validatePartner({ ...DRIVER, docs: false }, new Date("2026-11-10")).docs).toBe("Ajoutez votre pièce d'identité (recto et verso).");
  });
  it("paiement : organisation, type et e-mail obligatoires", () => {
    const e = validatePartner({ ...PAY, org: "", orgType: "", email: "x" }, new Date("2026-11-10"));
    expect(Object.keys(e).sort()).toEqual(["email", "org", "orgType"]);
  });
  it("candidatures complètes : aucune erreur", () => {
    expect(validatePartner(DRIVER, new Date("2026-11-10"))).toEqual({});
    expect(validatePartner(PAY, new Date("2026-11-10"))).toEqual({});
  });
});

describe("file Admin → Partenaires", () => {
  it("candidature valide → numéro PL-… / PP-… et apparition dans la file", () => {
    const a = submitPartner(DRIVER);
    const b = submitPartner(PAY);
    if (!a.ok || !b.ok) throw new Error("refus");
    expect(a.id).toMatch(/^PL-\d{4}$/);
    expect(b.id).toMatch(/^PP-\d{4}$/);
    const ids = partnersFor("super", demo.get()).map((p) => p.id);
    expect(ids).toEqual(expect.arrayContaining([a.id, b.id]));
  });
  it("Finance ne voit que les candidatures de paiement ; Marketing aucune", () => {
    submitPartner(DRIVER);
    expect(partnersFor("finance", demo.get()).every((p) => p.kind === "payment")).toBe(true);
    expect(partnersFor("finance", demo.get()).length).toBeGreaterThan(0);
    expect(partnersFor("marketing", demo.get())).toEqual([]);
  });
  it("rejet : motif obligatoire, journalisé, statut visible", () => {
    const r = submitPartner(DRIVER);
    if (!r.ok) throw new Error("refus");
    expect(partnerDecide(ME, r.id, "rej")).toBe("Indiquez un motif.");
    expect(partnerDecide(ME, r.id, "rej", "Permis expiré")).toBeNull();
    const p = partnersFor("super", demo.get()).find((x) => x.id === r.id)!;
    expect(p).toMatchObject({ st: "rej", why: "Permis expiré" });
    expect(demo.get().admin.audit[0]).toMatchObject({ a: "Candidature partenaire rejetée", who: "Nadège Pierre" });
  });
});
