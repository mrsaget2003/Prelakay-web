"use client";

// Carte des stores — MapLibre sur un fond MapTiler (décision du 11 nov. 2026).
// Les points d'intérêt du fond (hôtels, restaurants, sites touristiques) sont masqués :
// seuls les stores Prélakay portent un repère. Sans clé MapTiler, la page garde le plan
// schématique : rien ne casse, et aucune clé n'est écrite en dur.

import { useEffect, useRef, useState } from "react";
import type { Map as MlMap, Marker as MlMarker } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { STORES, type Store } from "@/lib/data/mock/seed";
import { MAP_CENTER, MAP_ZOOM, isPoiLayer, mapStyleUrl, storeLatLng } from "@/lib/data/mock/geo";

export function StoreMap({ mapKey, stores = STORES, sel, onSelect, zoom = MAP_ZOOM }: {
  mapKey: string;
  stores?: Store[];
  sel?: string | null;
  onSelect?: (id: string) => void;
  zoom?: number;
}) {
  const box = useRef<HTMLDivElement>(null);
  const map = useRef<MlMap | null>(null);
  const marks = useRef<Record<string, MlMarker>>({});
  // réseau coupé ou MapTiler injoignable (connexion fragile en Haïti) : on le dit, au lieu
  // d'une carte vide ; écouter « error » évite aussi que MapLibre remplisse la console
  const [failed, setFailed] = useState(false);
  // `onSelect` change à chaque rendu du parent : on le lit par référence pour ne pas
  // reconstruire la carte. La référence est mise à jour dans un effet, jamais au rendu.
  const pick = useRef(onSelect);
  useEffect(() => {
    pick.current = onSelect;
  }, [onSelect]);
  // la carte dépend de la liste des stores, pas de l'identité du tableau : `[store]` écrit
  // dans le rendu d'une page ne doit pas reconstruire la carte à chaque rendu
  const ids = stores.map((x) => x.id).join(",");
  const list = useRef(stores);
  useEffect(() => {
    list.current = stores;
  }, [stores]);

  useEffect(() => {
    const el = box.current;
    if (!el || !mapKey) return;
    let alive = true;
    let m: MlMap | null = null;

    (async () => {
      const stores = list.current;
      const maplibre = await import("maplibre-gl");
      if (!alive || !box.current) return;
      // worker servi par nous (public/maplibre/, copié par scripts/copy-maplibre-worker.mjs) :
      // une fois empaqueté, MapLibre ne le trouve plus à côté de son module
      maplibre.setWorkerUrl(`/maplibre/maplibre-gl-worker.mjs?v=${maplibre.getVersion()}`);
      const only = stores.length === 1 ? storeLatLng(stores[0]) : MAP_CENTER;
      const made = new maplibre.Map({
        container: box.current,
        style: mapStyleUrl(mapKey),
        center: [only.lng, only.lat],
        zoom,
        attributionControl: { compact: true },
      });
      m = made;
      map.current = made;
      made.addControl(new maplibre.NavigationControl({ showCompass: false }), "top-right");
      made.on("error", (e) => {
        // seul l'échec du style rend la carte inutilisable ; une tuile manquée se rattrape
        if (!made.isStyleLoaded() && /style|Failed to fetch/i.test(String(e?.error?.message ?? ""))) setFailed(true);
      });

      made.on("load", () => {
        // on enlève les points d'intérêt du fond : la carte ne montre que nos stores
        for (const layer of made.getStyle().layers ?? []) {
          if (isPoiLayer(layer as { id: string; "source-layer"?: string })) {
            try {
              made.setLayoutProperty(layer.id, "visibility", "none");
            } catch {
              /* couche sans propriété de visibilité : on la laisse */
            }
          }
        }
      });

      for (const s of stores) {
        const { lat, lng } = storeLatLng(s);
        const pin = document.createElement("button");
        pin.type = "button";
        pin.className = "mk-pin";
        pin.dataset.store = s.id;
        pin.setAttribute("aria-label", s.n);
        pin.innerHTML = `<span class="mk-dot"></span><span class="mk-lb"></span>`;
        pin.querySelector(".mk-lb")!.textContent = s.n;
        pin.addEventListener("click", (e) => {
          e.stopPropagation();
          pick.current?.(s.id);
        });
        marks.current[s.id] = new maplibre.Marker({ element: pin }).setLngLat([lng, lat]).addTo(made);
      }
    })();

    return () => {
      alive = false;
      marks.current = {};
      m?.remove();
      map.current = null;
    };
  }, [mapKey, ids, zoom]);

  // store sélectionné : le repère passe en avant et la carte s'y recentre
  useEffect(() => {
    for (const [id, mk] of Object.entries(marks.current)) {
      mk.getElement().classList.toggle("on", id === sel);
    }
    if (sel && map.current && marks.current[sel]) {
      map.current.easeTo({ center: marks.current[sel].getLngLat(), duration: 400 });
    }
  }, [sel]);

  return (
    <div className="mlmap" ref={box} role="application" aria-label="Carte des stores Prélakay">
      {failed ? <div className="mlmap-fail">Carte indisponible pour le moment</div> : null}
    </div>
  );
}

export default StoreMap;
