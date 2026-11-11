"use client";

// Compte — pageAccount du prototype (03-design §9.8) : profil + raccourcis, carte
// wallet, mes commandes et commandes en cours, retours et litiges, services (mobile),
// plus à découvrir.

import Link from "next/link";
import { P, prodBy, storeBy } from "@/lib/data/mock/seed";
import { productImage } from "@/lib/data/mock/images";
import { ORDER_SHORTCUTS, SERVICES } from "@/lib/data/mock/content";
import { useDemo } from "@/lib/demo/store";
import { unread } from "@/lib/demo/actions";
import { formatHTG as htg } from "@/lib/format";
import { isAvailable } from "@/lib/config/release";
import { ComingSoon } from "@/components/ui/ComingSoon";
import { AccLayout } from "@/components/proto/account";
import { StatHero } from "@/components/proto/blocks";
import { ProductCard } from "@/components/proto/cards";
import { DataIcon, Fi, NeedLogin, ORDER_STATUS, Ph, SecHead } from "@/components/proto/ui";

export default function AccountPage() {
  const s = useDemo();
  if (!s.logged) return <NeedLogin what="Votre compte" next="/account" />;
  const c = (st: string) => s.orders.filter((o) => o.status === st).length;
  const rv = s.orders.filter((o) => o.status === "done" && !o.reviewed).length;
  const cur = s.orders.filter((o) => ["ready", "prep", "received"].includes(o.status)).slice().reverse();
  const n = unread(s);
  return (
    <AccLayout k="account" title="Compte">
      <div className="panel ahead">
        <div className="who">
          <span className="avt">{s.name[0]}</span>
          <div>
            <b>{s.name}</b>
            <span className="cap">
              @{s.user} · {s.city}
            </span>
          </div>
          <Link className="gear mo" href="/settings" aria-label="Paramètres">
            <Fi s="gear" />
          </Link>
        </div>
        <div className="ashort">
          <Link href="/wishlist">
            <b>{Object.keys(s.wish).length}</b>
            <Fi s="heart" />
            Wishlist
          </Link>
          <Link href="/viewed">
            <b>{s.viewed.length}</b>
            <Fi s="clock-rotate-left" />
            Vus récemment
          </Link>
          <Link href="/coins">
            <b>{s.coins}</b>
            <Fi s="coins" />
            Coins
          </Link>
          <ComingSoon feature="coupons">
            <Link href="/account/coupons">
              <b>{s.coupons.mine.length}</b>
              <Fi s="tag" />
              Coupons
            </Link>
          </ComingSoon>
        </div>
      </div>
      <StatHero icon="wallet" label="Wallet Prélakay" value={htg(s.wallet)} href="/wallet" action={<span className="btn btn-p btn-sm">Recharger</span>} />
      <div className="panel">
        <div className="ph-h">
          <h2>Mes commandes</h2>
          <Link href="/orders">
            Tout voir <Fi s="chevron-right" />
          </Link>
        </div>
        <div className="ost">
          {ORDER_SHORTCUTS.map(([k, icon, label]) => {
            const cnt = k === "review" ? rv : c(k);
            return (
              <Link key={k} href={`/orders?tab=${k}`}>
                <span className="oi">
                  <DataIcon cls={icon} />
                  {cnt ? <span className="cnt">{cnt}</span> : null}
                </span>
                {label}
              </Link>
            );
          })}
        </div>
        {cur.length ? (
          <div className="cur">
            {cur.slice(0, 2).map((o) => {
              const p = prodBy(o.items[0].p)!;
              return (
                <Link key={o.id} className="cur-o" href={`/orders/${o.id}`}>
                  <Ph icon={p.icon} tint={p.tint} img={productImage(p.id, 160)} alt={p.n} />
                  <span>
                    <b>{ORDER_STATUS[o.status][1]}</b>
                    <span className="cap">
                      {storeBy(o.store)!.n} · {o.id}
                    </span>
                  </span>
                  {o.status === "ready" ? <span className="btn btn-p btn-sm">Code de retrait</span> : <span className="btn btn-o btn-sm">Détails</span>}
                </Link>
              );
            })}
          </div>
        ) : null}
        <Link className="lrow" href="/disputes">
          <Fi s="rotate-left" />
          Retours et litiges
          <Fi s="chevron-right" />
        </Link>
      </div>
      <div className="panel mo">
        <div className="ph-h">
          <h2>Services</h2>
        </div>
        <div className="short">
          {SERVICES.map(([href, icon, label, feat]) =>
            feat && !isAvailable(feat) ? (
              <ComingSoon key={label} feature={feat}>
                <button>
                  <DataIcon cls={icon} />
                  {label}
                </button>
              </ComingSoon>
            ) : (
              <Link key={label} href={href} prefetch={feat ? false : undefined} style={{ position: "relative" }}>
                <DataIcon cls={icon} />
                {label}
                {href === "/notifications" && n ? <span className="cnt">{n}</span> : null}
              </Link>
            ),
          )}
        </div>
      </div>
      <section className="sec">
        <SecHead title="Plus à découvrir" />
        <div className="grid acc-grid">
          {P.slice(20, 30).map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      </section>
    </AccLayout>
  );
}
