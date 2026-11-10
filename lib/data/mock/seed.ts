// Données de démonstration du pilote Les Cayes — portage à l'identique du prototype
// (prototype/prelakay-prototype.html, « DONNÉES FICTIVES », lignes ~1483-1553).
// Vérifié par tests/unit/seed.test.ts contre une référence générée depuis le prototype.
// Jamais utilisé en production (lib/config/env.ts).
// Les icônes gardent les classes Font Awesome du prototype ; <DataIcon> les convertit
// via le registre (lib/icons/registry.ts).

export type Cat = { id: string; n: string; i: string; sub: string[] };
export type Store = {
  id: string; n: string; type: "physique" | "virtuel"; trust: boolean; addr: string; km: number;
  x: number; y: number; cat: string; i: string; since: string; hours: string; rate: number; sold: number;
};
export type Product = {
  id: string; n: string; cat: string; sub: string; store: string; price: number; was: number; disc: number;
  sold: number; reviews: number; rating: number; icon: string; tint: string; isNew: boolean; stockLow: boolean; ready: boolean;
};
export type OptAxis = { k: string; t: "color" | "text"; v: string[] };
export type Choice = Record<string, string>;

export const CATS: Cat[] = [
  { id: "mode", n: "Mode", i: "fa-solid fa-shirt", sub: ["Femme", "Homme", "Chaussures", "Sacs et accessoires"] },
  { id: "tech", n: "Téléphones et tech", i: "fa-solid fa-mobile-screen-button", sub: ["Téléphones", "Accessoires téléphone", "Audio", "Ordinateurs"] },
  { id: "maison", n: "Maison", i: "fa-solid fa-house", sub: ["Cuisine", "Déco", "Électroménager", "Ménage"] },
  { id: "beaute", n: "Beauté et soins", i: "fa-solid fa-spray-can-sparkles", sub: ["Cheveux", "Soins de la peau", "Maquillage", "Parfums"] },
  { id: "alim", n: "Épicerie", i: "fa-solid fa-bread-slice", sub: ["Produits locaux", "Boissons", "Snacks", "Café"] },
  { id: "enfants", n: "Enfants et école", i: "fa-solid fa-book", sub: ["Jouets", "Fournitures scolaires", "Bébé", "Uniformes"] },
  { id: "sport", n: "Sport et loisirs", i: "fa-regular fa-futbol", sub: ["Football", "Fitness", "Vélo", "Plein air"] },
  { id: "auto", n: "Auto et moto", i: "fa-solid fa-car", sub: ["Pièces moto", "Accessoires auto", "Entretien", "Casques"] },
];

export const STORES: Store[] = [
  { id: "boutik-lakay", n: "Boutik Lakay", type: "physique", trust: true, addr: "Rue Geffrard, Les Cayes", km: 0.6, x: 42, y: 46, cat: "mode", i: "fa-solid fa-shirt", since: "2025", hours: "8 h – 18 h", rate: 4.8, sold: 1240 },
  { id: "tech-sud", n: "Tech Sud", type: "physique", trust: true, addr: "Avenue des Quatre Chemins, Les Cayes", km: 1.2, x: 58, y: 38, cat: "tech", i: "fa-solid fa-mobile-screen-button", since: "2025", hours: "9 h – 19 h", rate: 4.7, sold: 860 },
  { id: "kay-pratik", n: "Kay Pratik", type: "physique", trust: false, addr: "Rue Capitale, Les Cayes", km: 0.9, x: 35, y: 60, cat: "maison", i: "fa-solid fa-house", since: "2026", hours: "8 h – 17 h", rate: 4.5, sold: 210 },
  { id: "bel-soley", n: "Bel Soley Beauté", type: "physique", trust: true, addr: "Place d'Armes, Les Cayes", km: 0.4, x: 48, y: 55, cat: "beaute", i: "fa-solid fa-spray-can-sparkles", since: "2025", hours: "9 h – 18 h", rate: 4.9, sold: 1510 },
  { id: "mache-bon-pri", n: "Mache Bon Pri", type: "physique", trust: false, addr: "Marché Rue Nicolas, Les Cayes", km: 1.6, x: 66, y: 62, cat: "alim", i: "fa-solid fa-bread-slice", since: "2026", hours: "6 h – 16 h", rate: 4.4, sold: 430 },
  { id: "lekol-ak-jwet", n: "Lekòl ak Jwèt", type: "physique", trust: false, addr: "Route de Torbeck, Les Cayes", km: 2.3, x: 25, y: 30, cat: "enfants", i: "fa-solid fa-book", since: "2026", hours: "8 h – 17 h", rate: 4.6, sold: 95 },
  { id: "moto-pyes", n: "Moto Pyès Sud", type: "physique", trust: true, addr: "Carrefour Laborde, Les Cayes", km: 3.1, x: 76, y: 24, cat: "auto", i: "fa-solid fa-car", since: "2025", hours: "7 h – 17 h", rate: 4.6, sold: 520 },
  { id: "atelier-lagon", n: "Atelier Lagon", type: "virtuel", trust: false, addr: "Store en ligne · retrait au point Prélakay, Rue Geffrard", km: 0.7, x: 44, y: 42, cat: "mode", i: "fa-solid fa-palette", since: "2026", hours: "Sur rendez-vous", rate: 0, sold: 6 },
];

