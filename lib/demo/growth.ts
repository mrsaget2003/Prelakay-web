// Croissance (ex-V1.x / V2, actifs dans le prototype — CLAUDE.md 10 nov. 2026) :
// parrainage, ambassadeurs étudiants, abonnement Prélakay+.
// ⚠️ Protection anti-abus du parrainage : NON implémentée (point ouvert CLAUDE.md).

import { audit, type Me } from "./admin";
import { demo, type DemoState } from "./store";

/** CHANGELOG / PRD : 500 Coins par parrainage. */
export const REFERRAL_COINS = 500;
/** CHANGELOG / PRD : 1 500 HTG par mois. */
export const PLUS_PRICE = 1500;
/** Avantages affichés (PRD : badge or, réductions et events exclusifs ; détails à confirmer). */
export const PLUS_PERKS: [string, string, string][] = [
  ["fa-solid fa-crown", "Badge or", "Votre profil et vos avis portent le badge Prélakay+."],
  ["fa-solid fa-percent", "Réductions réservées", "Des coupons réservés aux abonnés chaque mois (montants à confirmer)."],
  ["fa-regular fa-calendar", "Events exclusifs", "Accès en avant-première aux events Prélakay."],
  ["fa-solid fa-coins", "Coins bonus", "Des Coins en plus sur vos commandes (taux à confirmer)."],
];

export function refLink(s: DemoState): string {
  return `prelakay.com/r/${s.user}`;
}

export function subscribePlus(): string | null {
  const s0 = demo.get();
  if (s0.growth.plus) return "Vous êtes déjà abonné.";
  if (s0.wallet < PLUS_PRICE) return "Solde insuffisant. Rechargez votre wallet.";
  demo.update((s) => {
    s.wallet -= PLUS_PRICE;
    s.growth.plus = { since: "6 nov. 2026", next: "6 déc. 2026" };
    s.txs.unshift(["fa-solid fa-crown", "Abonnement Prélakay+ · 1 mois", "6 nov.", -PLUS_PRICE, ""]);
    s.notif.unshift({ i: "fa-solid fa-crown", t: "Bienvenue dans Prélakay+", p: "Votre badge or est actif.", to: "/plus", un: true });
  });
  return null;
}

export function cancelPlus() {
  demo.update((s) => {
    s.growth.plus = null;
  });
}

/** Démo : le filleul fait sa première commande, le parrain reçoit ses Coins (une fois). */
export function completeReferral(u: string): string | null {
  const r = demo.get().growth.referrals.find((x) => x.u === u);
  if (!r) return "Filleul introuvable.";
  if (r.st === "done") return "Parrainage déjà terminé.";
  demo.update((s) => {
    s.growth.referrals.find((x) => x.u === u)!.st = "done";
    s.coins += REFERRAL_COINS;
    s.notif.unshift({ i: "fa-solid fa-user-plus", t: `+${REFERRAL_COINS} Coins`, p: `${u} a passé sa première commande.`, to: "/invite", un: true });
  });
  return null;
}

export function applyAmbassador(school: string): string | null {
  if (!school.trim()) return "Indiquez votre établissement.";
  demo.update((s) => {
    s.growth.amb = { st: "recu", school: school.trim() };
  });
  return null;
}

export function ambDecide(me: Me, ok: boolean): string | null {
  if (!demo.get().growth.amb) return "Aucune candidature.";
  demo.update((s) => {
    s.growth.amb!.st = ok ? "ok" : "rej";
    audit(s, me, ok ? "Ambassadeur validé" : "Ambassadeur refusé", `@${s.user} · ${s.growth.amb!.school}`);
    s.notif.unshift({ i: "fa-solid fa-user-plus", t: ok ? "Vous êtes ambassadeur Prélakay" : "Candidature ambassadeur refusée", p: ok ? "Partagez votre lien : chaque inscription vous rapporte des Coins." : "Vous pourrez repostuler plus tard.", to: "/ambassadeurs", un: true });
  });
  return null;
}
