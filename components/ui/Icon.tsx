import { ICONS, type IconName } from "@/lib/icons/registry";
import styles from "./Icon.module.css";

// Rend un élément <i> (classe fa-ic) : les règles du prototype (`.ph i`, `.btn i`,
// `i[class*="fa-"]`…) s'appliquent sans changement.
// Seul point d'entrée des icônes dans l'UI : jamais de classe `fa-…` en dur
// (passage à Iconly Pro mécanique, design-prelakay §4).
// Le SVG est dessiné directement depuis la définition Font Awesome :
// pas de police d'icônes à télécharger, seules les icônes utilisées partent.

export type { IconName };

export type IconProps = {
  name: IconName;
  /** Actif : icône pleine + pastille de fond à 20 % (duotone simulé, 03-design §5.1). */
  active?: boolean;
  /** Force un style sans pastille (ex. étoiles d'une note) ; sinon actif = plein, repos = contour. */
  variant?: "solid" | "regular";
  /** Taille en px ; par défaut 1em (suit la taille du texte). */
  size?: number;
  /** Nom accessible. Sans label, l'icône est décorative. */
  label?: string;
  className?: string;
};

export function Icon({ name, active = false, variant, size, label, className }: IconProps) {
  const entry = ICONS[name];
  const wantSolid = variant ? variant === "solid" : active;
  const def = wantSolid || !("regular" in entry) ? entry.solid : entry.regular;
  const [w, h, , , path] = def.icon;
  const d = Array.isArray(path) ? path.join(" ") : path;
  const dim = size ?? "1em";
  return (
    <i
      className={["fa-ic", styles.icon, active ? styles.active : "", className ?? ""].filter(Boolean).join(" ")}
      data-active={active ? "true" : undefined}
    >
      <svg
        viewBox={`0 0 ${w} ${h}`}
        width={dim}
        height={dim}
        fill="currentColor"
        focusable="false"
        data-prefix={def.prefix}
        data-icon={def.iconName}
        aria-hidden={label ? undefined : "true"}
        role={label ? "img" : undefined}
        aria-label={label}
      >
        <path d={d} />
      </svg>
    </i>
  );
}
