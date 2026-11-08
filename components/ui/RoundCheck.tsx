"use client";

import styles from "./RoundCheck.module.css";

// Case à cocher ronde du panier (tout, par store, par article — 03-design §9.7).
export function RoundCheck({ checked, onChange, label, hideLabel = false }: { checked: boolean; onChange: (v: boolean) => void; label: string; hideLabel?: boolean }) {
  return (
    <label className={styles.rc}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className={styles.box} aria-hidden="true" />
      <span className={hideLabel ? styles.sr : undefined}>{label}</span>
    </label>
  );
}
