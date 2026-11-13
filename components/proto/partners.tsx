"use client";

// Pages « Devenir partenaire de paiement / de livraison » (CLAUDE.md 10 nov. 2026, spec §7) :
// bandeau, chiffres du pilote, avantages, étapes, profils, exigences, questions, candidature, contact.

import Image from "next/image";
import { useState } from "react";
import { ZONES } from "@/lib/charts/adminData";
import { PARTNER_PAGES, VEHICLES } from "@/lib/demo/partnerContent";
import { ORG_TYPES, submitPartner } from "@/lib/demo/partners";
import type { PartnerInput, PartnerKind } from "@/lib/domain/partners";
import { photoUrl } from "@/lib/data/mock/partnerImages";
import { Crumb } from "./legal";
import { FieldErr, Fi, IdPhoto } from "./ui";

function empty(kind: PartnerKind): PartnerInput {
  return kind === "delivery"
    ? { kind, who: "person", name: "", phone: "", email: "", msg: "", docs: false, dob: "", zone: ZONES[0][0], vehicle: "", avail: "" }
    : { kind, who: "company", name: "", phone: "", email: "", msg: "", docs: false, org: "", orgType: "", volume: "" };
}

function Field({ id, label, err, children }: { id: string; label: string; err?: string; children: React.ReactNode }) {
  return (
    <div className="fl">
      <label className="lbl" htmlFor={id}>
        {label}
      </label>
      {children}
      <FieldErr msg={err} />
    </div>
  );
}

