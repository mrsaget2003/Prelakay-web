import { describe, it, expect, beforeEach } from "vitest";
import { demo, resetDemo } from "@/lib/demo/store";
import { MSG_NO_FUNDS, addToCart, payCart } from "@/lib/demo/actions";
import { payLabel, validatePayment } from "@/lib/domain/payment";

// Paiement (12 nov. 2026) : wallet, MonCash, NatCash, carte Visa / Mastercard.
beforeEach(() => resetDemo());

describe("moyen de paiement", () => {
  it("mobile money : numéro à 8 chiffres obligatoire ; carte et wallet : rien à saisir", () => {
    expect(validatePayment({ method: "moncash", phone: "12" })).toBe("Indiquez le numéro MonCash à 8 chiffres.");
    expect(validatePayment({ method: "natcash" })).toBe("Indiquez le numéro NatCash à 8 chiffres.");
    expect(validatePayment({ method: "moncash", phone: "3712 3456" })).toBeNull();
    expect(validatePayment({ method: "card" })).toBeNull();
    expect(validatePayment({ method: "wallet" })).toBeNull();
  });

  it("libellé : wallet par défaut", () => {
    expect(payLabel(undefined)).toBe("Wallet Prélakay");
    expect(payLabel("card")).toBe("Carte bancaire");
  });
});

describe("payer une commande", () => {
  it("wallet : le solde est débité, la commande garde son moyen", () => {
    addToCart("tech-1", 1);
    const before = demo.get().wallet;
    const r = payCart("w1", { pay: { method: "wallet" } });
    if (!r.ok) throw new Error(r.error);
    const o = demo.get().orders.find((x) => x.id === r.ids[0])!;
    expect(demo.get().wallet).toBe(before - o.total);
    expect(o.pay).toBe("wallet");
  });

  it("MonCash : le wallet n'est pas touché, même avec un solde insuffisant", () => {
    demo.update((s) => { s.wallet = 0; });
    addToCart("tech-1", 1);
    const r = payCart("m1", { pay: { method: "moncash", phone: "3712 3456" } });
    if (!r.ok) throw new Error(r.error);
    expect(demo.get().wallet).toBe(0);
    expect(demo.get().orders.find((x) => x.id === r.ids[0])!.pay).toBe("moncash");
  });

  it("carte : payée sans le wallet ; l'argent reste protégé (commande reçue, pas libérée)", () => {
    demo.update((s) => { s.wallet = 0; });
    addToCart("tech-1", 1);
    const r = payCart("c1", { pay: { method: "card" } });
    if (!r.ok) throw new Error(r.error);
    const o = demo.get().orders.find((x) => x.id === r.ids[0])!;
    expect(o).toMatchObject({ pay: "card", status: "received" });
  });

  it("mobile money sans numéro : refusé, rien n'est créé", () => {
    addToCart("tech-1", 1);
    const n = demo.get().orders.length;
    const r = payCart("m2", { pay: { method: "natcash" } });
    expect(r).toEqual({ ok: false, error: "Indiquez le numéro NatCash à 8 chiffres." });
    expect(demo.get().orders).toHaveLength(n);
  });

  it("wallet sans solde suffisant : refusé comme avant", () => {
    demo.update((s) => { s.wallet = 0; });
    addToCart("tech-1", 1);
    expect(payCart("w2", { pay: { method: "wallet" } })).toEqual({ ok: false, error: MSG_NO_FUNDS });
  });
});
