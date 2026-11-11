"use client";

// Compte à rebours d'une offre flash (HH:MM:SS), mis à jour chaque seconde côté client.

import { useSyncExternalStore } from "react";

const pad = (n: number) => String(n).padStart(2, "0");

export function fmtLeft(ms: number): string {
  const t = Math.max(0, Math.floor(ms / 1000));
  return `${pad(Math.floor(t / 3600))}:${pad(Math.floor((t % 3600) / 60))}:${pad(t % 60)}`;
}

/** Horloge partagée à la seconde (0 au rendu serveur : « --:--:-- » jusqu'à l'hydratation). */
const tick = (cb: () => void) => {
  const t = setInterval(cb, 1000);
  return () => clearInterval(t);
};
const nowSec = () => Math.floor(Date.now() / 1000);

export function Countdown({ ends, className }: { ends: number; className?: string }) {
  const sec = useSyncExternalStore(tick, nowSec, () => 0);
  const now = sec ? sec * 1000 : null;
  return (
    <span className={`cdn tnum${className ? " " + className : ""}`} aria-label={now ? `Se termine dans ${fmtLeft(ends - now)}` : undefined}>
      {now ? fmtLeft(ends - now) : "--:--:--"}
    </span>
  );
}
