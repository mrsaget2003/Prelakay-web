import { describe, it, expect } from "vitest";
import { robotsFor } from "@/lib/config/robots";

// Décision du 11 nov. 2026 : `admin.prelakay.com` sans SEO, `vendeur.prelakay.com`
// avec SEO, `app.prelakay.com` indexable. Les déploiements d'intégration (`all`)
// ne doivent jamais être indexés : ils servent les trois espaces à la fois.
describe("robots.txt par espace", () => {
  it("admin : rien n'est indexé", () => {
    expect(robotsFor("admin")).toEqual({ rules: { userAgent: "*", disallow: "/" } });
  });

  it("intégration (all) : rien n'est indexé", () => {
    expect(robotsFor("all")).toEqual({ rules: { userAgent: "*", disallow: "/" } });
  });

  it("vendeur : indexable, sauf la console admin", () => {
    expect(robotsFor("vendeur")).toEqual({ rules: { userAgent: "*", allow: "/", disallow: ["/admin"] } });
  });

  it("acheteur : indexable, sauf la console admin et l'espace vendeur", () => {
    expect(robotsFor("acheteur")).toEqual({ rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/seller"] } });
  });
});
