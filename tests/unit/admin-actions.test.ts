import { describe, it, expect, beforeEach } from "vitest";
import { demo, resetDemo } from "@/lib/demo/store";
import { addToCart, payCart } from "@/lib/demo/actions";
import { allProducts, STORES } from "@/lib/data/mock/seed";
import {
  allDisputes, bannerDelete, bannerToggle, bannersOf, disputeDecide, kycApprove, kycList, kycReject, modQueue, orderCancel,
  pStatusOf, productApprove, productReject, queues, reportDecide, storeSuspend, storeTrust, teamInvite, type Me,
  assignDriver, deliveriesList,
} from "@/lib/demo/admin";
import { can } from "@/lib/domain/admin";
import { DEMO_DRIVERS } from "@/lib/demo/delivery";
import { sellerOrders, setManagedStore } from "@/lib/demo/sellerActions";

// Console admin : chaque décision se répercute chez l'acheteur et le vendeur (03-design §9.11).
const ME: Me = { e: "superadmin@prelakay.ht", n: "Marc-Karlin Saget", role: "super" };
beforeEach(() => resetDemo());

describe("modération", () => {
  it("un produit approuvé devient visible des acheteurs ; le store est prévenu ; c'est journalisé", () => {
    expect(queues(demo.get()).products).toBe(3);
    expect(allProducts().some((p) => p.id === "mq-0")).toBe(false);
    productApprove(ME, "mq-0");
    expect(allProducts().some((p) => p.id === "mq-0")).toBe(true);
    expect(demo.get().seller.notif[0]).toMatchObject({ t: "Produit approuvé", store: "tech-sud" });
    expect(demo.get().admin.audit[0]).toMatchObject({ a: "Produit approuvé", who: "Marc-Karlin Saget" });
    expect(queues(demo.get()).products).toBe(2);
  });
  it("un produit rejeté garde son motif", () => {
    productReject(ME, "mq-1", "Photos floues ou non réelles", "");
    const p = modQueue(demo.get()).find((x) => x.id === "mq-1")!;
    expect(pStatusOf(demo.get(), p)).toBe("rejected");
  });
  it("retirer un produit signalé le sort du catalogue", () => {
    expect(allProducts().some((p) => p.id === "tech-2")).toBe(true);
    expect(reportDecide(ME, "SG-381", "remove")).toBe("Produit retiré");
    expect(allProducts().some((p) => p.id === "tech-2")).toBe(false);
  });
});

describe("KYC", () => {
  it("approuver le dossier de l'utilisateur de démo ouvre son espace vendeur", () => {
    demo.update((s) => { s.kyc = "recu"; });
    kycApprove(ME, "KYC-0149");
    expect(demo.get().kyc).toBe("ok");
    expect(demo.get().notif[0].t).toBe("Dossier vendeur approuvé");
  });
  it("rejeter un dossier de démonstration enregistre le motif", () => {
    kycReject(ME, "KYC-0148", "Pièce d'identité illisible", "recto flou");
    expect(kycList(demo.get()).find((k) => k.id === "KYC-0148")).toMatchObject({ st: "rej", why: "Pièce d'identité illisible — recto flou" });
  });
});

describe("stores", () => {
  it("suspendre masque les produits du store ; réactiver les remet", () => {
    storeSuspend(ME, "bel-soley", "Litiges répétés");
    expect(allProducts().some((p) => p.store === "bel-soley")).toBe(false);
    storeSuspend(ME, "bel-soley", null);
    expect(allProducts().some((p) => p.store === "bel-soley")).toBe(true);
  });
  it("le badge « Store de confiance » se retire et revient à la valeur d'origine après réinitialisation", () => {
    storeTrust(ME, "boutik-lakay", false);
    expect(STORES.find((x) => x.id === "boutik-lakay")!.trust).toBe(false);
    resetDemo();
    expect(STORES.find((x) => x.id === "boutik-lakay")!.trust).toBe(true);
  });
});

describe("litiges et commandes", () => {
  it("rembourser l'acheteur de démo crédite son wallet ; le store voit le litige résolu", () => {
    addToCart("mode-0", 1);
    const r = payCart("k-1");
    if (!r.ok) throw new Error(r.error);
    const id = r.ids[0];
    demo.update((s) => {
      s.orders.find((o) => o.id === id)!.status = "done";
      s.disputes.push({ id, why: "Article endommagé", txt: "Déchiré" });
    });
    const d = allDisputes(demo.get()).find((x) => x.order === id)!;
    const w = demo.get().wallet;
    expect(disputeDecide(ME, d.id, "part", 99_999_999)).toBe("Montant invalide.");
    expect(disputeDecide(ME, d.id, "buyer")).toBeNull();
    const total = demo.get().orders.find((o) => o.id === id)!.total;
    expect(demo.get().wallet).toBe(w + total);
    expect(allDisputes(demo.get()).find((x) => x.id === d.id)!.st).toBe("done");
  });
  it("annuler une commande d'un autre acheteur la passe « Annulée » chez le store", () => {
    setManagedStore("boutik-lakay");
    const o = sellerOrders(demo.get()).find((x) => x.status === "received")!;
    orderCancel(ME, o.id, "Store injoignable");
    expect(sellerOrders(demo.get()).find((x) => x.id === o.id)!.status).toBe("cancelled");
  });
});

describe("contenu et équipe", () => {
  it("garde au moins une bannière (en ligne et au total)", () => {
    const L = bannersOf(demo.get());
    expect(bannerToggle(ME, L[0].id, false)).toBeNull();
    expect(bannerToggle(ME, L[1].id, false)).toBeNull();
    expect(bannerToggle(ME, L[2].id, false)).toBe("Gardez au moins une bannière en ligne.");
    expect(bannerDelete(ME, L[0].id)).toBeNull();
    expect(bannerDelete(ME, L[1].id)).toBeNull();
    expect(bannerDelete(ME, L[2].id)).toBe("Gardez au moins une bannière.");
  });
  it("invitation : adresse @prelakay.ht obligatoire, pas de doublon", () => {
    expect(teamInvite(ME, "x@gmail.com", "support")).toBe("Utilisez une adresse @prelakay.ht.");
    expect(teamInvite(ME, "support@prelakay.ht", "support")).toBe("Ce membre existe déjà.");
    expect(teamInvite(ME, "nouveau@prelakay.ht", "marketing")).toBeNull();
  });
});

describe("livraisons (admin)", () => {
  it("Marketing n'a pas accès aux livraisons ni aux partenaires", () => {
    expect(can("marketing", "deliveries")).toBe(false);
    expect(can("support", "deliveries")).toBe(true);
  });
  it("affecter un livreur est journalisé et visible chez l'acheteur", () => {
    addToCart("tech-1", 1);
    const store = STORES.find((x) => x.id === allProducts().find((p) => p.id === "tech-1")!.store)!.id;
    const r = payCart("k-adm-del", { modes: { [store]: "delivery" }, addr: { zone: "Simon", mark: "x", phone: "37000000" } });
    if (!r.ok) throw new Error(r.error);
    const id = r.ids[0];
    expect(deliveriesList(demo.get()).map((d) => d.id)).toContain(id);
    expect(assignDriver(ME, id, 1)).toBeNull();
    expect(demo.get().orders.find((o) => o.id === id)!.driver?.n).toBe(DEMO_DRIVERS[1].n);
    expect(demo.get().admin.audit[0]).toMatchObject({ a: "Livreur affecté" });
  });
});
