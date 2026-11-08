import { describe, it, expect } from "vitest";
import { appSpace, spaceRoute } from "@/lib/config/space";

// Plan §1.0 : trois projets en un (Acheteur, Espace vendeur, Espace admin).
describe("appSpace", () => {
  it("vaut all par défaut", () => {
    expect(appSpace({})).toBe("all");
  });
  it("lit APP_SPACE", () => {
    expect(appSpace({ APP_SPACE: "vendeur" })).toBe("vendeur");
  });
  it("refuse une valeur inconnue", () => {
    expect(() => appSpace({ APP_SPACE: "seller" })).toThrow(/APP_SPACE/);
  });
});

describe("spaceRoute", () => {
  it("acheteur ne sert ni le vendeur ni l'admin", () => {
    expect(spaceRoute("acheteur", "/p/mode-0")).toEqual({ action: "next" });
    expect(spaceRoute("acheteur", "/")).toEqual({ action: "next" });
    expect(spaceRoute("acheteur", "/seller")).toEqual({ action: "notFound" });
    expect(spaceRoute("acheteur", "/seller/orders/PK-1")).toEqual({ action: "notFound" });
    expect(spaceRoute("acheteur", "/admin/kyc")).toEqual({ action: "notFound" });
  });

  it("un préfixe ne déborde pas sur un autre chemin", () => {
    expect(spaceRoute("acheteur", "/sellers-guide")).toEqual({ action: "next" });
  });

  it("vendeur : / redirige vers /seller, la connexion et le KYC restent servis", () => {
    expect(spaceRoute("vendeur", "/")).toEqual({ action: "redirect", to: "/seller" });
    expect(spaceRoute("vendeur", "/seller/products/new")).toEqual({ action: "next" });
    expect(spaceRoute("vendeur", "/login")).toEqual({ action: "next" });
    expect(spaceRoute("vendeur", "/signup")).toEqual({ action: "next" });
    expect(spaceRoute("vendeur", "/sell")).toEqual({ action: "next" });
    expect(spaceRoute("vendeur", "/cart")).toEqual({ action: "notFound" });
    expect(spaceRoute("vendeur", "/admin")).toEqual({ action: "notFound" });
  });

  it("admin : seulement /admin", () => {
    expect(spaceRoute("admin", "/")).toEqual({ action: "redirect", to: "/admin" });
    expect(spaceRoute("admin", "/admin/login")).toEqual({ action: "next" });
    expect(spaceRoute("admin", "/login")).toEqual({ action: "notFound" });
    expect(spaceRoute("admin", "/seller")).toEqual({ action: "notFound" });
  });

  it("all sert tout", () => {
    expect(spaceRoute("all", "/admin")).toEqual({ action: "next" });
    expect(spaceRoute("all", "/seller")).toEqual({ action: "next" });
  });

  it("un point dans l'adresse ne contourne pas le cloisonnement (ex. @username)", () => {
    expect(spaceRoute("acheteur", "/admin/users/jean.pierre")).toEqual({ action: "notFound" });
    expect(spaceRoute("acheteur", "/seller/products/v1.2")).toEqual({ action: "notFound" });
    expect(spaceRoute("admin", "/p/robe.lin")).toEqual({ action: "notFound" });
    expect(spaceRoute("vendeur", "/store/boutik.lakay")).toEqual({ action: "notFound" });
  });

  it("les fichiers statiques, l'API et la page hors ligne passent toujours", () => {
    for (const p of ["/logo/_simple/full-logo-white.svg", "/fonts/_woff2/Onest-Variable.woff2", "/manifest.json", "/sw.js", "/api/release-check/coupons", "/~offline", "/_next/static/x.js"])
      expect(spaceRoute("admin", p), p).toEqual({ action: "next" });
  });
});
