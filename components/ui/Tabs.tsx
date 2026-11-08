"use client";

import { useRef, type KeyboardEvent } from "react";
import type { FeatureKey } from "@/lib/config/release";
import { ComingSoon } from "./ComingSoon";
import { SoonBadge } from "./Tag";
import styles from "./Tabs.module.css";

// Onglets (commandes, store, statistiques…). Un onglet d'une version future reste
// visible, affiche « À venir » et ne change pas l'onglet actif (CHANGELOG règle 3).

export type TabItem = { id: string; label: string; count?: number; feature?: FeatureKey };

export function Tabs({ tabs, value, onChange, label }: { tabs: TabItem[]; value: string; onChange: (id: string) => void; label: string }) {
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  const live = tabs.filter((t) => !t.feature);

  function onKey(e: KeyboardEvent, id: string) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const i = live.findIndex((t) => t.id === id);
    const next = live[(i + (e.key === "ArrowRight" ? 1 : -1) + live.length) % live.length];
    onChange(next.id);
    refs.current[tabs.indexOf(next)]?.focus();
  }

  return (
    <div role="tablist" aria-label={label} className={styles.tabs}>
      {tabs.map((t, i) => {
        const selected = t.id === value;
        const btn = (
          <button
            key={t.id}
            ref={(el) => { refs.current[i] = el; }}
            type="button"
            role="tab"
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            className={styles.tab}
            onClick={() => onChange(t.id)}
            onKeyDown={(e) => onKey(e, t.id)}
          >
            {t.label}
            {t.count != null && <span className={styles.count}>{t.count}</span>}
            {t.feature && <SoonBadge />}
          </button>
        );
        return t.feature ? <ComingSoon key={t.id} feature={t.feature}>{btn}</ComingSoon> : btn;
      })}
    </div>
  );
}
