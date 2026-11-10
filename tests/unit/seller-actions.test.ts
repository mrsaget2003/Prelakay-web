import { describe, it, expect, beforeEach } from "vitest";
import { demo, resetDemo } from "@/lib/demo/store";
import { addToCart, payCart } from "@/lib/demo/actions";
import {
  sellerOrders, readyOrder, prepOrder, validatePickup, cancelOrder, noShow, resolveDispute, sellerDisputes,
  saveProduct, formFrom, formError, setProductStatus, myProducts, statusOf, setManagedStore, requestPayout, sellerFin, whyOf,
} from "@/lib/demo/sellerActions";
import { allProducts, prodBy, stockFor, optsOf } from "@/lib/data/mock/seed";

// Espace vendeur : mêmes données que l'acheteur ; chaque action du store prévient l'acheteur (03-design §9.10).
beforeEach(() => resetDemo());

function buy(id = "mode-0") {
  addToCart(id, 1);
  const r = payCart(`k-${Math.random()}`);
  if (!r.ok) throw new Error(r.error);
  return r.ids[0];
}

describe("commandes", () => {
  it("une commande payée par l'acheteur apparaît chez le store, à préparer", () => {
    const id = buy();
    const o = sellerOrders(demo.get()).find((x) => x.id === id)!;
    expect(o).toMatchObject({ status: "received", buyer: "@marckarlin" });
  });

  it("prête : code à 6 chiffres + notification de l'acheteur ; le bon code valide le retrait", () => {
    const id = buy();
    prepOrder(id);
    readyOrder(id);
    const o = demo.get().orders.find((x) => x.id === id)!;
    expect(o.status).toBe("ready");
    expect(o.code).toMatch(/^\d{6}$/);
    expect(demo.get().notif[0].t).toBe(`Commande ${id} prête pour retrait`);
    expect(validatePickup("000000")).toEqual({ ok: false, error: "Code invalide ou commande déjà retirée. Vérifiez les 6 chiffres avec l'acheteur." });
    const coins = demo.get().coins;
    expect(validatePickup(o.code!.replace(/(\d{3})(\d{3})/, "$1 $2")).ok).toBe(true);
    expect(demo.get().orders.find((x) => x.id === id)!.status).toBe("done");
    expect(demo.get().coins).toBe(coins + 50);
  });

  it("annulation avant retrait : acheteur remboursé ; impossible après retrait", () => {
    const id = buy();
    const w = demo.get().wallet;
    const total = demo.get().orders.find((x) => x.id === id)!.total;
    cancelOrder(id);
    expect(demo.get().orders.find((x) => x.id === id)!.status).toBe("cancelled");
    expect(demo.get().wallet).toBe(w + total);
  });

  it("non-retrait : statut « Non retirée » et unité remise en stock", () => {
    const id = buy("tech-1");
    prepOrder(id);
    readyOrder(id);
    const p = prodBy("tech-1")!;
    const o = demo.get().orders.find((x) => x.id === id)!;
    const c = { [optsOf(p)[0].k]: o.items[0].v };
    setManagedStore("tech-sud");
    const before = stockFor(p, c);
    noShow(id);
    expect(demo.get().orders.find((x) => x.id === id)!.status).toBe("expired");
    expect(stockFor(p, c)).toBe(before + 1);
  });
});

describe("litiges", () => {
  it("remboursement partiel borné par le total ; escalade", () => {
    const d = sellerDisputes(demo.get())[0];
    expect(resolveDispute(d.id, "part", 99_999_999)).toMatch(/^Montant invalide/);
    expect(resolveDispute(d.id, "esc")).toBeNull();
    expect(sellerDisputes(demo.get()).find((x) => x.id === d.id)!.st).toBe("escalated");
  });
});

describe("produits", () => {
  it("validations du formulaire", () => {
    const F = formFrom(demo.get(), null);
    expect(formError(F, "mod")).toBe("Ajoutez un titre.");
    expect(formError({ ...F, n: "Tote bag", sub: "Femme", price: "1500", was: "1000" }, "mod")).toBe("Le prix barré doit être plus élevé que le prix de vente.");
    expect(formError({ ...F, n: "Tote bag", sub: "Femme", price: "1500" }, "mod")).toBe("Ajoutez au moins une photo.");
    expect(formError({ ...F, n: "Tote bag", sub: "Femme", price: "1500", photos: 1, axes: [{ k: "Couleur", v: "Noir, Écru" }] }, "mod")).toBe("Indiquez le stock de chaque variante.");
  });

  it("nouveau produit : en modération (invisible), puis actif (visible)", () => {
    const F = { ...formFrom(demo.get(), null), n: "Tote bag Lakay", sub: "Femme", price: "1500", photos: 2, axes: [{ k: "Couleur", v: "Noir, Écru" }], stock: { Noir: "4", "Écru": "0" } };
    const r = saveProduct(F, "mod");
    expect(r.result).toBe("mod");
    expect(allProducts().some((p) => p.id === r.id)).toBe(false);
    demo.update((s) => { s.seller.products.find((x) => x.id === r.id)!.status = "active"; });
    const p = allProducts().find((x) => x.id === r.id)!;
    expect(p.n).toBe("Tote bag Lakay");
    expect(stockFor(p, { Couleur: "Noir" })).toBe(4);
    expect(stockFor(p, { Couleur: "Écru" })).toBe(0);
  });

  it("archiver retire le produit du catalogue acheteur ; réactiver le remet", () => {
    setProductStatus("mode-0", "archived");
    expect(statusOf(demo.get(), prodBy("mode-0")!)).toBe("archived");
    expect(allProducts().some((p) => p.id === "mode-0")).toBe(false);
    setProductStatus("mode-0", "active");
    expect(allProducts().some((p) => p.id === "mode-0")).toBe(true);
  });

  it("le store a ses produits de démonstration en brouillon et refusé", () => {
    const L = myProducts(demo.get());
    expect(L.some((p) => p.id === "sp-boutik-lakay-0")).toBe(true);
  });
});

describe("retraits", () => {
  it("refuse un montant supérieur au disponible", () => {
    demo.update((s) => { s.seller.payMethod = { t: "MonCash", n: "•••• 3456" }; });
    expect(requestPayout(sellerFin(demo.get()).avail + 1, () => {})).toBe("Montant supérieur au solde disponible.");
    expect(requestPayout(0, () => {})).toBe("Indiquez un montant.");
  });
});

describe("produits de démonstration du store", () => {
  it("brouillon et refusé gardent leur statut et leur motif avant toute action", () => {
    const L = myProducts(demo.get());
    const draft = L.find((p) => p.id === "sp-boutik-lakay-0")!;
    const rej = L.find((p) => p.id === "sp-boutik-lakay-1")!;
    expect(statusOf(demo.get(), draft)).toBe("draft");
    expect(statusOf(demo.get(), rej)).toBe("rejected");
    expect(whyOf(demo.get(), rej.id)).toMatch(/^Photos floues/);
  });
});
