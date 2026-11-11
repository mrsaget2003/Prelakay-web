"use client";

// Cartes du prototype : card(p), storeCard(s) et l'aperçu rapide (quickView / renderQV).

import { HeartPop } from "./motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type MouseEvent } from "react";
import { prodBy, storeBy, hasOpts, stockFor, selLabel, optsOf, galleryIcons, type Product, type Store } from "@/lib/data/mock/seed";
import { productImage, storeImage } from "@/lib/data/mock/images";
import { useDemo, demo } from "@/lib/demo/store";
import { addToCart, selOf, setChoice, setQty, toggleWish } from "@/lib/demo/actions";
import { formatHTG as htg, formatDistance as km, formatCount as k } from "@/lib/format";
import { useToast } from "@/components/ui/Toast";
import { useModal } from "./modal";
import { Fi, Ph, Stars, fr1 } from "./ui";
import { SkuOptions, QtyRow } from "./Sku";

/** Bouton wishlist (cartes, aperçu rapide, fiche produit). */
export function useWish() {
  const s = useDemo();
  const router = useRouter();
  const toast = useToast();
  return (id: string) => (e?: MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (!s.logged) return router.push("/login");
    const on = toggleWish(id);
    toast.show(on ? "Ajouté à votre wishlist" : "Retiré de votre wishlist", "success");
  };
}

/** Bouton panier rond des cartes : ajout direct sans caractéristique, sinon aperçu rapide. */
export function useQuickAdd() {
  const s = useDemo();
  const router = useRouter();
  const toast = useToast();
  const modal = useModal();
  return (id: string) => (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!s.logged) return router.push("/login");
    const p = prodBy(id)!;
    setQty(id, 1);
    if (hasOpts(p)) return modal.openRaw("qv", <QuickView id={id} mode="add" />);
    addToCart(id, 1); // retour visuel : le badge du panier rebondit (pas de toast, spec §9)
  };
}

/** Carte produit (card du prototype). `showStore={false}` dans une page store : le nom du store n'y est pas répété. */
export function ProductCard({ p, showStore = true, badge }: { p: Product; showStore?: boolean; badge?: string }) {
  const s = useDemo();
  const st = storeBy(p.store)!;
  const wish = useWish();
  const qadd = useQuickAdd();
  return (
    <Link className="pc" href={`/p/${p.id}`}>
      {badge ? <span className={`tag ctl ${badge === "Flash" ? "tag-err" : "tag-neu"}`}>{badge}</span> : p.isNew ? <span className="tag tag-new ctl">Nouveau</span> : null}
      <button className={`wish ${s.wish[p.id] ? "on" : ""}`} onClick={wish(p.id)} aria-label="Wishlist">
        <HeartPop on={!!s.wish[p.id]}>{s.wish[p.id] ? <Fi s="heart" /> : <Fi r="heart" />}</HeartPop>
      </button>
      <div className="im">
        <Ph icon={p.icon} tint={p.tint} img={productImage(p.id)} alt={p.n} />
        {p.stockLow ? <span className="almost">Bientôt épuisé</span> : null}
        <button className="qa" onClick={qadd(p.id)} aria-label="Ajouter au panier">
          <Fi s="cart-plus" />
        </button>
      </div>
      <div className="bd">
        <div className="nm">{p.n}</div>
        <div className="price">
          <b className="tnum">{htg(p.price)}</b>
          {p.was ? <s className="tnum">{htg(p.was)}</s> : null}
        </div>
        <div className="meta">
          {p.reviews ? (
            <>
              <Fi s="star" />
              {fr1(p.rating)}
              <span className="bar" />
            </>
          ) : null}
          {p.sold ? `${k(p.sold)} vendus` : "Nouveau sur Prélakay"}
        </div>
        {showStore ? (
          <div className="st">
            {st.type === "physique" ? <Fi s="store" /> : <Fi s="globe" />}
            <span>
              {st.n} · {km(st.km)}
            </span>
          </div>
        ) : null}
      </div>
    </Link>
  );
}

export function StoreCard({ s, products }: { s: Store; products: Product[] }) {
  const pr = products.filter((p) => p.store === s.id).slice(0, 3);
  return (
    <Link className="storec" href={`/store/${s.id}`}>
      <div className="top">
        <Ph icon={s.i} tint="g4" cls="av" img={storeImage(s.id)} alt={s.n} />
        <div style={{ minWidth: 0 }}>
          <b>{s.n}</b>
          <span className="cap">
            {km(s.km)} · {s.addr.split(",")[0]}
          </span>
        </div>
      </div>
      <div className="row">
        {s.trust ? (
          <span className="tag tag-new">
            <Fi s="circle-check" />
            Store de confiance
          </span>
        ) : null}
        <span className="tag tag-neu">{s.type === "physique" ? "Retrait en magasin" : "Store en ligne"}</span>
      </div>
      <div className="thumbs">
        {pr.map((p) => (
          <Ph key={p.id} icon={p.icon} tint={p.tint} img={productImage(p.id, 160)} alt={p.n} />
        ))}
      </div>
    </Link>
  );
}


