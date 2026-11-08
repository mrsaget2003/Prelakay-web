import { describe, it, expect } from "vitest";
import { parseRoute } from "@/lib/proto/route";
import { iconFromClass } from "@/lib/icons/fromClass";

// Équivalent de parse() du prototype (#/nom/id/sous?params), sur les adresses Next.js.
describe("parseRoute", () => {
  it("accueil", () => {
    expect(parseRoute("/", "")).toMatchObject({ name: "home", id: null, sub: null, q: "" });
  });
  it("fiche produit et avis", () => {
    expect(parseRoute("/p/mode-0", "")).toMatchObject({ name: "p", id: "mode-0", sub: null });
    expect(parseRoute("/p/mode-0/reviews", "")).toMatchObject({ name: "p", id: "mode-0", sub: "reviews" });
  });
  it("recherche et paramètres", () => {
    const r = parseRoute("/search", "?q=caf%C3%A9+des");
    expect(r).toMatchObject({ name: "search", q: "café des" });
    expect(parseRoute("/discover", "?cat=mode&sort=new").params).toEqual({ cat: "mode", sort: "new" });
  });
  it("onglet de discovery (comme le prototype)", () => {
    expect(parseRoute("/discover", "?sort=new").tab).toBe("new");
    expect(parseRoute("/discover", "?sort=near").tab).toBe("near");
    expect(parseRoute("/discover", "?ready=1").tab).toBe("ready");
    expect(parseRoute("/map", "").tab).toBe("map");
  });
  it("store et sous-onglet", () => {
    expect(parseRoute("/store/bel-soley/products", "?q=huile")).toMatchObject({ name: "store", id: "bel-soley", sub: "products", q: "huile" });
  });
  it("décode les identifiants", () => {
    expect(parseRoute("/done/PK-1043%2CPK-1044", "").id).toBe("PK-1043,PK-1044");
  });
});

describe("iconFromClass", () => {
  it("convertit une classe du prototype en nom du registre + style", () => {
    expect(iconFromClass("fa-solid fa-shirt")).toEqual({ name: "shirt", variant: "solid" });
    expect(iconFromClass("fa-regular fa-heart")).toEqual({ name: "heart", variant: "regular" });
    expect(iconFromClass("fa-brands fa-usb")).toEqual({ name: "usb", variant: "solid" });
  });
  it("ignore les classes supplémentaires", () => {
    expect(iconFromClass("fa-solid fa-chevron-down chev")).toEqual({ name: "chevron-down", variant: "solid" });
  });
  it("retombe sur « box » si l'icône est inconnue", () => {
    expect(iconFromClass("fa-solid fa-unicorn")).toEqual({ name: "box", variant: "solid" });
  });
});
