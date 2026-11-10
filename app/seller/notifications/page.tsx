"use client";

// Notifications du store — sNotifs du prototype : notifications du store + exemples de démonstration.

import Link from "next/link";
import { useDemo } from "@/lib/demo/store";
import { markSellerNotifsRead, readSellerNotif } from "@/lib/demo/sellerActions";
import { SELLER_NOTIF_DEMO as DEMO } from "@/lib/demo/sellerMenu";
import { SHead } from "@/components/seller/shell";
import { DataIcon, Fi } from "@/components/proto/ui";


export default function Notifications() {
  const s = useDemo();
  const L = s.seller.notif.map((n, i) => ({ ...n, idx: i })).filter((n) => n.store === s.seller.store);
  return (
    <>
      <SHead title="Notifications" crumb={[["Compte", "/seller/account"], ["Notifications"]]} />
      <div className="panel">
        {L.length ? (
          <div className="ph-h">
            <span />
            <button className="lk" onClick={markSellerNotifsRead}>
              Tout marquer comme lu
            </button>
          </div>
        ) : null}
        {L.map((x) => (
          <Link key={`n${x.idx}`} className={`nrow${x.un ? " un" : ""}`} href={x.to} onClick={() => readSellerNotif(x.idx)}>
            <span className="ni">
              <DataIcon cls={x.i} />
            </span>
            <span className="nt">
              <b>{x.t}</b>
              <span className="cap">{x.p}</span>
            </span>
            <Fi s="chevron-right" />
          </Link>
        ))}
        {DEMO.map((x) => (
          <Link key={x.t} className="nrow" href={x.to}>
            <span className="ni">
              <DataIcon cls={x.i} />
            </span>
            <span className="nt">
              <b>{x.t}</b>
              <span className="cap">{x.p}</span>
            </span>
            <Fi s="chevron-right" />
          </Link>
        ))}
      </div>
    </>
  );
}
