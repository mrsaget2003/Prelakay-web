"use client";

// Coque de la console admin — aLayout, adminTabs, denied du prototype : barre lagon-900 avec le
// logo complet blanc, recherche globale, badge du rôle, menu groupé (Validation · Opérations ·
// Contenu · Système), onglets mobiles. Garde : session admin, puis droit du rôle sur la section.

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { hydrateDemo, useDemo } from "@/lib/demo/store";
import { adminSession, meOf, useAdminSession, type AdminSession } from "@/lib/demo/adminSession";
import { auditLog, queues, type Me } from "@/lib/demo/admin";
import { AMENU, ATAB_CANDIDATES, ATAB_ICONS, type AMenuItem } from "@/lib/demo/adminMenu";
import { can, ROLES, sectionOf, type Section } from "@/lib/domain/admin";
import { isAvailable, FEATURES } from "@/lib/config/release";
import { Logo } from "@/components/brand/Logo";
import { useToast } from "@/components/ui/Toast";
import { ComingSoon } from "@/components/ui/ComingSoon";
import { ModalProvider } from "@/components/proto/modal";
import { DataIcon, Fi } from "@/components/proto/ui";
import { VzTooltip } from "@/components/charts/vz";

/** Adresse du site acheteur (autre déploiement quand APP_SPACE=admin). */
export const BUYER_URL = process.env.NEXT_PUBLIC_URL_ACHETEUR ?? "";
const ROOTS = ["", "kyc", "reports", "disputes", "orders", "banners", "notify", "categories", "stores", "users", "menu"];

const MeCtx = createContext<Me | null>(null);
/** Membre connecté (dans la console, toujours défini). */
export function useMe(): Me {
  return useContext(MeCtx)!;
}