function ApplyForm({ kind }: { kind: PartnerKind }) {
  const [f, setF] = useState<PartnerInput>(() => empty(kind));
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [done, setDone] = useState<string | null>(null);
  // Pièce d'identité du livreur : les deux faces, comme le formulaire vendeur `/sell`.
  // `docs` ne vaut vrai que lorsque le recto et le verso sont déposés.
  const [faces, setFaces] = useState({ recto: false, verso: false });
  const pickFace = (k: "recto" | "verso", on: boolean) => {
    const next = { ...faces, [k]: on };
    setFaces(next);
    set({ docs: next.recto && next.verso });
  };
  const set = (p: Partial<PartnerInput>) => {
    setF((x) => ({ ...x, ...p }));
    setErrs((e) => {
      const n = { ...e };
      for (const k of Object.keys(p)) delete n[k];
      return n;
    });
  };
  const inv = (k: string) => (errs[k] ? true : undefined);
  if (done)
    return (
      <div className="pt-done" role="status">
        <span className="pt-ok">
          <Fi s="circle-check" />
        </span>
        <h3>Candidature reçue</h3>
        <p>
          Numéro de dossier <b className="tnum">{done}</b>. Notre équipe vous contacte par téléphone{f.email ? " ou par e-mail" : ""}.
        </p>
      </div>
    );
  return (
    <form
      className="pt-form"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        const r = submitPartner(f);
        if (r.ok) setDone(r.id);
        else setErrs(r.errors);
      }}
    >
      <div className="otabs sm" role="group" aria-label="Vous êtes">
        {(kind === "delivery" ? ([["person", "Particulier"], ["company", "Société"]] as const) : ([["company", "Organisation"], ["person", "Indépendant"]] as const)).map(([k, l]) => (
          <button type="button" key={k} className={f.who === k ? "on" : ""} aria-pressed={f.who === k} onClick={() => set({ who: k })}>
            {l}
          </button>
        ))}
      </div>
      <div className="pt-grid">
        {kind === "payment" ? (
          <>
            <Field id="pt-org" label="Organisation" err={errs.org}>
              <input className="field" id="pt-org" value={f.org} aria-invalid={inv("org")} onChange={(e) => set({ org: e.target.value })} />
            </Field>
            <Field id="pt-ot" label="Type d'organisation" err={errs.orgType}>
              <select className="field" id="pt-ot" value={f.orgType} aria-invalid={inv("orgType")} onChange={(e) => set({ orgType: e.target.value })}>
                <option value="">Choisir</option>
                {ORG_TYPES.map(([k, l]) => (
                  <option key={k} value={k}>
                    {l}
                  </option>
                ))}
              </select>
            </Field>
          </>
        ) : null}
        <Field id="pt-n" label={kind === "delivery" && f.who === "company" ? "Nom de la société" : "Nom et prénom"} err={errs.name}>
          <input className="field" id="pt-n" autoComplete="name" value={f.name} aria-invalid={inv("name")} onChange={(e) => set({ name: e.target.value })} />
        </Field>
        <Field id="pt-p" label="Téléphone" err={errs.phone}>
          <input className="field" id="pt-p" inputMode="tel" autoComplete="tel" placeholder="Ex. 3712 3456" value={f.phone} aria-invalid={inv("phone")} onChange={(e) => set({ phone: e.target.value })} />
        </Field>
        <Field id="pt-e" label={kind === "payment" ? "E-mail professionnel" : "E-mail (facultatif)"} err={errs.email}>
          <input className="field" id="pt-e" type="email" autoComplete="email" value={f.email} aria-invalid={inv("email")} onChange={(e) => set({ email: e.target.value })} />
        </Field>
        {kind === "delivery" ? (
          <>
            {f.who === "person" ? (
              <Field id="pt-d" label="Date de naissance" err={errs.dob}>
                <input className="field" id="pt-d" type="date" value={f.dob} aria-invalid={inv("dob")} onChange={(e) => set({ dob: e.target.value })} />
              </Field>
            ) : null}
            <Field id="pt-z" label="Quartier" err={errs.zone}>
              <select className="field" id="pt-z" value={f.zone} onChange={(e) => set({ zone: e.target.value })}>
                {ZONES.map(([z]) => (
                  <option key={z}>{z}</option>
                ))}
              </select>
            </Field>
            <Field id="pt-v" label="Véhicule" err={errs.vehicle}>
              <select className="field" id="pt-v" value={f.vehicle} aria-invalid={inv("vehicle")} onChange={(e) => set({ vehicle: e.target.value })}>
                <option value="">Choisir</option>
                {VEHICLES.map(([k, l]) => (
                  <option key={k} value={k}>
                    {l}
                  </option>
                ))}
              </select>
            </Field>
            <Field id="pt-a" label="Disponibilités">
              <input className="field" id="pt-a" placeholder="Ex. soirs et week-ends" value={f.avail} onChange={(e) => set({ avail: e.target.value })} />
            </Field>
          </>
        ) : (
          <Field id="pt-vol" label="Volume ou réseau (facultatif)">
            <input className="field" id="pt-vol" placeholder="Ex. 20 agences, 5 000 clients actifs" value={f.volume} onChange={(e) => set({ volume: e.target.value })} />
          </Field>
        )}
      </div>
      {kind === "delivery" ? (
        <div className="fl">
          <span className="lbl">Pièce d&apos;identité (recto et verso)</span>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <IdPhoto label="Recto" on={faces.recto} onPick={(on) => pickFace("recto", on)} />
            <IdPhoto label="Verso" on={faces.verso} onPick={(on) => pickFace("verso", on)} />
          </div>
          <FieldErr msg={errs.docs} />
        </div>
      ) : null}
      <Field id="pt-m" label="Message (facultatif)">
        <textarea className="field" id="pt-m" rows={3} value={f.msg} onChange={(e) => set({ msg: e.target.value })} />
      </Field>
      <button className="btn btn-p btn-block">Déposer ma candidature</button>
      <p className="cap" style={{ marginTop: 8 }}>Vos informations servent uniquement à étudier votre candidature. Elles ne sont jamais publiées.</p>
    </form>
  );
}

