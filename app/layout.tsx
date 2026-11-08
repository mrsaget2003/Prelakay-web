import type { Metadata, Viewport } from "next";
import { ToastProvider } from "@/components/ui/Toast";
import { SoonFromQuery } from "@/components/ui/SoonFromQuery";
import "./globals.css";

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
