// KYC vendeur (PRD §3, 02-app-flow §2.2) : nom, prénom, date de naissance (≥ 18 ans),
// NIF, NINU, pièce d'identité recto / verso. Règles pures, partagées démo / production.

import { BUSINESS } from "@/lib/config/business";

/** Âge exact (au jour près) à une date donnée ; « dob » au format AAAA-MM-JJ. */
export function ageOn(dob: string, today: Date): number {
  const [y, m, d] = dob.split("-").map(Number);
  let age = today.getFullYear() - y;
  const beforeBirthday = today.getMonth() + 1 < m || (today.getMonth() + 1 === m && today.getDate() < d);
  if (beforeBirthday) age -= 1;
  return age;
}

export function isAdult(dob: string, today: Date): boolean {
  return ageOn(dob, today) >= BUSINESS.minSellerAge;
}

export type KycInput = { fn: string; ln: string; dob: string; nif: string; ninu: string; files: number };

/** Message actionnable de la première erreur, ou null si le dossier est complet. */
export function validateKyc(k: KycInput, today: Date): string | null {
  if ([k.fn, k.ln, k.dob, k.nif, k.ninu].some((v) => !v.trim())) return "Complétez tous les champs.";
  if (k.files < 2) return "Ajoutez le recto et le verso de votre pièce.";
  if (!isAdult(k.dob, today)) return "Vous devez avoir au moins 18 ans pour vendre sur Prélakay.";
  return null;
}
