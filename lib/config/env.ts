// Environnement d'exécution et source des données.
// CHANGELOG règle 4 : jamais de fausses données en production.
// - development (défaut) : données de démo par défaut ;
// - demo : déploiement de démonstration (bandeau visible), données de démo autorisées ;
// - production : DATA_SOURCE=supabase obligatoire.

export type PrelakayEnv = "development" | "demo" | "production";
export type DataSource = "mock" | "supabase";

type EnvLike = { readonly [key: string]: string | undefined; PRELAKAY_ENV?: string; DATA_SOURCE?: string };

const ENVS: readonly PrelakayEnv[] = ["development", "demo", "production"];
const SOURCES: readonly DataSource[] = ["mock", "supabase"];

export function prelakayEnv(env: EnvLike): PrelakayEnv {
  const v = env.PRELAKAY_ENV || "development";
  if (!(ENVS as readonly string[]).includes(v)) {
    throw new Error(`PRELAKAY_ENV inconnu : « ${v} » (attendu : ${ENVS.join(", ")}).`);
  }
  return v as PrelakayEnv;
}

export function assertDataSource(env: EnvLike): DataSource {
  const mode = prelakayEnv(env);
  const raw = env.DATA_SOURCE;
  if (raw && !(SOURCES as readonly string[]).includes(raw)) {
    throw new Error(`DATA_SOURCE inconnu : « ${raw} » (attendu : ${SOURCES.join(", ")}).`);
  }
  if (mode === "production") {
    if (!raw) throw new Error("DATA_SOURCE doit être défini en production (supabase).");
    if (raw === "mock") {
      throw new Error("Refus de démarrer : les données de démonstration sont interdites en production (CHANGELOG règle 4).");
    }
  }
  return (raw as DataSource | undefined) ?? "mock";
}

export function isDemo(env: EnvLike): boolean {
  return prelakayEnv(env) === "demo";
}
