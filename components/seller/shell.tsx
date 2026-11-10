"use client";

// Coque de l'Espace vendeur (Seller Center) — sLayout, sellerTabs, sellerGate du prototype :
// barre du haut (logo · « Espace vendeur » · store géré · Valider un retrait · messages ·
// notifications · store · retour aux achats), menu latéral repliable, onglets mobiles.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { STORES } from "@/lib/data/mock/seed";
import { storeImage } from "@/lib/data/mock/images";
import { useDemo, hydrateDemo } from "@/lib/demo/store";
import { SMENU, SELLER_TABS } from "@/lib/demo/sellerMenu";
import { approveKyc, myStore, sellerUnread, setManagedStore, todo } from "@/lib/demo/sellerActions";
import { Logo } from "@/components/brand/Logo";
import { useToast } from "@/components/ui/Toast";
import { ModalProvider, useModal } from "@/components/proto/modal";
import { SupportForm } from "@/components/proto/shell";
import { DataIcon, Fi, NeedLogin, Ph } from "@/components/proto/ui";
import { VzTooltip } from "@/components/charts/vz";

/** Adresse du site acheteur (autre déploiement quand APP_SPACE=vendeur). */
export const BUYER_URL = process.env.NEXT_PUBLIC_URL_ACHETEUR ?? "";

const SGROUP: Record<string, string> = {
  products: "products", stock: "products", orders: "orders", pickup: "orders", disputes: "orders", marketing: "marketing", share: "marketing",
  finance: "finance", payouts: "finance", reviews: "reviews", questions: "reviews", messages: "messages", stats: "stats", store: "store",
  policy: "store", trust: "store", account: "account", notifications: "account", menu: "home",
};

export type SRoute = { sec: string; sub: string | null; group: string; root: boolean };
export function parseSeller(pathname: string): SRoute {
  const parts = pathname.split("/").filter(Boolean).slice(1).map(decodeURIComponent);
  const sec = parts[0] || "home";
  const sub = parts[1] ?? null;
  return { sec, sub, group: SGROUP[sec] || "home", root: !sub && ["home", "orders", "products", "messages", "menu"].includes(sec) };
}
const RouteCtx = createContext<SRoute>(parseSeller("/seller"));
export const useSRoute = () => useContext(RouteCtx);

/** En-tête de page : fil d'Ariane + titre (sc-head du prototype). */
export function SHead({ title, crumb }: { title: string; crumb?: [string, string?][] }) {
  return (
    <div className="sc-head">
      {crumb ? (
        <nav className="sc-crumb">
          <Link href="/seller">Accueil</Link>
          {crumb.map(([l, h]) => (
            <span key={l} style={{ display: "contents" }}>
              <Fi s="chevron-right" />
              {h ? <Link href={h}>{l}</Link> : <span>{l}</span>}
            </span>
          ))}
        </nav>
      ) : null}
      <h1>{title}</h1>
    </div>
  );
}

