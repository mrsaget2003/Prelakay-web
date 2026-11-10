"use client";

// Accueil vendeur — sHome du prototype : checklist « Prêt à vendre », À faire, solde,
// performances (graphiques : SellerHomeCharts), dernières commandes, actualités Prélakay.

import Link from "next/link";
import { prodBy } from "@/lib/data/mock/seed";
import { productImage } from "@/lib/data/mock/images";
import { useDemo } from "@/lib/demo/store";
import { myProducts, myStore, sellerFin, sellerOrders, todo } from "@/lib/demo/sellerActions";
import { formatHTG as htg } from "@/lib/format";
import { SHead, BUYER_URL } from "@/components/seller/shell";
import { OTag } from "@/components/seller/ui";
import { SellerHomeCharts } from "@/components/seller/charts";
import { Fi, Ph } from "@/components/proto/ui";

const NEWS: [string, string, string][] = [
  ["Pilote Les Cayes", "Les 30 premiers stores sont mis en avant dans « Nouveaux sur Prélakay ».", "6 nov."],
  ["Retrait en magasin", "Pensez à valider chaque retrait avec le code ou le QR de l'acheteur.", "4 nov."],
  ["Bientôt", "Coupons vendeurs et offres flash arrivent après le lancement.", "1 nov."],
];

export default function SellerHome() {
  const s = useDemo();
  const st = myStore(s);
  const T = todo(s);
  const F = sellerFin(s);
  const O = sellerOrders(s);
  const ready: [boolean, string, string][] = [
    [myProducts(s).length > 0, "Ajouter votre premier produit", "/seller/products/new"],
    [!!s.seller.policy, "Définir votre politique de retour", "/seller/policy"],
    [!!s.seller.payMethod, "Ajouter un moyen de retrait", "/seller/payouts"],
  ];
  const nDone = ready.filter((x) => x[0]).length;
  const tasks: [string, number, string, React.ReactNode][] = [
    ["À préparer", T.toPrep, "/seller/orders?tab=received", <Fi key="i" s="box-open" />],
    ["Prêtes, non retirées", T.ready, "/seller/orders?tab=ready", <Fi key="i" s="store" />],
    ["Questions sans réponse", T.q, "/seller/questions", <Fi key="i" r="circle-question" />],
    ["Litiges à traiter", T.d, "/seller/disputes", <Fi key="i" s="triangle-exclamation" />],
    ["Messages non lus", T.m, "/seller/messages", <Fi key="i" r="comment-dots" />],
    ["Stock bas", T.low, "/seller/stock", <Fi key="i" s="layer-group" />],
  ];
  return (
    <>
      <SHead title={`Bonjour, ${s.name.split("-")[0]}`} />
      <p className="sc-sub">
        {st.n} ·{" "}
        {st.trust ? (
          <span className="tag tag-new">
            <Fi s="circle-check" />
            Store de confiance
          </span>
        ) : (
          <Link href="/seller/trust" className="lk">
            Devenir store de confiance
          </Link>
        )}{" "}
        ·{" "}
        <a className="lk" href={`${BUYER_URL}/store/${st.id}`}>
          Voir mon store
        </a>
      </p>
      {nDone < 3 ? (
        <div className="panel s-ready">
          <div className="ph-h">
            <h2>Prêt à vendre</h2>
            <span className="cap">{nDone} sur 3</span>
          </div>
          <div className="prog">
            <i style={{ width: `${Math.round((nDone / 3) * 100)}%` }} />
          </div>
          {ready.map(([done, label, href]) => (
            <Link key={label} className="lrow" href={href}>
              {done ? <Fi s="circle-check" className="ok-c" /> : <Fi r="circle" />}
              <span className={done ? "done-t" : undefined}>{label}</span>
              <Fi s="chevron-right" />
            </Link>
          ))}
        </div>
      ) : null}
      <div className="s-grid2">
        <div className="panel">
          <div className="ph-h">
            <h2>À faire</h2>
            <Link href="/seller/orders">
              Toutes les commandes <Fi s="chevron-right" />
            </Link>
          </div>
          <div className="tasks">
            {tasks.map(([label, n, href, icon]) => (
              <Link key={label} className={`task${n ? " hot" : ""}`} href={href}>
                {icon}
                <b>{n}</b>
                <span>{label}</span>
              </Link>
            ))}
          </div>
        </div>
        <div className="panel s-bal">
          <div className="ph-h">
            <h2>Solde</h2>
            <Link href="/seller/finance">
              Détails <Fi s="chevron-right" />
            </Link>
          </div>
          <small>Disponible</small>
          <b className="tnum">{htg(F.avail)}</b>
          <div className="s-bal-r">
            <span>
              En escrow <b className="tnum">{htg(F.pending)}</b>
            </span>
            <span>Libération {st.trust ? "24 h" : "3 jours"} après retrait</span>
          </div>
          <Link className="btn btn-p btn-sm" href="/seller/payouts">
            Retirer
          </Link>
        </div>
      </div>
      <SellerHomeCharts />
      <div className="s-grid2">
        <div className="panel">
          <div className="ph-h">
            <h2>Dernières commandes</h2>
            <Link href="/seller/orders">
              Tout voir <Fi s="chevron-right" />
            </Link>
          </div>
          {O.length ? (
            O.slice(0, 5).map((o) => {
              const p = prodBy(o.items[0].p)!;
              return (
                <Link key={o.id} className="s-orow" href={`/seller/orders/${o.id}`}>
                  <Ph icon={p.icon} tint={p.tint} cls="mini" img={productImage(p.id, 120)} alt={p.n} />
                  <span>
                    <b>{o.id}</b>
                    <span className="cap">
                      {o.buyer} · {o.date}
                    </span>
                  </span>
                  <b className="tnum">{htg(o.total)}</b>
                  <OTag s={o.status} />
                </Link>
              );
            })
          ) : (
            <p className="muted">Aucune commande pour l&apos;instant.</p>
          )}
        </div>
        <div className="panel">
          <div className="ph-h">
            <h2>Actualités Prélakay</h2>
          </div>
          {NEWS.map(([b, p, d]) => (
            <div className="news" key={b}>
              <b>{b}</b>
              <p>{p}</p>
              <span className="cap">{d}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
