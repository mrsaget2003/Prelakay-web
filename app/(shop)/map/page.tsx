"use client";

// Carte des stores — pageMap du prototype : carte MapLibre sur fond MapTiler
// (décision du 11 nov. 2026), sans les points d'intérêt du fond, et liste par distance.
// Sans clé MapTiler, on garde le plan schématique du prototype.

import Link from "next/link";
import dynamic from "next/dynamic";
import { useState } from "react";
import { STORES } from "@/lib/data/mock/seed";
import { storeImage } from "@/lib/data/mock/images";
import { formatDistance as km } from "@/lib/format";
import { Fi, Ph } from "@/components/proto/ui";
import { MAPTILER_KEY } from "@/lib/data/mock/geo";

// MapLibre touche au DOM : jamais de rendu serveur.
const StoreMap = dynamic(() => import("@/components/proto/StoreMap"), {
  ssr: false,
  loading: () => <div className="mlmap is-loading" aria-hidden="true" />,
});

export default function MapPage() {
  const [sel, setSel] = useState<string | null>(null);
  const toggle = (id: string) => setSel((x) => (x === id ? null : id));
  const list = STORES.slice().sort((a, b) => a.km - b.km);
  return (
    <div className="wrap">
      <div className="crumb">
        <Link href="/">Accueil</Link>
        <Fi s="chevron-right" />
        <span>Carte des stores</span>
      </div>
      <h1 className="d-only">Stores près de vous</h1>
      <div className="mapv">
        {MAPTILER_KEY ? (
          <StoreMap mapKey={MAPTILER_KEY} sel={sel} onSelect={toggle} />
        ) : (
          <div className="map" role="img" aria-label="Carte de démonstration de Les Cayes">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none">
              <rect width="100" height="100" fill="#e9efee" />
              <path d="M0 82 Q30 76 52 86 T100 80 V100 H0Z" fill="#cfe9ec" />
              <g stroke="#ffffff" strokeWidth="1.6" fill="none">
                <path d="M5 50 H95" />
                <path d="M50 5 V80" />
                <path d="M15 20 L85 70" />
                <path d="M20 75 L80 15" />
              </g>
              <g stroke="#d8dada" strokeWidth=".6" fill="none">
                <path d="M5 30 H95" />
                <path d="M5 65 H95" />
                <path d="M30 5 V80" />
                <path d="M70 5 V80" />
              </g>
            </svg>
            <div className="pin me" style={{ left: "50%", top: "52%" }}>
              <span>Vous</span>
              <Fi s="map" />
            </div>
            {STORES.map((s) => (
              // un bouton, pas un div : le repère doit être atteignable au clavier
              <button
                key={s.id}
                type="button"
                className={`pin ${sel === s.id ? "on" : ""}`}
                style={{ left: `${s.x}%`, top: `${s.y}%` }}
                aria-pressed={sel === s.id}
                onClick={() => toggle(s.id)}
              >
                <span>{s.n}</span>
                <Fi s="location-dot" />
              </button>
            ))}
              <span className="note">Plan de repérage · ajoutez NEXT_PUBLIC_MAPTILER_KEY pour la vraie carte</span>
          </div>
        )}
        <div className="slist">
          {list.map((s) => (
            <div key={s.id} className={`srow ${sel === s.id ? "on" : ""}`} onClick={() => toggle(s.id)}>
              <Ph icon={s.i} tint="g4" cls="av" img={storeImage(s.id)} alt={s.n} />
              <div className="tx">
                <b>{s.n}</b>
                <span className="cap">
                  {km(s.km)} · {s.addr}
                </span>
                <div style={{ marginTop: 4, display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {s.trust ? <span className="tag tag-new">Store de confiance</span> : null}
                  <span className="tag tag-neu">{s.hours}</span>
                </div>
              </div>
              <Link className="btn btn-s btn-sm" href={`/store/${s.id}`} onClick={(e) => e.stopPropagation()}>
                Voir
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
