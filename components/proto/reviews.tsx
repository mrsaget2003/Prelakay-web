"use client";

// Avis clients (reviewsHtml du prototype) : note, répartition, 3 critères, filtres,
// avis avec choix acheté, photos, réponse du store, Utile / Signaler.

import Link from "next/link";
import { useState } from "react";
import { selLabel, type Product } from "@/lib/data/mock/seed";
import { REVS } from "@/lib/data/mock/content";
import { demo, useDemo } from "@/lib/demo/store";
import { selOf } from "@/lib/demo/actions";
import { useToast } from "@/components/ui/Toast";
import { EmptyBox, Fi, Ph, Stars, fr1 } from "./ui";

export function Reviews({ rating, reviews, product, full = false }: { rating: number; reviews: number; product?: Product; full?: boolean }) {
  const s = useDemo();
  const toast = useToast();
  const [f, setF] = useState("all");
  const [helpful, setHelpful] = useState<Record<number, boolean>>({});
  if (!reviews) return <EmptyBox icon={<Fi r="star" />} t="Pas encore d'avis" p="Seuls les acheteurs qui ont retiré leur commande peuvent laisser un avis." />;
  const dist = [0.72, 0.18, 0.06, 0.03, 0.01];
  let L = REVS.filter((r) => f === "all" || (f === "photo" && r[4]) || +f === r[1]);
  if (!full) L = L.slice(0, 3);
  const choice = product ? selLabel(product, selOf(product, s).o) : "achat vérifié";
  return (
    <>
      <div className="rv-top">
        <div className="rv-score">
          <b>{fr1(rating)}</b>
          <div className="stars">
            <Stars r={rating} />
          </div>
          <span className="cap nw">{reviews} avis vérifiés</span>
        </div>
        <div className="rv-dist">
          {dist.map((d, i) => (
            <div key={i}>
              <span className="nw">
                {5 - i} étoile{5 - i > 1 ? "s" : ""}
              </span>
              <i>
                <em style={{ width: `${Math.round(d * 100)}%` }} />
              </i>
              <span>{Math.round(d * 100)} %</span>
            </div>
          ))}
        </div>
        <div className="crit">
          {([["Conformité", rating], ["Accueil du store", Math.min(5, rating + 0.1)], ["Qualité-prix", Math.max(3.8, rating - 0.2)]] as const).map(([l, v]) => (
            <div key={l}>
              <b>{fr1(v)}</b>
              {l}
            </div>
          ))}
        </div>
      </div>
      <div className="rv-f">
        {[["all", "Tous"], ["photo", "Avec photos"], ["5", "5 ★"], ["4", "4 ★"], ["3", "3 ★"]].map(([v, l]) => (
          <button key={v} className={`chip ${f === v ? "on" : ""}`} onClick={() => setF(v)}>
            {l}
          </button>
        ))}
      </div>
      {L.length ? (
        L.map((r, i) => (
          <article className="rv" key={r[0]}>
            <div className="rv-h">
              <span className="ava">{r[0][1].toUpperCase()}</span>
              <div>
                <b>{r[0]}</b>
                <span className="cap">
                  il y a {i * 4 + 2} jours · {choice}
                </span>
              </div>
              <span className="tag tag-ok">
                <Fi s="check" />
                Achat vérifié
              </span>
            </div>
            <div className="stars">
              <Stars r={r[1]} />
            </div>
            <p>{r[2]}</p>
            {r[4] ? (
              <div className="rv-ph">
                <Ph icon={<Fi r="image" />} tint="g1" />
                <Ph icon={<Fi r="image" />} tint="g5" />
              </div>
            ) : null}
            {r[3] ? (
              <div className="reply">
                <b>Réponse du store :</b> {r[3]}
              </div>
            ) : null}
            <div className="acts">
              <button
                className={helpful[i] ? "on" : ""}
                onClick={() => {
                  setHelpful((h) => ({ ...h, [i]: !h[i] }));
                  toast.show(!helpful[i] ? "Merci pour votre retour" : "Retour retiré", "success");
                }}
              >
                <Fi r="thumbs-up" />
                Utile
              </button>
              <button
                onClick={() => {
                  demo.update((d) => {
                    d.reports.unshift({ id: `SG-${400 + d.reports.length}`, type: "avis", target: product?.id ?? "", reason: "Avis abusif ou faux", by: `@${d.user}`, date: "6 nov. 2026", st: "open" });
                  });
                  toast.show("Avis signalé à la modération", "success");
                }}
              >
                <Fi r="flag" />
                Signaler
              </button>
            </div>
          </article>
        ))
      ) : (
        <p className="muted" style={{ padding: "16px 0" }}>Aucun avis dans ce filtre.</p>
      )}
      {!full && product ? (
        <Link className="btn btn-o btn-block" style={{ marginTop: 12 }} href={`/p/${product.id}/reviews`}>
          Voir les {reviews} avis
        </Link>
      ) : null}
    </>
  );
}
