import { describe, it, expect } from "vitest";
import { assertDataSource, isDemo } from "@/lib/config/env";

// Review Focus n° 1 (plan §1.4) et CHANGELOG règle 4 : jamais de fausses données en production.
describe("assertDataSource", () => {
  it("refuse les données de démo en production", () => {
    expect(() => assertDataSource({ PRELAKAY_ENV: "production", DATA_SOURCE: "mock" })).toThrow(/données de démonstration/);
  });

  it("exige une source explicite en production", () => {
    expect(() => assertDataSource({ PRELAKAY_ENV: "production" })).toThrow(/DATA_SOURCE/);
  });

  it("un serveur de production doit déclarer PRELAKAY_ENV (pas de démo par oubli)", () => {
    expect(() => assertDataSource({ NODE_ENV: "production" })).toThrow(/PRELAKAY_ENV/);
    expect(assertDataSource({ NODE_ENV: "production", PRELAKAY_ENV: "demo" })).toBe("mock");
    expect(assertDataSource({ NODE_ENV: "production", PRELAKAY_ENV: "production", DATA_SOURCE: "supabase" })).toBe("supabase");
  });

  it("utilise les données de démo par défaut hors production", () => {
    expect(assertDataSource({})).toBe("mock");
    expect(assertDataSource({ PRELAKAY_ENV: "demo" })).toBe("mock");
  });

  it("accepte Supabase partout", () => {
    expect(assertDataSource({ PRELAKAY_ENV: "production", DATA_SOURCE: "supabase" })).toBe("supabase");
    expect(assertDataSource({ DATA_SOURCE: "supabase" })).toBe("supabase");
  });

  it("refuse un environnement ou une source inconnus", () => {
    expect(() => assertDataSource({ PRELAKAY_ENV: "prod" })).toThrow(/PRELAKAY_ENV/);
    expect(() => assertDataSource({ DATA_SOURCE: "postgres" })).toThrow(/DATA_SOURCE/);
  });
});

describe("isDemo", () => {
  it("vrai seulement pour un déploiement de démonstration", () => {
    expect(isDemo({ PRELAKAY_ENV: "demo" })).toBe(true);
    expect(isDemo({})).toBe(false);
    expect(isDemo({ PRELAKAY_ENV: "production" })).toBe(false);
  });
});
