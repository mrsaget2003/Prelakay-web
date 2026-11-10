"use client";

// D.3 — « Suivre » un store (02-app-flow §5.1 : bouton Follow du profil store).
// Prototype : localStorage (try/catch), lu après le montage — le rendu serveur et la
// première hydratation voient toujours « non suivi » (pas de hydration mismatch).

import { useSyncExternalStore } from "react";

export const FOLLOW_KEY = "pk-follows";

/**
 * Contrat prévu pour la future table Supabase `store_follows` (user_id, store_id, created_at).
 * TODO (Phase C/G, accord requis — CLAUDE.md règle 5 : aucun changement de base sans validation) :
 * implémenter ce port côté serveur (Server Actions) et remplacer le stockage local ci-dessous.
 */
export interface StoreFollowsRepo {
  isFollowing(userId: string, storeId: string): Promise<boolean>;
  follow(userId: string, storeId: string): Promise<void>;
  unfollow(userId: string, storeId: string): Promise<void>;
  followerCount(storeId: string): Promise<number>;
}

let follows: Set<string> | null = null;
const listeners = new Set<() => void>();

function load(): Set<string> {
  if (follows) return follows;
  try {
    const raw = localStorage.getItem(FOLLOW_KEY);
    follows = new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    follows = new Set();
  }
  return follows;
}

function save() {
  try {
    localStorage.setItem(FOLLOW_KEY, JSON.stringify([...load()]));
  } catch {
    /* stockage indisponible (navigation privée, quota) : l'état reste en mémoire */
  }
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

/** Tests : oublie l'état en mémoire (simule un nouveau chargement de page). */
export function __resetFollows() {
  follows = null;
}

export function useFollowStore(slug: string) {
  const following = useSyncExternalStore(
    subscribe,
    () => load().has(slug),
    () => false,
  );
  const ready = useSyncExternalStore(subscribe, () => true, () => false);
  const toggle = () => {
    const set = load();
    if (set.has(slug)) set.delete(slug);
    else set.add(slug);
    follows = new Set(set);
    save();
    listeners.forEach((l) => l());
    return follows.has(slug);
  };
  return { following, ready, toggle };
}
