"use client";

// Briques du prototype (fonctions ph, stars, emptyBox, secHead, qr) en composants.
// Même balisage, mêmes classes : le CSS du prototype (app/proto.css) s'applique tel quel.

import Link from "next/link";
import { useState, useSyncExternalStore, type ReactNode } from "react";
import { Icon, type IconName } from "@/components/ui/Icon";
import { iconFromClass } from "@/lib/icons/fromClass";

/** Icône fixe : <Fi s="chevron-right" /> (plein) ou <Fi r="heart" /> (contour). */
export function Fi({ s, r, className, label }: { s?: IconName; r?: IconName; className?: string; label?: string }) {
  return <Icon name={(s ?? r)!} variant={s ? "solid" : "regular"} className={className} label={label} />;
}

/** Icône venant des données du prototype (« fa-solid fa-shirt »). */
export function DataIcon({ cls, className }: { cls: string; className?: string }) {
  const { name, variant } = iconFromClass(cls);
  const extra = cls.split(/\s+/).filter((t) => !t.startsWith("fa-")).join(" ");
  return <Icon name={name} variant={variant} className={[extra, className].filter(Boolean).join(" ") || undefined} />;
}

/** Tuile du prototype (ph) : dégradé + icône Font Awesome ; une photo hébergée la recouvre
 *  si elle existe et se charge, sinon l'icône reste le placeholder. */
export function Ph({ icon, tint = "g0", cls = "", img, alt = "" }: { icon: string | ReactNode; tint?: string; cls?: string; img?: string; alt?: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className={`ph ${tint} ${cls}`.trim()}>
      {typeof icon === "string" ? <DataIcon cls={icon} /> : icon}
      {img && !failed ? (
        // Photo Unsplash déjà dimensionnée par son CDN (paramètres w/h/q) : pas d'optimisation Next.
        // eslint-disable-next-line @next/next/no-img-element
        <img className="ph-img" src={img} alt={alt} loading="lazy" decoding="async" onError={() => setFailed(true)} />
      ) : null}
    </div>
  );
}

/** Étoiles (fonction stars) : pleine si r ≥ i − 0,25, demie si r ≥ i − 0,75, sinon vide. */
export function Stars({ r }: { r: number }) {
  return (
    <>
      {[1, 2, 3, 4, 5].map((i) =>
        r >= i - 0.25 ? <Fi key={i} s="star" /> : r >= i - 0.75 ? <Fi key={i} s="star-half-stroke" /> : <Fi key={i} r="star" />,
      )}
    </>
  );
}

export function EmptyBox({ icon, t, p, children }: { icon: ReactNode; t: string; p?: string; children?: ReactNode }) {
  return (
    <div className="empty">
      {icon}
      <b>{t}</b>
      {p ? <p className="muted">{p}</p> : null}
      {children}
    </div>
  );
}

export function SecHead({ icon, title, sub, href, label }: { icon?: ReactNode; title: string; sub?: string; href?: string; label?: string }) {
  return (
    <div className="sec-h">
      <div>
        <h2>
          {icon}
          {title}
        </h2>
        {sub ? <p>{sub}</p> : null}
      </div>
      {href ? (
        <Link className="all" href={href}>
          {label || "Tout voir"}
          <Fi s="chevron-right" />
        </Link>
      ) : null}
    </div>
  );
}

export function Page404() {
  return (
    <div className="wrap">
      <div className="empty" style={{ marginTop: 24 }}>
        <Fi r="map" />
        <b>Cette page s&apos;est perdue en chemin</b>
        <p className="muted">Le lien est peut-être ancien.</p>
        <Link className="btn btn-p" href="/">Retour à l&apos;accueil</Link>
      </div>
    </div>
  );
}

/** QR code de démonstration du prototype (fonction qr) — décoratif ; vrai QR en Phase F. */
export function Qr({ seed }: { seed: string }) {
  const n = 21;
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const f = (x: number, y: number) => (x < 7 && y < 7) || (x > n - 8 && y < 7) || (x < 7 && y > n - 8);
  const rects: ReactNode[] = [];
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++) {
      let on: boolean;
      if (f(x, y)) {
        const lx = x > n - 8 ? x - (n - 7) : x;
        const ly = y > n - 8 ? y - (n - 7) : y;
        on = lx === 0 || lx === 6 || ly === 0 || ly === 6 || (lx >= 2 && lx <= 4 && ly >= 2 && ly <= 4);
      } else {
        h = (h * 1103515245 + 12345) >>> 0;
        on = ((h >> 16) & 1) === 1;
      }
      if (on) rects.push(<rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" />);
    }
  return (
    <svg viewBox="0 0 21 21" shapeRendering="crispEdges" fill="#0b0c10" role="img" aria-label="QR code de démonstration">
      {rects}
    </svg>
  );
}

/** Vrai côté navigateur après l'hydratation (pour les portails vers #mbar / #mbuy). */
const noop = () => () => {};
export function useMounted(): boolean {
  return useSyncExternalStore(noop, () => true, () => false);
}

export const fr1 = (x: number) => x.toFixed(1).replace(".", ",");

/** needLogin du prototype : page réservée aux membres ; retour à la page après connexion (?next=). */
export function NeedLogin({ what, next }: { what: string; next: string }) {
  return (
    <div className="wrap">
      <div className="empty" style={{ marginTop: 16 }}>
        <Fi s="lock" />
        <b>Connectez-vous pour continuer</b>
        <p className="muted">{what} est réservé aux membres. C&apos;est gratuit.</p>
        <Link className="btn btn-p" href={`/login?next=${encodeURIComponent(next)}`}>
          Se connecter
        </Link>
      </div>
    </div>
  );
}

/** Étiquette de statut de commande (stTag du prototype). */
export const ORDER_STATUS: Record<string, [string, string]> = {
  received: ["tag-neu", "Reçue"], prep: ["tag-warn", "En préparation"], ready: ["tag-new", "Prête pour retrait"],
  done: ["tag-ok", "Retirée"], expired: ["tag-err", "Non retirée"], cancelled: ["tag-err", "Annulée"],
};
export function StTag({ s }: { s: string }) {
  const [cls, label] = ORDER_STATUS[s] ?? ["tag-neu", s];
  return <span className={`tag ${cls}`}>{label}</span>;
}

/** Erreur de champ affichée sous le champ (tri des toasts, spec §9) — remplace le toast d'erreur. */
export function FieldErr({ msg }: { msg: string | null | undefined }) {
  if (!msg) return null;
  return (
    <p className="ferr" role="alert">
      <Fi s="circle-exclamation" />
      <span>{msg}</span>
    </p>
  );
}
