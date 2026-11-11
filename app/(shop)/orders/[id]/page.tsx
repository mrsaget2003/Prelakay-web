"use client";

// Détail de commande — pageOrder du prototype (03-design §9.9) : carte de retrait
// (code à 6 chiffres, QR, itinéraire, échéance, frais de restockage [À CONFIRMER]),
// frise de suivi, articles, point de retrait ; reçu, avis, litige après retrait.

import Link from "next/link";
import { useParams } from "next/navigation";
import { prodBy, storeBy } from "@/lib/data/mock/seed";
import { productImage, storeImage } from "@/lib/data/mock/images";
import { DELIVERY_TIMELINE, ORDER_TIMELINE } from "@/lib/data/mock/content";
import { useDemo } from "@/lib/demo/store";
import { simulatePickup } from "@/lib/demo/actions";
import { formatHTG as htg } from "@/lib/format";
import { useToast } from "@/components/ui/Toast";
import { AccLayout, useRoute } from "@/components/proto/account";
import { DeliveryTrack } from "@/components/proto/delivery";
import { DisputeForm, Receipt, ReviewForm } from "@/components/proto/forms";
import { useModal } from "@/components/proto/modal";
import { DataIcon, Fi, Page404, Ph, Qr, StTag } from "@/components/proto/ui";

const LEVEL: Record<string, number> = { received: 0, prep: 1, ready: 2, done: 3, expired: 3, cancelled: 0 };
/** Livraison : Reçue → En préparation → Au livreur → En route → Livrée. */
const DLEVEL: Record<string, number> = { received: 0, prep: 1, handed: 2, enroute: 3, delivered: 4, cancelled: 0 };

