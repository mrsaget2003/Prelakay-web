"use client";

// Coque de l'Acheteur, portée du prototype : renderHeader (+ méga-menu), renderMTop,
// renderTabbar, renderFooter, rail flottant, classes du <body> posées par render().
// Desktop = header AliExpress ; mobile = coque de l'app (03-design §9.2 et §9.2 bis).

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { CATS, STORES, PICONS, TINTS, P, catBy, storeBy } from "@/lib/data/mock/seed";
import { productImage, storeImage } from "@/lib/data/mock/images";
import { useDemo, hydrateDemo, demo } from "@/lib/demo/store";
import { cartCount, unread } from "@/lib/demo/actions";
import { parseRoute, type ProtoRoute } from "@/lib/proto/route";
import { formatHTG as htg } from "@/lib/format";
import { Logo } from "@/components/brand/Logo";
import { ComingSoon } from "@/components/ui/ComingSoon";
import { SoonBadge } from "@/components/ui/Tag";
import { useToast } from "@/components/ui/Toast";
import { ModalProvider, useModal } from "./modal";
import { SearchBox } from "./search";
import { DataIcon, Fi, Ph, Qr, useMounted } from "./ui";
import { ShareModal } from "./share";
import { Intro } from "./auth";

/* ---------- route courante ---------- */
const RouteCtx = createContext<ProtoRoute>(parseRoute("/", ""));
export const useProtoRoute = () => useContext(RouteCtx);

/* ---------- barres d'action mobiles (#mbuy, #mbar) ---------- */
type Bars = { set(kind: "mbuy" | "mbar", on: boolean): void; mbuy: boolean; mbar: boolean };
const BarsCtx = createContext<Bars>({ set() {}, mbuy: false, mbar: false });