const NAMES: Record<string, string[]> = {
  mode: ["Robe en lin brodée", "Chemise guayabera homme", "Sandales en cuir tressé", "Sac cabas en paille", "Jean droit taille haute", "T-shirt « Lakay » coton", "Casquette brodée", "Ensemble enfant coton"],
  tech: ["Écouteurs sans fil", "Chargeur rapide 20 W", "Coque antichoc", "Batterie externe 10 000 mAh", "Smartphone 128 Go", "Câble USB-C tressé", "Enceinte Bluetooth", "Clé USB 64 Go"],
  maison: ["Marmite en fonte 6 L", "Ventilateur rechargeable", "Lampe solaire LED", "Set de 6 verres", "Seau et balai", "Rideau occultant", "Boîtes de conservation x5", "Fer à repasser"],
  beaute: ["Huile de ricin noire", "Crème hydratante karité", "Kit de tresses", "Parfum floral 50 ml", "Shampoing sans sulfate", "Rouge à lèvres mat", "Peigne démêlant", "Savon artisanal x3"],
  alim: ["Café des Cayes 500 g", "Mamba (beurre d'arachide)", "Confiture de chadèque", "Clairin 750 ml", "Pikliz maison", "Cassave x6", "Riz local 5 kg", "Sirop d'orgeat"],
  enfants: ["Sac à dos scolaire", "Kit de crayons x24", "Ballon junior", "Puzzle 100 pièces", "Cahiers x10", "Poupée en tissu", "Calculatrice", "Gourde enfant"],
  sport: ["Ballon de football", "Corde à sauter", "Maillot domicile", "Haltères 2 x 2 kg", "Gants de gardien", "Tapis de yoga"],
  auto: ["Casque moto homologué", "Batterie moto 12 V", "Huile 4 temps 1 L", "Rétroviseurs x2", "Housse de selle", "Antivol en U"],
};

export const CAT_STORE: Record<string, string[]> = {
  mode: ["boutik-lakay", "atelier-lagon"], tech: ["tech-sud"], maison: ["kay-pratik"], beaute: ["bel-soley"],
  alim: ["mache-bon-pri"], enfants: ["lekol-ak-jwet"], sport: ["boutik-lakay", "lekol-ak-jwet"], auto: ["moto-pyes"],
};

export const TINTS = ["g0", "g1", "g2", "g3", "g5"];

export const PICONS: Record<string, string[]> = {
  mode: ["fa-solid fa-shirt", "fa-solid fa-bag-shopping", "fa-solid fa-shoe-prints", "fa-solid fa-bag-shopping", "fa-solid fa-shirt", "fa-solid fa-shirt", "fa-solid fa-crown", "fa-solid fa-shirt"],
  tech: ["fa-solid fa-headphones", "fa-solid fa-bolt", "fa-solid fa-mobile-screen", "fa-solid fa-battery-full", "fa-solid fa-mobile-screen-button", "fa-solid fa-link", "fa-solid fa-volume-high", "fa-brands fa-usb"],
  maison: ["fa-solid fa-bowl-food", "fa-solid fa-fan", "fa-regular fa-lightbulb", "fa-solid fa-glass-water", "fa-solid fa-paintbrush", "fa-solid fa-table-columns", "fa-solid fa-box-open", "fa-solid fa-shirt"],
  beaute: ["fa-solid fa-droplet", "fa-solid fa-spa", "fa-regular fa-face-smile-beam", "fa-solid fa-spray-can-sparkles", "fa-solid fa-water", "fa-solid fa-palette", "fa-solid fa-paintbrush", "fa-solid fa-leaf"],
  alim: ["fa-solid fa-mug-saucer", "fa-solid fa-bowl-rice", "fa-solid fa-utensils", "fa-solid fa-wine-bottle", "fa-solid fa-bowl-food", "fa-solid fa-bread-slice", "fa-solid fa-bowl-rice", "fa-solid fa-mug-saucer"],
  enfants: ["fa-solid fa-bag-shopping", "fa-solid fa-pencil", "fa-regular fa-futbol", "fa-solid fa-puzzle-piece", "fa-solid fa-book", "fa-regular fa-face-smile", "fa-solid fa-calculator", "fa-solid fa-water"],
  sport: ["fa-regular fa-futbol", "fa-solid fa-person-running", "fa-solid fa-shirt", "fa-solid fa-dumbbell", "fa-solid fa-shield", "fa-solid fa-child-reaching"],
  auto: ["fa-solid fa-shield", "fa-solid fa-battery-full", "fa-solid fa-droplet", "fa-solid fa-car", "fa-solid fa-car", "fa-solid fa-lock"],
};

