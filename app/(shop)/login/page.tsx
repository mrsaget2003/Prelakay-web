"use client";

// Connexion — pageLogin(false) du prototype ; ?next= ramène à la page de départ.
import { AuthPage } from "@/components/proto/auth";

export default function LoginPage() {
  return <AuthPage sign={false} />;
}
