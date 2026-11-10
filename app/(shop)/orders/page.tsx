"use client";

// Commandes — pageOrders du prototype : onglets (Toutes · Reçues · En préparation ·
// Prêtes pour retrait · Retirées · À évaluer), recherche (n°, produit, store) + période.

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { prodBy, storeBy } from "@/lib/data/mock/seed";
import { useDemo, type Order } from "@/lib/demo/store";
import { useProtoRoute } from "@/components/proto/shell";
import { AccLayout, OrderCard } from "@/components/proto/account";
import { EmptyBox, Fi, NeedLogin } from "@/components/proto/ui";

const TABS: [string, string][] = [["all", "Toutes"], ["received", "Reçues"], ["prep", "En préparation"], ["ready", "Prêtes pour retrait"], ["done", "Retirées"], ["review", "À évaluer"]];
const inTab = (o: Order, t: string) => t === "all" || o.status === t || (t === "review" && o.status === "done" && !o.reviewed);

export default function OrdersPage() {
  const s = useDemo();
  const r = useProtoRoute();
  const [tab, setTab] = useState(r.params.tab || "all");
  const [q, setQ] = useState("");
  const [qIn, setQIn] = useState("");
  if (!s.logged) return <NeedLogin what="Vos commandes" next="/orders" />;
  const list = s.orders
    .filter((o) => inTab(o, tab) && (!q || `${o.id} ${storeBy(o.store)!.n} ${o.items.map((i) => prodBy(i.p)!.n).join(" ")}`.toLowerCase().includes(q.toLowerCase())))
    .slice()
    .reverse();
  const submit = (e: FormEvent) => {
    e.preventDefault();
    setQ(qIn.trim());
  };
  return (
    <AccLayout k="orders" title="Commandes">
      <div className="panel otop">
        <div className="otabs">
          {TABS.map(([v, l]) => {
            const c = s.orders.filter((o) => inTab(o, v)).length;
            return (
              <button key={v} className={tab === v ? "on" : ""} onClick={() => setTab(v)}>
                {l}
                {v !== "all" && v !== "done" && c ? ` (${c})` : ""}
              </button>
            );
          })}
        </div>
        <form className="osearch" onSubmit={submit}>
          <input name="q" value={qIn} onChange={(e) => setQIn(e.target.value)} placeholder="N° de commande, produit ou store" aria-label="Rechercher une commande" />
          <button className="btn btn-p btn-sm" aria-label="Rechercher">
            <Fi s="magnifying-glass" />
          </button>
          <select aria-label="Période">
            <option>3 derniers mois</option>
            <option>2026</option>
          </select>
        </form>
      </div>
      {list.length ? (
        list.map((o) => <OrderCard key={o.id} o={o} />)
      ) : (
        <EmptyBox icon={<Fi s="receipt" />} t="Aucune commande ici" p="Vos commandes apparaîtront dans cet onglet.">
          <Link className="btn btn-p" href="/discover">
            Découvrir les produits
          </Link>
        </EmptyBox>
      )}
    </AccLayout>
  );
}
