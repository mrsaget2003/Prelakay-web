"use client";

// Paiement — pageCheckout du prototype (03-design §9.7) : retrait en magasin ou livraison
// (CLAUDE.md 10 nov. 2026), choix par store, adresse si livraison, wallet, argent protégé, total, Payer.

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ZONES } from "@/lib/charts/adminData";
import { BUSINESS } from "@/lib/config/business";
import { deliveryFee, type DeliveryAddr, type FulfillMode } from "@/lib/domain/delivery";
import { productImage } from "@/lib/data/mock/images";
import { useDemo } from "@/lib/demo/store";
import { MSG_NO_ADDR, cartTotals, groups, payCart, simulateDelivery, simulateStoreProgress } from "@/lib/demo/actions";
import { formatHTG as htg, formatDistance as km } from "@/lib/format";
import { ComingSoon } from "@/components/ui/ComingSoon";
import { useToast } from "@/components/ui/Toast";
import { MBar } from "@/components/proto/shell";
import { EmptyBox, FieldErr, Fi, NeedLogin, Ph } from "@/components/proto/ui";

export default function CheckoutPage() {
  const s = useDemo();
  const router = useRouter();
  const toast = useToast();
  const [modes, setModes] = useState<Record<string, FulfillMode>>({});
  const [addr, setAddr] = useState<DeliveryAddr>({ zone: ZONES[0][0], mark: "", phone: "" });
  const [addrErr, setAddrErr] = useState<string | null>(null);
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
  const sids = Object.keys(G);
  const modeOf = (sid: string): FulfillMode => modes[sid] ?? "pickup";
  const nDel = sids.filter((sid) => modeOf(sid) === "delivery").length;
  const fee = nDel ? deliveryFee(addr.zone) : 0;
  const due = T.sub + fee * nDel;
  const allDel = nDel === sids.length;
  const setAll = (m: FulfillMode) => setModes(Object.fromEntries(sids.map((sid) => [sid, m])));
  const enough = s.wallet >= due;
  // clé d'idempotence = panier payé + nombre de commandes : un double clic ne paie qu'une fois (Review Focus n° 5)
  const payKey = `pay-${s.orders.length}-${JSON.stringify(T.on.map((l) => [l.c.p, l.c.v, l.c.q]))}`;
  const pay = () => {
    const r = payCart(payKey, { modes, addr });
    if (!r.ok) return r.error === MSG_NO_ADDR ? setAddrErr(r.error) : toast.show(r.error, "error");
    simulateStoreProgress(r.ids, (id) => toast.show(`Commande ${id} prête pour retrait`, "success"));
    simulateDelivery(r.ids, (id) => toast.show(`Commande ${id} en route : préparez votre code de livraison`, "info"));
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
            <button className={`opt${nDel === 0 ? " on" : ""}`} onClick={() => setAll("pickup")} aria-pressed={nDel === 0}>
              <Fi s="store" className="big" />
              <span>
                <b>Retrait en magasin</b>
                <small>Gratuit · prêt en 2 à 24 heures · gardé 3 jours</small>
              </span>
              <span className="rd" />
            </button>
            <ComingSoon feature="delivery">
              <button className={`opt${allDel ? " on" : ""}`} onClick={() => setAll("delivery")} aria-pressed={allDel}>
                <Fi s="box" className="big" />
                <span>
                  <b>Livraison à domicile</b>
                  <small>Flotte Prélakay · environ {BUSINESS.demoDeliveryMinutes} min après la préparation · frais selon le quartier</small>
                </span>
                <span className="rd" />
              </button>
            </ComingSoon>
            {nDel ? (
              <div className="dl-addr">
                <h4>Adresse de livraison</h4>
                <div className="fl">
                  <label className="lbl" htmlFor="dz">Quartier</label>
                  <select className="field" id="dz" value={addr.zone} onChange={(e) => setAddr({ ...addr, zone: e.target.value })}>
                    {ZONES.map(([z]) => (
                      <option key={z} value={z}>
                        {z} · {htg(deliveryFee(z))}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="fl">
                  <label className="lbl" htmlFor="dm">Repère</label>
                  <input className="field" id="dm" placeholder="Ex. près de l'église, portail bleu" value={addr.mark} onChange={(e) => { setAddr({ ...addr, mark: e.target.value }); setAddrErr(null); }} />
                </div>
                <div className="fl">
                  <label className="lbl" htmlFor="dp">Téléphone pour le livreur</label>
                  <input className="field" id="dp" inputMode="tel" placeholder="Ex. 3712 3456" value={addr.phone} onChange={(e) => { setAddr({ ...addr, phone: e.target.value }); setAddrErr(null); }} />
                </div>
                <FieldErr msg={addrErr} />
                <p className="cap">Frais de démonstration (à confirmer). Le livreur vous demandera votre code de livraison.</p>
              </div>
            ) : null}
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
                  {modeOf(sid) === "delivery" ? `Livraison depuis ${st.n}` : `Retrait chez ${st.n}`}
                </h3>
                <p className="cap" style={{ margin: "-6px 0 10px" }}>
                  {modeOf(sid) === "delivery" ? `Livré à ${addr.zone} · ${htg(fee)}` : `${st.addr} · ${km(st.km)} · ${st.hours}`}
                </p>
                {sids.length > 1 ? (
                  <div className="otabs sm dl-mode" role="group" aria-label={`Mode de remise pour ${st.n}`}>
                    <button className={modeOf(sid) === "pickup" ? "on" : ""} aria-pressed={modeOf(sid) === "pickup"} onClick={() => setModes({ ...modes, [sid]: "pickup" })}>
                      Retrait
                    </button>
                    <button className={modeOf(sid) === "delivery" ? "on" : ""} aria-pressed={modeOf(sid) === "delivery"} onClick={() => setModes({ ...modes, [sid]: "delivery" })}>
                      Livraison
                    </button>
                  </div>
                ) : null}
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
                    Solde insuffisant : il manque <b className="tnum">{htg(due - s.wallet)}</b>. Rechargez votre wallet, puis réessayez.
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
          {nDel < sids.length ? (
            <div className="ln">
              <span>Retrait en magasin</span>
              <span>Gratuit</span>
            </div>
          ) : null}
          {nDel ? (
            <div className="ln">
              <span>Livraison{nDel > 1 ? ` (${nDel} stores)` : ""}</span>
              <span className="tnum">{htg(fee * nDel)}</span>
            </div>
          ) : null}
          <div className="ln">
            <span>Coins gagnés</span>
            <span>+{50 * Object.keys(G).length}</span>
          </div>
          <div className="tot">
            <span>À payer</span>
            <b className="tnum">{htg(due)}</b>
          </div>
          <button className="btn btn-p btn-block" onClick={pay} disabled={!enough}>
            Payer {htg(due)}
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
          <b className="tnum">{htg(due)}</b>
        </div>
        <button className="btn btn-p" onClick={pay} disabled={!enough}>
          Payer
        </button>
      </MBar>
    </div>
  );
}