export function catBy(id: string): Cat | null {
  return CATS.find((c) => c.id === id) ?? null;
}
export function storeBy(id: string): Store | null {
  return STORES.find((s) => s.id === id) ?? null;
}

/** Générateur pseudo-aléatoire du prototype (seed = 11) : mêmes produits à chaque chargement. */
function buildProducts(): Product[] {
  let seed = 11;
  const rnd = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  const out: Product[] = [];
  // L'ordre des appels à rnd() reproduit exactement celui du prototype (y compris les courts-circuits).
  for (const c of CATS) {
    (NAMES[c.id] || []).forEach((n, i) => {
      const sids = CAT_STORE[c.id];
      const sid = sids[i % sids.length];
      const st = storeBy(sid)!;
      const price = Math.round((250 + Math.pow(rnd(), 1.8) * (c.id === "tech" ? 24000 : 6500)) / 25) * 25;
      const disc = rnd() < 0.45 ? Math.round(8 + rnd() * 30) : 0;
      const reviews = rnd() < 0.7 ? Math.round(3 + rnd() * 140) : 0;
      const was = disc ? Math.round(price / (1 - disc / 100) / 25) * 25 : 0;
      const sold = Math.round(Math.pow(rnd(), 1.6) * 900);
      const rating = reviews ? Math.round((4.1 + rnd() * 0.9) * 10) / 10 : 0;
      const icon = (PICONS[c.id] || ["fa-solid fa-box"])[i % 8] || "fa-solid fa-box";
      const tint = TINTS[(i + c.id.length) % 5];
      const isNew = i >= NAMES[c.id].length - 2 || (st.since === "2026" && i % 3 === 0);
      const stockLow = rnd() < 0.22;
      const ready = st.type === "physique" && rnd() < 0.6;
      out.push({ id: `${c.id}-${i}`, n, cat: c.id, sub: c.sub[i % c.sub.length], store: sid, price, was, disc, sold, reviews, rating, icon, tint, isNew, stockLow, ready });
    });
  }
  return out;
}

export const P: Product[] = buildProducts();

/** Produits ajoutés par les vendeurs en démo (Espace vendeur) et statut de chaque produit
 *  (actif par défaut). Synchronisés depuis l'état de démo (lib/demo/store.ts). */
let extraProducts: Product[] = [];
let statusOf: Record<string, string> = {};
export function setCatalogOverlay(extras: Product[], statuses: Record<string, string>) {
  extraProducts = extras;
  statusOf = statuses;
}
export function productStatus(id: string): string {
  return statusOf[id] ?? (P.some((p) => p.id === id) ? "active" : "draft");
}
/** Catalogue visible par les acheteurs : produits actifs seulement. */
export function allProducts(): Product[] {
  const base = Object.keys(statusOf).length ? P.filter((p) => productStatus(p.id) === "active") : P;
  return [...base, ...extraProducts.filter((p) => productStatus(p.id) === "active")];
}
/** Tous les produits, quel que soit leur statut (espace vendeur, fiches). */
export function everyProduct(): Product[] {
  return extraProducts.length ? [...P, ...extraProducts] : P;
}
export function prodBy(id: string): Product | null {
  return everyProduct().find((p) => p.id === id) ?? null;
}

/** Pastilles de couleur des caractéristiques. */
export const COLORS: Record<string, string> = {
  Noir: "#0b0c10", Blanc: "#fffaf7", Lagon: "#0e6b74", "Écru": "#f3ede4", Gris: "#898f90", "Lagon clair": "#80e6f0", Sable: "#d9c7a7", Bordeaux: "#6b1f2a",
};

let customOpts: Record<string, OptAxis[]> = {};
export function setOptsOverlay(map: Record<string, OptAxis[]>) {
  customOpts = map;
}

