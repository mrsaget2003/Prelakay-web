import { describe, it, expect, beforeEach } from "vitest";
import { demo, resetDemo } from "@/lib/demo/store";
import { addToCart, payCart } from "@/lib/demo/actions";
import { allDisputes, allOrders, disputeMessage, disputeRequest, disputeThread, type Me } from "@/lib/demo/admin";
import { escrowOf, platformFinance } from "@/lib/charts/financeData";
import { pData } from "@/lib/charts/adminData";
import { sum } from "@/lib/charts/sellerData";

// Finances plateforme (ex-V2, actif dans le prototype) et Dispute Center complet (ex-V1.x).
beforeEach(() => resetDemo());
const ME: Me = { e: "support@prelakay.ht", n: "Nadège Pierre", role: "support" };

describe("finances plateforme", () => {
  it("commission non calculée tant que le taux est un point ouvert", () => {
    const f = platformFinance(demo.get(), 30);
    expect(f.commission).toBeNull();
    expect(f.gmv).toBe(sum(pData(30, 1).gmv));
  });
  it("escrow en circulation = commandes payées non libérées (frais de livraison compris)", () => {
    const s = demo.get();
    const expected = allOrders(s)
      .filter((o) => ["received", "prep", "ready", "handed", "enroute"].includes(o.status) || (["done", "delivered"].includes(o.status) && !o.rel))
      .reduce((a, o) => a + o.total + (o.fee ?? 0), 0);
    expect(escrowOf(s)).toBe(expected);
    addToCart("mode-0", 1);
    const r = payCart("k-fin");
    if (!r.ok) throw new Error(r.error);
    const o = demo.get().orders.find((x) => x.id === r.ids[0])!;
    expect(escrowOf(demo.get())).toBe(expected + o.total);
  });
  it("retraits en attente des stores", () => {
    expect(platformFinance(demo.get(), 7).payoutsPending).toBeGreaterThanOrEqual(0);
  });
});

describe("Dispute Center", () => {
  it("message de l'admin au store : dans le fil du litige, journalisé, notifié au store", () => {
    const d = allDisputes(demo.get()).find((x) => x.st === "escalated")!;
    expect(disputeMessage(ME, d.id, "store", "  ")).toBe("Écrivez un message.");
    expect(disputeMessage(ME, d.id, "store", "Merci d'envoyer une photo du sac au comptoir.")).toBeNull();
    expect(disputeThread(demo.get(), d.id).at(-1)).toMatchObject({ from: "admin", to: "store", t: "Merci d'envoyer une photo du sac au comptoir." });
    expect(demo.get().admin.audit[0]).toMatchObject({ a: "Message dans un litige", who: "Nadège Pierre" });
    expect(demo.get().seller.notif[0]).toMatchObject({ store: d.store, t: `Litige ${d.id} : message de Prélakay` });
  });
  it("demande de pièces à l'acheteur : étape « Pièces demandées » dans le fil", () => {
    const d = allDisputes(demo.get()).find((x) => x.st === "escalated")!;
    expect(disputeRequest(ME, d.id, "buyer")).toBeNull();
    expect(disputeThread(demo.get(), d.id).at(-1)).toMatchObject({ from: "admin", to: "buyer", kind: "request" });
  });
});
