// Quota de fiches produit pour les visiteurs sans compte (12 nov. 2026, Marc-Karlin).
// Le visiteur garde l'accès aux N premières fiches qu'il a ouvertes ; à la suivante, une
// invitation bloquante lui demande de créer un compte. Règle pure.

/** Fiches vues par le visiteur, sans doublon, dans l'ordre d'ouverture. */
export function noteVisitorView(views: string[], id: string): string[] {
  return views.includes(id) ? views : [...views, id];
}

/** Vrai si cette fiche dépasse le quota : elle n'est pas parmi les `quota` premières vues. */
export function visitorBlocked(views: string[], id: string, quota: number): boolean {
  const i = views.indexOf(id);
  return i === -1 ? views.length >= quota : i >= quota;
}

/** Fiches encore consultables avant l'invitation. */
export function visitorLeft(views: string[], quota: number): number {
  return Math.max(0, quota - views.length);
}
