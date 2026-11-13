"use client";

// Connexion / inscription (pageLogin du prototype), reprise le 12 nov. 2026 :
// - inscription : e-mail, @username, mot de passe et sa **confirmation** (Marc-Karlin) ;
// - erreurs sous chaque champ, bouton « afficher » dans le champ mot de passe ;
// - connexion : « Mot de passe oublié ? » ;
// - Google et téléphone en seconds choix, côte à côte ;
// - mobile : la page est le formulaire ; bureau : à côté, les stores proches et leur distance.
// L'intro de première visite a été retirée le 11 nov. 2026.

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { STORES } from "@/lib/data/mock/seed";
import { storeImage } from "@/lib/data/mock/images";
import { formatDistance as km } from "@/lib/format";
import { PASSWORD_MIN, normalizeUsername, validateLogin, validateSignup } from "@/lib/domain/auth";
import { demo } from "@/lib/demo/store";
import { ComingSoon } from "@/components/ui/ComingSoon";
import { useToast } from "@/components/ui/Toast";
import { PhoneAuth } from "./phone";
import { useModal } from "./modal";
import { useProtoRoute } from "./shell";
import { FieldErr, Fi, Ph } from "./ui";

/** Logo Google en couleurs : une marque tierce se reconnaît avant de se lire. */
function GoogleG() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.6 5.4 2.7 13.3l7.9 6.1C12.5 13.6 17.8 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.1 24.6c0-1.6-.1-3.1-.4-4.6H24v9h12.4c-.5 2.9-2.2 5.3-4.6 6.9l7.5 5.8c4.4-4 6.8-10 6.8-17.1z" />
      <path fill="#FBBC05" d="M10.6 28.6c-.5-1.4-.8-2.9-.8-4.6s.3-3.2.8-4.6l-7.9-6.1C1 16.6 0 20.2 0 24s1 7.4 2.7 10.7l7.9-6.1z" />
      <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.8 2.3-8.4 2.3-6.2 0-11.5-4.1-13.4-9.9l-7.9 6.1C6.6 42.6 14.6 48 24 48z" />
    </svg>
  );
}

function Field({ id, label, err, hint, children }: { id: string; label: string; err?: string; hint?: string; children: ReactNode }) {
  return (
    <div className="fl">
      <label className="lbl" htmlFor={id}>{label}</label>
      {children}
      {err ? <FieldErr msg={err} /> : hint ? <span className="cap">{hint}</span> : null}
    </div>
  );
}

/** Mot de passe avec bouton « afficher » dans le champ. */
function Password({ id, value, onChange, auto, invalid }: { id: string; value: string; onChange: (v: string) => void; auto: string; invalid?: boolean }) {
  const [shown, setShown] = useState(false);
  return (
    <div className="pw">
      <input
        className="field"
        id={id}
        type={shown ? "text" : "password"}
        autoComplete={auto}
        value={value}
        aria-invalid={invalid || undefined}
        onChange={(e) => onChange(e.target.value)}
      />
      <button
        type="button"
        className="pw-eye"
        aria-label={shown ? "Masquer le mot de passe" : "Afficher le mot de passe"}
        aria-pressed={shown}
        onClick={() => setShown((x) => !x)}
      >
        <Fi r={shown ? "eye-slash" : "eye"} />
      </button>
    </div>
  );
}

type Form = { email: string; username: string; password: string; confirm: string };

