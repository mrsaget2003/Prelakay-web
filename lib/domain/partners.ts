// Candidatures de partenaires (CLAUDE.md 10 nov. 2026, spec §7) : paiement (opérateurs, banques,
// transferts diaspora, points de recharge) et livraison (livreurs indépendants, sociétés).

import { isAdult } from "./kyc";

export type PartnerKind = "payment" | "delivery";
export type PartnerStatus = "recu" | "verif" | "ok" | "rej" | "docs";
export type PartnerInput = {
  kind: PartnerKind;
  who: "person" | "company";
  name: string;
  phone: string;
  email: string;
  msg: string;
  /** Pièces jointes (livreur : pièce d'identité recto / verso). */
  docs: boolean;
  // livraison
  dob?: string;
  zone?: string;
  vehicle?: string;
  avail?: string;
  // paiement
  org?: string;
  orgType?: string;
  volume?: string;
};
export type PartnerApp = PartnerInput & { id: string; st: PartnerStatus; why?: string; date: string };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Erreurs par champ (vide = candidature complète). */
export function validatePartner(p: PartnerInput, today: Date): Record<string, string> {
  const e: Record<string, string> = {};
  if (!p.name.trim()) e.name = "Indiquez votre nom.";
  if (p.phone.replace(/\D/g, "").length !== 8) e.phone = "Numéro à 8 chiffres.";
  if (p.email.trim() && !EMAIL.test(p.email.trim())) e.email = "Adresse e-mail invalide.";
  if (p.kind === "delivery") {
    if (p.who === "person") {
      if (!p.dob) e.dob = "Indiquez votre date de naissance.";
      else if (!isAdult(p.dob, today)) e.dob = "Il faut avoir au moins 18 ans.";
    }
    if (!p.zone?.trim()) e.zone = "Indiquez votre quartier.";
    if (!p.vehicle?.trim()) e.vehicle = "Indiquez votre véhicule.";
    if (!p.docs) e.docs = "Ajoutez votre pièce d'identité (recto et verso).";
  } else {
    if (!p.org?.trim()) e.org = "Indiquez le nom de l'organisation.";
    if (!p.orgType?.trim()) e.orgType = "Choisissez le type d'organisation.";
    if (!p.email.trim() || !EMAIL.test(p.email.trim())) e.email = "Adresse e-mail professionnelle obligatoire.";
  }
  return e;
}
