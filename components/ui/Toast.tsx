"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { sileo, Toaster } from "sileo";
import "sileo/styles.css";

// Toasts dessinés par Sileo (CLAUDE.md, 10 nov. 2026). Façade inchangée pour les appelants :
// useToast().show(msg, kind) et .soon(). Un seul toast à la fois, 3 s ; le suivant remplace
// le précédent. Une région live discrète annonce le message aux lecteurs d'écran.
// Tri (spec §9) : pas de toast quand le résultat se voit déjà à l'endroit de l'action.

export type ToastKind = "info" | "success" | "error";
type ToastState = { id: number; msg: string; kind: ToastKind } | null;

type ToastApi = {
  show(msg: string, kind?: ToastKind): void;
  /** Toast « À venir » d'une fonctionnalité d'une version future. */
  soon(): void;
};

/** 1,8 s (12 nov. 2026, Marc-Karlin : « les toasts prennent trop de temps à disparaître »).
 *  Un toast ne porte qu'une phrase courte : 1,8 s suffit à la lire, l'animation de sortie s'ajoute. */
export const TOAST_MS = 1800;
export const SOON_LABEL = "À venir";
/** Fond des toasts : --color-black de design-prelakay (Sileo dessine en SVG : couleur littérale). */
const FILL = "#0b0c10";

const ToastContext = createContext<ToastApi | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const seq = useRef(0);
  const [desk, setDesk] = useState(false);

  useEffect(() => {
    const mq = typeof window !== "undefined" && window.matchMedia ? window.matchMedia("(min-width: 768px)") : null;
    if (!mq) return;
    const on = () => setDesk(mq.matches);
    on();
    mq.addEventListener?.("change", on);
    return () => mq.removeEventListener?.("change", on);
  }, []);

  const show = useCallback((msg: string, kind: ToastKind = "info") => {
    if (timer.current) clearTimeout(timer.current);
    seq.current += 1;
    setToast({ id: seq.current, msg, kind });
    timer.current = setTimeout(() => setToast(null), TOAST_MS);
    sileo.clear();
    sileo[kind]({ title: msg, duration: TOAST_MS, fill: FILL, styles: { title: "pk-sileo-t", badge: "pk-sileo-b" } });
  }, []);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const api = useMemo<ToastApi>(() => ({ show, soon: () => show(SOON_LABEL, "info") }), [show]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <Toaster position={desk ? "top-right" : "top-center"} offset={{ top: 16, right: 16 }} />
      {toast && (
        <div key={toast.id} role="status" aria-live="polite" data-kind={toast.kind} className="pk-sr">
          {toast.msg}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast doit être utilisé sous <ToastProvider>.");
  return ctx;
}
