"use client";

// Détail d'une commande du store — sOrder du prototype : étapes, action suivante, articles,
// acheteur (message), retrait, bon de préparation.

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { prodBy } from "@/lib/data/mock/seed";
import { productImage } from "@/lib/data/mock/images";
import { useDemo } from "@/lib/demo/store";
import { handToDriver, myStore, noShow, openChat, orderById, prepOrder, readyOrder } from "@/lib/demo/sellerActions";
import { formatHTG as htg } from "@/lib/format";
import { useToast } from "@/components/ui/Toast";
import { SHead } from "@/components/seller/shell";
import { OTag } from "@/components/proto/tags";
import { useCancelOrder } from "@/components/seller/orders";
import { EmptyBox, Fi, Ph } from "@/components/proto/ui";

const STEPS = [["receipt", "Reçue"], ["box", "En préparation"], ["store", "Prête"], ["check", "Retirée"]] as const;
const LVL: Record<string, number> = { received: 0, prep: 1, ready: 2, done: 3, expired: 3, cancelled: 0 };
/** Livraison (10 nov. 2026) : Reçue → En préparation → Au livreur → En route → Livrée. */
const DSTEPS = [["receipt", "Reçue"], ["box", "En préparation"], ["box-open", "Au livreur"], ["truck", "En route"], ["check", "Livrée"]] as const;
const DLVL: Record<string, number> = { received: 0, prep: 1, handed: 2, enroute: 3, delivered: 4, cancelled: 0 };

