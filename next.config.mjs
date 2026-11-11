import { spawnSync } from "node:child_process";
import withSerwistInit from "@serwist/next";

// Sert à versionner la page offline précachée, pour éviter qu'un visiteur
// garde une vieille version en cache après un déploiement. Tombe sur un
// UUID si .git n'existe pas encore (avant le premier commit).
const gitRevision = spawnSync("git", ["rev-parse", "HEAD"], {
  encoding: "utf-8",
}).stdout?.trim();
const revision = gitRevision || crypto.randomUUID();

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  additionalPrecacheEntries: [{ url: "/~offline", revision }],
  // Évite les conflits avec le hot-reload en dev — le SW ne tourne qu'en build de prod.
  disable: process.env.NODE_ENV === "development",
});

// Garde-fou (revue finale, 10 nov. 2026) : le mode du client (démo = toutes les versions actives,
// production = V1) est figé au build. Un build de production sans PRELAKAY_ENV activerait tout
// côté navigateur : on refuse de construire. (`next dev` n'est pas concerné.)
const PHASE_BUILD = process.argv.includes("build");
if (PHASE_BUILD && !process.env.PRELAKAY_ENV) {
  throw new Error("PRELAKAY_ENV doit être défini pour construire (demo ou production) — voir lib/config/release.ts.");
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Le client sait s'il est en démo (tout actif) ou en production (V1) : lib/config/release.ts.
  env: { NEXT_PUBLIC_PRELAKAY_ENV: process.env.PRELAKAY_ENV ?? "development" },
  // Images compressées / lazy-load par défaut via next/image — contrainte
  // "connectivité Haïti" documentée dans 04-trd.md.
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default withSerwist(nextConfig);
