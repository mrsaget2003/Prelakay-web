"use client";

// Programme ambassadeurs étudiants. Réécrit le 11 nov. 2026 : page détaillée, tournée
// vers la candidature, avec un questionnaire de profil étudiant et l'auto-complétion
// des universités et des facultés (lib/data/facultes.json, complété par Marc-Karlin).

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import { useDemo } from "@/lib/demo/store";
import { REFERRAL_COINS, applyAmbassador } from "@/lib/demo/growth";
import {
  AVAILABILITY, FOLLOWERS, NETWORKS, YEARS, WHY_MIN,
  validateAmbassador, type AmbassadorInput,
} from "@/lib/domain/ambassador";
import { PARTNER_PHOTOS, photoUrl } from "@/lib/data/mock/partnerImages";
import FACULTES from "@/lib/data/facultes.json";
import { Crumb } from "@/components/proto/legal";
import { FieldErr, Fi, NeedLogin } from "@/components/proto/ui";
import type { IconName } from "@/lib/icons/registry";

const STEPS: [string, string, string][] = [
  ["Candidature", "Vous remplissez ce questionnaire : université, faculté, disponibilités.", "5 minutes"],
  ["Validation", "L'équipe Prélakay lit votre profil et vous appelle.", "délai à confirmer"],
  ["Votre lien", "Vous recevez un lien de parrainage à votre nom, à partager sur le campus et sur WhatsApp.", "le jour de la validation"],
  ["Vos Coins", `${REFERRAL_COINS} Coins pour chaque inscrit qui passe sa première commande.`, "à chaque commande"],
];

const GAINS: [IconName, string, string][] = [
  ["coins", "Des Coins, pas des promesses", `${REFERRAL_COINS} Coins dès qu'un inscrit passe sa première commande. Vos Coins se dépensent sur la plateforme.`],
  ["link", "Un lien à votre nom", "Vous suivez vos inscriptions et vos gains depuis votre compte, en direct."],
  ["book", "Une ligne sur votre CV", "Représenter une plateforme auprès de son campus, cela se raconte en entretien."],
  ["users", "Un réseau", "Vous rejoignez les autres ambassadeurs : on partage ce qui marche et ce qui ne marche pas."],
];

const EXPECT: string[] = [
  "Parler de Prélakay autour de vous, honnêtement",
  "Aider un camarade à passer sa première commande",
  "Nous remonter ce qui coince : un prix, un bug, une attente",
];

const NO_EXPECT: string[] = [
  "Aucun quota d'inscriptions",
  "Aucune avance d'argent, aucun achat obligatoire",
  "Aucune exclusivité : vous restez libre de vos engagements",
];

const FAQ: [string, string][] = [
  ["Faut-il être étudiant pour candidater ?", "Le programme s'adresse aux étudiants et aux jeunes diplômés. Si vous n'êtes ni l'un ni l'autre, le parrainage classique reste ouvert à tout le monde depuis votre compte."],
  ["Combien de temps cela prend-il par semaine ?", "C'est vous qui le dites dans le questionnaire. Il n'y a ni horaire ni quota : certains ambassadeurs partagent leur lien une fois et s'arrêtent là."],
  ["Est-ce payé en argent ?", "Non, en Coins. Ils se dépensent sur la plateforme. Une conversion en gourdes n'est pas prévue à ce jour."],
  ["Mon université n'est pas dans la liste", "Écrivez-la quand même : le champ accepte n'importe quel nom. Nous l'ajouterons à la liste."],
  ["Que faites-vous de mes réponses ?", "Elles servent à étudier votre candidature et à vous joindre. Elles ne sont ni publiées ni revendues."],
  ["Puis-je arrêter quand je veux ?", "Oui, à tout moment, sans démarche. Les Coins déjà gagnés vous restent."],
];

type Uni = { sigle: string; nom: string; ville: string; facultes: string[] };
const UNIS = FACULTES.universites as Uni[];

const empty: AmbassadorInput = {
  university: "", faculty: "", year: "", city: "", phone: "",
  network: "", handle: "", followers: "", hours: "", why: "",
};

function Field({ id, label, err, hint, children }: { id: string; label: string; err?: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="fl">
      <label className="lbl" htmlFor={id}>{label}</label>
      {children}
      {hint && !err ? <span className="cap">{hint}</span> : null}
      <FieldErr msg={err} />
    </div>
  );
}

