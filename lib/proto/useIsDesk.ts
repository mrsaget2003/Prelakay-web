"use client";

import { useEffect, useState } from "react";

/** isDesk() du prototype (≥ 1024 px), réactif au redimensionnement. Faux au premier rendu (mobile d'abord). */
export function useIsDesk(): boolean {
  const [d, setD] = useState(false);
  useEffect(() => {
    const m = window.matchMedia("(min-width: 1024px)");
    const on = () => setD(m.matches);
    on();
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, []);
  return d;
}
