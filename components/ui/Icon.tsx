import { ICONS, type IconName } from "@/lib/icons/registry";
import styles from "./Icon.module.css";

// Seul point d'entrée des icônes dans l'UI : jamais de classe `fa-…` en dur
// (passage à Iconly Pro mécanique, design-prelakay §4).
// Le SVG est dessiné directement depuis la définition Font Awesome :
// pas de police d'icônes à télécharger, seules les icônes utilisées partent.

export type { IconName };

export type IconProps = {
  name: IconName;
  /** Actif : icône pleine + pastille de fond à 20 % (duotone simulé, 03-design §5.1). */
  active?: boolean;
  /** Taille en px ; par défaut 1em (suit la taille du texte). */
  size?: number;
  /** Nom accessible. Sans label, l'icône est décorative. */
  label?: string;
  className?: string;
};

export function Icon({ name, active = false, size, label, className }: IconProps) {
  const entry = ICONS[name];
  const def = active || !("regular" in entry) ? entry.solid : entry.regular;
  const [w, h, , , path] = def.icon;
  const d = Array.isArray(path) ? path.join(" ") : path;
  const dim = size ?? "1em";
  return (
    <span
      className={[styles.icon, active ? styles.active : "", className ?? ""].filter(Boolean).join(" ")}
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
    </span>
  );
}
