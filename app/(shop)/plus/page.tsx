"use client";

// Prélakay+ (ex-V2, actif dans le prototype) : abonnement à 1 500 HTG / mois payé par le wallet,
// badge or, réductions et events exclusifs (détails à confirmer).

import Link from "next/link";
import { useDemo } from "@/lib/demo/store";
import { PLUS_PERKS, PLUS_PRICE, cancelPlus, subscribePlus } from "@/lib/demo/growth";
import { formatHTG as htg } from "@/lib/format";
import { useToast } from "@/components/ui/Toast";
import { AccLayout } from "@/components/proto/account";
import { DataIcon, FieldErr, Fi, NeedLogin } from "@/components/proto/ui";
import { useState } from "react";

export default function Plus() {
  const s = useDemo();
  const toast = useToast();
  const [err, setErr] = useState<string | null>(null);
  if (!s.logged) return <NeedLogin what="Prélakay+" next="/plus" />;
  const on = s.growth.plus;
  return (
    <AccLayout k="plus" title="Prélakay+">
      <section className="pt-hero plus">
        <div>
          <h1>Prélakay+</h1>
          <p>
            {on ? `Abonné depuis le ${on.since} · prochain paiement le ${on.next}.` : `${htg(PLUS_PRICE)} par mois, payé avec votre wallet. Sans engagement.`}
          </p>
          {on ? (
            <span className="bdg gold">
              <Fi s="crown" /> Badge or actif
            </span>
          ) : (
            <>
              <button
                className="btn btn-p"
                onClick={() => {
                  const r = subscribePlus();
                  setErr(r);
                  if (!r) toast.show("Bienvenue dans Prélakay+ : votre badge or est actif", "success");
                }}
              >
                S&apos;abonner · {htg(PLUS_PRICE)} / mois
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
        <span className="pt-hi" aria-hidden="true">
          <Fi s="crown" />
        </span>
      </section>
      <div className="pt-cards">
        {PLUS_PERKS.map(([i, t, p]) => (
          <div className="panel pt-card" key={t}>
            <span className="pt-ic">
              <DataIcon cls={i} />
            </span>
            <h3>{t}</h3>
            <p>{p}</p>
          </div>
        ))}
      </div>
      {on ? (
        <button className="lk" style={{ marginTop: 12 }} onClick={() => cancelPlus()}>
          Résilier l&apos;abonnement
        </button>
      ) : null}
    </AccLayout>
  );
}
