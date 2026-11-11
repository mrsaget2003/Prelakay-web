"use client";

// Interrupteur du mode sombre (Paramètres) : Clair · Sombre · Selon l'appareil.

import { useSyncExternalStore } from "react";
import { getTheme, setTheme, type ThemeChoice } from "@/lib/ui/theme";
import { Fi } from "./ui";

const listeners = new Set<() => void>();
const sub = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export function ThemeSwitch() {
  const t = useSyncExternalStore(sub, getTheme, () => "system" as ThemeChoice);
  const pick = (v: ThemeChoice) => {
    setTheme(v);
    listeners.forEach((l) => l());
  };
  return (
    <div className="lrow st th-sw">
      <Fi s="moon" />
      <span>Mode sombre</span>
      <span className="otabs sm" role="group" aria-label="Apparence">
        {([["light", "Clair"], ["dark", "Sombre"], ["system", "Appareil"]] as const).map(([k, l]) => (
          <button key={k} type="button" className={t === k ? "on" : ""} aria-pressed={t === k} onClick={() => pick(k)}>
            {l}
          </button>
        ))}
      </span>
    </div>
  );
}
