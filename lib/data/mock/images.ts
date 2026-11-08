// Photos de démonstration hébergées sur Unsplash (licence Unsplash : usage libre,
// sans attribution obligatoire). Vérifiées le 8 nov. 2026 (réponse 200 + contrôle
// visuel). Écartées : photos hors sujet ou montrant une marque (parfum, rouge à
// lèvres, clairin…). Sans photo, la tuile Font Awesome du prototype reste affichée.
// À remplacer par les vraies photos des stores (Supabase Storage, Phase E).

const U = (id: string, w: number) => `https://images.unsplash.com/photo-${id}?w=${w}&h=${w}&fit=crop&auto=format&q=70`;

const PRODUCT_PHOTOS: Record<string, string> = {
  "mode-0": "1515372039744-b8f02a3ae446",
  "mode-1": "1596755094514-f87e34085b2c",
  "mode-2": "1603487742131-4160ec999306",
  "mode-3": "1590874103328-eac38a683ce7",
  "mode-4": "1542272604-787c3835535d",
  "mode-5": "1583743814966-8936f5b7be1a",
  "mode-6": "1521369909029-2afed882baee",
  "mode-7": "1519238263530-99bdd11df2ea",
  "tech-0": "1590658268037-6bf12165a8df",
  "tech-1": "1583863788434-e58a36330cf0",
  "tech-2": "1601593346740-925612772716",
  "tech-3": "1609091839311-d5365f9ff1c5",
  "tech-4": "1592899677977-9c10ca588bbd",
  "tech-6": "1589003077984-894e133dabab",
  "maison-1": "1618941716939-553df3c6c278",
  "maison-2": "1509391366360-2e959784a276",
  "maison-4": "1563453392212-326f5e854473",
  "maison-5": "1513694203232-719a280e022f",
  "beaute-0": "1608571423902-eed4a5ad8108",
  "beaute-1": "1556228578-8c89e6adf883",
  "beaute-2": "1522337360788-8b13dee7a37e",
  "beaute-4": "1631729371254-42c2892f0e6e",
  "beaute-6": "1590159763121-7c9fd312190d",
  "beaute-7": "1600857544200-b2f666a9a2ec",
  "alim-0": "1559056199-641a0ac8b55e",
  "alim-1": "1600189020840-e9918c25269d",
  "alim-5": "1509440159596-0249088772ff",
  "alim-6": "1586201375761-83865001e31c",
  "alim-7": "1544145945-f90425340c7e",
  "enfants-0": "1553062407-98eeb64c6a62",
  "enfants-1": "1513364776144-60967b0f800f",
  "enfants-2": "1579952363873-27f3bade9f55",
  "enfants-4": "1531346878377-a5be20888e57",
  "enfants-6": "1564939558297-fc396f18e5c7",
  "enfants-7": "1602143407151-7111542de6e8",
  "sport-0": "1614632537190-23e4146777db",
  "sport-3": "1584735935682-2f2b69dff9d2",
  "sport-5": "1601925260368-ae2f83cf8b7f",
  "auto-4": "1609630875171-b1321377ee65",
};

const STORE_PHOTOS: Record<string, string> = {
  "boutik-lakay": "1441986300917-64674bd600d8",
  "tech-sud": "1531297484001-80022131f5a1",
  "kay-pratik": "1556911220-bff31c812dba",
  "bel-soley": "1560066984-138dadb4c035",
  "mache-bon-pri": "1488459716781-31db52582fe9",
  "lekol-ak-jwet": "1503676260728-1c00da094a0b",
  "moto-pyes": "1558981285-6f0c94958bb6",
  "atelier-lagon": "1452860606245-08befc0ff44b",
};

const BANNER_PHOTOS: Record<string, string> = {
  b1: "1472851294608-062f824d29cc",
  b2: "1556742049-0cfed4f6a45d",
  b3: "1483985988355-763728e1935b",
};

export function productImage(id: string, w = 400): string | undefined {
  const k = PRODUCT_PHOTOS[id];
  return k ? U(k, w) : undefined;
}
export function storeImage(id: string, w = 200): string | undefined {
  const k = STORE_PHOTOS[id];
  return k ? U(k, w) : undefined;
}
export function bannerImage(id: string, w = 600): string | undefined {
  const k = BANNER_PHOTOS[id];
  return k ? U(k, w) : undefined;
}
