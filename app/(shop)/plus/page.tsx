"use client";

// Prélakay+ (ex-V2, actif dans le prototype) : abonnement à 1 500 HTG / mois payé par le wallet,
// badge or, réductions et events exclusifs (détails à confirmer).
// 13 nov. 2026 (unslop) : au lieu d'un bandeau à couronne et de 4 cartes à icône, l'écran montre
// ce que l'abonnement change pour de vrai — votre nom, tel qu'il apparaît sur vos avis et vos
// questions, avec le badge or. Les avantages sont une liste ; le bouton ne répète plus le prix.

import Link from "next/link";
import { useState } from "react";
import { useDemo } from "@/lib/demo/store";
import { PLUS_PERKS, PLUS_PRICE, cancelPlus, subscribePlus } from "@/lib/demo/growth";
import { formatHTG as htg } from "@/lib/format";
import { AccLayout } from "@/components/proto/account";
import { FieldErr, Fi, NeedLogin } from "@/components/proto/ui";

export default function Plus() {
  const s = useDemo();
  const [err, setErr] = useState<string | null>(null);
  if (!s.logged) return <NeedLogin what="Prélakay+" next="/plus" />;
  const on = s.growth.plus;
  return (
    <AccLayout k="plus" title="Prélakay+">
      <section className="panel plus-h">
        <div className="plus-tx">
          <h1>Prélakay+</h1>
          {on ? (
            <p className="plus-st">
              <b>Badge or actif.</b> Abonné depuis le {on.since}. Prochain paiement de <span className="tnum">{htg(PLUS_PRICE)}</span> le {on.next}, sur votre wallet.
            </p>
          ) : (
            <>
              <p className="plus-price">
                <b className="tnum">{htg(PLUS_PRICE)}</b> par mois
              </p>
              <p className="muted">Payé avec votre wallet. Sans engagement.</p>
              <button
                className="btn btn-p plus-go"
                onClick={() => {
                  // pas de toast : le badge s'active sous les yeux (tri des toasts, 10 nov. 2026)
                  setErr(subscribePlus());
                }}
              >
                S&apos;abonner
              </button>
              <FieldErr msg={err} />
              {err ? (
                <Link className="btn btn-s btn-sm" style={{ marginTop: 8 }} href="/wallet?topup=1">
                  Recharger le wallet
                </Link>
              ) : null}
            </>
          )}
        </div>

        {/* le moment : votre nom, comme les stores le voient */}
        <figure className={`plus-id${on ? " on" : ""}`}>
          <div className="plus-card">
            <span className="plus-av" aria-hidden="true">
              {s.name.charAt(0)}
            </span>
            <span className="plus-who">
              <b>@{s.user}</b>
              <span className="cap">{s.city}</span>
            </span>
            <span key={on ? "on" : "off"} className="bdg gold plus-bdg">
              <Fi s="crown" /> Prélakay+
            </span>
          </div>
          <figcaption className="cap">{on ? "Votre nom sur vos avis et vos questions" : "Votre nom sur vos avis et vos questions, avec Prélakay+"}</figcaption>
        </figure>
      </section>

      <section className="panel">
        <h2 className="ph-t">Ce que comprend l&apos;abonnement</h2>
        <dl className="plus-perks">
          {PLUS_PERKS.map(([, t, p]) => (
            <div key={t}>
              <dt>{t}</dt>
              <dd>{p}</dd>
            </div>
          ))}
        </dl>
        {on ? (
          <button className="lk plus-stop" onClick={() => cancelPlus()}>
            Résilier l&apos;abonnement
          </button>
        ) : null}
      </section>
    </AccLayout>
  );
}
