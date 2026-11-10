import { Suspense, type ReactNode } from "react";
import { SellerShell } from "@/components/seller/shell";

// Espace vendeur (projet 2) : Seller Center, après dossier KYC approuvé (03-design §9.10).
export default function SellerLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={null}>
      <SellerShell>{children}</SellerShell>
    </Suspense>
  );
}
