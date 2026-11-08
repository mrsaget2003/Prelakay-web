// Trois projets en un (plan §1.0, décidé le 7 nov. 2026) : une application, trois
// déploiements. APP_SPACE limite les routes servies par chaque déploiement.

export type AppSpace = "all" | "acheteur" | "vendeur" | "admin";
export type SpaceDecision =
  | { action: "next" }
  | { action: "notFound" }
  | { action: "redirect"; to: string };

const SPACES: readonly AppSpace[] = ["all", "acheteur", "vendeur", "admin"];

export function appSpace(env: { APP_SPACE?: string }): AppSpace {
  const v = env.APP_SPACE || "all";
  if (!(SPACES as readonly string[]).includes(v)) {
    throw new Error(`APP_SPACE inconnu : « ${v} » (attendu : ${SPACES.join(", ")}).`);
  }
  return v as AppSpace;
}

function under(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(prefix + "/");
}

/** Toujours servis, quel que soit l'espace : fichiers, API, page hors ligne, outils de démo. */
function isShared(pathname: string): boolean {
  if (pathname.startsWith("/_next/") || pathname.startsWith("/api/")) return true;
  if (["/~offline", "/demo", "/style-guide"].some((p) => under(pathname, p))) return true;
  const last = pathname.split("/").pop() ?? "";
  return last.includes("."); // fichier statique (svg, woff2, json, js, ico…)
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
