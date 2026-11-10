"use client";

// Outils marketing — sMarketing du prototype : coupons, offres flash, événements (V1.x),
// mise en avant (V2) restent visibles avec « À venir » ; « Partager mon store » est actif.

import Link from "next/link";
import type { FeatureKey } from "@/lib/config/release";
import { ComingSoon } from "@/components/ui/ComingSoon";
import { SHead } from "@/components/seller/shell";
import { Fi } from "@/components/proto/ui";

const TOOLS: [React.ReactNode, string, string, FeatureKey, string][] = [
  [<Fi key="i" s="ticket" />, "Coupons du store", "Code à 6 chiffres, pourcentage, montant minimum et maximum.", "coupons", "V1.x"],
  [<Fi key="i" s="bolt" />, "Offres flash 24 h", "Proposées par Prélakay aux stores bien notés.", "flash_offers", "V1.x"],
  [<Fi key="i" r="calendar" />, "Événements Prélakay", "Participez aux opérations commerciales avec exonération de commission.", "events", "V1.x"],
  [<Fi key="i" s="rocket" />, "Mettre en avant un produit", "Boost payant dans les résultats.", "boost", "V2"],
];

export default function Marketing() {
  return (
    <>
      <SHead title="Marketing" crumb={[["Marketing"]]} />
      <div className="mk-g">
        {TOOLS.map(([icon, t, p, f, v]) => (
          <div className="panel mk" key={t}>
            <span className="mk-i">{icon}</span>
            <h3>{t}</h3>
            <p className="muted">{p}</p>
            <ComingSoon feature={f}>
              <button className="btn btn-o btn-sm">Créer</button>
            </ComingSoon>
            <span className="soon-t">À venir · {v}</span>
          </div>
        ))}
        <div className="panel mk on">
          <span className="mk-i">
            <Fi s="share-nodes" />
          </span>
          <h3>Partager mon store</h3>
          <p className="muted">Lien, QR code pour la vitrine et partage WhatsApp. Disponible dès maintenant.</p>
          <Link className="btn btn-p btn-sm" href="/seller/share">
            Partager
          </Link>
        </div>
      </div>
    </>
  );
}
