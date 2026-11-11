"use client";

// Connexion / inscription (pageLogin du prototype) et intro (renderIntro : 3 écrans
// max, « Passer » dès le premier, puis choix de 2-3 catégories — 02-app-flow §2.1).

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CATS } from "@/lib/data/mock/seed";
import { INTRO } from "@/lib/data/mock/content";
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
      if (sign) {
        d.introDone = false;
        d.introStep = INTRO.length;
      }
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

/** Intro de première visite (superposition #intro du prototype). */
export function Intro() {
  const s = useDemo();
  const toast = useToast();
  const mounted = useMounted();
  if (!mounted || s.introDone) return null;
  const i = s.introStep;
  const end = () => {
    if (i < INTRO.length) return demo.update((d) => { d.introStep = INTRO.length; });
    demo.update((d) => { d.introDone = true; d.introStep = 0; });
    toast.show("Bienvenue ! Votre accueil est personnalisé.", "success");
  };
  if (i >= INTRO.length)
    return (
      <div id="intro">
        <div className="intro">
          <h1>Qu&apos;est-ce qui vous intéresse ?</h1>
          <p>Choisissez 2 ou 3 catégories pour personnaliser votre accueil.</p>
          <div className="picks" style={{ width: "min(420px,100%)" }}>
            {CATS.slice(0, 6).map((c) => (
              <button key={c.id} className={s.picked[c.id] ? "on" : ""} onClick={() => demo.update((d) => { d.picked[c.id] = !d.picked[c.id]; })}>
                <DataIcon cls={c.i} />
                {c.n.split(" ")[0]}
              </button>
            ))}
          </div>
          <button className="btn btn-p" onClick={end}>
            C&apos;est parti
          </button>
        </div>
      </div>
    );
  const [icon, tint, h, p] = INTRO[i];
  return (
    <div id="intro">
      <div className="intro">
        <button className="btn btn-s btn-sm skip" onClick={end}>
          Passer
        </button>
        <Ph icon={icon} tint={tint} cls="il" />
        <h1>{h}</h1>
        <p>{p}</p>
        <div className="dts">
          {INTRO.map((_, j) => (
            <span key={j} className={j === i ? "on" : ""} />
          ))}
        </div>
        <button className="btn btn-p" onClick={() => demo.update((d) => { d.introStep = i + 1; })}>
          Suivant
        </button>
      </div>
    </div>
  );
}
