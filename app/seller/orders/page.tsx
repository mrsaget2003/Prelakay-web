"use client";

// Commandes du store — sOrders du prototype : onglets par statut, recherche (n°, acheteur,
// produit), carte par commande avec l'action suivante (Préparer, Marquer prête, Valider le retrait).

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { prodBy } from "@/lib/data/mock/seed";
import { productImage } from "@/lib/data/mock/images";
import { useDemo } from "@/lib/demo/store";
import { prepOrder, readyOrder, sellerOrders } from "@/lib/demo/sellerActions";
import type { SellerOrder } from "@/lib/demo/seller";
import { formatHTG as htg } from "@/lib/format";
import { useToast } from "@/components/ui/Toast";
import { SHead } from "@/components/seller/shell";
import { OTag } from "@/components/seller/ui";
import { EmptyBox, Fi, Ph } from "@/components/proto/ui";

const TABS: [string, string][] = [["all", "Toutes"], ["received", "À préparer"], ["prep", "En préparation"], ["ready", "Prêtes pour retrait"], ["done", "Retirées"], ["expired", "Non retirées"], ["cancelled", "Annulées"]];

function Orders() {
  const s = useDemo();
  const router = useRouter();
  const toast = useToast();
  const sp = useSearchParams();
  const q0 = sp.get("q") ?? "";
  const t0 = sp.get("tab");
  const [tab, setTab] = useState(t0 && TABS.some((t) => t[0] === t0) ? t0 : "all");
  const [q, setQ] = useState(q0);
  const O = sellerOrders(s);
  const ql = q0.toLowerCase();
  const list = O.filter((o) => (tab === "all" || o.status === tab) && (!ql || `${o.id} ${o.buyer} ${o.items.map((i) => prodBy(i.p)?.n).join(" ")}`.toLowerCase().includes(ql)));
  const act = (o: SellerOrder) =>
    o.status === "received" ? (
      <button
        className="btn btn-p btn-sm"
        onClick={() => {
          prepOrder(o.id);
          toast.show(`Commande ${o.id} en préparation`);
        }}
      >
        Préparer
      </button>
    ) : o.status === "prep" ? (
      <button
        className="btn btn-p btn-sm"
        onClick={() => {
          readyOrder(o.id);
          toast.show("Prête : l'acheteur a reçu son code de retrait", "success");
        }}
      >
        Marquer prête
      </button>
    ) : o.status === "ready" ? (
      <Link className="btn btn-p btn-sm" href={`/seller/pickup?id=${o.id}`}>
        Valider le retrait
      </Link>
    ) : (
      <Link className="btn btn-o btn-sm" href={`/seller/orders/${o.id}`}>
        Détails
      </Link>
    );
  return (
    <>
      <SHead title="Commandes" crumb={[["Commandes"]]} />
      <div className="panel s-tools">
        <div className="otabs">
          {TABS.map(([k, l]) => {
            const c = O.filter((o) => k === "all" || o.status === k).length;
            return (
              <button key={k} className={tab === k ? "on" : ""} onClick={() => setTab(k)}>
                {l}
                {c && k !== "all" ? ` (${c})` : ""}
              </button>
            );
          })}
        </div>
        <div className="s-bar">
          <form
            className="osearch"
            onSubmit={(e) => {
              e.preventDefault();
              router.replace(q.trim() ? `/seller/orders?q=${encodeURIComponent(q.trim())}` : "/seller/orders");
            }}
          >
            <input name="q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="N° de commande, acheteur ou produit" aria-label="Chercher une commande" />
            <button className="btn btn-o btn-sm">Chercher</button>
          </form>
          <Link className="btn btn-p btn-sm" href="/seller/pickup">
            <Fi s="qrcode" />
            Valider un retrait
          </Link>
        </div>
      </div>
      {list.length ? (
        list.map((o) => {
          const it = o.items[0];
          const p = prodBy(it.p)!;
          return (
            <article className="soc" key={o.id}>
              <header>
                <span>
                  <b>{o.id}</b>
                  <span className="cap">
                    {" "}
                    · {o.date}
                    {o.time ? ` à ${o.time}` : ""} · {o.buyer}
                  </span>
                </span>
                <OTag s={o.status} />
              </header>
              <div className="soc-b">
                <Link className="oc-it" href={`/seller/orders/${o.id}`}>
                  <Ph icon={p.icon} tint={p.tint} img={productImage(p.id, 160)} alt={p.n} />
                  <div>
                    <span className="nm">{p.n}</span>
                    <span className="cap">
                      {it.v} × {it.q}
                      {o.items.length > 1 ? ` · +${o.items.length - 1} article(s)` : ""}
                    </span>
                    {o.status === "ready" ? <span className="cap">À retirer avant le {o.due}</span> : null}
                  </div>
                </Link>
                <div className="soc-t">
                  <span className="cap">Total</span>
                  <b className="tnum">{htg(o.total)}</b>
                  <span className="cap">Wallet · escrow</span>
                </div>
                <div className="soc-a">
                  {act(o)}
                  {!["done", "expired", "cancelled"].includes(o.status) ? (
                    <Link className="lk" href={`/seller/orders/${o.id}`}>
                      Détails
                    </Link>
                  ) : null}
                </div>
              </div>
            </article>
          );
        })
      ) : (
        <EmptyBox icon={<Fi s="receipt" />} t="Aucune commande ici" p="Les nouvelles commandes apparaissent dans « À préparer »." />
      )}
    </>
  );
}

export default function Page() {
  return (
    <Suspense>
      <Orders />
    </Suspense>
  );
}
