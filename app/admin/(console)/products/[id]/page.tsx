"use client";

// Modération d'un produit — aProducts(r.sub) du prototype : aperçu acheteur, store, grille de
// contrôle, décision (approuver / rejeter avec motif).

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { TINTS, catBy, optsOf, storeBy } from "@/lib/data/mock/seed";
import { productImage, storeImage } from "@/lib/data/mock/images";
import { useDemo, type SellerProduct } from "@/lib/demo/store";
import { modProduct, pStatusOf, productApprove, productReject } from "@/lib/demo/admin";
import { whyOf } from "@/lib/demo/sellerActions";
import { stockTotal } from "@/lib/demo/seller";
import { formatHTG as htg } from "@/lib/format";
import { useToast } from "@/components/ui/Toast";
import { AHead, useMe } from "@/components/admin/shell";
import { useDecide } from "@/components/admin/ui";
import { PTag } from "@/components/proto/tags";
import { Fi, Page404, Ph } from "@/components/proto/ui";

const CHECKS = ["Photos réelles du produit (pas de visuel générique)", "Titre et catégorie cohérents", "Prix cohérent avec la catégorie", "Produit autorisé à la vente", "Caractéristiques et stock renseignés"];

export default function ModProduct() {
  const { id } = useParams<{ id: string }>();
  const s = useDemo();
  const me = useMe();
  const router = useRouter();
  const toast = useToast();
  const decide = useDecide();
  const p = modProduct(s, decodeURIComponent(id));
  if (!p) return <Page404 />;
  const st = storeBy(p.store)!;
  const A = optsOf(p);
  const status = pStatusOf(s, p);
  const why = whyOf(s, p.id);
  const desc = (p as SellerProduct).desc;
  return (
    <>
      <AHead title={`Modération · ${p.n}`} crumb={[["Produits à modérer", "/admin/products"], [p.n]]} />
      <div className="s-grid2 wide">
        <div>
          <div className="panel">
            <div className="ph-h">
              <h2>Aperçu acheteur</h2>
              <PTag s={status === "active" && stockTotal(p) === 0 ? "out" : status} />
            </div>
            <div className="mod-pv">
              <div className="pf-ph">
                {[0, 1, 2].map((i) => (
                  <div className="pf-img" key={i}>
                    <Ph icon={p.icon} tint={TINTS[(i + 1) % 5]} img={i === 0 ? productImage(p.id, 200) : undefined} alt={p.n} />
                  </div>
                ))}
              </div>
              <div>
                <h3 style={{ fontSize: 17 }}>{p.n}</h3>
                <p className="cap">
                  {catBy(p.cat)?.n} › {p.sub}
                </p>
                <div className="bigp" style={{ margin: "8px 0" }}>
                  <b className="tnum">{htg(p.price)}</b>
                  {p.was ? <s>{htg(p.was)}</s> : null}
                </div>
                {A.length ? (
                  A.map((a) => (
                    <p className="cap" key={a.k}>
                      <b>{a.k} :</b> {a.v.join(", ")}
                    </p>
                  ))
                ) : (
                  <p className="cap">Modèle unique</p>
                )}
                <p className="cap">Stock total : {stockTotal(p)}</p>
                {desc ? <p style={{ marginTop: 8 }}>{desc}</p> : null}
              </div>
            </div>
          </div>
          <div className="panel">
            <h3>Store</h3>
            <div className="s-orow st">
              <Ph icon={st.i} tint="g4" cls="sav" img={storeImage(st.id, 120)} alt={st.n} />
              <span>
                <b>{st.n}</b>
                <span className="cap">
                  {st.trust ? "Store de confiance · " : ""}
                  {st.addr}
                </span>
              </span>
              <Link className="btn btn-o btn-sm" href={`/admin/stores/${st.id}`}>
                Fiche store
              </Link>
            </div>
          </div>
        </div>
        <div>
          <div className="panel">
            <h3>Grille de contrôle</h3>
            {CHECKS.map((c) => (
              <label className="ck" key={c}>
                <input type="checkbox" className="mchk" defaultChecked />
                {c}
              </label>
            ))}
          </div>
          {status === "mod" ? (
            <div className="panel">
              <h3>Décision</h3>
              <div className="row-b">
                <button
                  className="btn btn-p"
                  onClick={() => {
                    productApprove(me, p.id);
                    toast.show("Produit approuvé et publié", "success");
                    router.push("/admin/products");
                  }}
                >
                  <Fi s="check" />
                  Approuver
                </button>
                <button
                  className="btn btn-o"
                  onClick={() =>
                    decide("Rejeter le produit", "Motif", ["Photos floues ou non réelles", "Produit interdit", "Catégorie incorrecte", "Prix trompeur", "Description insuffisante"], (m, c) => {
                      productReject(me, p.id, m, c);
                      toast.show("Produit rejeté. Le store est prévenu.");
                      router.push("/admin/products");
                    })
                  }
                >
                  Rejeter
                </button>
              </div>
            </div>
          ) : (
            <div className="info-box">
              <Fi s="circle-info" />
              <span>
                Décision déjà prise.{why ? ` Motif : ${why}` : ""}
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
