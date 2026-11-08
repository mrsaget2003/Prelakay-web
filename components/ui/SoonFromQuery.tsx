"use client";

import { useEffect, useRef } from "react";
import { useToast } from "./Toast";

// Une adresse d'une version future redirige vers l'Accueil avec ?soon=<fonctionnalité>
// (proxy.ts) : on affiche « À venir » une fois, puis on nettoie l'adresse.
export function SoonFromQuery({ search }: { search?: string }) {
  const toast = useToast();
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;
    const s = search ?? window.location.search;
    const params = new URLSearchParams(s);
    if (!params.get("soon")) return;
    done.current = true;
    toast.soon();
    if (search === undefined) {
      params.delete("soon");
      const qs = params.toString();
      window.history.replaceState(null, "", window.location.pathname + (qs ? `?${qs}` : "") + window.location.hash);
    }
  }, [search, toast]);

  return null;
}