/** Caractéristiques (SKU) : 0 à 3 axes par produit (03-design §9.4 bis). */
export function optsOf(p: Product): OptAxis[] {
  const custom = customOpts[p.id];
  if (custom) return custom;
  const n = p.n;
  const C = (l: string[]): OptAxis => ({ k: "Couleur", t: "color", v: l });
  const T = (k: string, l: string[]): OptAxis => ({ k, t: "text", v: l });
  if (/Rideau/.test(n)) return [C(["Écru", "Gris", "Lagon"]), T("Longueur", ["160 cm", "220 cm", "260 cm"]), T("Largeur", ["140 cm", "200 cm"])];
  if (/Tapis/.test(n)) return [C(["Lagon", "Gris", "Noir"]), T("Longueur", ["173 cm", "183 cm"]), T("Largeur", ["61 cm", "80 cm"])];
  if (/Sandales|Chaussures/.test(n)) return [C(["Sable", "Noir"]), T("Pointure", ["37", "38", "39", "40", "41", "42"])];
  if (/Sac cabas|Casquette/.test(n)) return [C(["Sable", "Noir", "Lagon"])];
  if (/Jean/.test(n)) return [C(["Noir", "Lagon"]), T("Taille", ["36", "38", "40", "42", "44"]), T("Longueur de jambe", ["Regular", "Long"])];
  if (p.cat === "mode" || (p.cat === "sport" && /Maillot|Gants/.test(n))) return [C(["Noir", "Lagon", "Écru"]), T("Taille", ["S", "M", "L", "XL"])];
  if (/Smartphone/.test(n)) return [C(["Noir", "Blanc", "Lagon clair"]), T("Stockage", ["128 Go", "256 Go"])];
  if (/Haltères/.test(n)) return [T("Poids", ["2 x 1 kg", "2 x 2 kg", "2 x 4 kg"])];
  if (p.cat === "tech" && !/Clé USB/.test(n)) return [C(["Noir", "Blanc"])];
  if (/Clé USB/.test(n)) return [T("Capacité", ["32 Go", "64 Go", "128 Go"])];
  if (/Marmite/.test(n)) return [T("Contenance", ["4 L", "6 L", "8 L"])];
  if (p.cat === "beaute" && !/Kit|Peigne/.test(n)) return [T("Format", ["Format standard", "Grand format"])];
  if (/Riz|Café/.test(n)) return [T("Poids", [/Riz/.test(n) ? "5 kg" : "500 g", /Riz/.test(n) ? "10 kg" : "1 kg"])];
  return [];
}

export function hasOpts(p: Product): boolean {
  return optsOf(p).length > 0;
}

/** Stock modifié par le vendeur en démo : clé « id#v1|v2 ». */
let stockOverrides: Record<string, number> = {};
export function setStockOverlay(map: Record<string, number>) {
  stockOverrides = map;
}

/** Stock d'une combinaison (règle du prototype ; `partial` : axes incomplets). */
export function stockFor(p: Product, o: Choice, partial = false): number {
  const A = optsOf(p);
  // stock modifié par le vendeur (y compris « modèle unique » : clé « id# », oubliée par le prototype)
  if (A.every((a) => o[a.k])) {
    const ov = stockOverrides[p.id + "#" + A.map((a) => o[a.k]).join("|")];
    if (ov != null) return ov;
  }
  if (!A.length) return p.stockLow ? 3 : 12;
  const key = p.id + A.map((a) => o[a.k] || "*").join("|");
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  if (partial && A.some((a) => !o[a.k])) return 1;
  return h % 7 === 0 ? 0 : p.stockLow ? 1 + (h % 3) : 3 + (h % 14);
}

/** Première combinaison en stock (sélection initiale, fonction selOf du prototype). */
export function defaultChoice(p: Product): Choice {
  const o: Choice = {};
  for (const a of optsOf(p)) {
    for (const v of a.v) {
      if (stockFor(p, { ...o, [a.k]: v }, true) > 0) {
        o[a.k] = v;
        break;
      }
    }
    if (!o[a.k]) o[a.k] = a.v[0];
  }
  return o;
}

/** Vignettes de la galerie produit du prototype : photo, autres vues, liste, guide des tailles. */
export function galleryIcons(p: Product): string[] {
  return [p.icon, "fa-regular fa-images", "fa-solid fa-list", "fa-solid fa-ruler"];
}

/** Libellé du choix : « Écru · 160 cm · 140 cm » ; « Standard » sans caractéristique. */
export function selLabel(p: Product, o: Choice): string {
  const A = optsOf(p);
  return A.length ? A.map((a) => o[a.k]).join(" · ") : "Standard";
}

/** Abonnés de démonstration d'un store (D.2) — remplacé par store_follows en production. */
export function followersOf(s: Store): number {
  return Math.round(s.sold / 4) + 12;
}
