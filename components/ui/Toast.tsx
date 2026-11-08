"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Icon, type IconName } from "./Icon";
import styles from "./Toast.module.css";

// Un seul toast à la fois, 3 s (CHANGELOG règle 2) ; le suivant remplace le précédent.

export type ToastKind = "info" | "success" | "error";
type ToastState = { id: number; msg: string; kind: ToastKind } | null;

type ToastApi = {
  show(msg: string, kind?: ToastKind): void;
  /** Toast « À venir » d'une fonctionnalité d'une version future. */
  soon(): void;
};

export const TOAST_MS = 3000;
export const SOON_LABEL = "À venir";

const ICON: Record<ToastKind, IconName> = { info: "clock", success: "circle-check", error: "circle-exclamation" };

const ToastContext = createContext<ToastApi | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const seq = useRef(0);

  const show = useCallback((msg: string, kind: ToastKind = "info") => {
    if (timer.current) clearTimeout(timer.current);
    seq.current += 1;
    setToast({ id: seq.current, msg, kind });
    timer.current = setTimeout(() => setToast(null), TOAST_MS);
  }, []);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const api = useMemo<ToastApi>(() => ({ show, soon: () => show(SOON_LABEL, "info") }), [show]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      {toast && (
        <div key={toast.id} role="status" aria-live="polite" data-kind={toast.kind} className={`${styles.toast} ${styles[toast.kind]}`}>
          <Icon name={ICON[toast.kind]} />
          <span>{toast.msg}</span>
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
