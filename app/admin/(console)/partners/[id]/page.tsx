"use client";

// Candidature de partenaire : informations, pièces, décision (accepter, refuser avec motif,
// demander des pièces). Chaque décision est journalisée.

import { useParams } from "next/navigation";
import { useDemo } from "@/lib/demo/store";
import { ORG_TYPES, PARTNER_ST, partnerById, partnerDecide } from "@/lib/demo/partners";
import { VEHICLES } from "@/lib/demo/partnerContent";
import { useToast } from "@/components/ui/Toast";
import { AHead, useMe } from "@/components/admin/shell";
import { useDecide } from "@/components/admin/ui";
import { Fi, Page404 } from "@/components/proto/ui";

const label = (list: [string, string][], k?: string) => list.find(([x]) => x === k)?.[1] ?? k ?? "—";

export default function PartnerFile() {
  const { id } = useParams<{ id: string }>();
  const s = useDemo();
  const me = useMe();
  const toast = useToast();
  const decide = useDecide();
  const p = partnerById(me.role, s, decodeURIComponent(id));
  if (!p) return <Page404 />;
  const del = p.kind === "delivery";
  const open = !["ok", "rej"].includes(p.st);
  const run = (st: "ok" | "rej" | "docs" | "verif", why = "", msg = "") => {
    const err = partnerDecide(me, p.id, st, why);
    toast.show(err ?? msg, err ? "error" : "success");
  };
  return (
    <>
      <AHead title={`${p.id} · ${p.org ?? p.name}`} crumb={[["Partenaires", "/admin/partners"], [p.id]]} />
      <div className="s-grid2 wide">
        <div className="panel">
          <div className="ph-h">
            <h2>{del ? "Partenaire de livraison" : "Partenaire de paiement"}</h2>
            <span className={`tag ${PARTNER_ST[p.st][0]}`}>{PARTNER_ST[p.st][1]}</span>
          </div>
          {p.why ? (
            <div className="err-box" style={{ margin: "12px 0" }}>
              <Fi s="circle-exclamation" />
              <span>Motif : {p.why}</span>
            </div>
          ) : null}
          <dl className="kv" style={{ marginTop: 12 }}>
            {p.org ? (
              <>
                <dt>Organisation</dt>
                <dd>{p.org}</dd>
                <dt>Type</dt>
                <dd>{label(ORG_TYPES, p.orgType)}</dd>
              </>
            ) : null}
            <dt>{p.who === "company" && del ? "Société" : "Contact"}</dt>
            <dd>{p.name}</dd>
            <dt>Téléphone</dt>
            <dd>{p.phone}</dd>
            <dt>E-mail</dt>
            <dd>{p.email || "—"}</dd>
            {del ? (
              <>
                {p.dob ? (
                  <>
                    <dt>Date de naissance</dt>
                    <dd>{p.dob}</dd>
                  </>
                ) : null}
                <dt>Quartier</dt>
                <dd>{p.zone}</dd>
                <dt>Véhicule</dt>
                <dd>{label(VEHICLES, p.vehicle)}</dd>
                <dt>Disponibilités</dt>
                <dd>{p.avail || "—"}</dd>
                <dt>Pièce d&apos;identité</dt>
                <dd>{p.docs ? "Recto et verso reçus (démo)" : "Manquante"}</dd>
              </>
            ) : (
              <>
                <dt>Volume ou réseau</dt>
                <dd>{p.volume || "—"}</dd>
              </>
            )}
            <dt>Reçue le</dt>
            <dd>{p.date}</dd>
          </dl>
          {p.msg ? <p className="reply">{p.msg}</p> : null}
        </div>
        <div className="panel">
          <h2 className="ph-t">Décision</h2>
          {open ? (
            <div style={{ display: "grid", gap: 8 }}>
              {p.st === "recu" ? (
                <button className="btn btn-o btn-block" onClick={() => run("verif", "", "Candidature en vérification")}>
                  <Fi s="magnifying-glass" />
                  Passer en vérification
                </button>
              ) : null}
              <button className="btn btn-p btn-block" onClick={() => run("ok", "", "Candidature acceptée : le partenaire est prévenu")}>
                <Fi s="circle-check" />
                Accepter
              </button>
              <button
                className="btn btn-o btn-block"
                onClick={() => decide(`Demander des pièces · ${p.id}`, "Pièce demandée", ["Pièce d'identité lisible", "Permis de conduire", "Agrément de l'activité", "Autre"], (m, c) => run("docs", c ? `${m} — ${c}` : m, "Demande envoyée au partenaire"))}
              >
                <Fi s="upload" />
                Demander des pièces
              </button>
              <button
                className="btn btn-o btn-block"
                onClick={() => decide(`Refuser · ${p.id}`, "Motif", ["Pièces invalides", "Zone non couverte", "Activité non conforme", "Autre"], (m, c) => run("rej", c ? `${m} — ${c}` : m, "Candidature refusée. Le motif est envoyé."))}
              >
                <Fi s="ban" />
                Refuser
              </button>
            </div>
          ) : (
            <p className="muted">Décision prise : {PARTNER_ST[p.st][1].toLowerCase()}.</p>
          )}
        </div>
      </div>
    </>
  );
}
