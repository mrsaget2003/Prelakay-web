// Crédits et licences — source unique, affichée seulement sur la page /credits.
// Aucun crédit n'est écrit en dur ailleurs dans l'application.

export type Credit = { name: string; by: string; license: string; url: string; note?: string };
export type CreditSection = { title: string; items: Credit[] };

export const CREDITS: CreditSection[] = [
  {
    title: "Marque",
    items: [{ name: "Logo et wordmark Prélakay", by: "Prélakay LLC", license: "Tous droits réservés", url: "https://prelakay.com" }],
  },
  {
    title: "Polices",
    items: [
      { name: "Fraunces", by: "Undercase Type", license: "SIL Open Font License 1.1", url: "https://fonts.google.com/specimen/Fraunces" },
      { name: "Onest", by: "Dmitri Voloshin", license: "SIL Open Font License 1.1", url: "https://fonts.google.com/specimen/Onest" },
      { name: "Surgena", by: "—", license: "Licence à confirmer", url: "https://prelakay.com", note: "[À CONFIRMER] licence de la police du wordmark" },
    ],
  },
  {
    title: "Icônes",
    items: [{ name: "Font Awesome Free 6", by: "Fonticons, Inc.", license: "CC BY 4.0 (icônes)", url: "https://fontawesome.com/license/free", note: "Remplacées par Iconly Pro en production [À CONFIRMER]" }],
  },
  {
    title: "Logiciels",
    items: [
      { name: "Next.js", by: "Vercel", license: "MIT", url: "https://github.com/vercel/next.js" },
      { name: "React", by: "Meta", license: "MIT", url: "https://github.com/facebook/react" },
      { name: "Serwist", by: "Serwist", license: "MIT", url: "https://github.com/serwist/serwist" },
      { name: "supabase-js", by: "Supabase", license: "MIT", url: "https://github.com/supabase/supabase-js" },
      { name: "Nivo", by: "Raphaël Benitte", license: "MIT", url: "https://github.com/plouc/nivo" },
      { name: "Sileo", by: "Aaryan", license: "MIT", url: "https://github.com/hiaaryan/sileo" },
      { name: "Motion", by: "Motion Division", license: "MIT", url: "https://github.com/motiondivision/motion" },
      { name: "NumberFlow", by: "Maxwell Barvian", license: "MIT", url: "https://github.com/barvian/number-flow" },
      { name: "Vaul", by: "Emil Kowalski", license: "MIT", url: "https://github.com/emilkowalski/vaul" },
      { name: "Embla Carousel", by: "David Jerleke", license: "MIT", url: "https://github.com/davidjerleke/embla-carousel" },
    ],
  },
  {
    title: "Données",
    items: [
      { name: "Contours des communes d'Haïti (ADM3)", by: "geoBoundaries · FEWS NET", license: "CC BY 4.0", url: "https://www.geoboundaries.org", note: "Carte des ventes de la console admin" },
    ],
  },
];

/** Documents légaux : en préparation tant que la base légale n'est pas fixée (05-backend « Durée de conservation », plan I5). */
export const LEGAL_DOCS: { slug: string; title: string }[] = [
  { slug: "conditions", title: "Conditions d'utilisation" },
  { slug: "confidentialite", title: "Politique de confidentialité" },
  { slug: "mentions", title: "Mentions légales" },
];
