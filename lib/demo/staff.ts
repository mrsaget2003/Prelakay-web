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
    s.seller.staff.push({ n: x.n.trim(), tel, role: x.role, st: "invited" });
  });
  return null;
}

export function removeStaff(tel: string) {
  demo.update((s) => {
    s.seller.staff = s.seller.staff.filter((m) => m.tel !== tel);
  });
}
