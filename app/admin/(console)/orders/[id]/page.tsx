"use client";

// Commande — aOrders(r.sub) du prototype : étapes, articles, escrow, parties, annulation support.

import Link from "next/link";
import { useParams } from "next/navigation";
import { prodBy, storeBy } from "@/lib/data/mock/seed";
import { productImage } from "@/lib/data/mock/images";
import { useDemo } from "@/lib/demo/store";
import { orderAt, orderCancel } from "@/lib/demo/admin";
import { formatHTG as htg } from "@/lib/format";
import { useToast } from "@/components/ui/Toast";
import { AHead, useMe } from "@/components/admin/shell";
import { useDecide } from "@/components/admin/ui";
import { OTag } from "@/components/proto/tags";
import { Fi, Page404, Ph } from "@/components/proto/ui";

const STEPS = [["receipt", "Reçue"], ["box", "En préparation"], ["store", "Prête"], ["check", "Retirée"]] as const;
const LVL: Record<string, number> = { received: 0, prep: 1, ready: 2, done: 3, expired: 3, cancelled: 0 };

export default function AdminOrder() {
  const { id } = useParams<{ id: string }>();
  const s = useDemo();
  const me = useMe();
  const toast = useToast();
  const decide = useDecide();
  const o = orderAt(s, decodeURIComponent(id));
  if (!o) return <Page404 />;
  const st = storeBy(o.store)!;
  const lvl = LVL[o.status];
  const escrow = o.status === "done" ? (o.rel ? "libéré au store" : "retenu jusqu'à libération") : o.status === "cancelled" || o.status === "expired" ? "remboursé à l'acheteur" : "retenu";
  return (
    <>
      <AHead title={`Commande ${o.id}`} crumb={[["Commandes", "/admin/orders"], [o.id]]} />
      <div className="s-grid2 wide">
        <div>
          <div className="panel">
            <div className="ph-h">
              <h2>{o.id}</h2>
              <OTag s={o.status} />
            </div>
            <div className="tl">
              {STEPS.map(([i, l], k) => (
                <div key={l} className={o.status === "cancelled" ? "" : k < lvl || (o.status === "done" && k === 3) ? "ok" : k === lvl ? "now" : ""}>
                  <span>
                    <Fi s={i} />
                  </span>
                  {l}
                </div>
              ))}
            </div>
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
              <span>Total (wallet)</span>
              <b className="tnum">{htg(o.total)}</b>
            </div>
            <div className="ln2 cap">
              <span>Escrow</span>
              <span>{escrow}</span>
            </div>
          </div>
        </div>
        <div>
          <div className="panel">
            <h3>Parties</h3>
            <Link className="lrow" href={`/admin/users/${encodeURIComponent(o.buyer.slice(1))}`}>
              <Fi r="user" />
              <span>
                {o.buyer}
                <span className="cap" style={{ display: "block" }}>
                  Acheteur
                </span>
              </span>
              <Fi s="chevron-right" />
            </Link>
            <Link className="lrow" href={`/admin/stores/${st.id}`}>
              <Fi s="store" />
              <span>
                {st.n}
                <span className="cap" style={{ display: "block" }}>
                  Store
                </span>
              </span>
              <Fi s="chevron-right" />
            </Link>
          </div>
          {["received", "prep", "ready"].includes(o.status) ? (
            <div className="panel">
              <h3>Support</h3>
              <button
                className="btn btn-o btn-block"
                onClick={() =>
                  decide(`Annuler ${o.id}`, "Motif", ["Store injoignable", "Article indisponible", "Demande de l'acheteur", "Autre"], (m) => {
                    orderCancel(me, o.id, m);
                    toast.show("Commande annulée, acheteur remboursé");
                  }, { hold: true })
                }
              >
                Annuler et rembourser l&apos;acheteur
              </button>
              <p className="cap" style={{ marginTop: 8 }}>
                À utiliser si le store ne répond plus.
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
