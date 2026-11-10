"use client";

// Étiquettes de statut partagées par l'espace vendeur et la console admin (oTag, PST, litiges).

export const OST: Record<string, [string, string]> = {
  received: ["tag-warn", "À préparer"], prep: ["tag-neu", "En préparation"], ready: ["tag-new", "Prête pour retrait"],
  done: ["tag-ok", "Retirée"], expired: ["tag-err", "Non retirée"], cancelled: ["tag-err", "Annulée"],
};
export function OTag({ s }: { s: string }) {
  const [c, l] = OST[s] ?? ["tag-neu", s];
  return <span className={`tag ${c}`}>{l}</span>;
}

export const PST: Record<string, [string, string]> = {
  active: ["tag-ok", "Actif"], mod: ["tag-warn", "En modération"], draft: ["tag-neu", "Brouillon"],
  out: ["tag-err", "Rupture"], archived: ["tag-neu", "Archivé"], rejected: ["tag-err", "Rejeté"],
};
export function PTag({ s }: { s: string }) {
  const [c, l] = PST[s] ?? ["tag-neu", s];
  return <span className={`tag ${c}`}>{l}</span>;
}

/** Étiquette de litige (Réponse attendue / Transmis à Prélakay / Résolu). */
export function DTag({ st, short = false }: { st: string; short?: boolean }) {
  const cls = st === "open" ? "tag-warn" : st === "escalated" ? "tag-err" : "tag-ok";
  const l = st === "open" ? "Réponse attendue" : st === "escalated" ? (short ? "Chez Prélakay" : "Transmis à Prélakay") : "Résolu";
  return <span className={`tag ${cls}`}>{l}</span>;
}
