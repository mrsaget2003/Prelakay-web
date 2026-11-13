// Copie le worker de MapLibre dans public/ (12 nov. 2026).
//
// MapLibre 6 cherche son worker à côté de son propre module (`new URL("./maplibre-gl-worker.mjs",
// import.meta.url)`). Une fois empaqueté par Next, ce module vit dans /_next/static/chunks/, où
// le worker n'existe pas : « Worker failed to load », et la carte ne décode plus ses tuiles.
// On sert donc le worker nous-mêmes (public/maplibre/) et StoreMap le déclare avec setWorkerUrl.
// Lancé avant `dev` et `build` (package.json) ; le fichier copié n'est pas versionné.

import { copyFileSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "node_modules", "maplibre-gl", "dist", "maplibre-gl-worker.mjs");
const dest = join(root, "public", "maplibre", "maplibre-gl-worker.mjs");
mkdirSync(dirname(dest), { recursive: true });
copyFileSync(src, dest);
const { version } = JSON.parse(readFileSync(join(root, "node_modules", "maplibre-gl", "package.json"), "utf8"));
console.log(`worker MapLibre ${version} copié dans public/maplibre/`);
