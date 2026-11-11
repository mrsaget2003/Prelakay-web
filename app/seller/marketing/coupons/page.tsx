"use client";

// Coupons du store (ex-V1.x activé dans le prototype) : créer, suivre les utilisations, suspendre.

import { useState } from "react";
import { useDemo } from "@/lib/demo/store";
import { myStore } from "@/lib/demo/sellerActions";
import { DEMO_TODAY, couponsOfStore, createCoupon, setCouponOn, usedOf } from "@/lib/demo/coupons";
import type { CouponInput } from "@/lib/domain/coupons";
import { formatHTG as htg } from "@/lib/format";
import { useToast } from "@/components/ui/Toast";
import { SHead } from "@/components/seller/shell";
import { EmptyBox, FieldErr, Fi } from "@/components/proto/ui";

const EMPTY: CouponInput = { code: "", pct: "10", min: "0", from: DEMO_TODAY, to: "2026-11-30", stock: "50" };

export default function SellerCoupons() {
  const s = useDemo();
  const toast = useToast();
  const st = myStore(s);
  const [f, setF] = useState<CouponInput>(EMPTY);
  const [errs, setErrs] = useState<Record<string, string>>({});
  const list = couponsOfStore(s, st.id);
  const set = (p: Partial<CouponInput>) => {
    setF((x) => ({ ...x, ...p }));
    setErrs((e) => {
      const n = { ...e };
      for (const k of Object.keys(p)) delete n[k];
      return n;
    });
  };
  const inp = (k: keyof CouponInput, label: string, extra: Record<string, string> = {}) => (
    <div className="fl">
      <label className="lbl" htmlFor={`cp-${k}`}>
        {label}
      </label>
      <input className="field" id={`cp-${k}`} value={f[k]} aria-invalid={errs[k] ? true : undefined} onChange={(e) => set({ [k]: k === "code" ? e.target.value.toUpperCase() : e.target.value } as Partial<CouponInput>)} {...extra} />
      <FieldErr msg={errs[k]} />
    </div>
  );
  return (
    <>
      <SHead title="Coupons du store" crumb={[["Marketing", "/seller/marketing"], ["Coupons"]]} />
      <div className="s-grid2">
        <div className="panel">
          <h2 className="ph-t">Créer un coupon</h2>
          <form
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              const r = createCoupon(st.id, f);
              if (!r.ok) return setErrs(r.errors);
              setF(EMPTY);
              toast.show(`Coupon ${r.code} publié dans l'onglet Promos du store`, "success");
            }}
          >
            {inp("code", "Code (vide = généré)", { placeholder: "Ex. LAKAY5", maxLength: "6" })}
            <div className="pt-grid">
              {inp("pct", "Réduction (%)", { inputMode: "numeric" })}
              {inp("min", "Montant minimum (HTG)", { inputMode: "numeric" })}
              {inp("from", "Début", { type: "date" })}
              {inp("to", "Fin", { type: "date" })}
              {inp("stock", "Nombre d'utilisations", { inputMode: "numeric" })}
            </div>
            <button className="btn btn-p btn-block">Publier le coupon</button>
          </form>
        </div>
        <div className="panel">
          <h2 className="ph-t">Mes coupons</h2>
          {list.length ? (
            <div className="tbl-w">
              <table className="tbl rsp">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Réduction</th>
                    <th>Utilisés</th>
                    <th>Fin</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {list.map((c) => {
                    const expired = DEMO_TODAY > c.to;
                    return (
                      <tr key={c.code}>
                        <td data-l="Code">
                          <b className="tnum">{c.code}</b>
                        </td>
                        <td data-l="Réduction">
                          −{c.pct} %{c.min ? ` dès ${htg(c.min)}` : ""}
                        </td>
                        <td data-l="Utilisés" className="tnum">
                          {usedOf(s, c.code)} / {c.stock}
                        </td>
                        <td data-l="Fin">{expired ? <span className="tag tag-err">Expiré</span> : c.to}</td>
                        <td>
                          {expired ? null : (
                            <button className="btn btn-o btn-sm" onClick={() => setCouponOn(c.code, !c.on)} aria-pressed={!c.on}>
                              {c.on ? "Suspendre" : "Réactiver"}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyBox icon={<Fi s="ticket" />} t="Aucun coupon" p="Créez un premier coupon : il s'affiche dans l'onglet Promos de votre store." />
          )}
        </div>
      </div>
    </>
  );
}
