"use client";

// Coupons côté acheteur (ex-V1.x activé dans le prototype) : carte de coupon, « Garder »,
// code copiable. Utilisé par « Mes coupons » et l'onglet Promos d'un store.

import { storeBy } from "@/lib/data/mock/seed";
import { DEMO_TODAY, claimCoupon, usedOf } from "@/lib/demo/coupons";
import { useDemo } from "@/lib/demo/store";
import type { Coupon } from "@/lib/domain/coupons";
import { formatHTG as htg } from "@/lib/format";
import { useFlash } from "@/components/ui/Feedback";
import { Fi } from "./ui";

const day = (d: string) => new Date(`${d}T12:00:00`).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });

export function CouponCard({ c }: { c: Coupon }) {
  const s = useDemo();
  const [copied, flash] = useFlash();
  const kept = s.coupons.mine.includes(c.code);
  const left = Math.max(0, c.stock - usedOf(s, c.code));
  const dead = !c.on || DEMO_TODAY > c.to || left === 0;
  return (
    <div className={`cpn${dead ? " dead" : ""}`}>
      <div className="cpn-v">
        <b>−{c.pct} %</b>
        <span>{c.min ? `dès ${htg(c.min)}` : "sans minimum"}</span>
      </div>
      <div className="cpn-b">
        <b>{c.store ? storeBy(c.store)?.n : c.welcome ? "Bienvenue sur Prélakay" : "Coupon Prélakay"}</b>
        <span className="cap">
          {dead ? (DEMO_TODAY > c.to ? "Expiré" : left === 0 ? "Épuisé" : "Suspendu") : `Valable jusqu'au ${day(c.to)} · ${left} restant${left > 1 ? "s" : ""}`}
        </span>
        <div className="cpn-a">
          <button
            className="cpn-code tnum"
            aria-label={`Copier le code ${c.code}`}
            onClick={() => {
              try {
                void navigator.clipboard.writeText(c.code);
              } catch {
                /* presse-papiers indisponible */
              }
              flash();
            }}
          >
            {copied ? <Fi s="check" /> : <Fi s="copy" />}
            {copied ? "Copié" : c.code}
          </button>
          {dead ? null : kept ? (
            <span className="tag tag-ok">Gardé</span>
          ) : (
            <button className="btn btn-s btn-sm" onClick={() => claimCoupon(c.code)}>
              Garder
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