export default function OrderPage() {
  const { id } = useParams<{ id: string }>();
  const s = useDemo();
  const toast = useToast();
  const modal = useModal();
  const route = useRoute();
  const o = s.orders.find((x) => x.id === id);
  if (!o) return <Page404 />;
  const st = storeBy(o.store)!;
  const del = o.mode === "delivery";
  const lvl = (del ? DLEVEL : LEVEL)[o.status] ?? 0;
  const TL = del ? DELIVERY_TIMELINE : ORDER_TIMELINE;
  const finished = o.status === "done" || o.status === "delivered";
  const simulate = () => {
    simulatePickup(o.id);
    toast.show("Commande retirée · +50 Coins", "success");
  };

  let top = null;
  if (o.status === "ready")
    top = (
      <div className="pick">
        <div>
          <h3>Prête pour retrait</h3>
          <p style={{ color: "var(--color-lagon-100)", fontSize: 13 }}>Présentez ce code ou le QR code au store.</p>
          <div className="code">{(o.code ?? "").replace(/(\d{3})(\d{3})/, "$1 $2")}</div>
          <span className="cd">
            <Fi r="clock" />À retirer avant le {o.due}
          </span>
          <div className="acts">
            <button className="btn btn-p btn-sm" onClick={() => route(st.id)}>
              <Fi s="diamond-turn-right" />
              Itinéraire
            </button>
            <button className="btn btn-s btn-sm" onClick={simulate}>
              <Fi s="qrcode" />
              Simuler le retrait
            </button>
          </div>
          <p style={{ fontSize: 12, color: "var(--color-lagon-100)", marginTop: 10 }}>
            Sans retrait après 3 jours : remboursement partiel sur votre wallet, moins des frais de restockage <i>(montant à confirmer)</i>.
          </p>
        </div>
        <div className="qr">
          <Qr seed={o.code ?? o.id} />
        </div>
      </div>
    );
  if (o.status === "handed" || o.status === "enroute") top = <DeliveryTrack o={o} />;
  if (finished)
    top = (
      <div className="panel">
        <div className="info-box">
          <Fi s="circle-check" />
          <span>{o.status === "delivered" ? "Livrée" : "Retirée"} le {o.date}. Vous pouvez ouvrir un litige pendant 3 jours.</span>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
          <button className="btn btn-s btn-sm" onClick={() => modal.open(`Reçu ${o.id}`, <Receipt order={o} />)}>
            <Fi s="receipt" />
            Reçu
          </button>
          {o.reviewed ? null : (
            <button className="btn btn-p btn-sm" onClick={() => modal.open("Votre avis", <ReviewForm order={o} />)}>
              <Fi r="star" />
              Laisser un avis
            </button>
          )}
          <button className="btn btn-s btn-sm" onClick={() => modal.open("Signaler un problème", <DisputeForm order={o} />)}>
            <Fi s="triangle-exclamation" />
            Signaler un problème
          </button>
        </div>
      </div>
    );
  if (o.status === "cancelled")
    top = (
      <div className="err-box">
        <Fi s="circle-exclamation" />
        <span>Le store a annulé la commande. Le montant a été remboursé sur votre wallet.</span>
      </div>
    );
  if (o.status === "expired")
    top = (
      <div className="err-box">
        <Fi s="circle-exclamation" />
        <span>Commande non retirée dans les 3 jours. Remboursée sur votre wallet, moins les frais de restockage (montant à confirmer).</span>
      </div>
    );
  if (o.status === "received" || o.status === "prep")
    top = (
      <div className="info-box">
        <Fi s="circle-info" />
        <span>{st.n} prépare votre commande. Vous recevrez une notification avec le code de {del ? "livraison" : "retrait"}.</span>
      </div>
    );

  return (
    <AccLayout k="orders" title={`Commande ${o.id}`}>
      {top}
      <div className="panel" style={{ marginTop: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
          <b>
            {o.id} · {o.date}
          </b>
          <StTag s={o.status} />
        </div>
        <div className="tl">
          {TL.map(([icon, label], i) => (
            <div key={label} className={i < lvl || finished ? "ok" : i === lvl ? "now" : ""}>
              <span>
                <DataIcon cls={icon} />
              </span>
              {label}
            </div>
          ))}
        </div>
      </div>
      <div className="panel">
        <h3>Articles</h3>
        {o.items.map((it, i) => {
          const p = prodBy(it.p)!;
          return (
            <div className="oc" style={{ padding: 0, margin: "0 0 8px" }} key={i}>
              <Link className="it" href={`/p/${p.id}`}>
                <Ph icon={p.icon} tint={p.tint} img={productImage(p.id, 160)} alt={p.n} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <b style={{ fontWeight: 500 }}>{p.n}</b>
                  <div className="cap">
                    {it.v} × {it.q}
                  </div>
                </div>
                <b className="tnum">{htg(p.price * it.q)}</b>
              </Link>
            </div>
          );
        })}
        <div className="hr" />
        {o.fee ? (
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span>Livraison · {o.addr?.zone}</span>
            <span className="tnum">{htg(o.fee)}</span>
          </div>
        ) : null}
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Total payé (wallet)</span>
          <b className="tnum">{htg(o.total + (o.fee ?? 0))}</b>
        </div>
      </div>
      {del ? (
        <div className="panel">
          <h3>Adresse de livraison</h3>
          <p>
            <b>{o.addr?.zone}</b> · {o.addr?.mark}
          </p>
          <p className="cap">Téléphone pour le livreur : {o.addr?.phone} · expédié par {st.n}</p>
        </div>
      ) : (
      <div className="panel">
        <h3>Point de retrait</h3>
        <div className="storebox">
          <Ph icon={st.i} tint="g4" cls="av" img={storeImage(st.id)} alt={st.n} />
          <div className="tx">
            <b>{st.n}</b>
            <div className="cap">
              {st.addr} · {st.hours}
            </div>
          </div>
          <button className="btn btn-s btn-sm" onClick={() => route(st.id)}>
            <Fi s="diamond-turn-right" />
            Itinéraire
          </button>
        </div>
      </div>
      )}
    </AccLayout>
  );
}
