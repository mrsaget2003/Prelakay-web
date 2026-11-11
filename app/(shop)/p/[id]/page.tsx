"use client";

// Fiche produit — pageProduct du prototype (03-design §9.5) : galerie, informations,
// caractéristiques et quantité, panneau d'achat collant (Engagement Prélakay),
// ancres collantes, avis, caractéristiques, description, questions, store, plus à découvrir.

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { P, prodBy, storeBy, catBy, optsOf, stockFor, galleryIcons } from "@/lib/data/mock/seed";
import { productImage, storeImage } from "@/lib/data/mock/images";
import { demo, useDemo } from "@/lib/demo/store";
import { addToCart, markViewed, selOf, setChoice, setQty } from "@/lib/demo/actions";
import { formatHTG as htg, formatDistance as km, formatCount as k } from "@/lib/format";
import { useIsDesk } from "@/lib/proto/useIsDesk";
import { BUSINESS } from "@/lib/config/business";
import { ComingSoon } from "@/components/ui/ComingSoon";
import { useToast } from "@/components/ui/Toast";
import { useFlash } from "@/components/ui/Feedback";
import { ProductCard, useWish } from "@/components/proto/cards";
import { AskForm, ReportForm } from "@/components/proto/forms";
import { useModal } from "@/components/proto/modal";
import { Reviews } from "@/components/proto/reviews";
import { ShareModal, shareTitle } from "@/components/proto/share";
import { MBar } from "@/components/proto/shell";
import { SkuOptions } from "@/components/proto/Sku";
import { Fi, Page404, Ph, Stars, fr1 } from "@/components/proto/ui";

const ANCHORS: [string, string][] = [["rev", "Avis clients"], ["spec", "Caractéristiques"], ["desc", "Description"], ["qa", "Questions"], ["store", "Store"], ["more", "Plus à découvrir"]];

