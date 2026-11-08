"use client";

// Panier partagé — pageShared du prototype : consultation + « Payer ce panier »
// (payer le panier d'un proche, PRD §3).

import Link from "next/link";
import { useRouter } from "next/navigation";
import { prodBy, storeBy } from "@/lib/data/mock/seed";
import { productImage } from "@/lib/data/mock/images";
import { useDemo } from "@/lib/demo/store";
import { payForRelative } from "@/lib/demo/actions";
import { formatHTG as htg } from "@/lib/format";
import { useToast } from "@/components/ui/Toast";
import { Fi, Ph } from "@/components/proto/ui";

const ITEMS: [string, number][] = [["beaute-1", 2], ["alim-0", 1]];

export default function SharedCartPage() {
  const s = useDemo();
  const router = useRouter();
  const toast = useToast();
  const tot = ITEMS.reduce((a, [id, q]) => a + prodBy(id)!.price * q, 0);
  const pay = () => {
    if (!s.logged) return router.push("/login?next=/shared/lili_cayes");
    if (s.wallet < tot) return toast.show("Solde insuffisant. Rechargez votre wallet, puis réessayez.", "error");
    payForRelative("lili_cayes", tot);
    toast.show("Panier payé. @lili_cayes a reçu le code de retrait.", "success");
    router.push("/wallet?tab=hist");
  };
  return (
    <div className="wrap" style={{ maxWidth: 720 }}>
      <div className="panel" style={{ marginTop: 16 }}>
        <div className="info-box" style={{ marginBottom: 12 }}>
          <Fi s="share-nodes" />
          <span>
            <b>@lili_cayes</b> vous a partagé son panier (consultation seulement).
          </span>
        </div>
        {ITEMS.map(([id, q]) => {
          const p = prodBy(id)!;
          const st = storeBy(p.store)!;
          return (
            <div className="oc" style={{ padding: 0, margin: "0 0 10px" }} key={id}>
              <Link className="it" href={`/p/${p.id}`}>
                <Ph icon={p.icon} tint={p.tint} img={productImage(p.id, 160)} alt={p.n} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <b style={{ fontWeight: 500 }}>{p.n}</b>
                  <div className="cap">
                    × {q} · retrait chez {st.n}
                  </div>
                </div>
                <b className="tnum">{htg(p.price * q)}</b>
              </Link>
            </div>
          );
        })}
        <div className="hr" />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <span>Total</span>
          <b className="tnum" style={{ fontSize: 22 }}>
            {htg(tot)}
          </b>
        </div>
        <button className="btn btn-p btn-block" style={{ marginTop: 12 }} onClick={pay}>
          <Fi s="gift" />
          Payer ce panier avec mon wallet
        </button>
        <p className="cap" style={{ marginTop: 8, textAlign: "center" }}>@lili_cayes recevra le code de retrait.</p>
      </div>
    </div>
  );
}
