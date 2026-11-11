// Candidature ambassadeur étudiant (11 nov. 2026) : profil étudiant, règles pures,
// partagées entre la démonstration et la production.

import { normalizeHtPhone } from "./phone";

export type AmbassadorInput = {
  university: string;
  faculty: string;
  year: string;
  city: string;
  phone: string;
  network: string;
  handle: string;
  /** Tranche d'abonnés : clé de `FOLLOWERS`. */
  followers: string;
  /** Heures par semaine : clé de `AVAILABILITY`. */
  hours: string;
  why: string;
};

export const YEARS: string[] = ["1re année", "2e année", "3e année", "4e année", "5e année et plus", "Diplômé(e) récent(e)"];
export const NETWORKS: string[] = ["WhatsApp", "Instagram", "TikTok", "Facebook", "X", "Aucun"];
export const FOLLOWERS: [string, string][] = [
  ["0-100", "Moins de 100"],
  ["100-500", "100 à 500"],
  ["500-2000", "500 à 2 000"],
  ["2000+", "Plus de 2 000"],
];
export const AVAILABILITY: [string, string][] = [
  ["1-3", "1 à 3 h"],
  ["4-8", "4 à 8 h"],
  ["9+", "9 h et plus"],
];

export const WHY_MIN = 30;

/** Erreurs par champ, vide si la candidature est complète. */
export function validateAmbassador(a: AmbassadorInput): Record<string, string> {
  const e: Record<string, string> = {};
  if (!a.university.trim()) e.university = "Indiquez votre université.";
  if (!a.faculty.trim()) e.faculty = "Indiquez votre faculté ou votre filière.";
  if (!YEARS.includes(a.year)) e.year = "Choisissez votre année d'étude.";
  if (!a.city.trim()) e.city = "Indiquez votre ville.";
  if (!normalizeHtPhone(a.phone)) e.phone = "Numéro à 8 chiffres.";
  if (!NETWORKS.includes(a.network)) e.network = "Choisissez un réseau.";
  // « Aucun » est une réponse valable : on ne demande alors pas de pseudo
  if (a.network !== "Aucun" && !a.handle.trim()) e.handle = "Indiquez votre pseudo sur ce réseau.";
  if (a.network !== "Aucun" && !FOLLOWERS.some(([k]) => k === a.followers)) e.followers = "Choisissez une tranche.";
  if (!AVAILABILITY.some(([k]) => k === a.hours)) e.hours = "Indiquez vos disponibilités.";
  if (a.why.trim().length < WHY_MIN) e.why = `Encore quelques mots : ${WHY_MIN} caractères au minimum.`;
  return e;
}

/** Résumé affiché au candidat et dans la file Admin → Croissance. */
export function ambassadorSummary(a: AmbassadorInput): string {
  return [a.faculty.trim(), a.university.trim(), a.year, a.city.trim()].filter(Boolean).join(" · ");
}