function scrollToSec(v: string) {
  const sec = document.getElementById(`s-${v}`);
  if (!sec) return;
  const hh = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--hh")) || 72;
  window.scrollTo({ top: sec.getBoundingClientRect().top + window.scrollY - hh - 52, behavior: "smooth" });
}

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const p = prodBy(id);
  const s = useDemo();
  const router = useRouter();
  const toast = useToast();
  const [added, flashAdded] = useFlash();
  const modal = useModal();
  const wish = useWish();
  const desk = useIsDesk();
  const [galI, setGalI] = useState(0);
  const [anchor, setAnchor] = useState<string | null>(null);

  useEffect(() => {
    if (p) markViewed(p.id);
  }, [p]);
  // ancre active et prix collant (onScroll du prototype)
  useEffect(() => {
    const onScroll = () => {
      const hh = document.getElementById("hdr")?.offsetHeight ?? 72;
      const pi = document.querySelector(".pinfo");
      if (pi) document.body.classList.toggle("pdp-scrolled", pi.getBoundingClientRect().bottom < hh);
      let cur: string | null = null;
      document.querySelectorAll<HTMLElement>(".psec").forEach((sec) => {
        if (sec.getBoundingClientRect().top < hh + 80) cur = sec.id.slice(2);
      });
      setAnchor(cur);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      document.body.classList.remove("pdp-scrolled");
    };
  }, []);

  if (!p) return <Page404 />;
  const st = storeBy(p.store)!;
  const c = catBy(p.cat)!;
  const sel = selOf(p, s);
  const OPT = optsOf(p);
  const stock = stockFor(p, sel.o);
  const q = Math.min(sel.q, Math.max(1, stock));
  const gal = galleryIcons(p);
  const need = () => {
    if (!s.logged) {
      router.push("/login");
      return false;
    }
    return true;
  };
  const add = () => {
    if (!need()) return;
    addToCart(p.id, q);
    flashAdded();
  };
  const buy = () => {
    if (!need()) return;
    demo.update((d) => d.cart.forEach((x) => (x.on = false)));
    addToCart(p.id, q);
    router.push("/checkout");
  };
  const route = () => toast.show(`Itinéraire vers ${st.n} (${km(st.km)})`);
  const share = (kind: "produit" | "store", sid: string) => modal.open(shareTitle(kind), <ShareModal kind={kind} id={sid} />);
  const specs: [string, string][] = [
    ["Catégorie", c.n],
    ["Sous-catégorie", p.sub],
    ["Caractéristiques", OPT.map((a) => `${a.k} : ${a.v.join(", ")}`).join(" — ") || "Modèle unique"],
    ["Vendu par", st.n],
    ["Type de store", st.type === "physique" ? "Store physique" : "Store en ligne"],
    ["Mode de remise", "Retrait en magasin"],
    ["Ville", "Les Cayes"],
    ["Référence", p.id.toUpperCase()],
  ];
  const same = P.filter((x) => x.store === p.store && x.id !== p.id).slice(0, 5);
  const like = P.filter((x) => x.cat === p.cat && x.id !== p.id).slice(0, desk ? 8 : 6);
  const heart = s.wish[p.id] ? <Fi s="heart" /> : <Fi r="heart" />;
  const myQs = s.questions.filter((x) => x.p === p.id);

  return (
    <div className="wrap">
      <div className="crumb">
        <Link href="/">Accueil</Link>
        <Fi s="chevron-right" />
        <Link href={`/discover?cat=${c.id}`}>{c.n}</Link>
        <Fi s="chevron-right" />
        <Link href={`/discover?cat=${c.id}&sub=${encodeURIComponent(p.sub)}`}>{p.sub}</Link>
      </div>
      <div className="pp">
        <div className="pp-l">
          <div className="pp-top">
            <div className="gal">
              <div className="th">
                {gal.map((ic, i) => (
                  <button key={i} className={i === galI ? "on" : ""} onClick={() => setGalI(i)} aria-label={`Image ${i + 1}`}>
                    <Ph icon={ic} tint={p.tint} img={i === 0 ? productImage(p.id, 160) : undefined} alt={p.n} />
                  </button>
                ))}
              </div>
              <div style={{ position: "relative" }}>
                <Ph icon={gal[galI]} tint={p.tint} cls="main" img={galI === 0 ? productImage(p.id, 900) : undefined} alt={p.n} />
                <span className="ctr">
                  {galI + 1} / {gal.length}
                </span>
              </div>
            </div>
            <div className="pinfo">
              <div style={{ display: "flex", gap: 6, marginBottom: 6, flexWrap: "wrap" }}>
                {p.isNew ? <span className="tag tag-new">Nouveau sur Prélakay</span> : null}
                {st.trust ? (
                  <span className="tag tag-neu">
                    <Fi s="circle-check" />
                    Store de confiance
                  </span>
                ) : null}
              </div>
              <h1>{p.n}</h1>
              <div className="rate">
                {p.reviews ? (
                  <>
                    <span className="stars">
                      <Stars r={p.rating} />
                    </span>
                    <b>{fr1(p.rating)}</b>
                    <a className="nw" href="#s-rev" onClick={(e) => { e.preventDefault(); scrollToSec("rev"); }}>
                      {p.reviews} avis vérifiés
                    </a>
                    <span>·</span>
                  </>
                ) : null}
                <span>{p.sold ? `${k(p.sold)} vendus` : "Nouveau sur Prélakay"}</span>
              </div>
              <div className="pbox">
                <div className="bigp">
                  <b className="tnum">{htg(p.price)}</b>
                  {p.was ? (
                    <>
                      <s className="tnum">{htg(p.was)}</s>
                      <span className="tag tag-new">-{p.disc} %</span>
                    </>
                  ) : null}
                </div>
                <div className="ex">Prix fixé par le store · payé avec votre wallet</div>
              </div>
              <SkuOptions p={p} o={sel.o} onPick={(kk, v) => setChoice(p.id, kk, v)} />
              <div className="var-h">Quantité</div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <span className="qty">
                  <button disabled={q <= 1} aria-label="Moins" onClick={() => setQty(p.id, q - 1)}>
                    <Fi s="minus" />
                  </button>
                  <input value={q} readOnly aria-label="Quantité" />
                  <button disabled={q >= stock} aria-label="Plus" onClick={() => setQty(p.id, q + 1)}>
                    <Fi s="plus" />
                  </button>
                </span>
                {stock === 0 ? (
                  <span className="tag tag-err">Rupture pour cette variante</span>
                ) : stock <= 3 ? (
                  <span className="low">
                    <Fi s="triangle-exclamation" /> Plus que {stock} en stock
                  </span>
                ) : (
                  <span className="cap">{stock} disponibles</span>
                )}
              </div>
              <div className="pickup mo">
                <Fi s="store" />
                <div>
                  <b>Retrait gratuit chez {st.n}</b>
                  {st.addr} · {km(st.km)}
                  <br />
                  {p.ready ? "Prêt en 2 heures environ" : "Prêt sous 24 heures"} · gardé 3 jours
                </div>
              </div>
            </div>
          </div>
          <nav className="anav" aria-label="Sections du produit">
            {ANCHORS.map(([v, l], i) => (
              <button key={v} className={(anchor ? anchor === v : i === 0) ? "on" : ""} onClick={() => scrollToSec(v)}>
                {l}
              </button>
            ))}
          </nav>
          <section className="psec" id="s-rev">
            <h2>Avis clients</h2>
            <Reviews rating={p.rating} reviews={p.reviews} product={p} />
          </section>
          <section className="psec" id="s-spec">
            <h2>Caractéristiques</h2>
            <dl className="spec2">
              {specs.map(([dt, dd]) => (
                <div key={dt}>
                  <dt>{dt}</dt>
                  <dd>{dd}</dd>
                </div>
              ))}
            </dl>
          </section>
          <section className="psec desc" id="s-desc">
            <h2>
              Description{" "}
              <button className="lk" onClick={() => modal.open("Signaler ce produit", <ReportForm id={p.id} kind="produit" />)}>
                Signaler ce produit ou ce store
              </button>
            </h2>
            <ul>
              <li>
                {p.n}, vendu par {st.n} sur Prélakay.
              </li>
              <li>À retirer directement en magasin avec votre code de retrait ou votre QR code.</li>
              <li>Photos réelles et description complète fournies par le store en production.</li>
            </ul>
          </section>
          <section className="psec" id="s-qa">
            <h2>
              Questions{" "}
              <button className="lk" onClick={() => modal.open("Poser une question", <AskForm id={p.id} />)}>
                <Fi r="comment-dots" /> Poser une question
              </button>
            </h2>
            <div className="qa">
              <div className="q">
                <Fi r="circle-question" />
                Est-ce que je peux voir le produit avant de payer ?
              </div>
              <div className="a">
                <Fi s="store" />
                Oui, passez au store. Pour le réserver, commandez en ligne : il vous attend 3 jours. — {st.n}
              </div>
            </div>
            <div className="qa">
              <div className="q">
                <Fi r="circle-question" />
                Quelqu&apos;un d&apos;autre peut récupérer ma commande ?
              </div>
              <div className="a">
                <Fi s="store" />
                Oui, avec le code de retrait ou le QR code. — {st.n}
              </div>
            </div>
            {myQs.map((x) => (
              <div className="qa" key={x.k}>
                <div className="q">
                  <Fi r="circle-question" />
                  {x.q}
                </div>
                <div className="a">
                  <Fi s="store" />
                  <span className="cap">En attente de la réponse du store</span>
                </div>
              </div>
            ))}
          </section>
          <section className="psec" id="s-store">
            <h2>Store</h2>
            <div className="storebox">
              <Ph icon={st.i} tint="g4" cls="av" img={storeImage(st.id)} alt={st.n} />
              <div className="tx">
                <b style={{ fontSize: 16 }}>{st.n}</b>
                <div className="cap">
                  {st.addr} · {km(st.km)} · {st.hours}
                </div>
                <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                  {st.trust ? (
                    <span className="tag tag-new">
                      <Fi s="circle-check" />
                      Store de confiance
                    </span>
                  ) : null}
                  <span className="tag tag-neu">
                    {st.rate ? `${fr1(st.rate)} ★ · ` : ""}
                    {k(st.sold)} ventes
                  </span>
                </div>
              </div>
              <Link className="btn btn-s btn-sm" href={`/store/${st.id}`}>
                Voir le store
              </Link>
              <button className="btn btn-s btn-sm" onClick={() => share("store", st.id)}>
                <span style={{ fontSize: 18 }}>
                  <Fi s="qrcode" />
                </span>
                QR code
              </button>
            </div>
            {same.length ? (
              <div className="rail" style={{ marginTop: 16 }}>
                {same.map((x) => (
                  <ProductCard key={x.id} p={x} />
                ))}
              </div>
            ) : null}
          </section>
          <section className="psec" id="s-more" style={{ border: 0 }}>
            <h2>Plus à découvrir</h2>
            <div className="grid" style={{ ["--cols" as string]: desk ? 4 : 2 }}>
              {like.map((x) => (
                <ProductCard key={x.id} p={x} />
              ))}
            </div>
          </section>
        </div>
        <aside className="buy" aria-label="Acheter">
          <div className="bp">
            <b className="tnum">{htg(p.price)}</b>
            {p.was ? <s className="tnum">{htg(p.was)}</s> : null}
          </div>
          <div className="soldby">
            <b>Vendu par</b>
            <Link className="n" href={`/store/${st.id}`}>
              {st.n}
              <Fi s="chevron-right" />
            </Link>
          </div>
          <div className="sub2">
            <Link href={`/store/${st.id}`}>
              <Fi s="circle-info" />
              Infos du store
            </Link>
            <button onClick={route}>
              <Fi s="diamond-turn-right" />
              Itinéraire
            </button>
          </div>
          <div className="engage">
            <div className="eh">
              <span className="lg">Prélakay</span>Engagement Prélakay
            </div>
            <div className="ei">
              <Fi s="store" />
              <div>
                <b>Retrait gratuit en magasin</b> · {km(st.km)}
                <span className="ok">{p.ready ? "Prêt en 2 heures environ" : "Prêt sous 24 heures"}</span>
                <span className="cap">Gardé 3 jours · {st.hours}</span>
              </div>
            </div>
            <div className="ei">
              <Fi s="shield-halved" />
              <div>
                <b>Argent protégé</b>
                <ul>
                  <li>
                    <Fi s="check" />
                    Store payé seulement après le retrait
                  </li>
                  <li>
                    <Fi s="check" />
                    Remboursé sur le wallet si le store annule
                  </li>
                  <li>
                    <Fi s="check" />
                    Avis vérifiés après retrait
                  </li>
                </ul>
              </div>
            </div>
            <div className="ei">
              <Fi s="rotate-left" />
              <div>
                <b>Retour sous 3 jours</b>
                <span className="cap" style={{ display: "block" }}>Si l&apos;article est non conforme ou endommagé (photo obligatoire)</span>
              </div>
            </div>
            <ComingSoon feature="delivery">
              <div className="ei">
                <Fi s="truck" />
                <div>
                  <b>Livraison à domicile</b>
                  <span className="cap" style={{ display: "block" }}>
                    Aux Cayes, environ {BUSINESS.demoDeliveryMinutes} min après la préparation · à partir de {htg(Math.min(...Object.values(BUSINESS.demoDeliveryFee)))}
                  </span>
                </div>
              </div>
            </ComingSoon>
          </div>
          <button className="btn btn-p btn-block" onClick={buy} disabled={stock === 0}>
            Acheter maintenant
          </button>
          <button className="btn btn-o btn-block" onClick={add} disabled={stock === 0} aria-live="polite">
            {added ? <><Fi s="check" /> Ajouté au panier</> : "Ajouter au panier"}
          </button>
          <div className="row2">
            <button onClick={() => share("produit", p.id)}>
              <Fi s="share-nodes" />
              Partager
            </button>
            <button className={s.wish[p.id] ? "on" : ""} onClick={wish(p.id)} aria-label={s.wish[p.id] ? "Retirer de la wishlist" : "Ajouter à la wishlist"}>
              {heart}
            </button>
          </div>
        </aside>
      </div>
      <MBar kind="mbuy">
        <Link className="ic" href={`/store/${st.id}`}>
          <Fi s="store" />
          Store
        </Link>
        <button className="ic" onClick={wish(p.id)}>
          {heart}
          Wishlist
        </button>
        <button className="btn btn-s" onClick={add} disabled={stock === 0} aria-live="polite">
          {added ? <><Fi s="check" /> Ajouté</> : "Au panier"}
        </button>
        <button className="btn btn-p" onClick={buy} disabled={stock === 0}>
          Acheter
        </button>
      </MBar>
    </div>
  );
}