function Survey() {
  const [f, setF] = useState<AmbassadorInput>(empty);
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [sent, setSent] = useState<string | null>(null);
  const set = (p: Partial<AmbassadorInput>) => {
    setF((x) => ({ ...x, ...p }));
    setErrs((e) => {
      const n = { ...e };
      for (const k of Object.keys(p)) delete n[k];
      return n;
    });
  };
  // facultés proposées : celles de l'université saisie, sinon toutes
  const faculties = useMemo(() => {
    const hit = UNIS.find((u) => u.nom.toLowerCase() === f.university.trim().toLowerCase() || (u.sigle && u.sigle.toLowerCase() === f.university.trim().toLowerCase()));
    const list = hit ? hit.facultes : UNIS.flatMap((u) => u.facultes);
    return [...new Set(list)];
  }, [f.university]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const found = validateAmbassador(f);
    setErrs(found);
    if (Object.keys(found).length) return;
    const err = applyAmbassador(f);
    if (err) return setErrs({ why: err });
    setSent("ok");
  };
  if (sent) return null;

  return (
    <form className="pt-form" noValidate onSubmit={submit}>
      <datalist id="amb-unis">
        {UNIS.map((u) => (
          <option key={u.nom} value={u.nom}>{u.sigle ? `${u.sigle} · ${u.ville}` : u.ville}</option>
        ))}
      </datalist>
      <datalist id="amb-facs">
        {faculties.map((x) => (
          <option key={x} value={x} />
        ))}
      </datalist>

      <h3 className="pt-sub">Vos études</h3>
      <div className="pt-grid">
        <Field id="amb-u" label="Université" err={errs.university} hint="Commencez à écrire : la liste se complète.">
          <input className="field" id="amb-u" list="amb-unis" autoComplete="off" value={f.university} aria-invalid={errs.university ? true : undefined} onChange={(e) => set({ university: e.target.value })} />
        </Field>
        <Field id="amb-f" label="Faculté ou filière" err={errs.faculty}>
          <input className="field" id="amb-f" list="amb-facs" autoComplete="off" value={f.faculty} aria-invalid={errs.faculty ? true : undefined} onChange={(e) => set({ faculty: e.target.value })} />
        </Field>
        <Field id="amb-y" label="Année d'étude" err={errs.year}>
          <select className="field" id="amb-y" value={f.year} aria-invalid={errs.year ? true : undefined} onChange={(e) => set({ year: e.target.value })}>
            <option value="">Choisissez</option>
            {YEARS.map((y) => <option key={y}>{y}</option>)}
          </select>
        </Field>
        <Field id="amb-c" label="Ville" err={errs.city}>
          <input className="field" id="amb-c" value={f.city} aria-invalid={errs.city ? true : undefined} onChange={(e) => set({ city: e.target.value })} />
        </Field>
      </div>

      <h3 className="pt-sub">Pour vous joindre</h3>
      <div className="pt-grid">
        <Field id="amb-p" label="Téléphone" err={errs.phone} hint="8 chiffres, comme 3712 3456.">
          <input className="field" id="amb-p" inputMode="tel" value={f.phone} aria-invalid={errs.phone ? true : undefined} onChange={(e) => set({ phone: e.target.value })} />
        </Field>
        <Field id="amb-n" label="Réseau où vous êtes le plus actif" err={errs.network}>
          <select className="field" id="amb-n" value={f.network} aria-invalid={errs.network ? true : undefined} onChange={(e) => set({ network: e.target.value })}>
            <option value="">Choisissez</option>
            {NETWORKS.map((n) => <option key={n}>{n}</option>)}
          </select>
        </Field>
        {f.network && f.network !== "Aucun" ? (
          <>
            <Field id="amb-h" label="Votre pseudo" err={errs.handle}>
              <input className="field" id="amb-h" value={f.handle} aria-invalid={errs.handle ? true : undefined} onChange={(e) => set({ handle: e.target.value })} />
            </Field>
            <Field id="amb-fo" label="Nombre d'abonnés" err={errs.followers}>
              <select className="field" id="amb-fo" value={f.followers} aria-invalid={errs.followers ? true : undefined} onChange={(e) => set({ followers: e.target.value })}>
                <option value="">Choisissez</option>
                {FOLLOWERS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
              </select>
            </Field>
          </>
        ) : null}
      </div>

      <h3 className="pt-sub">Vos disponibilités</h3>
      <Field id="amb-hr" label="Temps que vous pouvez y consacrer par semaine" err={errs.hours}>
        <div className="otabs sm" role="group" aria-label="Disponibilités par semaine">
          {AVAILABILITY.map(([k, l]) => (
            <button type="button" key={k} className={f.hours === k ? "on" : ""} aria-pressed={f.hours === k} onClick={() => set({ hours: k })}>
              {l}
            </button>
          ))}
        </div>
      </Field>
      <Field id="amb-w" label="Pourquoi vous ?" err={errs.why} hint={`${WHY_MIN} caractères au minimum — dites-nous comment vous comptez en parler.`}>
        <textarea className="field" id="amb-w" rows={3} style={{ height: "auto", padding: "10px 12px" }} value={f.why} aria-invalid={errs.why ? true : undefined} onChange={(e) => set({ why: e.target.value })} />
      </Field>
      <button className="btn btn-p btn-block">Envoyer ma candidature</button>
      <p className="cap" style={{ marginTop: 8 }}>Vos réponses servent uniquement à étudier votre candidature et à vous joindre.</p>
    </form>
  );
}

export default function Ambassadors() {
  const s = useDemo();
  if (!s.logged) return <NeedLogin what="Le programme ambassadeurs" next="/ambassadeurs" />;
  const a = s.growth.amb;
  return (
    <div className="wrap pt">
      <Crumb items={[["Ambassadeurs étudiants"]]} />
      <section className="pt-hero pt-hero-img">
        <div>
          <h1>Ambassadeurs étudiants</h1>
          <p>
            Faites découvrir Prélakay sur votre campus. Chaque camarade qui passe sa première commande vous rapporte {REFERRAL_COINS} Coins.
            Pas de quota, pas d&apos;horaires : vous en parlez quand cela vous arrange.
          </p>
          <a className="btn btn-p" href="#candidature">Devenir ambassadeur</a>
          <ul className="pt-hero-pts">
            <li><Fi s="check" />Questionnaire en 5 minutes</li>
            <li><Fi s="check" />Ouvert aux étudiants et jeunes diplômés</li>
          </ul>
        </div>
        <Image className="pt-photo" src={photoUrl(PARTNER_PHOTOS.ambassadorHero, 760, 560)} alt={PARTNER_PHOTOS.ambassadorHero.alt} width={380} height={280} unoptimized priority />
      </section>

      <ul className="pt-stats" aria-label="Le programme en bref">
        <li><b>{REFERRAL_COINS}</b><span>Coins par première commande d&apos;un filleul</span></li>
        <li><b>0</b><span>quota d&apos;inscriptions à tenir</span></li>
        <li><b>Libre</b><span>vous arrêtez quand vous voulez</span></li>
      </ul>

      <section className="pt-sec">
        <h2>Ce que vous y gagnez</h2>
        <div className="pt-cards">
          {GAINS.map(([i, t, p]) => (
            <div className="panel pt-card" key={t}>
              <span className="pt-ic"><Fi s={i} /></span>
              <h3>{t}</h3>
              <p>{p}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="pt-sec">
        <h2>Comment ça marche</h2>
        <ol className="pt-steps">
          {STEPS.map(([t, p, d], i) => (
            <li key={t}>
              <span className="pt-n">{i + 1}</span>
              <b>{t}</b>
              <p>{p}</p>
              <span className="pt-dur"><Fi r="clock" />{d}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="pt-sec pt-split">
        <div>
          <h2>Ce que nous attendons</h2>
          <ul className="pt-needs">
            {EXPECT.map((x) => <li key={x}><Fi s="check" />{x}</li>)}
          </ul>
          <h3 className="pt-sub">Ce que nous n&apos;attendons pas</h3>
          <ul className="pt-needs pt-no">
            {NO_EXPECT.map((x) => <li key={x}><Fi s="xmark" />{x}</li>)}
          </ul>
        </div>
        <Image className="pt-photo pt-photo-side" src={photoUrl(PARTNER_PHOTOS.ambassadorCampus, 720, 900)} alt={PARTNER_PHOTOS.ambassadorCampus.alt} width={360} height={450} unoptimized />
      </section>

      <section className="pt-sec">
        <h2>Questions fréquentes</h2>
        <div className="panel pt-faq">
          {FAQ.map(([q, r]) => (
            <details key={q}>
              <summary>{q}</summary>
              <p>{r}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="pt-sec" id="candidature">
        <div className="panel">
          {a ? (
            <div className="pt-done" role="status">
              <span className="pt-ok">
                <Fi s={a.st === "rej" ? "circle-exclamation" : "circle-check"} />
              </span>
              <h3>{a.st === "ok" ? "Vous êtes ambassadeur" : a.st === "rej" ? "Candidature refusée" : "Candidature reçue"}</h3>
              <p>{a.school}</p>
              {a.st === "ok" ? (
                <Link className="btn btn-p" href="/invite">Mon lien de parrainage</Link>
              ) : a.st === "recu" ? (
                <p className="cap">Nous vous appelons au numéro que vous avez laissé.</p>
              ) : null}
            </div>
          ) : (
            <>
              <h2>Votre candidature</h2>
              <p className="pt-cta-t">Dites-nous qui vous êtes et comment vous comptez en parler autour de vous.</p>
              <Survey />
            </>
          )}
        </div>
      </section>
    </div>
  );
}
