import { describe, it, expect } from "vitest";
import { MAP_CENTER, isPoiLayer, mapStyleUrl, storeLatLng } from "@/lib/data/mock/geo";
import { STORES } from "@/lib/data/mock/seed";

// Carte des stores (11 nov. 2026) : MapLibre + MapTiler, sans les points d'intérêt du
// fond de carte. La géolocalisation réelle des boutiques arrive en V3 : seules les
// coordonnées de ce module changeront.
describe("coordonnées des stores", () => {
  it("chaque store tombe autour des Cayes, à moins de 3 km du centre", () => {
    for (const s of STORES) {
      const { lat, lng } = storeLatLng(s);
      expect(Math.abs(lat - MAP_CENTER.lat), s.n).toBeLessThan(0.03);
      expect(Math.abs(lng - MAP_CENTER.lng), s.n).toBeLessThan(0.03);
    }
  });

  it("deux stores à des positions différentes ont des coordonnées différentes", () => {
    const seen = new Set(STORES.map((s) => `${storeLatLng(s).lat},${storeLatLng(s).lng}`));
    expect(seen.size).toBe(STORES.length);
  });

  it("y croît vers le bas, la latitude vers le haut", () => {
    expect(storeLatLng({ x: 50, y: 10 }).lat).toBeGreaterThan(storeLatLng({ x: 50, y: 90 }).lat);
    expect(storeLatLng({ x: 10, y: 50 }).lng).toBeLessThan(storeLatLng({ x: 90, y: 50 }).lng);
  });
});

describe("fond de carte", () => {
  it("la clé passe par l'adresse du style, encodée", () => {
    expect(mapStyleUrl("abc 123")).toBe("https://api.maptiler.com/maps/streets-v2/style.json?key=abc%20123");
  });

  it("masque les points d'intérêt, garde les rues et les noms de lieux", () => {
    expect(isPoiLayer({ id: "poi", "source-layer": "poi" })).toBe(true);
    expect(isPoiLayer({ id: "Other-poi-label", "source-layer": "poi" })).toBe(true);
    expect(isPoiLayer({ id: "hotel-icons", "source-layer": "poi" })).toBe(true);
    expect(isPoiLayer({ id: "road_major", "source-layer": "transportation" })).toBe(false);
    expect(isPoiLayer({ id: "place_label_city", "source-layer": "place" })).toBe(false);
  });
});