/** Ouvre l'aperçu rapide en mode « cart » : reprend le choix et la quantité de la ligne. */
export function openCartVariant(modal: ReturnType<typeof useModal>, ci: number) {
  const c = demo.get().cart[ci];
  const p = prodBy(c.p);
  if (!p) return;
  const parts = c.v.split(" · ");
  demo.update((s) => {
    const cur = selOf(p, s);
    const o = { ...cur.o };
    optsOf(p).forEach((a, j) => (o[a.k] = parts[j] || o[a.k]));
    s.sel[p.id] = { o, q: c.q };
  });
  modal.openRaw("qv", <QuickView id={p.id} mode="cart" ci={ci} />);
}

/** Aperçu rapide (desktop) / feuille de caractéristiques (mobile) — renderQV du prototype. */
export function QuickView({ id, mode, ci }: { id: string; mode: "add" | "cart"; ci?: number }) {
  const s = useDemo();
  const modal = useModal();
  const toast = useToast();
  const wish = useWish();
  const [img, setImg] = useState(0);
  const p = prodBy(id)!;
  const st = storeBy(p.store)!;
  const sel = selOf(p, s);
  const stock = stockFor(p, sel.o);
  const cta = mode === "cart" ? "Mettre à jour" : "Ajouter au panier";
  const gal = galleryIcons(p);

  const go = () => {
    if (mode === "cart" && ci != null) {
      const label = selLabel(p, sel.o);
      demo.update((d) => {
        const cl = d.cart[ci];
        const dup = d.cart.find((c, j) => j !== ci && c.p === p.id && c.v === label);
        if (dup) {
          dup.q += sel.q;
          d.cart.splice(ci, 1);
        } else {
          cl.v = label;
          cl.q = sel.q;
        }
      });
      modal.close();
    } else {
      addToCart(p.id);
      modal.close();
    }
  };
  const pick = (k: string, v: string) => setChoice(p.id, k, v);
  const qty = <QtyRow q={sel.q} stock={stock} onQ={(q) => setQty(p.id, q)} />;

  return (
    <>
      <button className="qv-x" onClick={modal.close} aria-label="Fermer">
        <Fi s="xmark" />
      </button>
      <div className="qv-d">
        <div className="gal">
          <div className="th">
            {gal.map((ic, i) => (
              <button key={i} className={i === img ? "on" : ""} onClick={() => setImg(i)}>
                <Ph icon={ic} tint={p.tint} img={i === 0 ? productImage(p.id, 160) : undefined} alt={p.n} />
              </button>
            ))}
          </div>
          <div>
            <Ph icon={gal[img]} tint={p.tint} cls="main" img={img === 0 ? productImage(p.id, 700) : undefined} alt={p.n} />
          </div>
        </div>
        <div className="qv-i">
          <h2>{p.n}</h2>
          <div className="rate">
            {p.reviews ? (
              <>
                <span className="stars">
                  <Stars r={p.rating} />
                </span>
                <b>{fr1(p.rating)}</b>
                <span>{p.reviews} avis</span>
                <span>·</span>
              </>
            ) : null}
            <span>{p.sold ? `${k(p.sold)} vendus` : "Nouveau"}</span>
          </div>
          <div className="pbox">
            <div className="bigp">
              <b className="tnum">{htg(p.price)}</b>
              {p.was ? (
                <>
                  <s className="tnum">{htg(p.was)}</s>
                  <span className="tag tag-new">−{p.disc} %</span>
                </>
              ) : null}
            </div>
          </div>
          <SkuOptions p={p} o={sel.o} onPick={pick} />
          {qty}
        </div>
        <aside className="qv-r">
          <div className="soldby">
            <b>Vendu par</b>
            <Link href={`/store/${st.id}`} onClick={modal.close}>
              {st.n} <Fi s="chevron-right" />
            </Link>
          </div>
          <div className="engage mini">
            <div className="ei">
              <Fi s="store" />
              <div>
                <b>Retrait gratuit</b> · {km(st.km)}
                <span className="ok">{p.ready ? "Prêt en 2 heures environ" : "Prêt sous 24 heures"}</span>
              </div>
            </div>
            <div className="ei">
              <Fi s="shield-halved" />
              <div>
                <b>Argent protégé</b>
                <span className="cap" style={{ display: "block" }}>Payé au store après le retrait</span>
              </div>
            </div>
          </div>
          <button className="btn btn-p btn-lg btn-block" onClick={go} disabled={!stock}>
            {cta}
          </button>
          <div className="row2">
            <Link className="btn btn-s" href={`/p/${p.id}`} onClick={modal.close}>
              Voir les détails
            </Link>
            <button className="btn btn-s" onClick={wish(p.id)} aria-label="Wishlist">
              {s.wish[p.id] ? <Fi s="heart" /> : <Fi r="heart" />}
            </button>
          </div>
        </aside>
      </div>
      <div className="qv-m">
        <div className="sh-top">
          <Ph icon={p.icon} tint={p.tint} img={productImage(p.id, 200)} alt={p.n} />
          <div>
            <b className="tnum">{htg(p.price)}</b>
            {p.was ? (
              <>
                {" "}
                <s className="tnum">{htg(p.was)}</s>
              </>
            ) : null}
            <span className="cap">{stock ? `Stock : ${stock}` : "Épuisé pour ce choix"}</span>
            <span className="cap">Choix : {selLabel(p, sel.o)}</span>
          </div>
        </div>
        <div className="sh-body">
          <SkuOptions p={p} o={sel.o} onPick={pick} />
          {qty}
        </div>
        <div className="sh-foot">
          <button className="btn btn-p btn-lg btn-block" onClick={go} disabled={!stock}>
            {cta}
          </button>
        </div>
      </div>
    </>
  );
}
