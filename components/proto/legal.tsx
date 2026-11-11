"use client";

// Pages « Légal » et « Crédits » (pied de page). Pages partenaires : ./partners.tsx.
// Les textes juridiques ne sont pas rédigés ici : ils restent « en préparation »
// tant que la base légale n'est pas fixée ([À CONFIRMER], plan I5).

import Link from "next/link";
import { CREDITS, LEGAL_DOCS } from "@/lib/data/credits";
import { photoCredits } from "@/lib/data/mock/images";
import { Fi, Page404 } from "./ui";

export function Crumb({ items }: { items: [string, string?][] }) {
  return (
    <nav className="crumb">
      <Link href="/">Accueil</Link>
      {items.map(([label, href]) => (
        <span key={label} style={{ display: "contents" }}>
          <Fi s="chevron-right" />
          {href ? <Link href={href}>{label}</Link> : <span>{label}</span>}
        </span>
      ))}
    </nav>
  );
}

export function LegalIndex() {
  return (
    <div className="wrap legal">
      <Crumb items={[["Légal"]]} />
      <div className="panel">
        <h1 className="ph-t">Légal</h1>
        {LEGAL_DOCS.map((d) => (
          <Link key={d.slug} className="lrow" href={`/legal/${d.slug}`}>
            <Fi s="file-lines" />
            {d.title}
            <Fi s="chevron-right" />
          </Link>
        ))}
        <Link className="lrow" href="/credits">
          <Fi s="circle-info" />
          Crédits
          <Fi s="chevron-right" />
        </Link>
      </div>
    </div>
  );
}

export function LegalDoc({ slug }: { slug: string }) {
  const d = LEGAL_DOCS.find((x) => x.slug === slug);
  if (!d) return <Page404 />;
  return (
    <div className="wrap legal">
      <Crumb items={[["Légal", "/legal"], [d.title]]} />
      <div className="panel">
        <h1 className="ph-t">{d.title}</h1>
        <div className="info-box">
          <Fi s="circle-info" />
          <span>Ce document est en préparation. Il sera publié avant l&apos;ouverture de la plateforme.</span>
        </div>
        <p className="muted" style={{ marginTop: 12 }}>
          Une question en attendant ? Écrivez-nous depuis le <Link className="lk" href="/help">centre d&apos;aide</Link>.
        </p>
      </div>
    </div>
  );
}

export function Credits() {
  const photos = photoCredits();
  return (
    <div className="wrap legal">
      <Crumb items={[["Légal", "/legal"], ["Crédits"]]} />
      <div className="panel">
        <h1 className="ph-t">Crédits</h1>
        <p className="muted" style={{ marginBottom: 8 }}>Prélakay remercie les auteurs des ressources utilisées dans l&apos;application.</p>
        {CREDITS.map((sec) => (
          <section key={sec.title} className="cr-sec">
            <h2>{sec.title}</h2>
            {sec.items.map((c) => (
              <div className="lrow st" key={c.name}>
                <span>
                  <b>{c.name}</b>
                  <span className="cap" style={{ display: "block" }}>
                    {c.by} · {c.license}
                    {c.note ? ` · ${c.note}` : ""}
                  </span>
                </span>
                <a className="lk" href={c.url} target="_blank" rel="noopener noreferrer">
                  Voir
                </a>
              </div>
            ))}
          </section>
        ))}
        <section className="cr-sec">
          <h2>Photos de démonstration</h2>
          <p className="cap" style={{ marginBottom: 8 }}>
            {photos.length} photos Unsplash, sous{" "}
            <a className="lk" href="https://unsplash.com/license" target="_blank" rel="noopener noreferrer">
              licence Unsplash
            </a>
            . Elles seront remplacées par les photos des stores.
          </p>
          <ul className="cr-photos">
            {photos.map((p) => (
              <li key={`${p.usage}-${p.key}`}>
                <a className="lk" href={p.url} target="_blank" rel="noopener noreferrer">
                  {p.usage} · {p.key}
                </a>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
