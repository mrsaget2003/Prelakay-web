"use client";

import { Icon } from "./Icon";
import styles from "./QtyStepper.module.css";

// Quantité bornée par le stock de la combinaison choisie (03-design §9.4 bis).
export function QtyStepper({
  value,
  min = 1,
  max,
  onChange,
  label = "Quantité",
}: {
  value: number;
  min?: number;
  max: number;
  onChange: (v: number) => void;
  label?: string;
}) {
  const clamp = (v: number) => Math.min(Math.max(v, min), Math.max(max, min));
  return (
    <div className={styles.qty} role="group" aria-label={label}>
      <button type="button" aria-label="Retirer un" disabled={value <= min} onClick={() => onChange(clamp(value - 1))}>
        <Icon name="minus" />
      </button>
      <input
        type="number"
        inputMode="numeric"
        aria-label={label}
        min={min}
        max={max}
        value={value}
        onChange={(e) => {
          const n = Number.parseInt(e.target.value, 10);
          if (!Number.isNaN(n)) onChange(clamp(n));
        }}
      />
      <button type="button" aria-label="Ajouter un" disabled={value >= max} onClick={() => onChange(clamp(value + 1))}>
        <Icon name="plus" />
      </button>
    </div>
  );
}