export function PartnerPage({ kind }: { kind: PartnerKind }) {
  const c = PARTNER_PAGES[kind];
  return (
    <div className="wrap pt">
      <Crumb items={[[c.crumb]]} />
      {/* 13 nov. 2026 (unslop) : la photo est le bandeau, le texte posé dessus ; plus de cartes
          « icône + titre + phrase » — des listes, une frise pour les étapes. Contenu inchangé. */}
      <section className="ptn-hero">
        <Image className="ptn-bg" src={photoUrl(c.heroPhoto, 1600, 900)} alt={c.heroPhoto.alt} fill priority sizes="(max-width: 1023px) 100vw, 1240px" />
        <div className="ptn-panel">
          <h1>{c.title}</h1>
          <p>{c.promise}</p>
          <a className="btn btn-p" href="#candidature">
            Déposer une candidature
          </a>
          <ul className="ptn-pts">
            {c.heroPoints.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </div>
      </section>
      <dl className="ptn-facts" aria-label="La plateforme en bref">
        {c.stats.map(([v, l]) => (
          <div key={l}>
            <dt>{v}</dt>
            <dd>{l}</dd>
          </div>
        ))}
      </dl>
      <section className="ptn-sec">
        <h2>Pourquoi Prélakay</h2>
        <dl className="ptn-dl">
          {c.benefits.map(([, t, p]) => (
            <div key={t}>
              <dt>{t}</dt>
              <dd>{p}</dd>
            </div>
          ))}
        </dl>
      </section>
      <section className="ptn-sec ptn-split">
        <div>
          <h2>Ce que vous y gagnez</h2>
          <dl className="ptn-dl ptn-one">
            {c.gains.map((g) => (
              <div key={g.t}>
                <dt>
                  {g.t}
                  {g.open ? <span className="ptn-open">Encore ouvert</span> : null}
                </dt>
                <dd>{g.p}</dd>
              </div>
            ))}
          </dl>
        </div>
        <Image className="ptn-side" src={photoUrl(c.sidePhoto, 600, 750)} alt={c.sidePhoto.alt} width={360} height={450} loading="lazy" />
      </section>
      <section className="ptn-sec">
        <h2>Comment ça marche</h2>
        <ol className="ptn-steps">
          {c.steps.map(([t, p, d], i) => (
            <li key={t}>
              <span className="ptn-n tnum" aria-hidden="true">
                {i + 1}
              </span>
              <b>{t}</b>
              <p>{p}</p>
              <span className="cap">{d}</span>
            </li>
          ))}
        </ol>
      </section>
      <section className="ptn-sec ptn-two">
        <div>
          <h2>Profils recherchés</h2>
          <div className="ptn-prof">
            {c.profiles.map((p) => (
              <div key={p.t}>
                <b>{p.t}</b>
                <ul>
                  {p.items.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h2>Ce qu&apos;il faut fournir</h2>
          <ul className="ptn-list">
            {c.needs.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
          <h3 className="ptn-sub">Ce que nous ne demandons pas</h3>
          <ul className="ptn-list ptn-no">
            {c.noNeed.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </div>
      </section>
      <section className="ptn-sec">
        <h2>Nos engagements</h2>
        <dl className="ptn-dl ptn-three">
          {c.promises.map(([t, p]) => (
            <div key={t}>
              <dt>{t}</dt>
              <dd>{p}</dd>
            </div>
          ))}
        </dl>
      </section>
      <section className="pt-sec">
        <h2>Questions fréquentes</h2>
        <div className="panel pt-faq">
          {c.faq.map(([q, a]) => (
            <details key={q}>
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </section>
      <section className="pt-sec" id="candidature">
        <div className="panel">
          <h2>{c.ctaTitle}</h2>
          <p className="pt-cta-t">{c.ctaText}</p>
          <ApplyForm kind={kind} />
        </div>
      </section>
      <p className="pt-contact">
        <Fi s="envelope" />
        Une question ? <a className="lk" href={`mailto:${c.contact}`}>{c.contact}</a>
      </p>
    </div>
  );
}