export default function SellerOrder() {
  const { id } = useParams<{ id: string }>();
  const s = useDemo();
  const router = useRouter();
  const toast = useToast();
  const cancel = useCancelOrder();
  const st = myStore(s);
  const o = orderById(s, decodeURIComponent(id));
  if (!o)
    return (
      <>
        <SHead title="Commande introuvable" />
        <EmptyBox icon={<Fi s="receipt" />} t="Commande introuvable">
          <Link className="btn btn-p" href="/seller/orders">
            Mes commandes
          </Link>
        </EmptyBox>
      </>
    );
  const del = o.mode === "delivery";
  const lvl = (del ? DLVL : LVL)[o.status] ?? 0;
  const steps = del ? DSTEPS : STEPS;
  const finished = o.status === "done" || o.status === "delivered";
  const cancelBtn = (
    <button className="btn btn-o" onClick={() => cancel(o.id)}>
      Annuler (rupture)
    </button>
  );
  const next =
    o.status === "received" ? (
      <div className="s-next">
        <div>
          <b>Nouvelle commande</b>
          <span className="cap">
            {del
              ? `Livraison à ${o.addr?.zone} : préparez les articles, puis remettez la commande au livreur.`
              : "Préparez les articles, puis marquez la commande comme prête. L'acheteur reçoit alors son code de retrait."}
          </span>
        </div>
        <button
          className="btn btn-p"
          onClick={() => {
            prepOrder(o.id);
            toast.show(`Commande ${o.id} en préparation`);
          }}
        >
          Commencer la préparation
        </button>
        {cancelBtn}
      </div>
    ) : o.status === "prep" && del ? (
      <div className="s-next">
        <div>
          <b>En préparation · livraison</b>
          <span className="cap">
            {o.addr?.zone} · {o.addr?.mark} · {o.addr?.phone}
          </span>
        </div>
        <button
          className="btn btn-p"
          onClick={() => {
            const err = handToDriver(o.id);
            toast.show(err ?? "Remise au livreur : l'acheteur suit sa commande", err ? "error" : "success");
          }}
        >
          <Fi s="truck" />
          Remettre au livreur
        </button>
        {cancelBtn}
      </div>
    ) : o.status === "handed" || o.status === "enroute" ? (
      <div className="info-box">
        <Fi s="truck" />
        <span>
          {o.status === "handed" ? "Remise au livreur" : "En route"} · {o.driver?.n} ({o.driver?.tel}). Le paiement est libéré après la saisie du code de livraison (délai à confirmer).
        </span>
      </div>
    ) : o.status === "delivered" ? (
      <div className="info-box">
        <Fi s="circle-check" />
        <span>Livrée à {o.addr?.zone}. Paiement en escrow, libéré selon la règle de livraison (à confirmer).</span>
      </div>
    ) : o.status === "prep" ? (
      <div className="s-next">
        <div>
          <b>En préparation</b>
          <span className="cap">Quand tout est prêt au comptoir, marquez la commande comme prête.</span>
        </div>
        <button
          className="btn btn-p"
          onClick={() => {
            readyOrder(o.id);
            toast.show("Prête : l'acheteur a reçu son code de retrait", "success");
          }}
        >
          Marquer prête pour retrait
        </button>
        {cancelBtn}
      </div>
    ) : o.status === "ready" ? (
      <div className="s-next">
        <div>
          <b>En attente de l&apos;acheteur</b>
          <span className="cap">À retirer avant le {o.due}. Rappels envoyés à J+1 et J+2.</span>
        </div>
        <Link className="btn btn-p" href={`/seller/pickup?id=${o.id}`}>
          <Fi s="qrcode" />
          Valider le retrait
        </Link>
        <button
          className="btn btn-o"
          onClick={() => {
            noShow(o.id);
            toast.show("Commande non retirée : stock remis à jour");
          }}
        >
          Simuler le délai dépassé
        </button>
      </div>
    ) : o.status === "done" ? (
      <div className="info-box">
        <Fi s="circle-check" />
        <span>Retirée. Paiement {o.rel ? "libéré sur votre solde." : `en escrow, libéré ${st.trust ? "24 h" : "3 jours"} après le retrait si aucun litige n'est ouvert.`}</span>
      </div>
    ) : o.status === "expired" ? (
      <div className="err-box">
        <Fi s="circle-exclamation" />
        <span>Non retirée dans les 3 jours. L&apos;acheteur est remboursé moins les frais de restockage (montant à confirmer) ; le stock a été remis à jour.</span>
      </div>
    ) : (
      <div className="err-box">
        <Fi s="circle-exclamation" />
        <span>Annulée par le store. L&apos;acheteur a été remboursé sur son wallet.</span>
      </div>
    );
  return (
    <>
      <SHead title={`Commande ${o.id}`} crumb={[["Commandes", "/seller/orders"], [o.id]]} />
      <div className="s-grid2 wide">
        <div>
          <div className="panel">
            <div className="ph-h">
              <h2>{o.id}</h2>
              <OTag s={o.status} />
            </div>
            <div className="tl">
              {steps.map(([i, l], k) => (
                <div key={l} className={o.status === "cancelled" ? "" : k < lvl || (finished && k === steps.length - 1) ? "ok" : k === lvl ? "now" : ""}>
                  <span>
                    <Fi s={i} />
                  </span>
                  {l}
                </div>
              ))}
            </div>
            <div style={{ marginTop: 16 }}>{next}</div>
          </div>
          <div className="panel">
            <h2 className="ph-t">Articles</h2>
            {o.items.map((it, k) => {
              const p = prodBy(it.p)!;
              return (
                <div className="s-orow st" key={k}>
                  <Ph icon={p.icon} tint={p.tint} cls="mini" img={productImage(p.id, 120)} alt={p.n} />
                  <span>
                    <b>{p.n}</b>
                    <span className="cap">
                      {it.v} · {htg(p.price)} × {it.q}
                    </span>
                  </span>
                  <b className="tnum">{htg(p.price * it.q)}</b>
                </div>
              );
            })}
            <div className="hr" />
            <div className="ln2">
              <span>Total payé par wallet</span>
              <b className="tnum">{htg(o.total)}</b>
            </div>
            <div className="ln2 cap">
              <span>Commission Prélakay</span>
              <span>taux à confirmer</span>
            </div>
          </div>
        </div>
        <div>
          <div className="panel">
            <h3>Acheteur</h3>
            <div className="who2">
              <span className="ava">{o.buyer[1].toUpperCase()}</span>
              <span>
                <b>{o.buyer}</b>
                <span className="cap">Commande du {o.date}</span>
              </span>
            </div>
            <button className="btn btn-o btn-sm btn-block" onClick={() => router.push(`/seller/messages/${openChat(o.buyer, o.id)}`)}>
              <Fi r="comment-dots" />
              Envoyer un message
            </button>
          </div>
          <div className="panel">
            <h3>Retrait</h3>
            <p className="cap" style={{ marginBottom: 8 }}>
              {st.addr} · {st.hours}
            </p>
            {o.status === "ready" ? (
              <p>L&apos;acheteur présente son code à 6 chiffres ou son QR code. Vérifiez-le dans « Valider un retrait ».</p>
            ) : o.status === "done" ? (
              <p>Retirée le {o.picked || o.date}.</p>
            ) : (
              <p className="muted">Le code de retrait est créé quand la commande est prête.</p>
            )}
          </div>
          <div className="panel">
            <button className="lrow" onClick={() => toast.show("Bon de préparation envoyé à l'impression")}>
              <Fi s="print" />
              Imprimer le bon de préparation
              <Fi s="chevron-right" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
