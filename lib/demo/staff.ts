// Comptes employés d'un store (ex-V2, actifs dans le prototype) : préparation ou caisse.

import { normalizeHtPhone } from "@/lib/domain/phone";
import { demo } from "./store";

export type StaffRole = "prep" | "cash";
export const STAFF_ROLES: Record<StaffRole, [string, string]> = {
  prep: ["Préparation", "Voit les commandes et valide les retraits"],
  cash: ["Caisse", "Valide seulement les retraits (code ou QR)"],
};

export function inviteStaff(x: { n: string; tel: string; role: StaffRole }): string | null {
  if (!x.n.trim()) return "Indiquez le nom de l'employé.";
  const tel = normalizeHtPhone(x.tel);
  if (!tel) return "Numéro à 8 chiffres.";
  if (demo.get().seller.staff.some((m) => m.tel === tel)) return "Ce numéro est déjà invité.";
  demo.update((s) => {
    s.seller.staff.push({ n: x.n.trim(), tel, role: x.role, st: "invited", via: "sms" });
  });
  return null;
}

/** Adresse de l'espace vendeur (vendeur.prelakay.com, décision du 11 nov. 2026). */
const SELLER_URL = (process.env.NEXT_PUBLIC_URL_VENDEUR || "https://vendeur.prelakay.com").replace(/\/$/, "");

export function staffInviteUrl(token: string): string {
  return `${SELLER_URL}/rejoindre/${token}`;
}

/** Invitation par lien (12 nov. 2026) : le lien se copie ou se partage (WhatsApp, Facebook,
 *  e-mail, SMS) ; l'employé l'ouvre, crée son compte et rejoint le store avec ce rôle.
 *  En démo, le lien est enregistré « en attente » dans l'équipe. */
export function createStaffLink(role: StaffRole, n = ""): { token: string; url: string } {
  const s0 = demo.get();
  const token = `${s0.seller.store}-${role}-${(s0.seller.staff.length + 1).toString(36)}${Date.now().toString(36).slice(-4)}`;
  demo.update((s) => {
    s.seller.staff.push({ n: n.trim() || "Invitation par lien", tel: "", role, st: "invited", via: "lien", token });
  });
  return { token, url: staffInviteUrl(token) };
}

/** Retire un employé ou annule une invitation : par téléphone, ou par jeton pour un lien. */
export function removeStaff(key: string) {
  demo.update((s) => {
    s.seller.staff = s.seller.staff.filter((m) => (m.token ?? m.tel) !== key && m.tel !== key);
  });
}
