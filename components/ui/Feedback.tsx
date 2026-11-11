"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

// Retours visuels à l'endroit de l'action (tri des toasts, spec §9) :
// le bouton affiche « Ajouté ✓ » ou « Copié » ; le badge du panier rebondit.

/** État temporaire d'un bouton : vrai pendant `ms` après l'appel ; un nouvel appel relance la durée. */
export function useFlash(ms = 1600): [boolean, () => void] {
  const [on, setOn] = useState(false);
  const t = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flash = useCallback(() => {
    if (t.current) clearTimeout(t.current);
    setOn(true);
    t.current = setTimeout(() => setOn(false), ms);
  }, [ms]);
  useEffect(() => () => { if (t.current) clearTimeout(t.current); }, []);
  return [on, flash];
}

/** Pastille du panier (classe .cnt du prototype) : rebondit quand le nombre augmente. */
export function BumpBadge({ count, always = false }: { count: number; always?: boolean }) {
  const reduce = useReducedMotion();
  // valeur précédente gardée en état (motif React « ajuster l'état quand une prop change »)
  const [prev, setPrev] = useState(count);
  const [grew, setGrew] = useState(false);
  if (count !== prev) {
    setGrew(count > prev);
    setPrev(count);
  }
  if (!count && !always) return null;
  return (
    <motion.span
      key={count}
      className="cnt"
      initial={grew && !reduce ? { scale: 1.6 } : false}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 520, damping: 14 }}
    >
      {count}
    </motion.span>
  );
}
