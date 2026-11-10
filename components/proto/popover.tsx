"use client";

// Popovers et menus du header (A.2 / A.3) : un seul composant, un seul comportement.
// - ouverture : survol (délai 150 ms), clic qui bascule, focus clavier ;
// - fermeture : Échap, clic extérieur, changement de route, ouverture d'un autre menu ;
// - un seul menu ouvert à la fois (le méga-menu « Toutes les catégories » compris).

import { usePathname, useSearchParams } from "next/navigation";
import {
  cloneElement, createContext, useCallback, useContext, useEffect, useMemo, useRef, useState,
  type FocusEvent, type ReactElement, type ReactNode,
} from "react";

const HOVER_MS = 150;

type MenuApi = {
  openId: string | null;
  open(id: string): void;
  close(id?: string): void;
  toggle(id: string): void;
  /** Survol : ouvre ou ferme après 150 ms (annulé si la souris revient). */
  hover(id: string, on: boolean): void;
};

const MenuCtx = createContext<MenuApi | null>(null);

export function MenuProvider({ children }: { children: ReactNode }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const routeKey = `${pathname}?${search}`;
  const [at, setAt] = useState(routeKey);
  // changement de route : tout se ferme (dérivé au rendu, sans effet en cascade)
  if (at !== routeKey) {
    setAt(routeKey);
    setOpenId(null);
  }

  const clear = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };
  const open = useCallback((id: string) => {
    clear();
    setOpenId(id);
  }, []);
  const close = useCallback((id?: string) => {
    clear();
    setOpenId((cur) => (id === undefined || cur === id ? null : cur));
  }, []);
  const toggle = useCallback((id: string) => {
    clear();
    setOpenId((cur) => (cur === id ? null : id));
  }, []);
  const hover = useCallback((id: string, on: boolean) => {
    clear();
    timer.current = setTimeout(() => setOpenId((cur) => (on ? id : cur === id ? null : cur)), HOVER_MS);
  }, []);

  useEffect(() => {
    if (!openId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenId(null);
    };
    const onDown = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (!t.closest(`[data-menu="${openId}"]`)) setOpenId(null);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [openId]);
  useEffect(() => () => clear(), []);

  const api = useMemo(() => ({ openId, open, close, toggle, hover }), [openId, open, close, toggle, hover]);
  return <MenuCtx.Provider value={api}>{children}</MenuCtx.Provider>;
}

export function useMenu(): MenuApi {
  const c = useContext(MenuCtx);
  if (!c) throw new Error("useMenu doit être utilisé sous <MenuProvider>.");
  return c;
}

/** Popover du header : déclencheur + panneau .ddp, mêmes classes que le prototype. */
export function Popover({
  id,
  cls,
  trigger,
  children,
  hover = true,
  label,
}: {
  id: string;
  cls: string;
  trigger: ReactElement<{ onClick?: (e: React.MouseEvent) => void; "aria-expanded"?: boolean; "aria-haspopup"?: boolean | "true" | "menu" | "dialog"; "aria-controls"?: string }>;
  children: ReactNode;
  hover?: boolean;
  label?: string;
}) {
  const m = useMenu();
  const isOpen = m.openId === id;
  const panelId = `pop-${id}`;
  const prevClick = trigger.props.onClick;
  return (
    <div
      className={`dd ${cls}${isOpen ? " open" : ""}`}
      data-menu={id}
      onMouseEnter={hover ? () => m.hover(id, true) : undefined}
      onMouseLeave={
        hover
          ? (e) => {
              // pas de fermeture au survol pendant une saisie dans le panneau (ex. <select> ouvert)
              if (!e.currentTarget.contains(document.activeElement)) m.hover(id, false);
            }
          : undefined
      }
      onFocus={(e: FocusEvent<HTMLDivElement>) => {
        // ouverture au focus clavier seulement : au clic, le clic bascule déjà le panneau
        if ((e.target as HTMLElement).matches(":focus-visible")) m.open(id);
      }}
      onBlur={(e: FocusEvent<HTMLDivElement>) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) m.close(id);
      }}
    >
      {cloneElement(trigger, {
        "aria-expanded": isOpen,
        "aria-haspopup": "true",
        "aria-controls": panelId,
        onClick: (e: React.MouseEvent) => {
          prevClick?.(e);
          if (e.defaultPrevented) return;
          // un lien garde sa navigation ; un bouton bascule le panneau
          if ((e.currentTarget as HTMLElement).tagName !== "A") m.toggle(id);
        },
      })}
      <div className={`ddp ${cls}`} id={panelId} role="dialog" aria-label={label}>
        {children}
      </div>
    </div>
  );
}
