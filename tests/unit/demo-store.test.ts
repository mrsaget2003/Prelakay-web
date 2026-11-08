import { describe, it, expect, beforeEach } from "vitest";
import { demo, resetDemo, initialState } from "@/lib/demo/store";
import { addToCart, cartTotals, payCart, toggleWish, setChoice, selOf } from "@/lib/demo/actions";
import { prodBy, optsOf, stockFor } from "@/lib/data/mock/seed";

// Actions du prototype (addToCart, doPay, wish…) sur l'état de démo.
beforeEach(() => resetDemo());

describe("état initial (comme le prototype)", () => {
  it("connecté en @marckarlin, wallet 450 000 HTG, 120 Coins, 4 commandes de démo", () => {
    const s = initialState();
    expect(s.logged).toBe(true);
    expect(s.user).toBe("marckarlin");
    expect(s.wallet).toBe(450000);
    expect(s.coins).toBe(120);
    expect(s.orders.map((o) => o.id)).toEqual(["PK-1042", "PK-1038", "PK-1021", "PK-0997"]);
    expect(s.orders[0].total).toBe(prodBy("beaute-0")!.price);
  });
});

describe("panier", () => {
  it("ajoute avec le choix courant et fusionne le même choix", () => {
    const v = addToCart("mode-0", 1);
    addToCart("mode-0", 2);
    const s = demo.get();
    expect(s.cart).toHaveLength(1);
    expect(s.cart[0]).toMatchObject({ p: "mode-0", v, q: 3, on: true });
  });

  it("un autre choix = une autre ligne", () => {
    const p = prodBy("mode-0")!;
    addToCart("mode-0", 1);
    const axis = optsOf(p)[1];
    const other = axis.v.find((x) => x !== selOf(p).o[axis.k] && stockFor(p, { ...selOf(p).o, [axis.k]: x }) > 0)!;
    setChoice("mode-0", axis.k, other);
    addToCart("mode-0", 1);
    expect(demo.get().cart).toHaveLength(2);
  });

  it("totaux : seulement les lignes cochées", () => {
    addToCart("mode-0", 2);
    addToCart("tech-1", 1);
    demo.update((s) => { s.cart[1].on = false; });
    const T = cartTotals();
    expect(T.n).toBe(2);
    expect(T.sub).toBe(prodBy("mode-0")!.price * 2);
  });
});

describe("paiement (doPay)", () => {
  it("une commande par store, wallet débité, lignes payées retirées", () => {
    addToCart("mode-0", 1); // Boutik Lakay
    addToCart("tech-1", 1); // Tech Sud
    const before = demo.get().wallet;
    const r = payCart("k1");
    expect(r.ok).toBe(true);
    const s = demo.get();
    expect(r.ok && r.ids).toEqual(["PK-1043", "PK-1044"]);
    expect(s.orders.filter((o) => o.status === "received")).toHaveLength(2);
    expect(s.wallet).toBe(before - prodBy("mode-0")!.price - prodBy("tech-1")!.price);
    expect(s.cart).toHaveLength(0);
    expect(s.notif[0].t).toBe("Commande PK-1043, PK-1044 reçue");
  });

  it("solde insuffisant : message actionnable, rien n'est débité", () => {
    addToCart("tech-4", 1);
    demo.update((s) => { s.wallet = 10; });
    const r = payCart("k2");
    expect(r).toEqual({ ok: false, error: "Solde insuffisant. Rechargez votre wallet, puis réessayez." });
    expect(demo.get().wallet).toBe(10);
    expect(demo.get().orders).toHaveLength(4);
  });

  it("Review Focus n° 2 : choix épuisé entre-temps → refus, aucun débit", () => {
    const p = prodBy("mode-0")!;
    const zero = (() => { // une combinaison épuisée de ce produit
      const A = optsOf(p);
      for (const a of A[0].v) for (const b of A[1].v) if (stockFor(p, { [A[0].k]: a, [A[1].k]: b }) === 0) return { [A[0].k]: a, [A[1].k]: b };
      return null;
    })()!;
    demo.update((s) => { s.cart.push({ p: "mode-0", v: Object.values(zero).join(" · "), q: 1, on: true }); });
    const before = demo.get().wallet;
    const r = payCart("k3");
    expect(r).toEqual({ ok: false, error: "Cet article n'est plus disponible dans ce choix. Modifiez-le ou retirez-le." });
    expect(demo.get().wallet).toBe(before);
  });

  it("Review Focus n° 5 : même clé deux fois → une seule commande, un seul débit", () => {
    addToCart("tech-1", 1);
    const first = payCart("same");
    addToCart("tech-1", 1);
    const again = payCart("same");
    expect(again).toEqual(first);
    expect(demo.get().orders).toHaveLength(5);
  });
});

describe("wishlist", () => {
  it("bascule", () => {
    expect(toggleWish("mode-0")).toBe(true);
    expect(demo.get().wish["mode-0"]).toBe(true);
    expect(toggleWish("mode-0")).toBe(false);
    expect(demo.get().wish["mode-0"]).toBeUndefined();
  });
});
