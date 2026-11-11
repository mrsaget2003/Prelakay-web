"use client";

// Connexion à la console — adminLogin du prototype : e-mail @prelakay.ht + mot de passe,
// « Rester connecté 8 heures », code à 6 chiffres, mot de passe oublié (message neutre),
// blocage après 5 échecs. Identifiants de démonstration : variables d'environnement.

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ADMINS, ROLES, loginStep, type LoginState } from "@/lib/domain/admin";
import { BUSINESS } from "@/lib/config/business";
import { adminSession, useAdminSession } from "@/lib/demo/adminSession";
import { auditLog } from "@/lib/demo/admin";
import { hydrateDemo } from "@/lib/demo/store";
import { Logo } from "@/components/brand/Logo";
import { useToast } from "@/components/ui/Toast";
import { ModalProvider, useModal } from "@/components/proto/modal";
import { Fi } from "@/components/proto/ui";
import { BUYER_URL } from "./shell";

export type DemoCreds = { password: string; otp: string } | null;

function Err({ children }: { children: React.ReactNode }) {
  return (
    <div className="err-box" role="alert">
      <Fi s="circle-exclamation" />
      <span>{children}</span>
    </div>
  );
}

function Login({ creds }: { creds: DemoCreds }) {
  const router = useRouter();
  const next = useSearchParams().get("next");
  const toast = useToast();
  const modal = useModal();
  const session = useAdminSession();
  const [step, setStep] = useState<"login" | "otp" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [otp, setOtp] = useState("");
  const [err, setErr] = useState<React.ReactNode>(null);
  const [locked, setLocked] = useState(false);
  const [sent, setSent] = useState(false);
  /** Connexion en cours : la redirection vers « next » l'emporte sur « déjà connecté ». */
  const justIn = useRef(false);

  useEffect(() => hydrateDemo(), []);
  useEffect(() => {
    const B = document.body;
    B.classList.add("seller", "admin", "alog");
    return () => B.classList.remove("seller", "admin", "alog");
  }, []);
  // déjà connecté : directement à la console
  useEffect(() => {
    if (session && !justIn.current) router.replace("/admin");
  }, [session, router]);
  // fin du blocage
  useEffect(() => {
    const st = adminSession.loginState();
    const left = st.lockUntil - Date.now();
    if (left <= 0) return;
    const t0 = setTimeout(() => setLocked(true), 0);
    const t = setTimeout(() => setLocked(false), left + 100);
    return () => {
      clearTimeout(t0);
      clearTimeout(t);
    };
  }, [locked]);

  const submitLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!creds) return setErr("Connexion de démonstration non configurée sur ce déploiement.");
    const r = loginStep(adminSession.loginState() as LoginState, { email, password: pw }, creds, Date.now());
    adminSession.setLoginState(r.state);
    if (r.ok) {
      setErr(null);
      setEmail(r.email);
      setStep("otp");
      return;
    }
    if (r.locked) {
      setLocked(true);
      setErr(null);
      return;
    }
    setErr(`E-mail ou mot de passe incorrect. ${r.left} essai${r.left > 1 ? "s" : ""} restant${r.left > 1 ? "s" : ""}.`);
  };
  const submitOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!creds || otp.replace(/\D/g, "") !== creds.otp) return setErr("Code incorrect ou expiré.");
    justIn.current = true;
    adminSession.login(email, remember);
    const m = ADMINS.find((a) => a.e === email)!;
    auditLog({ e: m.e, n: m.n, role: m.role }, "Connexion", "Console admin");
    toast.show(`Bienvenue, ${m.n.split(" ")[0]}`, "success");
    router.replace(next && next.startsWith("/admin") && !next.startsWith("/admin/login") ? next : "/admin");
  };

  return (
    <div className="al">
      <div className="al-side">
        <a className="logo" href={`${BUYER_URL}/`} aria-label="Prélakay, accueil">
          <Logo variant="full" tone="white" height={36} />
        </a>
        <div>
          <h1>Console d&apos;administration</h1>
          <p>Validation des stores, modération, litiges, bannières et notifications.</p>
        </div>
        <span className="cap">Accès réservé à l&apos;équipe Prélakay. Toute connexion est enregistrée.</span>
      </div>
      <div className="al-main">
        <div className="al-card">
          {step === "otp" ? (
            <>
              <h2>Vérification en deux étapes</h2>
              <p className="muted">
                Saisissez le code à 6 chiffres envoyé au numéro enregistré pour <b>{email}</b>.
              </p>
              <form className="al-f" onSubmit={submitOtp}>
                <label className="lbl" htmlFor="aotp">
                  Code de vérification
                </label>
                <input className="field otp" id="aotp" inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder="••••••" autoFocus value={otp} onChange={(e) => setOtp(e.target.value)} />
                <div id="aerr">{err ? <Err>{err}</Err> : null}</div>
                <button className="btn btn-p btn-lg btn-block">Vérifier</button>
              </form>
              <div className="row-b">
                <button className="lk" onClick={() => toast.show(creds ? `Nouveau code envoyé (prototype : ${creds.otp})` : "Nouveau code envoyé")}>
                  Renvoyer le code
                </button>
                <button
                  className="lk"
                  onClick={() => {
                    setStep("login");
                    setErr(null);
                  }}
                >
                  Changer de compte
                </button>
              </div>
            </>
          ) : step === "forgot" ? (
            <>
              <h2>Mot de passe oublié</h2>
              <p className="muted">Indiquez l&apos;e-mail de votre compte admin. Si le compte existe, vous recevrez un lien valable 30 minutes.</p>
              <form
                className="al-f"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!/@/.test(email)) return setErr("Indiquez une adresse e-mail valide.");
                  setErr(null);
                  setSent(true);
                }}
              >
                <label className="lbl" htmlFor="afe">
                  E-mail professionnel
                </label>
                <input className="field" id="afe" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <div id="aerr">
                  {err ? <Err>{err}</Err> : null}
                  {sent ? (
                    <div className="ok-box">
                      <Fi s="circle-check" />
                      <div>
                        <b>Vérifiez votre boîte mail</b>
                        <span>Si un compte admin existe pour cette adresse, un lien vient d&apos;être envoyé.</span>
                      </div>
                    </div>
                  ) : null}
                </div>
                <button className="btn btn-p btn-lg btn-block">Envoyer le lien</button>
              </form>
              <button
                className="lk"
                onClick={() => {
                  setStep("login");
                  setErr(null);
                  setSent(false);
                }}
              >
                Retour à la connexion
              </button>
            </>
          ) : (
            <>
              <h2>Connexion</h2>
              <p className="muted">Utilisez votre e-mail @prelakay.ht.</p>
              <form className="al-f" onSubmit={submitLogin}>
                <label className="lbl" htmlFor="ae">
                  E-mail professionnel
                </label>
                <input className="field" id="ae" type="email" autoComplete="username" placeholder="prenom@prelakay.ht" value={email} onChange={(e) => setEmail(e.target.value)} />
                <label className="lbl" htmlFor="ap">
                  Mot de passe
                </label>
                <div className="pw">
                  <input className="field" id="ap" type={show ? "text" : "password"} autoComplete="current-password" value={pw} onChange={(e) => setPw(e.target.value)} />
                  <button type="button" className="ib" aria-label={show ? "Masquer le mot de passe" : "Afficher le mot de passe"} onClick={() => setShow((v) => !v)}>
                    <Fi r={show ? "eye-slash" : "eye"} />
                  </button>
                </div>
                <div className="al-row">
                  <label className="ck">
                    <input type="checkbox" id="arem" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                    Rester connecté {BUSINESS.adminSessionHours} heures
                  </label>
                  <button
                    type="button"
                    className="lk"
                    onClick={() => {
                      setStep("forgot");
                      setErr(null);
                    }}
                  >
                    Mot de passe oublié ?
                  </button>
                </div>
                <div id="aerr">
                  {locked ? (
                    <div className="err-box" role="alert">
                      <Fi s="lock" />
                      <span>Trop de tentatives. Réessayez plus tard (prototype : 20 secondes).</span>
                    </div>
                  ) : err ? (
                    <Err>{err}</Err>
                  ) : null}
                </div>
                <button className="btn btn-p btn-lg btn-block" disabled={locked}>
                  Se connecter
                </button>
              </form>
              <p className="cap al-req">
                Pas de compte ? Les accès sont créés par un superadmin.{" "}
                <button
                  className="lk"
                  onClick={() =>
                    modal.open(
                      "Demander un accès",
                      <>
                        <p className="muted">
                          Les comptes admin sont créés uniquement par un superadmin, avec une adresse @prelakay.ht. Écrivez à <b>admin@prelakay.ht</b> en précisant votre rôle (Support, Finance ou Marketing).
                        </p>
                        <button className="btn btn-p btn-block" style={{ marginTop: 14 }} onClick={modal.close}>
                          Compris
                        </button>
                      </>,
                    )
                  }
                >
                  Demander un accès
                </button>
              </p>
            </>
          )}
        </div>
        {creds ? (
          <div className="al-demo">
            <b>Prototype : comptes de démonstration</b>
            <span className="cap">
              Mot de passe : <code>{creds.password}</code> · code : <code>{creds.otp}</code>
            </span>
            {ADMINS.map((a) => (
              <button
                key={a.e}
                className="chip"
                onClick={() => {
                  setStep("login");
                  setErr(null);
                  setEmail(a.e);
                  setPw(creds.password);
                }}
              >
                {ROLES[a.role]}
              </button>
            ))}
          </div>
        ) : null}
        <a className="al-back" href={`${BUYER_URL}/`}>
          <Fi s="arrow-left" />
          Retour au site
        </a>
      </div>
    </div>
  );
}

export function AdminLogin({ creds }: { creds: DemoCreds }) {
  return (
    <ModalProvider>
      <Login creds={creds} />
    </ModalProvider>
  );
}

