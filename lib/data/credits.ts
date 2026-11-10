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
    ],
  },
];

/** Documents légaux : en préparation tant que la base légale n'est pas fixée (05-backend « Durée de conservation », plan I5). */
export const LEGAL_DOCS: { slug: string; title: string }[] = [
  { slug: "conditions", title: "Conditions d'utilisation" },
  { slug: "confidentialite", title: "Politique de confidentialité" },
  { slug: "mentions", title: "Mentions légales" },
];
