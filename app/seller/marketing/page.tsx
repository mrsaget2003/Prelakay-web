"use client";

// Outils marketing — sMarketing du prototype : coupons, offres flash, événements, mise en avant.
// Actifs dans le prototype (CLAUDE.md 10 nov. 2026) ; « À venir » seulement hors prototype.

import Link from "next/link";
import { isAvailable, type FeatureKey } from "@/lib/config/release";
import { ComingSoon } from "@/components/ui/ComingSoon";
import { SHead } from "@/components/seller/shell";
import { Fi } from "@/components/proto/ui";

const TOOLS: [React.ReactNode, string, string, FeatureKey, string, string][] = [
  [<Fi key="i" s="ticket" />, "Coupons du store", "Code à 6 caractères, pourcentage, montant minimum, dates et nombre d'utilisations.", "coupons", "V1.x", "/seller/marketing/coupons"],
  [<Fi key="i" s="bolt" />, "Offres flash 24 h", "Proposées par Prélakay aux stores bien notés.", "flash_offers", "V1.x", "/seller/marketing/flash"],
  [<Fi key="i" r="calendar" />, "Événements Prélakay", "Participez aux opérations commerciales avec exonération de commission.", "events", "V1.x", "/seller/marketing/events"],
  [<Fi key="i" s="rocket" />, "Mettre en avant un produit", "Boost payant dans les résultats.", "boost", "V2", "/seller/marketing/boost"],
];

export default function Marketing() {
  return (
    <>
      <SHead title="Marketing" crumb={[["Marketing"]]} />
      <div className="mk-g">
        {TOOLS.map(([icon, t, p, f, v, href]) => (
          <div className={`panel mk${isAvailable(f) ? " on" : ""}`} key={t}>
            <span className="mk-i">{icon}</span>
            <h3>{t}</h3>
            <p className="muted">{p}</p>
            <ComingSoon feature={f}>
              <Link className="btn btn-o btn-sm" href={href} prefetch={false}>
                Ouvrir
              </Link>
            </ComingSoon>
            {isAvailable(f) ? null : <span className="soon-t">À venir · {v}</span>}
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
