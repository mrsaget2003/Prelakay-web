"use client";

// Session de la console admin — séparée du compte acheteur / vendeur (plan §1.0 « Sessions »).
// Démo : sessionStorage (fermeture de l'onglet = déconnexion). « Rester connecté 8 heures »
// est affiché ; la vraie durée de session arrive avec BetterAuth (Phase D).

import { useSyncExternalStore } from "react";
import { ADMINS, type Role } from "@/lib/domain/admin";
import type { LoginState } from "@/lib/domain/admin";
import type { Me } from "./admin";

export type AdminSession = { on: boolean; email: string; role: Role; n: string; at: string; remember: boolean };
const KEY = "pk-admin";
const LOGIN = "pk-admin-login";

let cache: AdminSession | null | undefined;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

function read(): AdminSession | null {
  if (cache !== undefined) return cache;
  try {
    const raw = typeof sessionStorage !== "undefined" ? sessionStorage.getItem(KEY) : null;
    const v = raw ? (JSON.parse(raw) as Partial<AdminSession>) : null;
    // une session sans membre connu (ex. rôle seul) est complétée depuis la liste de démo
    const m = v?.on ? ADMINS.find((a) => a.e === v.email) ?? ADMINS.find((a) => a.role === v.role) : undefined;
    cache = v?.on && m ? { on: true, email: v.email ?? m.e, role: (v.role ?? m.role) as Role, n: v.n ?? m.n, at: v.at ?? "—", remember: v.remember ?? true } : null;
  } catch {
    cache = null;
  }
  return cache;
}
function write(v: AdminSession | null) {
  cache = v;
  try {
    if (v) sessionStorage.setItem(KEY, JSON.stringify(v));
    else sessionStorage.removeItem(KEY);
  } catch {
    /* stockage indisponible : la session reste en mémoire */
  }
  emit();
}

export const adminSession = {
  get: read,
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  login(email: string, remember: boolean) {
    const m = ADMINS.find((a) => a.e === email)!;
    write({ on: true, email, role: m.role, n: m.n, at: new Date().toTimeString().slice(0, 5), remember });
  },
  logout() {
    write(null);
  },
  /** Compteur d'échecs et blocage (survit au rechargement de l'onglet). */
  loginState(): LoginState {
    try {
      const raw = sessionStorage.getItem(LOGIN);
      return raw ? (JSON.parse(raw) as LoginState) : { fails: 0, lockUntil: 0 };
    } catch {
      return { fails: 0, lockUntil: 0 };
    }
  },
  setLoginState(st: LoginState) {
    try {
      sessionStorage.setItem(LOGIN, JSON.stringify(st));
    } catch {
      /* rien */
    }
  },
};

/** undefined = pas encore lu (rendu serveur) ; null = pas de session. */
export function useAdminSession(): AdminSession | null | undefined {
  return useSyncExternalStore(adminSession.subscribe, adminSession.get, () => undefined);
}
export function meOf(s: AdminSession): Me {
  return { e: s.email, n: s.n, role: s.role };
}
