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

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Images compressées / lazy-load par défaut via next/image — contrainte
  // "connectivité Haïti" documentée dans 04-trd.md.
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default withSerwist(nextConfig);
