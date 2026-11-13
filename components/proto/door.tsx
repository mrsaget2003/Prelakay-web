"use client";

// Écrans de passage (13 nov. 2026) : page introuvable, « connectez-vous pour continuer ».
// Même composition que la connexion : une photo du monde de Prélakay, le texte posé dessus
// (bureau) ou dessous (mobile). Une action principale, au plus une secondaire.

import Image from "next/image";
import type { ReactNode } from "react";
import { photoUrl, type Photo } from "@/lib/data/mock/partnerImages";

export function Door({ photo, title, children, actions }: { photo: Photo; title: string; children?: ReactNode; actions: ReactNode }) {
  return (
    <div className="wrap">
      <section className="door" aria-labelledby="door-t">
        <Image className="door-bg" src={photoUrl(photo, 1600, 900)} alt={photo.alt} fill priority sizes="(max-width: 1023px) 100vw, 1240px" />
        <div className="door-p">
          <h1 id="door-t">{title}</h1>
          {children}
          <div className="door-a">{actions}</div>
        </div>
      </section>
    </div>
  );
}
