"use client";

// Connexion / inscription (pageLogin du prototype). L'intro de première visite a été
// retirée le 11 nov. 2026 à la demande de Marc-Karlin.

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CATS } from "@/lib/data/mock/seed";
import { demo, useDemo } from "@/lib/demo/store";
import { ComingSoon } from "@/components/ui/ComingSoon";
import { PhoneAuth } from "./phone";
import { useModal } from "./modal";
import { useToast } from "@/components/ui/Toast";
import { useProtoRoute } from "./shell";
import { DataIcon, Fi, Ph, useMounted } from "./ui";

export function AuthPage({ sign }: { sign: boolean }) {
  const router = useRouter();
  const modal = useModal();
  const toast = useToast();
  const r = useProtoRoute();
  // retour à la page de départ après connexion (02-app-flow §1) ; uniquement un chemin interne
  const next = r.params.next && r.params.next.startsWith("/") && !r.params.next.startsWith("//") ? r.params.next : "/";
  const go = () => {
    demo.update((d) => {
      d.logged = true;
    });
    toast.show(sign ? "Bienvenue sur Prélakay" : "Content de vous revoir", "success");
    router.push(next);
  };
  return (
    <div className="wrap">
      <div className="auth">
        <div className="card">
          <h1 style={{ marginBottom: 4 }}>{sign ? "Créer un compte" : "Se connecter"}</h1>
          <p className="muted" style={{ marginBottom: 16 }}>{sign ? "Seulement l'essentiel : vous complétez le reste plus tard." : "Content de vous revoir."}</p>
          <button className="btn btn-s btn-block" onClick={go}>
            <Fi s="google" />
            Continuer avec Google
          </button>
          <div className="or">ou</div>
          {sign ? (
            <div className="fl">
              <label className="lbl" htmlFor="lu">@username</label>
              <input className="field" id="lu" placeholder="votre_nom" />
            </div>
          ) : null}
          <div className="fl">
            <label className="lbl" htmlFor="le">E-mail</label>
            <input className="field" id="le" type="email" autoComplete="email" />
          </div>
          <div className="fl">
            <label className="lbl" htmlFor="lp">Mot de passe</label>
            <input className="field" id="lp" type="password" autoComplete={sign ? "new-password" : "current-password"} />
          </div>
          <button className="btn btn-p btn-block" onClick={go}>
            {sign ? "Créer mon compte" : "Se connecter"}
          </button>
          <ComingSoon feature="phone_otp">
            <button
              className="btn btn-block"
              style={{ marginTop: 8, color: "var(--color-neutral-700)" }}
              onClick={() => modal.open("Avec mon numéro de téléphone", <PhoneAuth mode="login" onDone={() => { modal.close(); router.push(next); }} />)}
            >
              <Fi s="phone" />
              Avec mon numéro de téléphone
            </button>
          </ComingSoon>
          <p className="cap" style={{ textAlign: "center", marginTop: 14 }}>
            {sign ? (
              <>
                Déjà membre ?{" "}
                <Link href={`/login${next !== "/" ? `?next=${encodeURIComponent(next)}` : ""}`} style={{ color: "var(--color-lagon-700)", fontWeight: 500 }}>
                  Se connecter
                </Link>
              </>
            ) : (
              <>
                Nouveau ?{" "}
                <Link href={`/signup${next !== "/" ? `?next=${encodeURIComponent(next)}` : ""}`} style={{ color: "var(--color-lagon-700)", fontWeight: 500 }}>
                  Créer un compte
                </Link>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
