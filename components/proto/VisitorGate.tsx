"use client";

// Invitation bloquante du quota visiteur (12 nov. 2026, modèle app AliExpress) : après N fiches
// produit sans compte, la fiche suivante demande de créer un compte. Le produit reste visible en
// aperçu (photo floutée, nom) pour que l'invitation dise ce qu'on débloque.

import Link from "next/link";
import type { Product } from "@/lib/data/mock/seed";
import { productImage } from "@/lib/data/mock/images";
import { Fi, Ph } from "./ui";

export function VisitorGate({ p, quota }: { p: Product; quota: number }) {
  const next = encodeURIComponent(`/p/${p.id}`);
  return (
    <div className="wrap">
      <section className="vgate" aria-labelledby="vgate-t">
        <div className="vgate-pv" aria-hidden="true">
          <Ph icon={p.icon} tint={p.tint} img={productImage(p.id, 480)} alt="" sizes="(max-width: 767px) 100vw, 360px" />
        </div>
        <div className="vgate-tx">
          <span className="vgate-n">{p.n}</span>
          <h1 id="vgate-t">Créez un compte pour voir ce produit</h1>
          <p className="muted">
            Vous avez consulté {quota} fiches sans compte. L&apos;inscription est gratuite et prend une minute : vous voyez ensuite tous
            les produits, leurs prix et les stores proches.
          </p>
          <Link className="btn btn-p btn-block" href={`/signup?next=${next}`}>
            Créer un compte
          </Link>
          <Link className="btn btn-o btn-block" href={`/login?next=${next}`}>
            J&apos;ai déjà un compte
          </Link>
          <Link className="vgate-back" href="/">
            <Fi s="arrow-left" />
            Retour à l&apos;accueil
          </Link>
        </div>
      </section>
    </div>
  );
}
