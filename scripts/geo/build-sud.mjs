// Contours des communes du département du Sud (carte des ventes admin, spec §8).
// Source : geoBoundaries HTI ADM3 (communes), FEWS NET, licence CC BY 4.0 —
// https://www.geoboundaries.org (crédit dans la page Crédits).
// Usage : node scripts/geo/build-sud.mjs  →  lib/data/geo/sud-communes.json
import { writeFileSync, mkdirSync } from "node:fs";

const SRC = "https://github.com/wmgeolab/geoBoundaries/raw/9469f09/releaseData/gbOpen/HTI/ADM3/geoBoundaries-HTI-ADM3_simplified.geojson";
/** Nom geoBoundaries → [identifiant, nom affiché]. */
const SUD = {
  "Les Cayes": ["les-cayes", "Les Cayes"], Torbeck: ["torbeck", "Torbeck"], Chantal: ["chantal", "Chantal"],
  "Camp Perrin": ["camp-perrin", "Camp-Perrin"], Maniche: ["maniche", "Maniche"], "Ile a Vache": ["ile-a-vache", "Île-à-Vache"],
  Aquin: ["aquin", "Aquin"], "Saint-Louis du Sud": ["saint-louis-du-sud", "Saint-Louis-du-Sud"], Cavaillon: ["cavaillon", "Cavaillon"],
  "Port Salut": ["port-salut", "Port-Salut"], "Saint-Jean du Sud": ["saint-jean-du-sud", "Saint-Jean-du-Sud"], Arniquet: ["arniquet", "Arniquet"],
  Coteaux: ["coteaux", "Côteaux"], "Port a Piment": ["port-a-piment", "Port-à-Piment"], "Roche a Bateaux": ["roche-a-bateau", "Roche-à-Bateau"],
  Chardonnieres: ["chardonnieres", "Chardonnières"], "Les Anglais": ["les-anglais", "Les Anglais"], Tiburon: ["tiburon", "Tiburon"],
};

const r = (x) => Math.round(x * 1e4) / 1e4;
const round = (c) => (typeof c[0] === "number" ? [r(c[0]), r(c[1])] : c.map(round));

const gj = await (await fetch(SRC)).json();
const features = gj.features
  .filter((f) => SUD[f.properties.shapeName])
  .map((f) => {
    const [id, name] = SUD[f.properties.shapeName];
    return { type: "Feature", id, properties: { name }, geometry: { type: f.geometry.type, coordinates: round(f.geometry.coordinates) } };
  });
const missing = Object.keys(SUD).filter((n) => !gj.features.some((f) => f.properties.shapeName === n));
if (missing.length) throw new Error("Communes introuvables : " + missing.join(", "));
mkdirSync("lib/data/geo", { recursive: true });
const out = { type: "FeatureCollection", source: "geoBoundaries HTI ADM3 (FEWS NET), CC BY 4.0", features };
writeFileSync("lib/data/geo/sud-communes.json", JSON.stringify(out));
console.log(`${features.length} communes écrites`);
