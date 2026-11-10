"use client";

// Dossier KYC — aKyc(r.sub) du prototype : étapes, données (NIF / NINU masqués), pièce
// d'identité, contrôles automatiques, décision.

import { useParams } from "next/navigation";
import { catBy } from "@/lib/data/mock/seed";
import { useDemo } from "@/lib/demo/store";
import { kycApprove, kycList, kycReject, kycTake } from "@/lib/demo/admin";
import { maskId } from "@/lib/domain/admin";
import { useToast } from "@/components/ui/Toast";
import { useModal } from "@/components/proto/modal";
import { AHead, useMe } from "@/components/admin/shell";
import { KTag, useDecide } from "@/components/admin/ui";
import { Fi, Page404, Ph } from "@/components/proto/ui";

const STEPS = [["receipt", "Reçu"], ["magnifying-glass", "En vérification"], ["circle-check", "Approuvé"]] as const;
const LV: Record<string, number> = { recu: 0, verif: 1, ok: 2, rej: 2 };

export default function KycFile() {
  const { id } = useParams<{ id: string }>();
  const s = useDemo();
  const me = useMe();
  const toast = useToast();
  const modal = useModal();
  const decide = useDecide();
  const k = kycList(s).find((x) => x.id === decodeURIComponent(id));
  if (!k) return <Page404 />;
  const lv = LV[k.st];
  const checks: [string, boolean, string][] = [
    ["Âge ≥ 18 ans", k.age >= 18, `${k.age} ans`],
    ["NIF : format valide", true, "10 chiffres"],
    ["NINU : format valide", true, "10 chiffres"],
    ["Nom identique sur la pièce", !k.flag, k.flag ? "à vérifier" : "conforme"],
    ["Pas de doublon (NIF déjà utilisé)", true, "aucun"],
  ];
  const reject = () =>
    decide(`Rejeter le dossier ${k.id}`, "Motif", ["Pièce d'identité illisible", "Âge inférieur à 18 ans", "NIF ou NINU invalide", "Informations incohérentes", "Autre"], (m, c) => {
      kycReject(me, k.id, m, c);
      toast.show("Dossier rejeté. Le motif est envoyé.");
    });
  return (
    <>
      <AHead title={`${k.id} · ${k.store}`} crumb={[["Dossiers KYC", "/admin/kyc"], [k.id]]} />
      <div className="s-grid2 wide">
        <div>
          <div className="panel">
            <div className="ph-h">
              <h2>Dossier</h2>
              <KTag st={k.st} />
            </div>
            <div className="tl kyc-st">
              {STEPS.map(([i, l], n) => (
                <div key={l} className={n < lv || (n === lv && n === 2) ? "ok" : n === lv ? "now" : ""}>
                  <span>
                    <Fi s={i} />
                  </span>
                  {n === 2 && k.st === "rej" ? "Rejeté" : l}
                </div>
              ))}
            </div>
            {k.flag ? (
              <div className="err-box" style={{ margin: "12px 0" }}>
                <Fi s="triangle-exclamation" />
                <span>{k.flag}</span>
              </div>
            ) : null}
            {k.why ? (
              <div className="err-box" style={{ margin: "12px 0" }}>
                <Fi s="circle-exclamation" />
                <span>Motif du rejet : {k.why}</span>
              </div>
            ) : null}
            <dl className="kv" style={{ marginTop: 12 }}>
              <dt>Prénom et nom</dt>
              <dd>
                {k.fn} {k.ln}
              </dd>
              <dt>Âge</dt>
              <dd>{k.age} ans</dd>
              <dt>NIF</dt>
              <dd>{k.nif ? maskId(k.nif, "nif") : "004 ••• ••21"}</dd>
              <dt>NINU</dt>
              <dd>{k.ninu ? maskId(k.ninu, "ninu") : "12 ••• •••88"}</dd>
              <dt>Store</dt>
              <dd>
                {k.store} ({k.type === "physique" ? "physique" : "en ligne"})
              </dd>
              <dt>Catégorie</dt>
              <dd>{catBy(k.cat)?.n}</dd>
              <dt>Adresse</dt>
              <dd>{k.addr}</dd>
              <dt>Reçu le</dt>
              <dd>{k.date}</dd>
            </dl>
            <p className="cap" style={{ marginTop: 10 }}>
              NIF et NINU masqués : affichage complet réservé au rôle Superadmin et journalisé.
            </p>
          </div>
          <div className="panel">
            <h2 className="ph-t">Pièce d&apos;identité</h2>
            <div className="docs">
              {["Recto", "Verso"].map((x, i) => (
                <button
                  key={x}
                  className="doc"
                  onClick={() =>
                    modal.open(
                      `Pièce d'identité · ${x}`,
                      <>
                        <Ph icon={<Fi r="id-card" />} tint="g1" cls="docbig" />
                        <p className="cap" style={{ marginTop: 10 }}>
                          Prototype : document fictif. En production, le fichier est servi par URL signée de courte durée, jamais public.
                        </p>
                      </>,
                    )
                  }
                >
                  <Ph icon={<Fi r="id-card" />} tint={i ? "g5" : "g1"} />
                  <span>{x}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        <div>
          <div className="panel">
            <h3>Contrôles</h3>
            {checks.map(([l, ok, d]) => (
              <div className="lrow st" key={l}>
                {ok ? <Fi s="circle-check" className="ok-c" /> : <Fi s="circle-xmark" className="err-t" />}
                <span>
                  {l}
                  <span className="cap" style={{ display: "block" }}>
                    {d}
                  </span>
                </span>
              </div>
            ))}
          </div>
          {k.st === "recu" || k.st === "verif" ? (
            <div className="panel">
              <h3>Décision</h3>
              <div className="row-b">
                {k.st === "recu" ? (
                  <button
                    className="btn btn-p"
                    onClick={() => {
                      kycTake(me, k.id);
                      toast.show("Dossier en vérification");
                    }}
                  >
                    Prendre en charge
                  </button>
                ) : (
                  <>
                    <button
                      className="btn btn-p"
                      onClick={() => {
                        kycApprove(me, k.id);
                        toast.show("Dossier approuvé. Le vendeur est prévenu.", "success");
                      }}
                    >
                      <Fi s="check" />
                      Approuver
                    </button>
                    <button className="btn btn-o" onClick={reject}>
                      Rejeter
                    </button>
                  </>
                )}
              </div>
              <p className="cap" style={{ marginTop: 10 }}>
                Le vendeur est prévenu par l&apos;app, WhatsApp et e-mail.
              </p>
            </div>
          ) : null}
          {k.mine ? (
            <div className="info-box">
              <Fi s="circle-info" />
              <span>Prototype : c&apos;est votre propre dossier, envoyé depuis « Enregistrer son commerce ».</span>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
