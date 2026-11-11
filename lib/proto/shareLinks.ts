// Liens de partage (03-design §9.5 : WhatsApp en priorité). Ouvrent l'application ou le site.

export function waLink(url: string, text?: string): string {
  return "https://wa.me/?text=" + encodeURIComponent(text ? `${text} ${url}` : url);
}

export function fbLink(url: string): string {
  return "https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(url);
}
