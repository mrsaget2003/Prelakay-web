import { Suspense } from "react";
import { prelakayEnv } from "@/lib/config/env";
import { AdminLogin, type DemoCreds } from "@/components/admin/login";

// Connexion à la console admin. Identifiants de démonstration (plan B8b) : variables
// d'environnement ADMIN_DEMO_PASSWORD et ADMIN_DEMO_OTP, jamais en dur ; jamais en production.
export const dynamic = "force-dynamic";

export default function AdminLoginPage() {
  const pw = process.env.ADMIN_DEMO_PASSWORD;
  const otp = process.env.ADMIN_DEMO_OTP;
  const creds: DemoCreds = prelakayEnv(process.env) !== "production" && pw && otp ? { password: pw, otp } : null;
  return (
    <Suspense fallback={null}>
      <AdminLogin creds={creds} />
    </Suspense>
  );
}
