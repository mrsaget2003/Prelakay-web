"use client";

// Modale du prototype (openModal / closeModal) : #ovl + .modal, mêmes classes.
// openModal(title, contenu) ajoute l'en-tête « .mh » ; openRaw(classe, contenu) sert
// à l'aperçu rapide (.modal.qv) qui a sa propre mise en page.

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { Fi } from "./ui";

type ModalApi = {
  open(title: string, content: ReactNode): void;
  openRaw(cls: string, content: ReactNode): void;
  close(): void;
  isOpen: boolean;
};

const Ctx = createContext<ModalApi | null>(null);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [m, setM] = useState<{ cls: string; title?: string; content: ReactNode } | null>(null);
  const close = useCallback(() => setM(null), []);

  useEffect(() => {
    document.body.classList.toggle("noscroll", !!m);
    if (!m) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setM(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [m]);

  const api = useMemo<ModalApi>(
    () => ({
      open: (title, content) => setM({ cls: "modal", title, content }),
      openRaw: (cls, content) => setM({ cls: `modal ${cls}`, content }),
      close,
      isOpen: !!m,
    }),
    [close, m],
  );

  return (
    <Ctx.Provider value={api}>
      {children}
      <div className={`ovl${m ? " open" : ""}`} id="ovl" onClick={close} />
      <div className={`${m?.cls ?? "modal"}${m ? " open" : ""}`} id="modal" role="dialog" aria-modal="true" aria-label={m?.title}>
        {m?.title !== undefined ? (
          <div className="mh">
            <h3 style={{ margin: 0 }}>{m.title}</h3>
            <button onClick={close} aria-label="Fermer">
              <Fi s="xmark" />
            </button>
          </div>
        ) : null}
        {m?.content}
      </div>
    </Ctx.Provider>
  );
}

export function useModal(): ModalApi {
  const c = useContext(Ctx);
  if (!c) throw new Error("useModal doit être utilisé sous <ModalProvider>.");
  return c;
}
