"use client";

// Recherche globale — aSearch du prototype : commandes, utilisateurs, stores, produits
// (sections filtrées selon le rôle).

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, type ReactNode } from "react";
import { STORES, storeBy } from "@/lib/data/mock/seed";
import { productImage, storeImage } from "@/lib/data/mock/images";
import { useDemo } from "@/lib/demo/store";
import { allOrders, modQueue, usersList } from "@/lib/demo/admin";
import { can } from "@/lib/domain/admin";
import { AHead, useMe, BUYER_URL } from "@/components/admin/shell";
import { OTag } from "@/components/proto/tags";
import { EmptyBox, Fi, Ph } from "@/components/proto/ui";

function Sec({ h, children }: { h: string; children: ReactNode[] }) {
  return children.length ? (
    <div className="panel">
      <h2 className="ph-t">{h}</h2>
      {children}
    </div>
  ) : null;
}

function Search() {
  const s = useDemo();
  const me = useMe();
  const router = useRouter();
  const q0 = useSearchParams().get("q") ?? "";
  const [q, setQ] = useState(q0);
  const t = q0.trim().toLowerCase();
  if (!t)
    return (
      <>
        <AHead title="Recherche" />
        <div className="panel">
          <form
            className="asearch big"
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              if (q.trim()) router.push(`/admin/search?q=${encodeURIComponent(q.trim())}`);
            }}
          >
            <Fi s="magnifying-glass" />
            <input name="q" placeholder="Commande, @utilisateur, store ou produit" aria-label="Recherche admin" autoFocus value={q} onChange={(e) => setQ(e.target.value)} />
          </form>
        </div>
      </>
    );
  const O = allOrders(s)
    .filter((o) => o.id.toLowerCase().includes(t) || o.buyer.toLowerCase().includes(t))
    .slice(0, 8);
  const U = can(me.role, "users") ? usersList(s).filter((u) => `${u.u} ${u.name}`.toLowerCase().includes(t)) : [];
  const St = can(me.role, "stores") ? STORES.filter((x) => x.n.toLowerCase().includes(t)) : [];
  const Pr = modQueue(s)
    .filter((p) => p.n.toLowerCase().includes(t))
    .slice(0, 8);
  const none = !O.length && !U.length && !St.length && !Pr.length;
  return (
    <>
      <AHead title={`Résultats pour « ${q0} »`} crumb={[["Recherche"]]} />
      {none ? (
        <EmptyBox icon={<Fi s="magnifying-glass" />} t="Aucun résultat" p="Essayez un n° de commande (PK-1042), un @username ou un nom de store." />
      ) : (
        <>
          <Sec h="Commandes">
            {O.map((o) => (
              <Link className="s-orow" key={o.id + o.store} href={`/admin/orders/${o.id}`}>
                <span>
                  <b>{o.id}</b>
                  <span className="cap">
                    {o.buyer} · {storeBy(o.store)?.n}
                  </span>
                </span>
                <OTag s={o.status} />
              </Link>
            ))}
          </Sec>
          <Sec h="Utilisateurs">
            {U.map((u) => (
              <Link className="s-orow" key={u.u} href={`/admin/users/${encodeURIComponent(u.u.slice(1))}`}>
                <span>
                  <b>{u.u}</b>
                  <span className="cap">{u.name}</span>
                </span>
              </Link>
            ))}
          </Sec>
          <Sec h="Stores">
            {St.map((x) => (
              <Link className="s-orow" key={x.id} href={`/admin/stores/${x.id}`}>
                <Ph icon={x.i} tint="g4" cls="sav" img={storeImage(x.id, 120)} alt={x.n} />
                <span>
                  <b>{x.n}</b>
                </span>
              </Link>
            ))}
          </Sec>
          <Sec h="Produits">
            {Pr.map((p) =>
              can(me.role, "products") ? (
                <Link className="s-orow" key={p.id} href={`/admin/products/${p.id}`}>
                  <Ph icon={p.icon} tint={p.tint} cls="mini" img={productImage(p.id, 120)} alt={p.n} />
                  <span>
                    <b>{p.n}</b>
                    <span className="cap">{storeBy(p.store)?.n}</span>
                  </span>
                </Link>
              ) : (
                <a className="s-orow" key={p.id} href={`${BUYER_URL}/p/${p.id}`}>
                  <Ph icon={p.icon} tint={p.tint} cls="mini" img={productImage(p.id, 120)} alt={p.n} />
                  <span>
                    <b>{p.n}</b>
                    <span className="cap">{storeBy(p.store)?.n}</span>
                  </span>
                </a>
              ),
            )}
          </Sec>
        </>
      )}
    </>
  );
}

export default function Page() {
  return (
    <Suspense>
      <Search key="s" />
    </Suspense>
  );
}
