import { NextResponse, type NextRequest } from "next/server";
import { appSpace, spaceRoute } from "@/lib/config/space";
import { futureFeatureFor } from "@/lib/config/release";

// 1. Espace du déploiement (plan §1.0) : chaque projet ne sert que ses routes.
// 2. Versions (CHANGELOG règle 3) : une page d'une version future redirige vers
//    l'Accueil avec ?soon=<fonctionnalité>, qui déclenche le toast « À venir » ;
//    dans la console admin, vers son tableau de bord (on reste dans la console).
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const decision = spaceRoute(appSpace(process.env), pathname);
  if (decision.action === "notFound") {
    return NextResponse.rewrite(new URL("/__espace-indisponible", request.url), { status: 404 });
  }
  if (decision.action === "redirect") {
    return NextResponse.redirect(new URL(decision.to, request.url));
  }

  const feature = futureFeatureFor(pathname);
  if (feature) {
    const home = new URL(pathname.startsWith("/admin/") ? "/admin" : "/", request.url);
    home.searchParams.set("soon", feature);
    return NextResponse.redirect(home);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
