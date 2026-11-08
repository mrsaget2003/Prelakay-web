import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

// Déclare `injectionPoint` pour TypeScript — remplacé au build par le
// manifeste réel des fichiers à précacher.
declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

// `defaultCache` (fourni par Serwist) couvre déjà une stratégie raisonnable
// par défaut pour Next.js : StaleWhileRevalidate pour JS/CSS/fonts/images,
// NetworkFirst pour les pages HTML (avec repli sur le cache si hors-ligne).
// Suffisant pour la Phase 0 — pas de stratégie par endpoint API tant qu'il
// n'y a pas d'API à mettre en cache (viendra avec le catalogue/Discovery,
// Phase 4-5 de 06-plan.md). Ne pas complexifier avant d'en avoir besoin.
const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
  fallbacks: {
    entries: [
      {
        url: "/~offline",
        matcher({ request }) {
          return request.destination === "document";
        },
      },
    ],
  },
});

serwist.addEventListeners();
