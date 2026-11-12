// Versions et fonctionnalités — copie du tableau « Correspondance fonctionnalité →
// version » de CHANGELOG.md. Passer à la version suivante = changer CURRENT_RELEASE.
// (06-plan cite src/config/release.ts ; le repo n'a pas de src/ : plan §1.2 n° 6.)

/** Ordre des versions. « 1.x » (au fil du pilote) précède « 1.1 » : ce n'est pas un ordre numérique. */
export const RELEASE_ORDER = ["1", "1.x", "1.1", "2", "3"] as const;
/** « all » : prototype de démonstration, tout est actif sauf HELD_IN_PROTOTYPE (CLAUDE.md, 10 nov. 2026). */
export type Release = (typeof RELEASE_ORDER)[number] | "all";

/** Production → V1 (règle du CHANGELOG) ; démo et développement → tout actif. */
export function releaseFor(prelakayEnv: string | undefined): Release {
  return prelakayEnv === "production" ? "1" : "all";
}

export const CURRENT_RELEASE: Release = releaseFor(process.env.NEXT_PUBLIC_PRELAKAY_ENV);

export const FEATURES = {
  // V1 · Pilote Les Cayes
  auth: "1", profile: "1", wishlist: "1", help: "1", kyc_seller: "1",
  home: "1", discover: "1", search: "1", map: "1", product: "1", store: "1", share_links: "1",
  cart: "1", click_collect: "1", wallet_topup: "1", wallet_pay: "1", pay_for_relative: "1", escrow: "1",
  orders: "1", pickup_code: "1", receipt: "1", reviews: "1", qa: "1", report: "1", dispute_open: "1", coins: "1",
  // V1.x · Au fil du pilote
  coupons: "1.x", flash_offers: "1.x", events: "1.x", badges: "1.x", referral: "1.x", ambassadors: "1.x", dispute_center: "1.x",
  // V1.1 · Sourcing international et confort
  sourcing: "1.1",
  // V2 · Phase 2
  delivery: "2", prelakay_plus: "2", creole: "2", phone_otp: "2", staff_accounts: "2",
  voice_search: "2", photo_search: "2", barcode: "2", boost: "2", platform_finance: "2",
  // V3 · Application native
  native_app: "3",
} as const satisfies Record<string, Exclude<Release, "all">>;

export type FeatureKey = keyof typeof FEATURES;

/** Restent « À venir » même dans le prototype : application native, sourcing (CLAUDE.md), créole. */
export const HELD_IN_PROTOTYPE: readonly FeatureKey[] = ["native_app", "sourcing", "creole"];

export function isAvailable(key: FeatureKey, current: Release = CURRENT_RELEASE): boolean {
  if (current === "all") return !HELD_IN_PROTOTYPE.includes(key);
  return RELEASE_ORDER.indexOf(FEATURES[key]) <= RELEASE_ORDER.indexOf(current);
}

/** Réponse d'API pour une fonctionnalité d'une version future (CHANGELOG règle 5). */
export function notReleased(): Response {
  return Response.json({ error: "feature_not_released" }, { status: 403 });
}

/** Pages d'une version future : redirection vers l'Accueil + toast « À venir » (CHANGELOG règle 3). */
export const FUTURE_ROUTES: ReadonlyArray<{ prefix: string; feature: FeatureKey }> = [
  { prefix: "/admin/finance", feature: "platform_finance" },
  { prefix: "/admin/events", feature: "events" },
];

export function futureFeatureFor(pathname: string, current: Release = CURRENT_RELEASE): FeatureKey | null {
  for (const r of FUTURE_ROUTES) {
    const hit = pathname === r.prefix || pathname.startsWith(r.prefix + "/");
    if (hit && !isAvailable(r.feature, current)) return r.feature;
  }
  return null;
}