export function AuthPage({ sign }: { sign: boolean }) {
  const router = useRouter();
  const modal = useModal();
  const toast = useToast();
  const r = useProtoRoute();
  // retour à la page de départ après connexion (02-app-flow §1) ; uniquement un chemin interne
  const next = r.params.next && r.params.next.startsWith("/") && !r.params.next.startsWith("//") ? r.params.next : "/";
  const qs = next !== "/" ? `?next=${encodeURIComponent(next)}` : "";
  const [f, setF] = useState<Form>({ email: "", username: "", password: "", confirm: "" });
  const [errs, setErrs] = useState<Record<string, string>>({});
  const set = (k: keyof Form) => (v: string) => {
    setF((x) => ({ ...x, [k]: v }));
    setErrs((e) => {
      const n = { ...e };
      delete n[k];
      return n;
    });
  };
  const enter = (user?: string) => {
    demo.update((d) => {
      d.logged = true;
      if (user) d.user = user;
    });
    toast.show(sign ? "Bienvenue sur Prélakay" : "Content de vous revoir", "success");
    router.push(next);
  };
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const found = sign ? validateSignup(f) : validateLogin(f);
    setErrs(found);
    const first = Object.keys(found)[0];
    if (first) {
      document.getElementById(`au-${first}`)?.focus();
      return;
    }
    enter(sign ? normalizeUsername(f.username) : undefined);
  };
  const near = STORES.filter((x) => x.type === "physique").sort((a, b) => a.km - b.km).slice(0, 3);

  return (
    <div className="wrap">
      <div className="auth2">
        <form className="auth2-f" noValidate onSubmit={submit}>
          <h1>{sign ? "Créer un compte" : "Se connecter"}</h1>
          <Field id="au-email" label="E-mail" err={errs.email}>
            <input
              className="field"
              id="au-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              value={f.email}
              aria-invalid={errs.email ? true : undefined}
              onChange={(e) => set("email")(e.target.value)}
            />
          </Field>
          {sign ? (
            <Field id="au-username" label="@username" err={errs.username} hint="C'est le nom que les stores verront.">
              <input
                className="field"
                id="au-username"
                autoComplete="username"
                autoCapitalize="none"
                placeholder="votre_nom"
                value={f.username}
                aria-invalid={errs.username ? true : undefined}
                onChange={(e) => set("username")(e.target.value)}
              />
            </Field>
          ) : null}
          <Field id="au-password" label="Mot de passe" err={errs.password} hint={sign ? `${PASSWORD_MIN} caractères au minimum.` : undefined}>
            <Password id="au-password" value={f.password} onChange={set("password")} auto={sign ? "new-password" : "current-password"} invalid={!!errs.password} />
          </Field>
          {sign ? (
            <Field id="au-confirm" label="Confirmer le mot de passe" err={errs.confirm}>
              <Password id="au-confirm" value={f.confirm} onChange={set("confirm")} auto="new-password" invalid={!!errs.confirm} />
            </Field>
          ) : (
            <button
              type="button"
              className="lk auth2-forgot"
              onClick={() =>
                modal.open(
                  "Mot de passe oublié",
                  <p className="muted">
                    Si un compte existe pour {f.email.trim() || "cette adresse"}, vous recevez un lien pour choisir un nouveau mot de passe.
                  </p>,
                )
              }
            >
              Mot de passe oublié ?
            </button>
          )}
          <button className="btn btn-p btn-block auth2-go">{sign ? "Créer mon compte" : "Se connecter"}</button>

          <div className="auth2-alt">
            <button type="button" className="btn btn-o" onClick={() => enter()}>
              <GoogleG />
              Google
            </button>
            <ComingSoon feature="phone_otp">
              <button
                type="button"
                className="btn btn-o"
                onClick={() =>
                  modal.open(
                    "Avec mon numéro de téléphone",
                    <PhoneAuth
                      mode="login"
                      onDone={() => {
                        modal.close();
                        router.push(next);
                      }}
                    />,
                  )
                }
              >
                <Fi s="phone" />
                Téléphone
              </button>
            </ComingSoon>
          </div>

          <p className="auth2-sw">
            {sign ? "Déjà membre ? " : "Nouveau sur Prélakay ? "}
            <Link href={`${sign ? "/login" : "/signup"}${qs}`}>{sign ? "Se connecter" : "Créer un compte"}</Link>
          </p>
        </form>

        {/* bureau : ce qui attend l'acheteur — des stores réels et leur distance (la signature) */}
        <aside className="auth2-near" aria-label="Stores près de chez vous">
          <b>Près de chez vous</b>
          {near.map((st) => (
            <Link key={st.id} href={`/store/${st.id}`} className="auth2-st">
              <Ph icon={st.i} tint="g4" cls="av" img={storeImage(st.id)} alt={st.n} sizes="48px" />
              <span>
                <b>{st.n}</b>
                <span className="cap">
                  {km(st.km)} · {st.addr.split(",")[0]}
                </span>
              </span>
            </Link>
          ))}
          <span className="cap">Commandez en ligne, retirez au comptoir. Votre argent reste protégé jusqu&apos;au retrait.</span>
        </aside>
      </div>
    </div>
  );
}
