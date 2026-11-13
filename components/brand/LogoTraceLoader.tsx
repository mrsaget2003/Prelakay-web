"use client";

// Chargeur qui trace le logo (13 nov. 2026, contrat fourni par Marc-Karlin) :
// tant que `loading`, un court segment de trait fait le tour du logo ; quand le travail est
// fini (`isComplete` ou `loading` à false), le contour se ferme, puis le logo se remplit.
// `onDone` est appelé une seule fois, quand le logo plein est visible.
// Couleur : currentColor (on la règle par `className`). Mouvement réduit : logo plein tout de
// suite. Des minuteries servent de filet : on ne dépend pas seulement des événements SVG.

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { LOGO_FILL_PATHS, LOGO_TRACE_PATH, LOGO_VIEW_BOX } from "@/lib/brand/logoPaths";

type LoaderPhase = "loop" | "closingOutline" | "fadingFill" | "done";

type LogoTraceLoaderProps = {
  loading?: boolean;
  isComplete?: boolean;
  size?: number;
  strokeWidth?: number;
  loopDurationSeconds?: number;
  fillFadeSeconds?: number;
  className?: string;
  ariaLabel?: string;
  onDone?: () => void;
};

const CLOSE_SECONDS = 0.5;

const RM = "(prefers-reduced-motion: reduce)";
function useReducedMotionPref() {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia(RM);
      m.addEventListener("change", cb);
      return () => m.removeEventListener("change", cb);
    },
    () => window.matchMedia(RM).matches,
    () => false,
  );
}

export function LogoTraceLoader({
  loading = true,
  isComplete = false,
  size = 48,
  strokeWidth = 10,
  loopDurationSeconds = 1.4,
  fillFadeSeconds = 0.3,
  className,
  ariaLabel = "Chargement",
  onDone,
}: LogoTraceLoaderProps) {
  const finished = isComplete || !loading;
  // après la fin : fermeture du contour → remplissage → fait (avancé par des minuteries)
  const [step, setStep] = useState<Exclude<LoaderPhase, "loop">>("closingOutline");
  const [prevFinished, setPrevFinished] = useState(finished);
  if (finished !== prevFinished) {
    // nouveau cycle : on repart de la fermeture du contour (mise à jour pendant le rendu)
    setPrevFinished(finished);
    setStep("closingOutline");
  }
  const reduce = useReducedMotionPref();
  const phase: LoaderPhase = !finished ? "loop" : reduce ? "done" : step;

  const doneCalled = useRef(false);
  const onDoneRef = useRef(onDone);
  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    if (!finished) {
      doneCalled.current = false;
      return;
    }
    const callDone = () => {
      if (doneCalled.current) return;
      doneCalled.current = true;
      onDoneRef.current?.();
    };
    if (reduce) {
      callDone();
      return;
    }
    const t1 = setTimeout(() => setStep("fadingFill"), CLOSE_SECONDS * 1000);
    const t2 = setTimeout(() => {
      setStep("done");
      callDone();
    }, (CLOSE_SECONDS + fillFadeSeconds) * 1000 + 50);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [finished, reduce, fillFadeSeconds]);

  const half = Math.max(1, strokeWidth / 2);
  return (
    <svg role="status" aria-label={ariaLabel} viewBox={LOGO_VIEW_BOX} width={size} height={size} className={["ltl", className].filter(Boolean).join(" ")}>
      <g opacity="0.18">
        <path d={LOGO_TRACE_PATH} fill="none" stroke="currentColor" strokeWidth={half} strokeLinejoin="round" />
      </g>

      {phase === "loop" ? (
        <path
          d={LOGO_TRACE_PATH}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
          strokeDasharray="0.16 0.84"
          style={{ animation: `logo-trace-loader-loop ${loopDurationSeconds}s linear infinite` }}
        />
      ) : null}

      {phase === "closingOutline" ? (
        <path
          d={LOGO_TRACE_PATH}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
          strokeDasharray="1 1"
          style={{ animation: `logo-trace-loader-close ${CLOSE_SECONDS}s cubic-bezier(.23,1,.32,1) forwards` }}
        />
      ) : null}

      {phase === "fadingFill" || phase === "done"
        ? LOGO_FILL_PATHS.map((d) => (
            <path key={d} d={d} fill="currentColor" style={phase === "fadingFill" ? { animation: `logo-trace-loader-fill ${fillFadeSeconds}s cubic-bezier(.23,1,.32,1) both` } : undefined} />
          ))
        : null}
    </svg>
  );
}
