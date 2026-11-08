import Image from "next/image";
import Link from "next/link";
import styles from "./Logo.module.css";

// Plan §2.4 et design-prelakay §5.1.
// - full = icône + wordmark (fichiers full-logo-*) : logo principal.
// - mark = icône seule (fichiers secondary-logo-*) : quand seule l'icône tient.
// Le wordmark n'est jamais recomposé en texte. Pas d'ombre, pas de recoloration.

type Variant = "full" | "mark";
type Tone = "lagon" | "white";

const FILES: Record<Variant, Record<Tone, string>> = {
  full: {
    lagon: "/logo/_simple/full-logo-lagon.svg",
    white: "/logo/_simple/full-logo-white.svg",
  },
  mark: {
    lagon: "/logo/_simple/secondary-logo-lagon.svg",
    white: "/logo/_simple/secondary-logo-white.svg",
  },
};

/** Largeur / hauteur, d'après le viewBox des SVG fournis. */
const RATIO: Record<Variant, number> = {
  full: 2324.17 / 772.09,
  mark: 664.95 / 663.1,
};

/** Tailles minimales (03-design §7.1) : 32 px de haut avec wordmark, 24 px pour l'icône seule. */
const MIN_HEIGHT: Record<Variant, number> = { full: 32, mark: 24 };
const DEFAULT_HEIGHT: Record<Variant, number> = { full: 36, mark: 32 };

export type LogoProps = {
  variant: Variant;
  tone: Tone;
  height?: number;
  href?: string;
  priority?: boolean;
  className?: string;
};

export function Logo({ variant, tone, height, href, priority, className }: LogoProps) {
  const h = Math.max(height ?? DEFAULT_HEIGHT[variant], MIN_HEIGHT[variant]);
  const w = Math.round(h * RATIO[variant]);
  const img = (
    <Image
      src={FILES[variant][tone]}
      alt="Prélakay"
      width={w}
      height={h}
      priority={priority}
      unoptimized
      className={href ? undefined : className}
    />
  );
  if (!href) return img;
  return (
    <Link href={href} aria-label="Prélakay, accueil" className={[styles.link, className].filter(Boolean).join(" ")}>
      {img}
    </Link>
  );
}
