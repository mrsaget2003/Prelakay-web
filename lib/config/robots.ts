import type { MetadataRoute } from "next";
import type { AppSpace } from "./space";

/** robots.txt par déploiement (décision du 11 nov. 2026) :
 *  - `admin` (admin.prelakay.com) : **sans SEO**, rien n'est indexé ;
 *  - `vendeur` (vendeur.prelakay.com) : indexable, avec connexion ;
 *  - `acheteur` (app.prelakay.com) : indexable ;
 *  - `all` : déploiement d'intégration, qui sert les trois espaces à la fois —
 *    jamais indexé, pour ne pas concurrencer les trois sites publics. */
export function robotsFor(space: AppSpace): MetadataRoute.Robots {
  if (space === "admin" || space === "all") return { rules: { userAgent: "*", disallow: "/" } };
  const hidden = space === "acheteur" ? ["/admin", "/seller"] : ["/admin"];
  return { rules: { userAgent: "*", allow: "/", disallow: hidden } };
}
