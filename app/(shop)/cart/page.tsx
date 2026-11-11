"use client";

// Panier — pageCart du prototype (03-design §9.7) : cases rondes (tout, par store,
// par article), groupes par store, puce de caractéristiques modifiable, quantité,
// récapitulatif collant, blocs de confiance, « Plus à découvrir » ; barre mobile.

import Link from "next/link";
import { P, hasOpts } from "@/lib/data/mock/seed";
import { productImage } from "@/lib/data/mock/images";
import { demo, useDemo } from "@/lib/demo/store";
import { cartTotals, groups } from "@/lib/demo/actions";
import { formatHTG as htg, formatDistance as km } from "@/lib/format";
import { ComingSoon } from "@/components/ui/ComingSoon";
import { useToast } from "@/components/ui/Toast";
import { ProductCard, openCartVariant } from "@/components/proto/cards";
import { useModal } from "@/components/proto/modal";
import { ShareModal } from "@/components/proto/share";
import { MBar } from "@/components/proto/shell";
import { Fi, NeedLogin, Ph, SecHead } from "@/components/proto/ui";

function Rc({ checked, onChange, label, children }: { checked: boolean; onChange: () => void; label?: string; children?: React.ReactNode }) {
  return (
    <label className="rc">
      <input type="checkbox" checked={checked} onChange={onChange} aria-label={label} />
      <span />
      {children}
    </label>
  );
}

