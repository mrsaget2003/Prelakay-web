import { FEATURES, isAvailable, notReleased, type FeatureKey } from "@/lib/config/release";

// Route de vérification de la porte des versions (06-plan étape 2bis).
// À retirer en Phase I (plan I3) : les vraies routes d'API appellent notReleased().
export async function GET(_req: Request, ctx: { params: Promise<{ feature: string }> }) {
  const { feature } = await ctx.params;
  if (!(feature in FEATURES)) {
    return Response.json({ error: "unknown_feature" }, { status: 404 });
  }
  if (!isAvailable(feature as FeatureKey)) return notReleased();
  return Response.json({ ok: true });
}
