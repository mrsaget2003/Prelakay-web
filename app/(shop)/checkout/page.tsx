"use client";

// Paiement — pageCheckout du prototype (03-design §9.7) : retrait en magasin ou livraison
// (CLAUDE.md 10 nov. 2026), choix par store, adresse si livraison, wallet, argent protégé, total, Payer.

import Link from "next/link";
import { SCENE_PHOTOS } from "@/lib/data/mock/sceneImages";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ZONES } from "@/lib/charts/adminData";
import { BUSINESS } from "@/lib/config/business";
import { deliveryFee, type DeliveryAddr, type FulfillMode } from "@/lib/domain/delivery";
import { productImage } from "@/lib/data/mock/images";
import { useDemo } from "@/lib/demo/store";
import { MSG_NO_ADDR, cartTotals, groups, payCart, pickCoupon, simulateDelivery, simulateStoreProgress, type CouponPick } from "@/lib/demo/actions";
import { formatHTG as htg, formatDistance as km } from "@/lib/format";
import { ComingSoon } from "@/components/ui/ComingSoon";
import { useToast } from "@/components/ui/Toast";
import { MBar } from "@/components/proto/shell";
import { EmptyBox, FieldErr, Fi, NeedLogin, Ph } from "@/components/proto/ui";
import { GatewayLogos, PayMark } from "@/components/proto/PayLogos";
import { PAY_LOGOS } from "@/lib/data/payment";
import { PAY_METHODS, validatePayment, type PayMethod } from "@/lib/domain/payment";
import { Money } from "@/components/proto/Money";

