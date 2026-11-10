import { Suspense, type ReactNode } from "react";
import { AdminShell } from "@/components/admin/shell";

// Console admin (projet 3) : session admin séparée, droits par rôle (03-design §9.11).
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={null}>
      <AdminShell>{children}</AdminShell>
    </Suspense>
  );
}
