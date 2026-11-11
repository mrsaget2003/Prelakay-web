import { describe, it, expect, beforeEach } from "vitest";
import { demo, resetDemo } from "@/lib/demo/store";
import { addToCart, payCart, validateDelivery } from "@/lib/demo/actions";
import { DELIVERY_STEPS, deliveryFee, nextDeliveryStatus } from "@/lib/domain/delivery";
import { prodBy } from "@/lib/data/mock/seed";
import { BUSINESS } from "@/lib/config/business";

// Livraison dès le lancement (CLAUDE.md 10 nov. 2026, spec §6) : choix par store au paiement,
// frais de démonstration par quartier, statuts, code de livraison.
beforeEach(() => resetDemo());

const ADDR = { zone: "Bergeaud", mark: "près de l'église", phone: "37000000" };

describe("règles", () => {
  it("statuts de livraison dans l'ordre ; la dernière étape attend le code", () => {
    expect(DELIVERY_STEPS).toEqual(["received", "prep", "handed", "enroute", "delivered"]);
    expect(nextDeliveryStatus("prep")).toBe("handed");
    expect(nextDeliveryStatus("handed")).toBe("enroute");
    expect(nextDeliveryStatus("enroute")).toBe("delivered");
    expect(nextDeliveryStatus("delivered")).toBeNull();
  });
  it("frais : valeur de démonstration par quartier, valeur par défaut sinon", () => {
    expect(deliveryFee("Bergeaud")).toBe(BUSINESS.demoDeliveryFee["Bergeaud"]);
    expect(deliveryFee("Inconnu")).toBe(BUSINESS.demoDeliveryFeeDefault);
  });
});

describe("paiement mixte retrait + livraison", () => {
  function twoStores() {
    addToCart("beaute-0", 1);
    addToCart("tech-1", 1);
    const s = demo.get();
    const stores = [...new Set(s.cart.map((c) => prodBy(c.p)!.store))];
    expect(stores).toHaveLength(2);
    return stores as [string, string];
  }

  it("deux commandes, frais sur la seule livraison, un seul débit ; idempotent", () => {
    const [a, b] = twoStores();
    const w0 = demo.get().wallet;
    const r = payCart("k-mix", { modes: { [a]: "pickup", [b]: "delivery" }, addr: ADDR });
    if (!r.ok) throw new Error(r.error);
    const orders = demo.get().orders.filter((o) => r.ids.includes(o.id));
    expect(orders).toHaveLength(2);
    const pick = orders.find((o) => o.store === a)!;
    const del = orders.find((o) => o.store === b)!;
    expect(pick.mode ?? "pickup").toBe("pickup");
    expect(pick.fee ?? 0).toBe(0);
    expect(del.mode).toBe("delivery");
    expect(del.fee).toBe(deliveryFee("Bergeaud"));
    expect(del.addr).toEqual(ADDR);
    expect(demo.get().wallet).toBe(w0 - pick.total - del.total - del.fee!);
    const again = payCart("k-mix", { modes: { [a]: "pickup", [b]: "delivery" }, addr: ADDR });
    expect(again).toEqual(r);
    expect(demo.get().wallet).toBe(w0 - pick.total - del.total - del.fee!);
  });

  it("livraison sans adresse complète refusée", () => {
    const [, b] = twoStores();
    expect(payCart("k-noaddr", { modes: { [b]: "delivery" } })).toEqual({ ok: false, error: "Indiquez l'adresse de livraison." });
    expect(payCart("k-noaddr2", { modes: { [b]: "delivery" }, addr: { zone: "Bergeaud", mark: "", phone: "12" } })).toEqual({ ok: false, error: "Indiquez l'adresse de livraison." });
  });

  it("solde insuffisant en comptant les frais", () => {
    const [, b] = twoStores();
    const s = demo.get();
    const sub = s.cart.reduce((a, c) => a + prodBy(c.p)!.price * c.q, 0);
    demo.update((d) => { d.wallet = sub; });
    const r = payCart("k-funds", { modes: { [b]: "delivery" }, addr: ADDR });
    expect(r.ok).toBe(false);
  });
});

describe("code de livraison", () => {
  it("le bon code passe la commande « Livrée » et crédite les Coins ; un mauvais code est refusé", () => {
    addToCart("tech-1", 1);
    const store = prodBy("tech-1")!.store;
    const r = payCart("k-code", { modes: { [store]: "delivery" }, addr: ADDR });
    if (!r.ok) throw new Error(r.error);
    const id = r.ids[0];
    demo.update((s) => { const o = s.orders.find((x) => x.id === id)!; o.status = "enroute"; o.code = "246810"; });
    const coins = demo.get().coins;
    expect(validateDelivery(id, "111111")).toBe("Code incorrect.");
    expect(demo.get().orders.find((o) => o.id === id)!.status).toBe("enroute");
    expect(validateDelivery(id, "246810")).toBeNull();
    expect(demo.get().orders.find((o) => o.id === id)!.status).toBe("delivered");
    expect(demo.get().coins).toBe(coins + BUSINESS.coinsPerOrder);
  });
});

describe("livraisons de démonstration (admin)", () => {
  it("chaque article existe et appartient au store de la livraison ; le quartier a des frais", async () => {
    const { DEMO_DELIVERIES } = await import("@/lib/demo/delivery");
    for (const o of DEMO_DELIVERIES) {
      for (const it of o.items) {
        const p = prodBy(it.p);
        expect(p, `${o.id} ${it.p}`).toBeTruthy();
        expect(p!.store, `${o.id} ${it.p}`).toBe(o.store);
      }
      expect(o.fee).toBe(deliveryFee(o.addr!.zone));
    }
  });
});
