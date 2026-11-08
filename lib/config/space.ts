// Trois projets en un (plan §1.0, décidé le 7 nov. 2026) : une application, trois
// déploiements. APP_SPACE limite les routes servies par chaque déploiement.

export type AppSpace = "all" | "acheteur" | "vendeur" | "admin";
export type SpaceDecision =
  | { action: "next" }
  | { action: "notFound" }
  | { action: "redirect"; to: string };

const SPACES: readonly AppSpace[] = ["all", "acheteur", "vendeur", "admin"];

export function appSpace(env: { readonly [key: string]: string | undefined; APP_SPACE?: string }): AppSpace {
  const v = env.APP_SPACE || "all";
  if (!(SPACES as readonly string[]).includes(v)) {
    throw new Error(`APP_SPACE inconnu : « ${v} » (attendu : ${SPACES.join(", ")}).`);
  }
  return v as AppSpace;
}

function under(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(prefix + "/");
}

/** Dossiers de public/ : servis dans tous les espaces. */
const PUBLIC_DIRS = ["/logo", "/fonts", "/icons", "/images"];

/** Toujours servis, quel que soit l'espace : fichiers, API, page hors ligne, outils de démo.
 *  Un point dans l'adresse ne suffit pas (« /admin/users/jean.pierre » n'est pas un fichier) :
 *  seuls les dossiers de public/ et les fichiers de premier niveau (manifest.json, sw.js…) passent. */
function isShared(pathname: string): boolean {
  if (pathname.startsWith("/_next/") || pathname.startsWith("/api/")) return true;
  if (["/~offline", "/demo", "/style-guide"].some((p) => under(pathname, p))) return true;
  if (PUBLIC_DIRS.some((p) => pathname.startsWith(p + "/"))) return true;
  const segments = pathname.split("/").filter(Boolean);
  return segments.length === 1 && segments[0].includes(".");
}

const NEXT: SpaceDecision = { action: "next" };
const NOT_FOUND: SpaceDecision = { action: "notFound" };

export function spaceRoute(space: AppSpace, pathname: string): SpaceDecision {
  if (space === "all" || isShared(pathname)) return NEXT;
  switch (space) {
    case "acheteur":
      return under(pathname, "/seller") || under(pathname, "/admin") ? NOT_FOUND : NEXT;
    case "vendeur":
      if (pathname === "/") return { action: "redirect", to: "/seller" };
      return ["/seller", "/login", "/signup", "/sell"].some((p) => under(pathname, p)) ? NEXT : NOT_FOUND;
    case "admin":
      if (pathname === "/") return { action: "redirect", to: "/admin" };
      return under(pathname, "/admin") ? NEXT : NOT_FOUND;
  }
}
