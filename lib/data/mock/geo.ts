// Coordonnées des stores. En démonstration, elles sont dérivées des positions x / y du
// prototype et posées sur Les Cayes — le temps que la **géolocalisation réelle des
// boutiques** arrive (V3, décision du 11 nov. 2026). C'est le seul fichier à remplacer
// ce jour-là : la carte lit `storeLatLng()`, jamais x / y.

/** Centre de la carte : Les Cayes. */
export const MAP_CENTER = { lat: 18.1927, lng: -73.7467 };
export const MAP_ZOOM = 14;

/** Cadre d'environ 3 km sur lequel les positions x / y sont projetées. */
const BOX = { south: 18.1805, north: 18.2055, west: -73.7595, east: -73.7335 };

export type LatLng = { lat: number; lng: number };

/** x et y sont des pourcentages (0 à 100) ; y croît vers le bas, la latitude vers le haut. */
export function storeLatLng(s: { x: number; y: number }): LatLng {
  return {
    lng: BOX.west + (BOX.east - BOX.west) * (s.x / 100),
    lat: BOX.north - (BOX.north - BOX.south) * (s.y / 100),
  };
}

/** Clé MapTiler — variable d'environnement, jamais en dur (CLAUDE.md règle 5).
 *  Sans clé, la carte retombe sur le plan schématique. */
export const MAPTILER_KEY = process.env.NEXT_PUBLIC_MAPTILER_KEY || "";

/** Fond de carte : rues seules. Les points d'intérêt (hôtels, restaurants, sites
 *  touristiques) sont masqués au chargement — seuls les stores Prélakay sont marqués. */
export function mapStyleUrl(key: string): string {
  return `https://api.maptiler.com/maps/streets-v2/style.json?key=${encodeURIComponent(key)}`;
}

/** Couches à masquer : tout ce qui vient de la couche « poi » du fond de carte. */
export function isPoiLayer(layer: { id: string; "source-layer"?: string }): boolean {
  return layer["source-layer"] === "poi" || /(^|[-_])poi([-_]|$)/.test(layer.id);
}
