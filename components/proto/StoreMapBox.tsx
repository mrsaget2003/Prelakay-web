"use client";

// Toutes les cartes de stores passent par ici (13 nov. 2026) : MapLibre sur fond MapTiler,
// chargé à la demande, jamais rendu côté serveur. Les plans dessinés en CSS (mini-map,
// plan schématique) sont retirés : une seule carte, la vraie.
// Sans clé MapTiler (variable d'environnement), on le dit au lieu de dessiner un faux plan.

import dynamic from "next/dynamic";
import type { Store } from "@/lib/data/mock/seed";
import { MAPTILER_KEY } from "@/lib/data/mock/geo";

const StoreMap = dynamic(() => import("./StoreMap"), {
  ssr: false,
  loading: () => <div className="mlmap is-loading" aria-hidden="true" />,
});

export function StoreMapBox({ stores, sel, onSelect, zoom, className = "" }: {
  stores?: Store[];
  sel?: string | null;
  onSelect?: (id: string) => void;
  zoom?: number;
  className?: string;
}) {
  return (
    <div className={`mlbox ${className}`.trim()}>
      {MAPTILER_KEY ? (
        <StoreMap mapKey={MAPTILER_KEY} stores={stores} sel={sel} onSelect={onSelect} zoom={zoom} />
      ) : (
        <div className="mlmap off" role="note">
          Carte indisponible pour le moment
        </div>
      )}
    </div>
  );
}
