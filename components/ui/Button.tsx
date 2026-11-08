import type { ButtonHTMLAttributes } from "react";
import styles from "./Button.module.css";

// design-prelakay §8.4 : 48 px, radius-sm, padding 16 px, fond lagon-500, texte
// #fffaf7 13 px Medium, hover lagon-700, désactivé neutral-300 / neutral-500, sans ombre.

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant: "primary" | "outline" | "ghost" | "dark";
  size?: "md" | "sm";
  block?: boolean;
  loading?: boolean;
};

export function Button({ variant, size = "md", block, loading, disabled, type = "button", className, children, onClick, ...rest }: ButtonProps) {
  const inert = disabled || loading;
  return (
    <button
      type={type}
      className={[styles.btn, styles[variant], styles[size], block ? styles.block : "", className ?? ""].filter(Boolean).join(" ")}
      disabled={disabled}
      aria-disabled={inert ? "true" : undefined}
      aria-busy={loading ? "true" : undefined}
      onClick={inert ? undefined : onClick}
      {...rest}
    >
      {loading && <span className={styles.spinner} aria-hidden="true" />}
      {children}
    </button>
  );
}
