"use client";

// Carte des stores — pageMap du prototype : carte MapLibre sur fond MapTiler
// (décision du 11 nov. 2026), sans les points d'intérêt du fond, et liste par distance.
// Le plan schématique dessiné en CSS est retiré le 13 nov. 2026 (StoreMapBox).

import Link from "next/link";
import { useState } from "react";
import { STORES } from "@/lib/data/mock/seed";
import { storeImage } from "@/lib/data/mock/images";
import { formatDistance as km } from "@/lib/format";
import { Fi, Ph } from "@/components/proto/ui";
import { StoreMapBox } from "@/components/proto/StoreMapBox";


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
        <StoreMapBox sel={sel} onSelect={toggle} className="mlbox-main" />
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
