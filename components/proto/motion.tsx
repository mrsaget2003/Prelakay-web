"use client";

// Vie de l'interface (CLAUDE.md 10 nov. 2026, spec §9) : interactions sur le modèle des composants
// Spectrum UI (Hold to Confirm, Like Button, Skeleton Reveal), écrites avec Motion dans nos styles.
// Au repos, la mise en page reste celle du prototype ; tout respecte prefers-reduced-motion.

import { Children, useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

/** Action irréversible : il faut maintenir le bouton (souris, doigt, Entrée ou Espace). */
export function HoldToConfirm({ label, onConfirm, ms = 1200, className = "btn btn-o btn-sm" }: { label: string; onConfirm: () => void; ms?: number; className?: string }) {
  const [held, setHeld] = useState(false);
  const t = useRef<ReturnType<typeof setTimeout> | null>(null);
  const done = useRef(false);
  const start = () => {
    if (t.current) return;
    done.current = false;
    setHeld(true);
    t.current = setTimeout(() => {
      done.current = true;
      t.current = null;
      setHeld(false);
      onConfirm();
    }, ms);
  };
  const stop = () => {
    if (t.current) clearTimeout(t.current);
    t.current = null;
    setHeld(false);
  };
  useEffect(() => () => { if (t.current) clearTimeout(t.current); }, []);
  return (
    <button
      type="button"
      className={`${className} hold${held ? " on" : ""}`}
      style={{ ["--hold" as string]: `${ms}ms` }}
      aria-label={`${label} (maintenir pour confirmer)`}
      onPointerDown={start}
      onPointerUp={stop}
      onPointerLeave={stop}
      onPointerCancel={stop}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && !e.repeat) {
          e.preventDefault();
          start();
        }
      }}
      onKeyUp={(e) => {
        if (e.key === "Enter" || e.key === " ") stop();
      }}
    >
      <span className="hold-bar" aria-hidden="true" />
      <span className="hold-t">{held ? "Maintenez…" : label}</span>
    </button>
  );
}

/** Apparition progressive des cartes d'une grille (décalage 40 ms, 8 au plus) ; contenu visible sans JS. */
/** Entrée des cartes ajoutées (« Voir plus ») : fondu et montée de 8 px, 30 ms d'écart,
 *  seulement pour les 6 premières (13 nov. 2026). Ce qui est déjà là au premier affichage
 *  (`still` premiers éléments) ne joue aucune entrée : le mouvement est pour ce qu'on déclenche. */
export function Reveal({ children, still = 0 }: { children: ReactNode; still?: number }) {
  const reduce = useReducedMotion();
  const items = Children.toArray(children);
  if (reduce) return <>{items}</>;
  return (
    <>
      {items.map((c, i) =>
        i < still ? (
          <div key={i} className="rvl">
            {c}
          </div>
        ) : (
          <motion.div
            key={i}
            className="rvl"
            initial={{ opacity: 0, transform: "translateY(8px)" }}
            animate={{ opacity: 1, transform: "translateY(0px)" }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1], delay: Math.min(i - still, 5) * 0.03 }}
          >
            {c}
          </motion.div>
        ),
      )}
    </>
  );
}

/** Cœur de la wishlist : petit rebond quand on ajoute. */
export function HeartPop({ on, children }: { on: boolean; children: ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.span style={{ display: "inline-flex" }} key={on ? "on" : "off"} initial={on && !reduce ? { scale: 0.6 } : false} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 600, damping: 12 }}>
      {children}
    </motion.span>
  );
}
