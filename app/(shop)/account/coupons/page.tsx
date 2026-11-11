"use client";

// Mes coupons (hub du compte) : coupons gardés, puis coupons à récupérer.

import { useState } from "react";
import { useDemo } from "@/lib/demo/store";
import { DEMO_TODAY, allCoupons } from "@/lib/demo/coupons";
import { AccLayout } from "@/components/proto/account";
import { CouponCard } from "@/components/proto/coupons";
import { EmptyBox, Fi, NeedLogin } from "@/components/proto/ui";

export default function MyCoupons() {
  const s = useDemo();
  const [tab, setTab] = useState<"mine" | "get">("mine");
  if (!s.logged) return <NeedLogin what="Vos coupons" next="/account/coupons" />;
  const all = allCoupons(s).filter((c) => c.on && c.to >= DEMO_TODAY);
  const list = tab === "mine" ? all.filter((c) => s.coupons.mine.includes(c.code)) : all.filter((c) => !s.coupons.mine.includes(c.code));
  return (
    <AccLayout k="coupons" title="Mes coupons">
      <div className="panel s-tools">
        <div className="otabs">
          <button className={tab === "mine" ? "on" : ""} onClick={() => setTab("mine")}>
            Mes coupons ({all.filter((c) => s.coupons.mine.includes(c.code)).length})
          </button>
          <button className={tab === "get" ? "on" : ""} onClick={() => setTab("get")}>
            À récupérer
          </button>
        </div>
      </div>
      {list.length ? (
        <div className="cpn-g">
          {list.map((c) => (
            <CouponCard key={c.code} c={c} />
          ))}
        </div>
      ) : (
        <EmptyBox icon={<Fi s="ticket" />} t={tab === "mine" ? "Aucun coupon gardé" : "Rien à récupérer"} p="Les stores publient leurs coupons dans leur onglet Promos." />
      )}
      <p className="cap" style={{ marginTop: 12 }}>
        Saisissez le code au moment du paiement. Un seul coupon par commande.
      </p>
    </AccLayout>
  );
}
