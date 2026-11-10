import { Suspense, type ReactNode } from "react";
import { ProtoShell } from "@/components/proto/shell";

// Coque de l'Acheteur (projet 1) : header desktop, coque mobile, pied de page.
export default function ShopLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={null}>
      <ProtoShell>{children}</ProtoShell>
    </Suspense>
  );
}
