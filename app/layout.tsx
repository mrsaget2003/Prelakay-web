import type { Metadata, Viewport } from "next";
import { ToastProvider } from "@/components/ui/Toast";
import { SoonFromQuery } from "@/components/ui/SoonFromQuery";
import "./globals.css";
import "./proto.css";
import "./proto-next.css";

export const metadata: Metadata = {
  // adresses absolues des images de partage : app.prelakay.com (décision du 11 nov. 2026)
  metadataBase: new URL(process.env.NEXT_PUBLIC_URL_ACHETEUR || "https://app.prelakay.com"),
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
    <html lang="fr">
      <body>
        <ToastProvider>
          {children}
          <SoonFromQuery />
        </ToastProvider>
      </body>
    </html>
  );
}