/** Barre d'action fixe du bas (prototype : #mbar, ex. panier « Commander », paiement « Payer »). */
export function MBar({ children, kind = "mbar" }: { children: ReactNode; kind?: "mbuy" | "mbar" }) {
  const bars = useContext(BarsCtx);
  const mounted = useMounted();
  const el = mounted ? document.getElementById(kind) : null;
  useEffect(() => {
    bars.set(kind, true);
    return () => bars.set(kind, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind]);
  return el ? createPortal(children, el) : null;
}

const ROOT = ["home", "categories", "cart", "account"];
const TITLES: Record<string, string> = {
  p: "Produit", store: "Store", cart: "Panier", checkout: "Paiement", done: "Confirmation", orders: "Commandes", wallet: "Wallet", coins: "Coins",
  wishlist: "Wishlist", sell: "Enregistrer sa Commerce", help: "Centre d'aide", shared: "Panier partagé", login: "Connexion", signup: "Créer un compte",
  account: "Compte", categories: "Catégories", notifications: "Centre de messages", settings: "Paramètres", viewed: "Vus récemment",
  disputes: "Retours et litiges", myreviews: "Mes avis", map: "Carte des stores", discover: "Produits",
};
const SETTINGS_TITLES: Record<string, string> = {
  profile: "Informations personnelles", secu: "Sécurité du compte", notifs: "Notifications", lang: "Langue et devise", ville: "Ville de retrait", privacy: "Confidentialité",
};

export function titleFor(r: ProtoRoute, cartLines: number): string {
  if (r.name === "orders" && r.id) return `Commande ${r.id}`;
  if (r.name === "store" && r.id && storeBy(r.id)) return storeBy(r.id)!.n;
  if (r.name === "settings" && r.id) return SETTINGS_TITLES[r.id] ?? "Paramètres";
  if (r.name === "p" && r.sub) return "Avis";
  if (r.name === "cart") return `Panier (${cartLines})`;
  return TITLES[r.name] || "Prélakay";
}

/* ---------- header desktop ---------- */
function Header({ r }: { r: ProtoRoute }) {
  const s = useDemo();
  const router = useRouter();
  const toast = useToast();
  const home = r.name === "home";
  const n = unread(s);
  const cc = cartCount(s);
  const hdr = useRef<HTMLElement>(null);
  // le méga-menu se referme à chaque changement de page (clé de route)
  const routeKey = `${r.name}/${r.id}/${r.params.cat ?? ""}`;
  const [megaState, setMegaState] = useState({ open: false, at: routeKey });
  const mega = megaState.open && megaState.at === routeKey;
  const setMega = (v: boolean | ((o: boolean) => boolean)) =>
    setMegaState((st) => {
      const cur = st.open && st.at === routeKey;
      return { open: typeof v === "function" ? v(cur) : v, at: routeKey };
    });
  const [megaCat, setMegaCat] = useState(CATS[0].id);
  const [locOpen, setLocOpen] = useState(false);
  const [city, setCity] = useState("Les Cayes");
  const [lang, setLang] = useState("Français");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDesk = () => window.innerWidth >= 1024;

  // --hh : hauteur du header (méga-menu, ancres de la fiche produit)
  useEffect(() => {
    const set = () => hdr.current && document.documentElement.style.setProperty("--hh", hdr.current.offsetHeight + "px");
    set();
    window.addEventListener("resize", set);
    return () => window.removeEventListener("resize", set);
  }, [home]);
  useEffect(() => {
    document.body.classList.toggle("mega-on", mega && !isDesk());
  }, [mega]);
  useEffect(() => {
    const out = (e: Event) => {
      const t = e.target as HTMLElement;
      if (!t.closest(".dd")) setLocOpen(false);
      if (isDesk() && !t.closest("#megaP .in") && !t.closest("[data-act=mega]")) setMegaState((st) => ({ ...st, open: false }));
    };
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMegaState((st) => ({ ...st, open: false }));
        setLocOpen(false);
      }
    };
    document.addEventListener("click", out);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("click", out);
      document.removeEventListener("keydown", esc);
    };
  }, []);

  // survol « Toutes les catégories » (desktop) : ouverture 120 ms, fermeture 180 ms
  const hoverIn = () => {
    if (!isDesk()) return;
    if (timer.current) clearTimeout(timer.current);
    if (!mega) timer.current = setTimeout(() => setMega(true), 120);
  };
  const hoverOut = () => {
    if (!isDesk()) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setMega(false), 180);
  };

  const L = (h: string, icon: ReactNode, t: string, x?: ReactNode) => (
    <Link className="mi" href={s.logged ? h : "/login"}>
      {icon}
      {t}
      {x}
    </Link>
  );
  const c = catBy(megaCat)!;
  const megaStores = STORES.filter((st) => P.some((p) => p.store === st.id && p.cat === c.id));
  const megaPop = P.filter((p) => p.cat === c.id).slice(0, 6);

  return (
    <header className="hdr" id="hdr" ref={hdr}>
      <div className="wrap">
        <div className="h1">
          <button className="hb hb-m" data-act="drawer" onClick={() => setMega((m) => !m)} aria-label="Toutes les catégories">
            <Fi s="bars" />
          </button>
          <Link className="logo" href="/" aria-label="Prélakay, accueil">
            <Logo variant="full" tone="lagon" height={34} priority />
          </Link>
          {home ? null : (
            <button className="hb hb-d" data-act="mega" onClick={() => setMega((m) => !m)} onMouseEnter={hoverIn} onMouseLeave={hoverOut} aria-label="Toutes les catégories">
              <Fi s="bars" />
            </button>
          )}
          <SearchBox key={`d-${r.q}`} variant="desk" initial={r.q || ""} onFocusOpen={() => setMega(false)} />
          <div className="hdr-r">
            <div className="dd hov app">
              <ComingSoon feature="native_app">
                <button className="hi">
                  <Fi s="qrcode" />
                  <span className="lb">
                    Télécharger
                    <br />
                    <b>l&apos;app Prélakay</b>
                  </span>
                </button>
              </ComingSoon>
              <div className="ddp app">
                <div className="qr">
                  <Qr seed="prelakay-app" />
                </div>
                <div>
                  <b>L&apos;app Prélakay</b>
                  <span className="cap">Scannez le QR code pour la télécharger.</span>
                  <div className="stores">
                    <ComingSoon feature="native_app">
                      <button>
                        <Fi s="apple" />
                        App Store
                      </button>
                    </ComingSoon>
                    <ComingSoon feature="native_app">
                      <button>
                        <Fi s="google-play" />
                        Google Play
                      </button>
                    </ComingSoon>
                  </div>
                  <span className="soon-t" style={{ display: "inline-block", margin: "8px 0 0" }}>À venir</span>
                </div>
              </div>
            </div>
            <div className={`dd loc${locOpen ? " open" : ""}`}>
              <button className="hi" aria-haspopup="true" onClick={(e) => { e.stopPropagation(); setLocOpen((o) => !o); }}>
                <span className="flag" aria-hidden="true" />
                <span className="lb">
                  {s.city}/FR/
                  <br />
                  <b>HTG</b> <Fi s="chevron-down" className="chev" />
                </span>
              </button>
              <div className="ddp loc">
                <h4>Retrait à</h4>
                <select aria-label="Pays">
                  <option>Haïti</option>
                </select>
                <select id="locCity" aria-label="Ville" value={city} onChange={(e) => setCity(e.target.value)}>
                  <option>Les Cayes</option>
                  <option value="x">Port-au-Prince (bientôt)</option>
                  <option value="x2">Cap-Haïtien (bientôt)</option>
                  <option value="x3">Jacmel (bientôt)</option>
                </select>
                <h4>Langue</h4>
                <select id="locLang" aria-label="Langue" value={lang} onChange={(e) => setLang(e.target.value)}>
                  <option>Français</option>
                  <option value="creole">Kreyòl (à venir)</option>
                </select>
                <h4>Devise</h4>
                <select aria-label="Devise">
                  <option>HTG (gourde)</option>
                </select>
                <button
                  className="btn btn-dark"
                  onClick={() => {
                    if (lang === "creole") return toast.soon();
                    if (city !== "Les Cayes") return toast.show("Prélakay n'est pas encore disponible dans cette ville.");
                    setLocOpen(false);
                    toast.show("Préférences enregistrées", "success");
                  }}
                >
                  Enregistrer
                </button>
              </div>
            </div>
            <div className="dd hov accm">
              <Link className="hi" href={s.logged ? "/account" : "/login"} aria-label="Mon compte">
                <Fi r="user" />
                {n && s.logged ? <span className="dot" /> : null}
                <span className="lb">
                  {s.logged ? (
                    <>
                      Bonjour,
                      <br />
                      <b>@{s.user}</b>
                    </>
                  ) : (
                    <>
                      Bienvenue
                      <br />
                      <b>Se connecter / S&apos;inscrire</b>
                    </>
                  )}
                </span>
              </Link>
              <div className="ddp accm">
                {s.logged ? (
                  <div className="who">
                    <span className="avt">{s.name[0]}</span>
                    <div>
                      <b>@{s.user}</b>
                      <span className="cap">
                        Wallet : <span className="tnum">{htg(s.wallet)}</span>
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="in">
                    <Link className="btn" href="/login">Se connecter</Link>
                    <Link href="/signup">Créer un compte</Link>
                  </div>
                )}
                <hr />
                {L("/orders", <Fi s="receipt" />, "Mes commandes")}
                {L("/coins", <Fi s="coins" />, "Mes Coins", <span className="r">{s.logged ? s.coins : ""}</span>)}
                <Link className="mi" href={s.logged ? "/notifications" : "/login"}>
                  <Fi r="bell" />
                  Centre de messages
                  {n && s.logged ? <span className="n">{n}</span> : null}
                </Link>
                {L("/wallet", <Fi s="wallet" />, "Wallet")}
                {L("/wishlist", <Fi r="heart" />, "Wishlist")}
                <ComingSoon feature="coupons">
                  <button className="mi">
                    <Fi s="tag" />
                    Mes coupons
                    <SoonBadge />
                  </button>
                </ComingSoon>
                <hr />
                <Link className="sm" href={s.logged ? "/settings" : "/login"}>Paramètres</Link>
                <Link className="sm" href="/sell">Enregistrer sa Commerce</Link>
                <a className="sm" href={process.env.NEXT_PUBLIC_URL_VENDEUR ? `${process.env.NEXT_PUBLIC_URL_VENDEUR}/seller` : "/seller"}>Espace vendeur</a>
                <Link className="sm" href="/help">Centre d&apos;aide</Link>
                <Link className="sm" href={s.logged ? "/disputes" : "/login"}>Retours et litiges</Link>
                {s.logged ? (
                  <button
                    className="sm"
                    onClick={() => {
                      demo.update((d) => { d.logged = false; });
                      toast.show("Vous êtes déconnecté", "success");
                      router.push("/");
                    }}
                  >
                    Se déconnecter
                  </button>
                ) : null}
              </div>
            </div>
            <Link className="hi" href="/cart" aria-label={`Panier, ${cc} article${cc > 1 ? "s" : ""}`}>
              <Fi s="cart-shopping" />
              <span className="cnt">{cc}</span>
              <span className="lb">
                <br />
                <b>Panier</b>
              </span>
            </Link>
          </div>
        </div>
        {home ? (
          <nav className="h2" aria-label="Raccourcis">
            <button className="allcats" data-act="mega" onClick={() => setMega((m) => !m)} onMouseEnter={hoverIn} onMouseLeave={hoverOut}>
              <Fi s="bars" />
              Toutes les catégories
            </button>
            <Link className="hl" href="/discover?sort=new">Nouveaux sur Prélakay</Link>
            <Link href="/discover?sort=near">Près de vous</Link>
            <Link href="/discover?ready=1">Prêts à retirer</Link>
            <Link href="/map">Carte des stores</Link>
            {CATS.slice(0, 3).map((x) => (
              <Link key={x.id} className="d-only" href={`/discover?cat=${x.id}`}>
                {x.n}
              </Link>
            ))}
            <div className="dd hov more">
              <button>
                Plus <Fi s="chevron-down" />
              </button>
              <div className="ddp more">
                {CATS.slice(3).map((x) => (
                  <Link key={x.id} href={`/discover?cat=${x.id}`}>
                    <DataIcon cls={x.i} />
                    {x.n}
                  </Link>
                ))}
                <ComingSoon feature="sourcing">
                  <button>
                    <Fi s="globe" />
                    Produits du monde
                    <SoonBadge />
                  </button>
                </ComingSoon>
              </div>
            </div>
          </nav>
        ) : null}
      </div>
      <div className={`megaP${mega ? " open" : ""}`} id="megaP" aria-hidden={!mega}>
        <div className="mega-ovl" />
        <div className="mega-sheet">
          <div className="wrap">
            <div className="mega-h">
              <button className="hb" onClick={() => setMega(false)} aria-label="Fermer">
                <Fi s="xmark" />
              </button>
              <b>Catégories</b>
            </div>
            <div className="mega-q">
              {[["/discover?sort=new", "Nouveaux"], ["/discover?sort=near", "Près de vous"], ["/discover?ready=1", "Prêts à retirer"], ["/map", "Carte des stores"], ["/discover", "Tout voir"]].map((x) => (
                <Link key={x[0]} className="chip" href={x[0]}>
                  {x[1]}
                </Link>
              ))}
            </div>
            <div className="in" onMouseEnter={hoverIn} onMouseLeave={hoverOut}>
              <div className="mega-l">
                {CATS.map((x) => (
                  <button key={x.id} className={x.id === megaCat ? "on" : ""} onClick={() => setMegaCat(x.id)} onMouseOver={() => mega && setMegaCat(x.id)}>
                    <DataIcon cls={x.i} />
                    {x.n}
                    <Fi s="chevron-right" className="go-i" />
                  </button>
                ))}
              </div>
              <div className="mega-r" id="megaR">
                <h5>
                  Recommandé <Link href={`/discover?cat=${c.id}`}>Tout {c.n.toLowerCase()} ›</Link>
                </h5>
                <div className="row">
                  {c.sub.map((sub, i) => (
                    <Link key={sub} href={`/discover?cat=${c.id}&sub=${encodeURIComponent(sub)}`}>
                      <Ph icon={PICONS[c.id][i] || c.i} tint={TINTS[i % 5]} />
                      {sub}
                    </Link>
                  ))}
                </div>
                {megaStores.length ? (
                  <>
                    <h5>Stores de la catégorie</h5>
                    <div className="row st">
                      {megaStores.map((st) => (
                        <Link key={st.id} href={`/store/${st.id}`}>
                          <Ph icon={st.i} tint="g4" img={storeImage(st.id, 160)} alt={st.n} />
                          {st.n}
                        </Link>
                      ))}
                    </div>
                  </>
                ) : null}
                <h5>Populaires</h5>
                <div className="row">
                  {megaPop.map((p) => (
                    <Link key={p.id} href={`/p/${p.id}`}>
                      <Ph icon={p.icon} tint={p.tint} img={productImage(p.id, 160)} alt={p.n} />
                      {p.n.length > 28 ? p.n.slice(0, 26) + "…" : p.n}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

/* ---------- haut de page mobile ---------- */
function MTop({ r, title }: { r: ProtoRoute; title: string }) {
  const s = useDemo();
  const router = useRouter();
  const modal = useModal();
  const n = r.name;
  const cc = cartCount(s);
  const back = () => (window.history.length > 1 ? router.back() : router.push("/"));
  let h: ReactNode = null;
  if (n === "home")
    h = (
      <>
        <SearchBox key={`m-${r.q}`} variant="mob" initial={r.q} />
        <nav className="mcats">
          {[{ id: "", n: "Pour vous" }, ...CATS].map((x, i) => (
            <Link key={x.id || "fy"} className={i === 0 ? "on" : ""} href={x.id ? `/discover?cat=${x.id}` : "/"}>
              {x.n}
            </Link>
          ))}
        </nav>
      </>
    );
  else if (n === "categories") h = <SearchBox key={`m-${r.q}`} variant="mob" initial={r.q} />;
  else if (n === "discover" || n === "search") h = <SearchBox key={`m-${r.q}`} variant="mob" initial={r.q} back />;
  else if (n === "p")
    h = (
      <div className="mt-pdp">
        <button className="mb round" onClick={back} aria-label="Retour">
          <Fi s="chevron-left" />
        </button>
        <span />
        <button className="mb round" onClick={() => modal.open("Partager ce produit", <ShareModal kind="produit" id={r.id ?? ""} />)} aria-label="Partager">
          <Fi s="share-nodes" />
        </button>
        <Link className="mb round" href="/cart" aria-label="Panier">
          <Fi s="cart-shopping" />
          {cc ? <span className="cnt">{cc}</span> : null}
        </Link>
      </div>
    );
  else if (n === "account") h = null;
  else
    h = (
      <div className="mt-bar">
        {n === "cart" ? (
          <span className="mb" />
        ) : (
          <button className="mb" onClick={back} aria-label="Retour">
            <Fi s="chevron-left" />
          </button>
        )}
        <b>{title}</b>
        {n === "store" ? (
          <Link className="mb" href={`/store/${r.id}/products`} aria-label="Chercher dans le store">
            <Fi s="magnifying-glass" />
          </Link>
        ) : n === "cart" ? (
          <button className="mb" onClick={() => modal.open("Partager votre panier", <ShareModal kind="panier" id="" />)} aria-label="Partager le panier">
            <Fi s="share-nodes" />
          </button>
        ) : (
          <span className="mb" />
        )}
      </div>
    );
  return (
    <div className={`mtop${n === "p" ? " over" : ""}${h ? "" : " none"}`} id="mtop">
      {h}
    </div>
  );
}

/* ---------- barre d'onglets mobile ---------- */
function TabBar({ r }: { r: ProtoRoute }) {
  const s = useDemo();
  const cc = cartCount(s);
  const tabs: [string, string, "house" | "table-cells-large" | "cart-shopping" | "user", string][] = [
    ["/", "home", "house", "Accueil"],
    ["/categories", "categories", "table-cells-large", "Catégories"],
    ["/cart", "cart", "cart-shopping", "Panier"],
    ["/account", "account", "user", "Compte"],
  ];
  return (
    <nav className="tabbar" id="tabbar" aria-label="Navigation principale">
      {tabs.map(([href, name, icon, label]) => {
        const a = r.name === name;
        return (
          <Link key={name} href={href} className={a ? "on" : ""} aria-current={a ? "page" : undefined}>
            <span className="ti">
              {icon === "user" && !a ? <Fi r="user" /> : <Fi s={icon} />}
              {name === "cart" && cc ? <span className="cnt">{cc}</span> : null}
              {name === "account" && unread(s) && s.logged ? <span className="dot" /> : null}
            </span>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

/* ---------- pied de page (desktop) ---------- */
function Footer() {
  return (
    <footer className="ftr" id="ftr">
      <div className="wrap">
        <div className="cols">
          <div>
            <span className="logo">
              <Logo variant="full" tone="lagon" height={32} />
            </span>
            <p className="tag-line">Cherchez-vous encore votre produit ?</p>
            <p style={{ fontSize: 13 }}>Le marketplace des stores d&apos;Haïti. Pilote à Les Cayes.</p>
          </div>
          <div>
            <h4>Acheter</h4>
            <Link href="/discover">Discovery</Link>
            <Link href="/map">Carte des stores</Link>
            <Link href="/help">Retrait en magasin</Link>
            <Link href="/wallet">Wallet</Link>
          </div>
          <div>
            <h4>Vendre</h4>
            <Link href="/sell">Enregistrer sa Commerce</Link>
            <Link href="/help">Devenir store de confiance</Link>
            <ComingSoon feature="ambassadors">
              <button>Ambassadeurs étudiants</button>
            </ComingSoon>
          </div>
          <div>
            <h4>Aide</h4>
            <Link href="/help">Centre d&apos;aide</Link>
            <Link href="/help">Litiges et remboursements</Link>
            <ComingSoon feature="creole">
              <button>Kreyòl</button>
            </ComingSoon>
            <ComingSoon feature="native_app">
              <button>Télécharger l&apos;app</button>
            </ComingSoon>
          </div>
        </div>
        <div className="bot">
          <span>© 2026 Prélakay LLC · Les Cayes, Haïti</span>
          <span>
            <a href={process.env.NEXT_PUBLIC_URL_ADMIN ? `${process.env.NEXT_PUBLIC_URL_ADMIN}/admin/login` : "/admin/login"} style={{ display: "inline", padding: 0 }}>
              Espace admin
            </a>{" "}
            · Icônes : Font Awesome (prototype)
          </span>
        </div>
      </div>
    </footer>
  );
}

/* ---------- rail flottant ---------- */
function Frail() {
  const modal = useModal();
  const s = useDemo();
  return (
    <div className="frail" aria-label="Raccourcis">
      <button
        title="Donner votre avis sur le site"
        aria-label="Donner votre avis sur le site"
        onClick={() => modal.open("Support Prélakay", <SupportForm user={s.user} />)}
      >
        <Fi r="pen-to-square" />
      </button>
      <button className="totop" title="Haut de page" aria-label="Haut de page" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
        <Fi s="arrow-up" />
      </button>
    </div>
  );
}

export function SupportForm({ user }: { user: string }) {
  const modal = useModal();
  const toast = useToast();
  return (
    <>
      <div className="info-box">
        <Fi s="robot" />
        <span>Bonjour @{user}. Je suis l&apos;assistant Prélakay. Décrivez votre souci : je réponds tout de suite, puis l&apos;équipe prend le relais si besoin.</span>
      </div>
      <div className="fl" style={{ marginTop: 12 }}>
        <label className="lbl" htmlFor="sm">Votre message</label>
        <textarea className="field" id="sm" rows={3} style={{ height: "auto", padding: "10px 12px" }} />
      </div>
      <button className="btn btn-p btn-block" onClick={() => { modal.close(); toast.show("Message envoyé. Réponse par l'app et e-mail.", "success"); }}>
        Envoyer
      </button>
    </>
  );
}

/* ---------- coque ---------- */
function Chrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const search = useSearchParams();
  const r = parseRoute(pathname, search.toString());
  const s = useDemo();
  const [bars, setBars] = useState({ mbuy: false, mbar: false });
  const barsApi: Bars = { ...bars, set: (k, on) => setBars((b) => (b[k] === on ? b : { ...b, [k]: on })) };

  useEffect(() => hydrateDemo(), []);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  useEffect(() => {
    const B = document.body;
    B.classList.toggle("pdp", r.name === "p" && !r.sub);
    B.classList.toggle("root", ROOT.includes(r.name));
    B.classList.toggle("has-mbar", bars.mbar);
    B.classList.toggle("has-bar", bars.mbar || bars.mbuy);
    B.setAttribute("data-route", r.name);
    B.classList.remove("pdp-scrolled");
  }, [r.name, r.sub, bars]);
  useEffect(() => {
    const onScroll = () => document.body.classList.toggle("scrolled", window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    document.title = r.name === "home" ? "Prélakay · Cherchez-vous encore votre produit ?" : `${titleFor(r, s.cart.length)} · Prélakay`;
  });

  return (
    <RouteCtx.Provider value={r}>
      <BarsCtx.Provider value={barsApi}>
        <ModalProvider>
          <div className="proto">
            <b>Prototype Prélakay</b> · acheteur · données fictives · structure inspirée d&apos;AliExpress, identité Prélakay
          </div>
          <Header r={r} />
          <MTop r={r} title={titleFor(r, s.cart.length)} />
          <main id="app">{children}</main>
          <Footer />
          <div className="mbuy" id="mbuy" />
          <div className="mbar" id="mbar" />
          <TabBar r={r} />
          <Frail />
          <Intro />
        </ModalProvider>
      </BarsCtx.Provider>
    </RouteCtx.Provider>
  );
}

export function ProtoShell({ children }: { children: ReactNode }) {
  return <Chrome>{children}</Chrome>;
}
