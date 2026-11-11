import type { Metadata, Viewport } from "next";
import { ToastProvider } from "@/components/ui/Toast";
import { SoonFromQuery } from "@/components/ui/SoonFromQuery";
import "./globals.css";
import "./proto.css";
import "./proto-next.css";
import "./theme-dark.css";
import { THEME_BOOT } from "@/lib/ui/theme";

export const metadata: Metadata = {
  title: "Prélakay",
  description: "Cherchez-vous encore votre produit ?",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/icons/icon-180.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0e6b74", // lagon-500
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        {/* mode sombre : appliqué avant le premier rendu (pas de flash clair) */}
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT }} />
      </head>
      <body>
        <ToastProvider>
          {children}
          <SoonFromQuery />
        </ToastProvider>
      </body>
    </html>
  );
}
