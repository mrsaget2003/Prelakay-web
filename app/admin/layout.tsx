import type { Metadata } from "next";

// Console admin : jamais indexée (décision du 11 nov. 2026 — `admin.prelakay.com`
// « sans SEO »). Couvre la connexion comme toutes les pages de la console.
export const metadata: Metadata = {
  title: "Admin · Prélakay",
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