export default function CartPage() {
  const s = useDemo();
  const toast = useToast();
  const modal = useModal();
  if (!s.logged) return <NeedLogin what="Votre panier" next="/cart" />;
  const T = cartTotals(s);
  const more = (
    <section className="sec">
      <SecHead title="Plus à découvrir" />
      <div className="grid">
        {P.slice(6, 16).map((p) => (
          <ProductCard key={p.id} p={p} />
        ))}
      </div>
    </section>
  );
  if (!T.L.length)
    return (
      <div className="wrap">
        <nav className="crumb">
          <Link href="/">Accueil</Link>
          <Fi s="chevron-right" />
          <span>Panier</span>
        </nav>
        <div className="panel cart-empty">
          <Fi s="cart-shopping" />
          <h2>Votre panier est vide</h2>
          <p className="muted">Les stores de Les Cayes ont de quoi vous plaire.</p>
          <Link className="btn btn-p" href="/discover">
            Commencer vos achats
          </Link>
        </div>
        {more}
      </div>
    );
  const G = groups(T.L);
  const all = T.L.every((l) => l.c.on);
  const saved = T.on.reduce((a, l) => a + (l.p.was ? (l.p.was - l.p.price) * l.c.q : 0), 0);
  const toggleAll = () => demo.update((d) => d.cart.forEach((c) => (c.on = !all)));
  const go = T.n ? "/checkout" : "/cart";

  return (
    <div className="wrap">
      <nav className="crumb">
        <Link href="/">Accueil</Link>
        <Fi s="chevron-right" />
        <span>Panier</span>
      </nav>
      <div className="cartw">
        <div className="cart-l">
          <div className="panel cart-h">
            <h1>Panier ({T.L.length})</h1>
            <Rc checked={all} onChange={toggleAll}>
              Tout sélectionner
            </Rc>
            <button className="lk" onClick={() => modal.open("Partager votre panier", <ShareModal kind="panier" id="" />)}>
              <Fi s="share-nodes" />
              Partager le panier
            </button>
          </div>
          {Object.keys(G).map((sid) => {
            const ls = G[sid];
            const st = ls[0].st;
            const son = ls.every((l) => l.c.on);
            return (
              <div className="panel cgroup" key={sid}>
                <div className="cg-h">
                  <Rc checked={son} label={`Sélectionner ${st.n}`} onChange={() => demo.update((d) => ls.forEach((l) => (d.cart[l.i].on = !son)))} />
                  <Link href={`/store/${sid}`}>
                    <Fi s="store" />
                    <b>{st.n}</b>
                    <Fi s="chevron-right" />
                  </Link>
                </div>
                <div className="cg-note">
                  <Fi s="location-dot" />
                  Retrait gratuit · {km(st.km)} · {st.hours}
                </div>
                {ls.map((l) => (
                  <div className="ci" key={l.i}>
                    <Rc checked={l.c.on} label="Sélectionner" onChange={() => demo.update((d) => { d.cart[l.i].on = !d.cart[l.i].on; })} />
                    <Link className="ci-im" href={`/p/${l.p.id}`}>
                      <Ph icon={l.p.icon} tint={l.p.tint} img={productImage(l.p.id, 200)} alt={l.p.n} />
                      {l.p.stockLow ? <span className="almost">Bientôt épuisé</span> : null}
                    </Link>
                    <div className="ci-b">
                      <div className="ci-t">
                        <Link className="nm" href={`/p/${l.p.id}`}>
                          {l.p.n}
                        </Link>
                        <span className="ci-x">
                          <button
                            title="Déplacer dans la wishlist"
                            aria-label="Déplacer dans la wishlist"
                            onClick={() => {
                              demo.update((d) => {
                                d.wish[l.c.p] = true;
                                d.cart.splice(l.i, 1);
                              });
                              // l'article quitte le panier pour une autre page : on dit où il va
                              toast.show("Déplacé dans la wishlist", "success");
                            }}
                          >
                            <Fi r="heart" />
                          </button>
                          <button
                            title="Supprimer"
                            aria-label="Supprimer"
                            onClick={() => {
                              demo.update((d) => { d.cart.splice(l.i, 1); });
                              toast.show("Article retiré du panier", "success");
                            }}
                          >
                            <Fi r="trash-can" />
                          </button>
                        </span>
                      </div>
                      {hasOpts(l.p) ? (
                        <button className="vchip" onClick={() => openCartVariant(modal, l.i)}>
                          {l.c.v}
                          <Fi s="chevron-down" />
                        </button>
                      ) : (
                        <span className="vchip st">{l.c.v}</span>
                      )}
                      <div className="ci-p">
                        <div>
                          <b className="tnum">{htg(l.p.price)}</b>
                          {l.p.was ? (
                            <>
                              {" "}
                              <s className="tnum">{htg(l.p.was)}</s> <span className="save">−{htg(l.p.was - l.p.price)}</span>
                            </>
                          ) : null}
                        </div>
                        <span className="qty">
                          <button disabled={l.c.q <= 1} aria-label="Moins" onClick={() => demo.update((d) => { d.cart[l.i].q = Math.max(1, d.cart[l.i].q - 1); })}>
                            <Fi s="minus" />
                          </button>
                          <input value={l.c.q} readOnly aria-label="Quantité" />
                          <button aria-label="Plus" onClick={() => demo.update((d) => { d.cart[l.i].q += 1; })}>
                            <Fi s="plus" />
                          </button>
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
        <aside className="cart-r">
          <div className="panel sum">
            <h2>Récapitulatif</h2>
            <div className="ln">
              <span>Articles ({T.n})</span>
              <span className="tnum">{htg(T.sub + saved)}</span>
            </div>
            {saved ? (
              <div className="ln">
                <span>Réductions des stores</span>
                <span className="tnum save-t">−{htg(saved)}</span>
              </div>
            ) : null}
            <div className="ln">
              <span>Retrait en magasin</span>
              <span>Gratuit</span>
            </div>
            <div className="ln">
              <span>Code promo</span>
              <ComingSoon feature="coupons">
                <Link className="lk" href={T.n ? `${go}#promo` : "/account/coupons"}>
                  Ajouter
                </Link>
              </ComingSoon>
            </div>
            <div className="tot">
              <span>Total estimé</span>
              <b className="tnum">{htg(T.sub)}</b>
            </div>
            <Link className={`btn btn-p btn-lg btn-block ${T.n ? "" : "dis"}`} href={go}>
              Commander ({T.n})
            </Link>
          </div>
          <div className="panel trust-l">
            <div>
              <Fi s="store" />
              <span>
                <b>Retrait en magasin</b>Prêt en 2 à 24 heures, gardé 3 jours
              </span>
            </div>
            <div>
              <Fi s="shield-halved" />
              <span>
                <b>Argent protégé</b>Le store est payé après le retrait
              </span>
            </div>
            <div>
              <Fi s="lock" />
              <span>
                <b>Paiement sécurisé</b>Wallet Prélakay : MonCash, NatCash, Sogebank, carte
              </span>
            </div>
          </div>
        </aside>
      </div>
      {more}
      <MBar>
        <Rc checked={all} onChange={toggleAll}>
          Tout
        </Rc>
        <div className="t">
          <small>Total</small>
          <b className="tnum">{htg(T.sub)}</b>
        </div>
        <Link className={`btn btn-p ${T.n ? "" : "dis"}`} href={go}>
          Commander ({T.n})
        </Link>
      </MBar>
    </div>
  );
}