/** En-tête de page : fil d'Ariane (Tableau de bord › …) + titre. */
export function AHead({ title, crumb, sub }: { title: string; crumb?: [string, string?][]; sub?: ReactNode }) {
  return (
    <>
      <div className="sc-head">
        {crumb ? (
          <nav className="sc-crumb">
            <Link href="/admin">Tableau de bord</Link>
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
      {sub}
    </>
  );
}

function soonLabel(f: keyof typeof FEATURES) {
  return FEATURES[f] === "2" ? "V2" : "V1.x";
}

function Side({ sec, me, cnt }: { sec: Section; me: Me; cnt: Partial<Record<Section, number>> }) {
  const groups: { t: string; items: AMenuItem[] }[] = [];
  let cur: { t: string; items: AMenuItem[] } | null = null;
  for (const m of AMENU) {
    if (m[0] === "-") {
      cur = { t: m[1], items: [] };
      groups.push(cur);
      continue;
    }
    const it = m as AMenuItem;
    if (!can(me.role, it[0])) continue;
    if (!cur) {
      cur = { t: "", items: [] };
      groups.push(cur);
    }
    cur.items.push(it);
  }
  return (
    <nav>
      {groups
        .filter((g) => g.items.length)
        .map((g, gi) => (
          <div key={gi} style={{ display: "contents" }}>
            {g.t ? <span className="sm-t">{g.t}</span> : null}
            {g.items.map(([k, icon, label, path, f]) =>
              f && !isAvailable(f) ? (
                <ComingSoon key={k} feature={f}>
                  <a className="sm-i" href={`/admin/${path}`}>
                    <DataIcon cls={icon} />
                    {label}
                    <span className="soon-t">{soonLabel(f)}</span>
                  </a>
                </ComingSoon>
              ) : (
                <Link key={k} className={`sm-i${k === sec ? " on" : ""}`} href={`/admin${path ? "/" + path : ""}`} aria-current={k === sec ? "page" : undefined}>
                  <DataIcon cls={icon} />
                  {label}
                  {cnt[k] ? <span className="n">{cnt[k]}</span> : null}
                </Link>
              ),
            )}
          </div>
        ))}
    </nav>
  );
}

function Tabs({ sec, me, cnt }: { sec: Section; me: Me; cnt: Partial<Record<Section, number>> }) {
  const prim = ATAB_CANDIDATES.filter(([k]) => can(me.role, k)).slice(0, 3);
  const T: [string, Section, string | ReactNode, string, number?][] = [
    ["/admin", "dash", ATAB_ICONS.home, "Accueil"],
    ...prim.map(([k, i, l]): [string, Section, string, string, number?] => [`/admin/${k}`, k, i, l, cnt[k]]),
    ["/admin/menu", "menu", ATAB_ICONS.more, "Plus"],
  ];
  const primKeys = prim.map((p) => p[0]);
  return (
    <nav className="tabbar sel" aria-label="Navigation admin">
      {T.map(([h, k, icon, label, n]) => {
        const on = k === sec || (k === "menu" && !primKeys.includes(sec) && sec !== "dash");
        return (
          <Link key={k} href={h} className={on ? "on" : ""} aria-current={on ? "page" : undefined}>
            <span className="ti">
              <DataIcon cls={icon as string} />
              {n ? <span className="cnt">{n}</span> : null}
            </span>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

function MeMenu({ session, me, logout }: { session: AdminSession; me: Me; logout: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const off = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("click", off);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("click", off);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);
  return (
    <div className={`dd${open ? " open" : ""}`} id="addd" ref={ref}>
      <button className="sc-me" aria-haspopup="true" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <span className="avt sm">{me.n[0]}</span>
        <span className="d-only">
          <b>{me.n}</b>
          <small>{session.email}</small>
        </span>
        <Fi s="chevron-down" />
      </button>
      <div className="ddp ad-menu">
        <b>{me.n}</b>
        <span className="cap">
          {session.email} · {ROLES[me.role]}
        </span>
        <hr />
        <a href={`${BUYER_URL}/`} className="mi">
          <Fi s="store" />
          Voir le site
        </a>
        {can(me.role, "team") ? (
          <Link href="/admin/team" className="mi" onClick={() => setOpen(false)}>
            <Fi s="user-shield" />
            Équipe et rôles
          </Link>
        ) : null}
        <button className="mi" onClick={logout}>
          <Fi s="arrow-right-from-bracket" />
          Se déconnecter
        </button>
      </div>
    </div>
  );
}

/** Accès refusé (rôle sans droit sur la section). */
function Denied({ me }: { me: Me }) {
  return (
    <>
      <AHead title="Accès refusé" />
      <div className="panel sgate">
        <span className="sg-i">
          <Fi s="lock" />
        </span>
        <h2>Cette section n&apos;est pas incluse dans votre rôle</h2>
        <p className="muted">Rôle actuel : {ROLES[me.role]}. Demandez l&apos;accès à un superadmin.</p>
        <Link className="btn btn-p" href="/admin">
          Tableau de bord
        </Link>
      </div>
    </>
  );
}

function Console({ session, children }: { session: AdminSession; children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const toast = useToast();
  const s = useDemo();
  const me = meOf(session);
  const sec = sectionOf(pathname);
  const parts = pathname.split("/").filter(Boolean);
  const root = parts.length <= 2 && ROOTS.includes(parts[1] ?? "");
  const Q = queues(s);
  const cnt: Partial<Record<Section, number>> = { kyc: Q.kyc, products: Q.products, reports: Q.reports, disputes: Q.disputes };
  const [q, setQ] = useState("");

  useEffect(() => {
    const B = document.body;
    B.classList.add("seller", "admin");
    B.classList.toggle("root", root);
    B.setAttribute("data-route", "admin");
    return () => B.classList.remove("seller", "admin", "root");
  }, [root]);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  const logout = () => {
    auditLog(me, "Déconnexion", "Console admin");
    adminSession.logout();
    toast.show("Vous êtes déconnecté de la console");
    router.replace("/admin/login");
  };

  return (
    <MeCtx.Provider value={me}>
      <div className="sc adm">
        <header className="sc-top">
          <div className="sc-tl">
            <Link className="logo d-only" href="/admin" aria-label="Console admin, tableau de bord">
              <Logo variant="full" tone="white" height={30} />
            </Link>
            <Link className="logo m-only" href="/admin" aria-label="Console admin, tableau de bord">
              <Logo variant="mark" tone="white" height={30} />
            </Link>
            <span className="sc-lab">Admin</span>
          </div>
          <form
            className="asearch"
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              router.push(q.trim() ? `/admin/search?q=${encodeURIComponent(q.trim())}` : "/admin/search");
            }}
          >
            <Fi s="magnifying-glass" />
            <input name="q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Commande, @utilisateur, store ou produit" aria-label="Recherche admin" />
          </form>
          <div className="sc-tr">
            <Link className="sc-ic m-only" href="/admin/search" aria-label="Rechercher">
              <Fi s="magnifying-glass" />
            </Link>
            <span className="role-b">{ROLES[me.role]}</span>
            <MeMenu session={session} me={me} logout={logout} />
          </div>
        </header>
        <div className="sc-body">
          <aside className="sc-side" aria-label="Menu admin">
            <Side sec={sec} me={me} cnt={cnt} />
            <div className="sc-help">
              <b>Session sécurisée</b>
              <span className="cap">
                Connecté à {session.at}
                {session.remember ? " · 8 h" : " · fermeture du navigateur"}
              </span>
              <button className="btn btn-o btn-sm" onClick={logout}>
                Se déconnecter
              </button>
            </div>
          </aside>
          <div className="sc-main">{can(me.role, sec) ? children : <Denied me={me} />}</div>
        </div>
      </div>
      <Tabs sec={sec} me={me} cnt={cnt} />
    </MeCtx.Provider>
  );
}

/** Garde de session : sans session admin, renvoie vers /admin/login?next=… */
function Guard({ children }: { children: ReactNode }) {
  const session = useAdminSession();
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();
  useEffect(() => {
    if (session === null) {
      const qs = search.toString();
      router.replace(`/admin/login?next=${encodeURIComponent(pathname + (qs ? `?${qs}` : ""))}`);
    }
  }, [session, router, pathname, search]);
  if (!session) return null;
  return <Console session={session}>{children}</Console>;
}

export function AdminShell({ children }: { children: ReactNode }) {
  useEffect(() => hydrateDemo(), []);
  return (
    <ModalProvider>
      <Guard>{children}</Guard>
      <VzTooltip />
    </ModalProvider>
  );
}
