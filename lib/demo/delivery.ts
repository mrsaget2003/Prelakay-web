// Livreurs de démonstration (la PWA livreur est hors périmètre : spec §6 ; le livreur est simulé).

import type { Order } from "./store";

/** Livraisons d'autres acheteurs (démo) : visibles dans Admin → Livraisons. */
export const DEMO_DELIVERIES: (Order & { buyer: string })[] = [
  { id: "PK-1031", store: "tech-sud", buyer: "@jowan509", items: [{ p: "tech-0", v: "Noir", q: 1 }], status: "enroute", date: "6 nov. 2026", total: 5075, mode: "delivery", addr: { zone: "Laborde", mark: "rue des Écoles", phone: "37441209" }, fee: 225, driver: { n: "Wilner Joseph", tel: "3712 4410" }, track: 55, code: "551203" },
  { id: "PK-1029", store: "boutik-lakay", buyer: "@nadege.p", items: [{ p: "mode-0", v: "Taille M", q: 1 }], status: "handed", date: "6 nov. 2026", total: 3250, mode: "delivery", addr: { zone: "Quatre Chemins", mark: "face à la station", phone: "46890011" }, fee: 175, driver: { n: "Roseline Pierre", tel: "4689 2207" }, track: 5, code: "730914" },
  { id: "PK-1024", store: "bel-soley", buyer: "@ketia.b", items: [{ p: "beaute-1", v: "Format standard", q: 2 }], status: "delivered", date: "5 nov. 2026", total: 12550, mode: "delivery", addr: { zone: "Centre-ville", mark: "près de la cathédrale", phone: "31559900" }, fee: 150, driver: { n: "Jean-Robert Saint-Fleur", tel: "3155 9083" }, track: 100 },
  { id: "PK-1019", store: "mache-bon-pri", buyer: "@lili_cayes", items: [{ p: "alim-1", v: "Pot de 500 g", q: 1 }], status: "prep", date: "6 nov. 2026", total: 6300, mode: "delivery", addr: { zone: "Simon", mark: "maison jaune", phone: "37881234" }, fee: 225 },
];

export const DEMO_DRIVERS: { n: string; tel: string }[] = [
  { n: "Wilner Joseph", tel: "3712 4410" },
  { n: "Roseline Pierre", tel: "4689 2207" },
  { n: "Jean-Robert Saint-Fleur", tel: "3155 9083" },
];
