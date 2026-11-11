// Candidatures de partenaires (démo) : envoi depuis les pages partenaires, file Admin → Partenaires.

import { validatePartner, type PartnerApp, type PartnerInput, type PartnerStatus } from "@/lib/domain/partners";
import type { Role } from "@/lib/domain/admin";
import { audit, type Me } from "./admin";
import { demo, type DemoState } from "./store";

/** Candidatures de démonstration déjà reçues. */
export const DEMO_PARTNER_APPS: PartnerApp[] = [
  { id: "PL-0041", kind: "delivery", who: "person", name: "Fritz Dorval", phone: "37225510", email: "", dob: "1996-02-18", zone: "Quatre Chemins", vehicle: "moto", avail: "Tous les jours, 8 h - 18 h", docs: true, msg: "Moto personnelle, je connais bien les quartiers.", st: "recu", date: "5 nov. 2026" },
  { id: "PL-0039", kind: "delivery", who: "company", name: "Sud Express Livraison", phone: "28114400", email: "contact@sudexpress.ht", zone: "Les Cayes et Torbeck", vehicle: "3 motos, 1 camionnette", avail: "Lundi - samedi", docs: true, msg: "", st: "verif", date: "3 nov. 2026" },
  { id: "PP-0012", kind: "payment", who: "company", name: "Mireille Charles", phone: "29401100", email: "partenaires@caisse-sud.ht", org: "Caisse populaire du Sud", orgType: "coop", volume: "≈ 800 clients actifs", docs: false, msg: "Points de recharge en espèces dans 4 agences.", st: "recu", date: "4 nov. 2026" },
  { id: "PP-0010", kind: "payment", who: "company", name: "David Lamour", phone: "28150000", email: "biz@transfert-diaspora.com", org: "Transfert Diaspora", orgType: "transfer", volume: "Envois depuis les États-Unis et le Canada", docs: false, msg: "", st: "verif", date: "1 nov. 2026" },
];

/** Libellés des types d'organisation (paiement) et des statuts. */
export const ORG_TYPES: [string, string][] = [["mobile", "Opérateur de mobile money"], ["bank", "Banque"], ["transfer", "Service de transfert (diaspora)"], ["coop", "Caisse ou point de recharge en espèces"], ["other", "Autre"]];
export const PARTNER_ST: Record<PartnerStatus, [string, string]> = {
  recu: ["tag-warn", "Reçue"], verif: ["tag-neu", "En vérification"], ok: ["tag-ok", "Acceptée"], rej: ["tag-err", "Refusée"], docs: ["tag-warn", "Pièces demandées"],
};

export function submitPartner(input: PartnerInput): { ok: true; id: string } | { ok: false; errors: Record<string, string> } {
  const errors = validatePartner(input, new Date());
  if (Object.keys(errors).length) return { ok: false, errors };
  let id = "";
  demo.update((s) => {
    const pre = input.kind === "delivery" ? "PL" : "PP";
    const n = 42 + s.partners.length + DEMO_PARTNER_APPS.length;
    id = `${pre}-${String(n).padStart(4, "0")}`;
    s.partners.unshift({ ...input, id, st: "recu", date: "6 nov. 2026" });
  });
  return { ok: true, id };
}

function all(s: DemoState): PartnerApp[] {
  return [...s.partners, ...DEMO_PARTNER_APPS].map((p) => {
    const d = s.admin.partners[p.id];
    return d ? { ...p, st: d.st, why: d.why } : p;
  });
}

/** Candidatures visibles par un rôle : Superadmin et Support toutes, Finance celles de paiement. */
export function partnersFor(role: Role, s: DemoState): PartnerApp[] {
  if (role === "super" || role === "support") return all(s);
  if (role === "finance") return all(s).filter((p) => p.kind === "payment");
  return [];
}

export function partnerById(role: Role, s: DemoState, id: string): PartnerApp | undefined {
  return partnersFor(role, s).find((p) => p.id === id);
}

const ACT: Record<"ok" | "rej" | "docs" | "verif", string> = {
  ok: "Candidature partenaire acceptée", rej: "Candidature partenaire rejetée", docs: "Pièces demandées à un partenaire", verif: "Candidature partenaire en vérification",
};

/** Décision de l'admin ; un rejet ou une demande de pièces demande un motif. */
export function partnerDecide(me: Me, id: string, st: "ok" | "rej" | "docs" | "verif", why = ""): string | null {
  const p = partnerById(me.role, demo.get(), id);
  if (!p) return "Candidature introuvable.";
  if ((st === "rej" || st === "docs") && !why.trim()) return "Indiquez un motif.";
  demo.update((s) => {
    s.admin.partners[id] = { st, why: why.trim() || undefined };
    audit(s, me, ACT[st], `${id} · ${p.org ?? p.name}${why.trim() ? ` · ${why.trim()}` : ""}`);
  });
  return null;
}
