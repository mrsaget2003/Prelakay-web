"use client";

// Bouton qui change d'état (13 nov. 2026) — composant DynamicButton fourni par Marc-Karlin,
// traduit dans nos classes (.btn) : « Copier » → « Copié ». L'ancien libellé monte et s'efface
// pendant que le nouveau arrive (même cellule, rien ne bouge autour) ; l'icône change par
// fondu + flou ; la largeur suit le libellé (courbe ease-out, pas de ressort).
// Mouvement réduit : simple fondu.

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useLayoutEffect, useRef, useState, type Key, type ReactNode } from "react";

const easeOut = [0.23, 1, 0.32, 1] as const;

export function DynamicButton({
  children,
  icon,
  stateKey,
  className = "btn btn-p btn-sm",
  onClick,
  ariaLabel,
}: {
  children: string;
  icon?: ReactNode;
  /** Change quand l'état change (ex. « copy » / « copied ») : déclenche l'échange. */
  stateKey?: Key;
  className?: string;
  onClick?: () => void;
  ariaLabel?: string;
}) {
  const reduce = useReducedMotion();
  const btn = useRef<HTMLButtonElement>(null);
  const measure = useRef<HTMLSpanElement>(null);
  const [w, setW] = useState<number | null>(null);
  const key = stateKey ?? children;

  useLayoutEffect(() => {
    const b = btn.current;
    const m = measure.current;
    if (!b || !m) return;
    const sync = () => {
      const cs = getComputedStyle(b);
      const pad = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight) + parseFloat(cs.borderLeftWidth) + parseFloat(cs.borderRightWidth);
      setW(Math.ceil(m.scrollWidth + pad));
    };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(m);
    return () => ro.disconnect();
  }, [children, key]);

  const enter = reduce ? { opacity: 0 } : { opacity: 0, transform: "translateY(8px)", filter: "blur(2px)" };
  const shown = { opacity: 1, transform: "translateY(0px)", filter: "blur(0px)" };
  const exit = reduce ? { opacity: 0 } : { opacity: 0, transform: "translateY(-8px)", filter: "blur(2px)" };
  const t = { duration: 0.18, ease: easeOut };

  return (
    <motion.button
      ref={btn}
      type="button"
      className={`${className} dyn-btn`}
      onClick={onClick}
      aria-label={ariaLabel}
      aria-live="polite"
      initial={false}
      animate={w ? { width: w } : undefined}
      transition={{ width: { duration: reduce ? 0 : 0.22, ease: easeOut } }}
    >
      <span className="dyn-in">
        {icon ? (
          <span className="dyn-ic">
            <AnimatePresence initial={false} mode="popLayout">
              <motion.span key={key} initial={reduce ? { opacity: 0 } : { opacity: 0, transform: "scale(0.3)", filter: "blur(3px)" }} animate={{ opacity: 1, transform: "scale(1)", filter: "blur(0px)" }} exit={reduce ? { opacity: 0 } : { opacity: 0, transform: "scale(0.3)", filter: "blur(3px)" }} transition={t}>
                {icon}
              </motion.span>
            </AnimatePresence>
          </span>
        ) : null}
        <span className="dyn-tx">
          <AnimatePresence initial={false} mode="popLayout">
            <motion.span key={`${String(key)}-${children}`} initial={enter} animate={shown} exit={exit} transition={t}>
              {children}
            </motion.span>
          </AnimatePresence>
        </span>
      </span>
      <span ref={measure} className="dyn-measure" aria-hidden="true">
        {icon ? <span className="dyn-ic" /> : null}
        <span>{children}</span>
      </span>
    </motion.button>
  );
}
