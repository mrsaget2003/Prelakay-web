"use client";

// Confirmation — pageDone du prototype : une commande par store, statut « Reçue ».

import Link from "next/link";
import { useParams } from "next/navigation";
import { storeBy } from "@/lib/data/mock/seed";
import { useDemo } from "@/lib/demo/store";
import { formatHTG as htg } from "@/lib/format";
import { Fi, StTag } from "@/components/proto/ui";

export default function DonePage() {
  const { ids } = useParams<{ ids: string }>();
  const list = decodeURIComponent(ids).split(",");
  const s = useDemo();
  const os = s.orders.filter((o) => list.includes(o.id));
  return (
    <div className="wrap" style={{ maxWidth: 640 }}>
      <div className="panel" style={{ textAlign: "center", marginTop: 20, padding: "28px 20px" }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--color-lagon-100)", color: "var(--color-lagon-700)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, margin: "0 auto 14px" }}>
          <Fi s="check" />
        </div>
        <h1>Commande reçue</h1>
        <p className="muted" style={{ margin: "6px 0 18px" }}>
          {os.length > 1 ? "Les stores la préparent." : `${storeBy(os[0]?.store ?? "boutik-lakay")!.n} la prépare.`} Vous serez prévenu dès qu&apos;elle sera prête pour le retrait.
        </p>
        {os.map((o) => (
          <div className="oc" style={{ textAlign: "left", background: "var(--color-neutral-100)" }} key={o.id}>
            <div className="top">
              <b>
                {o.id} · {storeBy(o.store)!.n}
              </b>
              <StTag s={o.status} />
            </div>
            <div className="cap">
              {o.items.length} article(s) · {htg(o.total)}
            </div>
          </div>
        ))}
        <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginTop: 12 }}>
          <Link className="btn btn-p" href="/orders">
            Suivre mes commandes
          </Link>
          <Link className="btn btn-s" href="/">
            Continuer mes achats
          </Link>
        </div>
        <p className="cap" style={{ marginTop: 12 }}>+{50 * os.length} Coins crédités après le retrait.</p>
      </div>
    </div>
  );
}
