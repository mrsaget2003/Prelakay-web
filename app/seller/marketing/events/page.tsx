"use client";

// Événements Prélakay (ex-V1.x, actif dans le prototype) : participer aux opérations commerciales.

import Link from "next/link";
import { useDemo } from "@/lib/demo/store";
import { myStore } from "@/lib/demo/sellerActions";
import { eventsList, joinEvent } from "@/lib/demo/marketing";
import { DEMO_TODAY } from "@/lib/demo/coupons";
import { useToast } from "@/components/ui/Toast";
import { SHead, BUYER_URL } from "@/components/seller/shell";
import { EmptyBox, Fi } from "@/components/proto/ui";

export default function SellerEvents() {
  const s = useDemo();
  const toast = useToast();
  const st = myStore(s);
  const list = eventsList(s).filter((e) => e.to >= DEMO_TODAY);
  return (
    <>
      <SHead title="Événements Prélakay" crumb={[["Marketing", "/seller/marketing"], ["Événements"]]} />
      {list.length ? (
        <div className="cpn-g">
          {list.map((e) => {
            const on = e.stores.includes(st.id);
            return (
              <div className="panel" key={e.id}>
                <h3>{e.n}</h3>
                <p className="cap">
                  Du {e.from} au {e.to} · {e.stores.length} store{e.stores.length > 1 ? "s" : ""}
                </p>
                {e.noCommission ? <span className="bdg">Sans commission</span> : null}
                <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                  {on ? (
                    <span className="tag tag-ok">Vous participez</span>
                  ) : (
                    <button
                      className="btn btn-p btn-sm"
                      onClick={() => {
                        const err = joinEvent(e.id, st.id);
                        if (err) toast.show(err, "error");
                      }}
                    >
                      Participer
                    </button>
                  )}
                  <Link className="btn btn-o btn-sm" href={`${BUYER_URL}/events/${e.id}`}>
                    Voir la page
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyBox icon={<Fi r="calendar" />} t="Aucun événement à venir" p="Prélakay annonce ici ses prochaines opérations commerciales." />
      )}
    </>
  );
}
