// Console admin — règles (03-design §9.11, plan B8) : membres de démonstration, rôles,
// permissions par section (PERM du prototype), connexion en deux étapes avec blocage.

import { BUSINESS } from "@/lib/config/business";

export type Role = "super" | "support" | "finance" | "marketing";
export const ROLES: Record<Role, string> = { super: "Superadmin", support: "Support", finance: "Finance", marketing: "Marketing" };
export const ROLE_KEYS = Object.keys(ROLES) as Role[];

export type Admin = { e: string; n: string; role: Role; last: string; pending?: boolean };
/** Membres de démonstration (ADMINS du prototype). */
export const ADMINS: Admin[] = [
  { e: "superadmin@prelakay.ht", n: "Marc-Karlin Saget", role: "super", last: "aujourd'hui" },
  { e: "support@prelakay.ht", n: "Nadège Pierre", role: "support", last: "hier" },
  { e: "finance@prelakay.ht", n: "Jowan Joseph", role: "finance", last: "il y a 3 jours" },
  { e: "marketing@prelakay.ht", n: "Ketia Baptiste", role: "marketing", last: "il y a 2 jours" },
];

export type Section =
  | "dash" | "stats" | "kyc" | "products" | "reports" | "disputes" | "stores" | "users" | "orders" | "banners" | "events"
  | "notify" | "categories" | "finance" | "team" | "settings" | "audit" | "search" | "menu"
  | "deliveries" | "partners" | "coupons";

const ALL: Role[] = ["super", "support", "finance", "marketing"];
/** Sections visibles par rôle (PERM du prototype). */
export const PERM: Record<Section, Role[]> = {
  dash: ALL, stats: ALL, search: ALL, menu: ALL,
  kyc: ["super", "support"], products: ["super", "support"], reports: ["super", "support"],
  disputes: ["super", "support", "finance"], stores: ["super", "support"], users: ["super", "support"],
  orders: ["super", "support", "finance"], banners: ["super", "marketing"], events: ["super", "marketing"],
  notify: ["super", "support", "marketing"], categories: ["super", "marketing"], finance: ["super", "finance"],
  team: ["super"], settings: ["super", "finance"], audit: ["super"],
  // 10 nov. 2026 : livraisons (Opérations) et candidatures de partenaires (Validation)
  deliveries: ["super", "support"], partners: ["super", "support", "finance"],
  coupons: ["super", "marketing"],
};

export function can(role: Role | null | undefined, s: Section): boolean {
  return !!role && PERM[s].includes(role);
}
/** Modification : les paramètres de la plateforme ne sont modifiables que par le Superadmin. */
export function canEdit(role: Role | null | undefined, s: Section): boolean {
  if (s === "settings") return role === "super";
  return can(role, s);
}

/** Section d'une route /admin/… (ASEC du prototype). */
export function sectionOf(pathname: string): Section {
  const k = pathname.split("/").filter(Boolean)[1] ?? "";
  return (k === "" ? "dash" : k in PERM ? k : "dash") as Section;
}

/* ---------- connexion ---------- */

export type LoginState = { fails: number; lockUntil: number };
export type LoginResult = { ok: true; email: string; state: LoginState } | { ok: false; locked: boolean; left: number; state: LoginState };
/** [À CONFIRMER] durée du blocage (BUSINESS.adminLockMinutes) : 20 s en démonstration, comme le prototype. */
export const DEMO_LOCK_MS = 20_000;

/** Étape 1 : e-mail d'un membre actif + mot de passe. Le 5e échec bloque la connexion. */
export function loginStep(st: LoginState, input: { email: string; password: string }, creds: { password: string }, now: number, members: Admin[] = ADMINS): LoginResult {
  const max = BUSINESS.adminMaxFailures;
  if (st.lockUntil > now) return { ok: false, locked: true, left: 0, state: st };
  const email = input.email.trim().toLowerCase();
  const a = members.find((x) => x.e === email && !x.pending);
  if (a && creds.password && input.password === creds.password) return { ok: true, email, state: { fails: 0, lockUntil: 0 } };
  const fails = st.fails + 1;
  if (fails >= max) return { ok: false, locked: true, left: 0, state: { fails: 0, lockUntil: now + (BUSINESS.adminLockMinutes ?? DEMO_LOCK_MS / 60_000) * 60_000 } };
  return { ok: false, locked: false, left: max - fails, state: { fails, lockUntil: 0 } };
}

/** NIF / NINU masqués (affichage complet réservé au Superadmin et journalisé). */
export function maskId(v: string, kind: "nif" | "ninu"): string {
  return kind === "nif" ? `${v.slice(0, 3)} ••• ••${v.slice(-2)}` : `${v.slice(0, 2)} ••• •••${v.slice(-2)}`;
}
