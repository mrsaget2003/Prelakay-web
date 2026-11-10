"use client";

// Paiement — pageCheckout du prototype (03-design §9.7) : Retrait en magasin seul actif
// (Livraison « À venir »), point de retrait par store, wallet, argent protégé, total, Payer.

import Link from "next/link";
import { useRouter } from "next/navigation";
import { productImage } from "@/lib/data/mock/images";
import { useDemo } from "@/lib/demo/store";
import { cartTotals, groups, payCart, simulateStoreProgress } from "@/lib/demo/actions";
import { formatHTG as htg, formatDistance as km } from "@/lib/format";
import { ComingSoon } from "@/components/ui/ComingSoon";
import { useToast } from "@/components/ui/Toast";
import { MBar } from "@/components/proto/shell";
import { EmptyBox, Fi, NeedLogin, Ph } from "@/components/proto/ui";

export default function CheckoutPage() {
  const s = useDemo();
  const router = useRouter();
  const toast = useToast();
  if (!s.logged) return <NeedLogin what="Le paiement" next="/checkout" />;
  const T = cartTotals(s);
  if (!T.n)
    return (
      <div className="wrap">
        <div style={{ marginTop: 16 }}>
          <EmptyBox icon={<Fi s="cart-shopping" />} t="Rien à payer" p="Sélectionnez au moins un article dans votre panier.">
            <Link className="btn btn-p" href="/cart">
              Retour au panier
            </Link>
          </EmptyBox>
        </div>
      </div>
    );
  const G = groups(T.on);
  const enough = s.wallet >= T.sub;
  // clé d'idempotence = panier payé + nombre de commandes : un double clic ne paie qu'une fois (Review Focus n° 5)
  const payKey = `pay-${s.orders.length}-${JSON.stringify(T.on.map((l) => [l.c.p, l.c.v, l.c.q]))}`;
  const pay = () => {
    const r = payCart(payKey);
    if (!r.ok) return toast.show(r.error, "error");
    simulateStoreProgress(r.ids, (id) => toast.show(`Commande ${id} prête pour retrait`, "success"));
    router.push(`/done/${r.ids.join(",")}`);
  };

  return (
    <div className="wrap">
      <div className="steps-h">
        <span>
          <b>1</b>Panier
        </span>
        <Fi s="chevron-right" />
        <span className="on">
          <b>2</b>Retrait et paiement
        </span>
        <Fi s="chevron-right" />
        <span>
          <b>3</b>Confirmation
        </span>
      </div>
      <div className="two">
        <div>
          <div className="panel">
            <h3>Mode de remise</h3>
            <button className="opt on">
              <Fi s="store" className="big" />
              <span>
                <b>Retrait en magasin</b>
                <small>Gratuit · prêt en 2 à 24 heures · gardé 3 jours</small>
              </span>
              <span className="rd" />
            </button>
            <ComingSoon feature="delivery">
              <button className="opt dis">
                <Fi s="box" className="big" />
                <span>
                  <b>Livraison à domicile</b>
                  <small>Bientôt avec la flotte Prélakay</small>
                </span>
                <span className="rd" />
              </button>
            </ComingSoon>
          </div>
          {Object.keys(G).map((sid) => {
            const ls = G[sid];
            const st = ls[0].st;
            return (
              <div className="panel" key={sid}>
                <h3 style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: "var(--color-lagon-500)" }}>
                    <Fi s="location-dot" />
                  </span>
                  Retrait chez {st.n}
                </h3>
                <p className="cap" style={{ margin: "-6px 0 10px" }}>
                  {st.addr} · {km(st.km)} · {st.hours}
                </p>
                {ls.map((l) => (
                  <div className="oc" style={{ padding: 0, margin: "0 0 8px" }} key={l.i}>
                    <div className="it">
                      <Ph icon={l.p.icon} tint={l.p.tint} img={productImage(l.p.id, 160)} alt={l.p.n} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <b style={{ fontWeight: 500 }}>{l.p.n}</b>
                        <div className="cap">
                          {l.c.v} × {l.c.q}
                        </div>
                      </div>
                      <b className="tnum">{htg(l.total)}</b>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
          <div className="panel">
            <h3>Paiement</h3>
            <button className="opt on">
              <Fi s="wallet" className="big" />
              <span>
                <b>Wallet Prélakay</b>
                <small>Solde : {htg(s.wallet)}</small>
              </span>
              <span className="rd" />
            </button>
            {enough ? (
              <div className="info-box">
                <Fi s="shield-halved" />
                <span>Votre argent est protégé : le store est payé seulement après le retrait. En cas de problème, vous êtes remboursé sur votre wallet.</span>
              </div>
            ) : (
              <>
                <div className="err-box">
                  <Fi s="circle-exclamation" />
                  <span>
                    Solde insuffisant : il manque <b className="tnum">{htg(T.sub - s.wallet)}</b>. Rechargez votre wallet, puis réessayez.
                  </span>
                </div>
                <Link className="btn btn-s" style={{ marginTop: 10 }} href="/wallet?topup=1">
                  <Fi s="plus" />
                  Recharger le wallet
                </Link>
              </>
            )}
            <div className="fl" style={{ marginTop: 14 }}>
              <label className="lbl" htmlFor="promo">
                Code promo
              </label>
              <div style={{ display: "flex", gap: 8 }}>
                <input className="field" id="promo" placeholder="Code à 6 chiffres" inputMode="numeric" />
                <ComingSoon feature="coupons">
                  <button className="btn btn-s">Appliquer</button>
                </ComingSoon>
              </div>
            </div>
          </div>
        </div>
        <aside className="sum">
          <h3>Total</h3>
          <div className="ln">
            <span>Articles ({T.n})</span>
            <span className="tnum">{htg(T.sub)}</span>
          </div>
          <div className="ln">
            <span>Retrait en magasin</span>
            <span>Gratuit</span>
          </div>
          <div className="ln">
            <span>Coins gagnés</span>
            <span>+{50 * Object.keys(G).length}</span>
          </div>
          <div className="tot">
            <span>À payer</span>
            <b className="tnum">{htg(T.sub)}</b>
          </div>
          <button className="btn btn-p btn-block" onClick={pay} disabled={!enough}>
            Payer {htg(T.sub)}
          </button>
          <p className="note">
            <Fi s="lock" />
            Paiement par wallet uniquement en v1.
          </p>
        </aside>
      </div>
      <MBar>
        <div className="t">
          <small>À payer</small>
          <b className="tnum">{htg(T.sub)}</b>
        </div>
        <button className="btn btn-p" onClick={pay} disabled={!enough}>
          Payer
        </button>
      </MBar>
    </div>
  );
}
