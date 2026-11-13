"use client";

// Liste à fondu (13 nov. 2026) — composant ScrollFadeList fourni par Marc-Karlin, traduit
// dans nos styles. Le haut et le bas s'estompent seulement quand il reste du contenu à faire
// défiler de ce côté ; la hauteur du fondu suit la distance restante (jusqu'à `maxFade`).
// Masque CSS plutôt qu'un calque de couleur : le fondu marche sur n'importe quel fond.

import { useEffect, useRef, type ReactNode } from "react";

export function ScrollFadeList<T>({
  items,
  getKey,
  renderItem,
  className = "",
  label,
  maxFade = 56,
}: {
  items: readonly T[];
  getKey: (item: T) => string;
  renderItem: (item: T) => ReactNode;
  className?: string;
  /** Nom accessible de la navigation. */
  label?: string;
  maxFade?: number;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      const max = Math.max(0, el.scrollHeight - el.clientHeight);
      el.style.setProperty("--fade-t", `${Math.min(maxFade, el.scrollTop)}px`);
      el.style.setProperty("--fade-b", `${Math.min(maxFade, max - el.scrollTop)}px`);
    };
    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    el.addEventListener("scroll", schedule, { passive: true });
    const ro = new ResizeObserver(schedule);
    ro.observe(el);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("scroll", schedule);
      ro.disconnect();
    };
  }, [maxFade, items.length]);

  return (
    <nav ref={ref} className={`sfl ${className}`.trim()} aria-label={label}>
      {items.map((it) => (
        <span key={getKey(it)} style={{ display: "contents" }}>
          {renderItem(it)}
        </span>
      ))}
    </nav>
  );
}