export default function CheckoutPage() {
  const s = useDemo();
  const router = useRouter();
  const toast = useToast();
  const [modes, setModes] = useState<Record<string, FulfillMode>>({});
  const [addr, setAddr] = useState<DeliveryAddr>({ zone: ZONES[0][0], mark: "", phone: "" });
  const [addrErr, setAddrErr] = useState<string | null>(null);
  // moyen de paiement (12 nov. 2026) : wallet, MonCash, NatCash ou carte
  const [method, setMethod] = useState<PayMethod>("wallet");
  const [payPhone, setPayPhone] = useState("");
  const [payErr, setPayErr] = useState<string | null>(null);
  const [promo, setPromo] = useState("");
  const [cp, setCp] = useState<CouponPick | null>(null);
  const [cpErr, setCpErr] = useState<string | null>(null);
  if (!s.logged) return <NeedLogin what="Le paiement" next="/checkout" />;
  const T = cartTotals(s);
  if (!T.n)
    return (
      <div className="wrap">
        <div style={{ marginTop: 16 }}>
          <EmptyBox photo={SCENE_PHOTOS.emptyCart} t="Rien à payer" p="Sélectionnez au moins un article dans votre panier.">
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
  const off = cp?.off ?? 0;
  const due = T.sub + fee * nDel - off;
  const applyPromo = () => {
    const r = pickCoupon(s, promo);
    if (r.ok) {
      setCp(r);
      setCpErr(null);
    } else {
      setCp(null);
      setCpErr(r.error);
    }
  };
  const allDel = nDel === sids.length;
  const setAll = (m: FulfillMode) => setModes(Object.fromEntries(sids.map((sid) => [sid, m])));
  const enough = s.wallet >= due;
  // seul le wallet dépend du solde : les autres moyens se valident chez le prestataire
  const canPay = method !== "wallet" || enough;
  // clé d'idempotence = panier payé + nombre de commandes : un double clic ne paie qu'une fois (Review Focus n° 5)
  const payKey = `pay-${s.orders.length}-${JSON.stringify(T.on.map((l) => [l.c.p, l.c.v, l.c.q]))}`;
  const pay = () => {
    const pe = validatePayment({ method, phone: payPhone });
    if (pe) {
      setPayErr(pe);
      document.getElementById("pay-phone")?.focus();
      return;
    }
    const r = payCart(payKey, { modes, addr, coupon: cp?.code, pay: { method, phone: payPhone } });
    if (!r.ok) {
      if (r.error === MSG_NO_ADDR) return setAddrErr(r.error);
      if (cp && /coupon|Code inconnu|Montant minimum/.test(r.error)) {
        setCp(null);
        return setCpErr(r.error);
      }
      return toast.show(r.error, "error");
    }
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
            <div className="paym-opts" role="radiogroup" aria-label="Moyen de paiement">
              {PAY_METHODS.map((m) => (
                <button
                  key={m.k}
                  type="button"
                  role="radio"
                  aria-checked={method === m.k}
                  className={`opt${method === m.k ? " on" : ""}`}
                  onClick={() => {
                    setMethod(m.k);
                    setPayErr(null);
                  }}
                >
                  <span className="paym-ic">
                    {m.k === "wallet" ? (
                      <Fi s="wallet" />
                    ) : m.k === "card" ? (
                      <>
                        <PayMark logo={PAY_LOGOS.visa} height={14} />
                        <PayMark logo={PAY_LOGOS.mastercard} height={14} />
                      </>
                    ) : (
                      <GatewayLogos gateway={m.k} height={18} />
                    )}
                  </span>
                  <span>
                    <b>{m.label}</b>
                    <small>{m.k === "wallet" ? `Solde : ${htg(s.wallet)}` : m.sub}</small>
                  </span>
                  <span className="rd" />
                </button>
              ))}
            </div>
            {method === "wallet" && !enough ? (
              <>
                <div className="err-box">
                  <Fi s="circle-exclamation" />
                  <span>
                    Solde insuffisant : il manque <b className="tnum">{htg(due - s.wallet)}</b>. Rechargez votre wallet ou choisissez un autre moyen.
                  </span>
                </div>
                <Link className="btn btn-s" style={{ marginTop: 10 }} href="/wallet?topup=1">
                  <Fi s="plus" />
                  Recharger le wallet
                </Link>
              </>
            ) : null}
            {method === "moncash" || method === "natcash" ? (
              <div className="fl" style={{ marginTop: 12 }}>
                <label className="lbl" htmlFor="pay-phone">
                  Numéro {method === "moncash" ? "MonCash" : "NatCash"}
                </label>
                <input
                  className="field"
                  id="pay-phone"
                  inputMode="tel"
                  placeholder="3712 3456"
                  value={payPhone}
                  aria-invalid={payErr ? true : undefined}
                  onChange={(e) => {
                    setPayPhone(e.target.value);
                    setPayErr(null);
                  }}
                />
                {payErr ? <FieldErr msg={payErr} /> : <span className="cap">Vous recevez une demande de paiement à valider sur ce téléphone.</span>}
              </div>
            ) : null}
            {method === "card" ? (
              <p className="cap" style={{ marginTop: 10 }}>
                Vous validez le paiement sur la page sécurisée de votre banque. Prélakay ne voit jamais le numéro de votre carte.
              </p>
            ) : null}
            {canPay ? (
              <div className="info-box" style={{ marginTop: 12 }}>
                <Fi s="shield-halved" />
                <span>Votre argent est protégé : le store est payé seulement après le retrait ou la livraison. En cas de problème, vous êtes remboursé.</span>
              </div>
            ) : null}
            <div className="fl" style={{ marginTop: 14 }}>
              <label className="lbl" htmlFor="promo">
                Code promo
              </label>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  className="field"
                  id="promo"
                  placeholder="Code à 6 caractères"
                  autoCapitalize="characters"
                  value={promo}
                  aria-invalid={cpErr ? true : undefined}
                  onChange={(e) => {
                    setPromo(e.target.value.toUpperCase());
                    setCpErr(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") applyPromo();
                  }}
                />
                <ComingSoon feature="coupons">
                  <button className="btn btn-s" onClick={applyPromo} disabled={!promo.trim()}>
                    Appliquer
                  </button>
                </ComingSoon>
              </div>
              <FieldErr msg={cpErr} />
              {cp ? (
                <p className="cp-ok">
                  <span>
                    <Fi s="circle-check" /> Coupon {cp.code} appliqué
                  </span>
                  <button className="lk" onClick={() => setCp(null)}>
                    Retirer
                  </button>
                </p>
              ) : null}
              {s.coupons.mine.length && !cp ? (
                <p className="cap" style={{ marginTop: 6 }}>
                  Vos coupons :{" "}
                  {s.coupons.mine.map((c) => (
                    <button key={c} className="lk" style={{ marginRight: 8 }} onClick={() => setPromo(c)}>
                      {c}
                    </button>
                  ))}
                </p>
              ) : null}
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
          {cp ? (
            <div className="ln">
              <span>Coupon {cp.code}</span>
              <span className="tnum">−{htg(cp.off)}</span>
            </div>
          ) : null}
          <div className="ln">
            <span>Coins gagnés</span>
            <span>+{50 * Object.keys(G).length}</span>
          </div>
          <div className="tot">
            <span>À payer</span>
            <b className="tnum">
              <Money v={due} />
            </b>
          </div>
          <button className="btn btn-p btn-block" onClick={pay} disabled={!canPay}>
            Payer {htg(due)}
          </button>
          <p className="note">
            <Fi s="lock" />
            Paiement sécurisé · argent protégé jusqu&apos;au retrait ou à la livraison.
          </p>
        </aside>
      </div>
      <MBar>
        <div className="t">
          <small>À payer</small>
          <b className="tnum">{htg(due)}</b>
        </div>
        <button className="btn btn-p" onClick={pay} disabled={!canPay}>
          Payer
        </button>
      </MBar>
    </div>
  );
}
