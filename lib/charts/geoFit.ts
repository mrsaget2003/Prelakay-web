// Cadrage Mercator d'un ensemble de contours pour @nivo/geo (qui attend échelle, translation
// relative et rotation). Rotation en longitude seulement : le centre horizontal tombe au milieu ;
// la translation verticale recentre la latitude moyenne.

type Pos = number[];
type Feature = { geometry: { type: string; coordinates: unknown } };
export type BBox = { w: number; e: number; s: number; n: number };

function walk(c: unknown, f: (p: Pos) => void) {
  if (Array.isArray(c) && typeof c[0] === "number") f(c as Pos);
  else if (Array.isArray(c)) for (const x of c) walk(x, f);
}

export function bboxOf(features: Feature[]): BBox {
  const b = { w: Infinity, e: -Infinity, s: Infinity, n: -Infinity };
  for (const ft of features)
    walk(ft.geometry.coordinates, ([lon, lat]) => {
      b.w = Math.min(b.w, lon);
      b.e = Math.max(b.e, lon);
      b.s = Math.min(b.s, lat);
      b.n = Math.max(b.n, lat);
    });
  return b;
}

const merc = (lat: number) => Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));

/** Échelle et translation pour que la boîte occupe `fill` du cadre W × H, centrée. */
export function fitMercator(features: Feature[], W: number, H: number, fill = 0.92) {
  const b = bboxOf(features);
  const dx = ((b.e - b.w) * Math.PI) / 180;
  const dy = merc(b.n) - merc(b.s);
  const scale = Math.min((W * fill) / dx, (H * fill) / dy);
  const yMid = (merc(b.n) + merc(b.s)) / 2;
  return {
    scale,
    translation: [0.5, 0.5 + (scale * yMid) / H] as [number, number],
    rotation: [-(b.w + b.e) / 2, 0, 0] as [number, number, number],
  };
}
