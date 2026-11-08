import { useId, type InputHTMLAttributes } from "react";
import { Icon } from "./Icon";
import styles from "./Field.module.css";

// design-prelakay §8.4 : 48 px, radius-sm, bordure 1 px neutral-300 ; focus 2 px
// lagon-500 + halo lagon-100 à 40 %. Erreur : fond error 8 %, texte actionnable.

export type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  hint?: string;
};

export function Field({ label, error, hint, id, className, ...input }: FieldProps) {
  const auto = useId();
  const fieldId = id ?? auto;
  const descId = `${fieldId}-desc`;
  const desc = error ?? hint;
  return (
    <div className={[styles.wrap, className ?? ""].filter(Boolean).join(" ")}>
      <label htmlFor={fieldId} className={styles.label}>{label}</label>
      <input
        id={fieldId}
        className={styles.input}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={desc ? descId : undefined}
        {...input}
      />
      {error ? (
        <p id={descId} className={styles.error}>
          <Icon name="circle-exclamation" />
          <span>{error}</span>
        </p>
      ) : hint ? (
        <p id={descId} className={styles.hint}>{hint}</p>
      ) : null}
    </div>
  );
}