function Side({ r }: { r: SRoute }) {
  const s = useDemo();
  const T = todo(s);
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const path = r.sec + (r.sub === "new" ? "/new" : "");
  return (
    <nav>
      {SMENU.map(([k, icon, label, items]) => {
        const on = k === r.group;
        if (typeof items === "string")
          return (
            <Link key={k} className={`sm-i${on ? " on" : ""}`} href={`/seller${items ? "/" + items : ""}`} aria-current={on ? "page" : undefined}>
              <DataIcon cls={icon} />
              {label}
              {k === "messages" && T.m ? <span className="n">{T.m}</span> : null}
            </Link>
          );
        const isOpen = on || open[k];
        return (
          <div key={k} className={`sm-g${isOpen ? " open" : ""}`}>
            <button className={`sm-i${on ? " on" : ""}`} aria-expanded={!!isOpen} onClick={() => setOpen((o) => ({ ...o, [k]: !isOpen }))}>
              <DataIcon cls={icon} />
              {label}
              {k === "orders" && T.toPrep ? <span className="n">{T.toPrep}</span> : null}
              <Fi s="chevron-down" className="car" />
            </button>
            <div className="sm-s">
              {items.map(([h, l]) => {
                const cur = path === h || (r.sec === h && r.sub !== "new" && !h.includes("/"));
                return (
                  <Link key={h} className={cur ? "on" : ""} href={`/seller/${h}`} aria-current={cur ? "page" : undefined}>
                    {l}
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </nav>
  );
}

function Tabs({ r }: { r: SRoute }) {
  const s = useDemo();
  const T = todo(s);
  const tabs = SELLER_TABS.map(([h, k, icon, label]) => [h, k, icon, label, k === "orders" ? T.toPrep : k === "messages" ? T.m : 0] as const);
  return (
    <nav className="tabbar sel" aria-label="Navigation vendeur">
      {tabs.map(([h, k, icon, label, n]) => {
        // « Plus » est actif sur le menu et sur les sections hors onglets (le prototype allumait « Accueil » sur le menu).
        const on = r.sec === "menu" ? k === "more" : k === r.group || (k === "more" && !["home", "orders", "products", "messages"].includes(r.group));
        return (
          <Link key={k} href={h} className={on ? "on" : ""} aria-current={on ? "page" : undefined}>
            <span className="ti">
              <DataIcon cls={icon} />
              {n ? <span className="cnt">{n}</span> : null}
            </span>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

/** Accès : connexion puis dossier KYC approuvé (sellerGate du prototype). */
function Gate() {
  const s = useDemo();
  const toast = useToast();
  if (!s.logged) return <NeedLogin what="L'espace vendeur" next="/seller" />;
  const lv = s.kyc === "recu" ? 0 : 1;
  const approve = () => {
    approveKyc();
    toast.show("Dossier approuvé : bienvenue dans l'espace vendeur", "success");
  };
  return (
    <div className="wrap">
      <div className="panel sgate">
        <span className="sg-i">
          <Fi s="store" />
        </span>
        <h1>Espace vendeur</h1>
        {s.kyc ? (
          <>
            <p className="muted">Votre dossier est {lv === 0 ? "reçu" : "en vérification"}. L&apos;espace vendeur s&apos;ouvre dès qu&apos;il est approuvé.</p>
            <div className="row-b" style={{ justifyContent: "center" }}>
              <a className="btn btn-o" href={`${BUYER_URL}/sell`}>Voir mon dossier</a>
              <button className="btn btn-p" onClick={approve}>Prototype : approuver le dossier</button>
            </div>
          </>
        ) : (
          <>
            <p className="muted">Vendez aux acheteurs de Les Cayes, avec retrait en magasin et paiement protégé.</p>
            <div className="sg-b">
              {[["store", "Retrait en magasin", "Pas de livraison à gérer"], ["shield-halved", "Paiement garanti", "L'acheteur paie avant de venir"], ["location-dot", "Visible sur la carte", "Les acheteurs proches vous trouvent"]].map(([i, b, c]) => (
                <div key={b}>
                  <Fi s={i as "store"} />
                  <b>{b}</b>
                  <span className="cap">{c}</span>
                </div>
              ))}
            </div>
            <div className="row-b" style={{ justifyContent: "center" }}>
              <a className="btn btn-p btn-lg" href={`${BUYER_URL}/sell`}>Enregistrer son commerce</a>
              <button className="btn btn-o btn-lg" onClick={approve}>Prototype : passer le KYC</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Center({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const r = parseSeller(pathname);
  const s = useDemo();
  const toast = useToast();
  const modal = useModal();
  const st = myStore(s);
  const T = todo(s);
  const un = sellerUnread(s);
  const ok = s.logged && s.kyc === "ok";

  useEffect(() => {
    const B = document.body;
    B.classList.toggle("seller", ok);
    B.classList.toggle("root", ok && r.root);
    B.setAttribute("data-route", "seller");
    return () => {
      B.classList.remove("seller", "root");
    };
  }, [ok, r.root]);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  if (!ok) return <Gate />;
  return (
    <RouteCtx.Provider value={r}>
      <div className="sc">
        <header className="sc-top">
          <div className="sc-tl">
            <Link className="logo d-only" href="/seller" aria-label="Espace vendeur, accueil">
              <Logo variant="full" tone="lagon" height={30} />
            </Link>
            <Link className="logo m-only" href="/seller" aria-label="Espace vendeur, accueil">
              <Logo variant="mark" tone="lagon" height={30} />
            </Link>
            <span className="sc-lab">Espace vendeur</span>
          </div>
          <label className="sc-sw" title="Prototype : choisir le store à gérer">
            <span>Prototype</span>
            <select
              aria-label="Store géré (prototype)"
              value={s.seller.store}
              onChange={(e) => {
                setManagedStore(e.target.value);
                toast.show(`Prototype : vous gérez ${STORES.find((x) => x.id === e.target.value)!.n}`);
              }}
            >
              {STORES.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.n}
                </option>
              ))}
            </select>
          </label>
          <div className="sc-tr">
            <Link className="btn btn-p btn-sm d-only" href="/seller/pickup">
              <Fi s="qrcode" />
              Valider un retrait
            </Link>
            <Link className="sc-ic" href="/seller/messages" aria-label="Messages">
              <Fi s="comment-dots" />
              {T.m ? <span className="cnt">{T.m}</span> : null}
            </Link>
            <Link className="sc-ic" href="/seller/notifications" aria-label="Notifications">
              <Fi s="bell" />
              {un ? <span className="cnt">{un}</span> : null}
            </Link>
            <Link className="sc-me" href="/seller/store">
              <Ph icon={st.i} tint="g4" cls="sav" img={storeImage(st.id, 120)} alt={st.n} />
              <span className="d-only">
                <b>{st.n}</b>
                <small>{s.name} · propriétaire</small>
              </span>
            </Link>
            <a className="sc-ic" href={`${BUYER_URL}/`} title="Retour aux achats" aria-label="Retour aux achats">
              <Fi s="arrow-right-from-bracket" />
            </a>
          </div>
        </header>
        <div className="sc-body">
          <aside className="sc-side" aria-label="Menu vendeur">
            <Side r={r} />
            <div className="sc-help">
              <b>Besoin d&apos;aide ?</b>
              <span className="cap">L&apos;équipe Prélakay accompagne les stores pilotes.</span>
              <button className="btn btn-o btn-sm" onClick={() => modal.open("Support Prélakay", <SupportForm user={s.user} />)}>
                Contacter
              </button>
            </div>
          </aside>
          <div className="sc-main">{children}</div>
        </div>
      </div>
      <Tabs r={r} />
    </RouteCtx.Provider>
  );
}

export function SellerShell({ children }: { children: ReactNode }) {
  useEffect(() => hydrateDemo(), []);
  return (
    <ModalProvider>
      <Center>{children}</Center>
      <VzTooltip />
    </ModalProvider>
  );
}
