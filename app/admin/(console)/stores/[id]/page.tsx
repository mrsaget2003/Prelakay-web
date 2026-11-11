"use client";

// Fiche store — aStores(r.sub) du prototype : indicateurs, dernières commandes, badge de
// confiance, avertissement, suspension (produits masqués aux acheteurs).

import Link from "next/link";
import { useParams } from "next/navigation";
import { storeBy } from "@/lib/data/mock/seed";
import { storeImage } from "@/lib/data/mock/images";
import { useDemo } from "@/lib/demo/store";
import { asStore, storeState, storeSuspend, storeTrust, storeWarn } from "@/lib/demo/admin";
import { myProducts, sellerFin, sellerOrders, statusOf } from "@/lib/demo/sellerActions";
import { formatHTG as htg } from "@/lib/format";
import { useToast } from "@/components/ui/Toast";
import { AHead, useMe, BUYER_URL } from "@/components/admin/shell";
import { useDecide } from "@/components/admin/ui";
import { OTag } from "@/components/proto/tags";
import { Fi, Page404, Ph, fr1 } from "@/components/proto/ui";

export default function AdminStore() {
  const { id } = useParams<{ id: string }>();
  const s = useDemo();
  const me = useMe();
  const toast = useToast();
  const decide = useDecide();
  if (!storeBy(decodeURIComponent(id))) return <Page404 />;
  const x = storeState(s, decodeURIComponent(id));
  const v = asStore(s, x.id);
  const O = sellerOrders(v);
  const L = myProducts(v);
  const F = sellerFin(v);
  return (
    <>
      <AHead title={x.n} crumb={[["Stores", "/admin/stores"], [x.n]]} />
      <div className="s-grid2 wide">
        <div>
          <div className="panel">
            <div className="who">
              <Ph icon={x.i} tint="g4" cls="sav big" img={storeImage(x.id, 160)} alt={x.n} />
              <div>
                <b>{x.n}</b>
                <span className="cap">
                  {x.addr} · depuis {x.since}
                </span>
                <div className="row-b">
                  {x.suspended ? <span className="tag tag-err">Suspendu</span> : <span className="tag tag-ok">Actif</span>}
                  {x.trust ? <span className="tag tag-new">Store de confiance</span> : null}
                  <span className="tag tag-neu">{x.type === "physique" ? "Physique" : "En ligne"}</span>
                </div>
              </div>
            </div>
            <div className="kpi" style={{ margin: "12px 0 0" }}>
              {(
                [
                  ["Produits actifs", L.filter((p) => statusOf(v, p) === "active").length],
                  ["Commandes", O.length],
                  ["Note", x.rate ? fr1(x.rate) : "—"],
                  ["En escrow", htg(F.pending)],
                ] as [string, string | number][]
              ).map(([l, n]) => (
                <div key={l}>
                  <span className="cap">{l}</span>
                  <b className="tnum">{n}</b>
                </div>
              ))}
            </div>
          </div>
          <div className="panel">
            <h2 className="ph-t">Dernières commandes</h2>
            {O.slice(0, 5).map((o) => (
              <Link className="s-orow" key={o.id} href={`/admin/orders/${o.id}`}>
                <span>
                  <b>{o.id}</b>
                  <span className="cap">
                    {o.buyer} · {o.date}
                  </span>
                </span>
                <b className="tnum">{htg(o.total)}</b>
                <OTag s={o.status} />
              </Link>
            ))}
          </div>
        </div>
        <div>
          <div className="panel">
            <h3>Actions</h3>
            <label className="tgl">
              <span>
                Store de confiance
                <span className="cap" style={{ display: "block" }}>
                  Paiement libéré en {s.admin.settings.escrowTrust} h, badge visible
                </span>
              </span>
              <input
                type="checkbox"
                checked={x.trust}
                onChange={(e) => {
                  storeTrust(me, x.id, e.target.checked);
                  toast.show(e.target.checked ? "Badge « Store de confiance » accordé" : "Badge retiré");
                }}
              />
              <i />
            </label>
            <button
              className="lrow"
              onClick={() =>
                decide(`Avertir ${x.n}`, "Sujet", ["Délais de préparation trop longs", "Photos non conformes", "Réponses aux litiges en retard", "Autre"], (m, c) => {
                  storeWarn(me, x.id, m, c);
                  toast.show("Avertissement envoyé au store");
                })
              }
            >
              <Fi s="triangle-exclamation" />
              <span>Envoyer un avertissement</span>
              <Fi s="chevron-right" />
            </button>
            <a className="lrow" href={`${BUYER_URL}/store/${x.id}`}>
              <Fi r="eye" />
              <span>Voir le store public</span>
              <Fi s="chevron-right" />
            </a>
            <button
              className={`btn ${x.suspended ? "btn-p" : "btn-o"} btn-block`}
              style={{ marginTop: 12 }}
              onClick={() => {
                if (x.suspended) {
                  storeSuspend(me, x.id, null);
                  toast.show("Store réactivé", "success");
                } else
                  decide(`Suspendre ${x.n}`, "Motif", ["Fraude ou contrefaçon", "Litiges répétés", "Non-respect des règles de retrait", "Demande du propriétaire", "Autre"], (m) => {
                    storeSuspend(me, x.id, m);
                    toast.show("Store suspendu : ses produits sont masqués");
                  }, { hold: true });
              }}
            >
              {x.suspended ? "Réactiver le store" : "Suspendre le store"}
            </button>
            {x.suspended ? (
              <p className="cap" style={{ marginTop: 8 }}>
                Motif : {x.why}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}
