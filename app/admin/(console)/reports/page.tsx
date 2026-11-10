"use client";

// Signalements — aReports du prototype : produit, avis ou store ; classer, retirer, masquer, avertir.

import Link from "next/link";
import { useState } from "react";
import { prodBy, storeBy } from "@/lib/data/mock/seed";
import { useDemo } from "@/lib/demo/store";
import { reportDecide, reportsList, type Report } from "@/lib/demo/admin";
import { useToast } from "@/components/ui/Toast";
import { AHead, useMe, BUYER_URL } from "@/components/admin/shell";
import { EmptyBox, Fi } from "@/components/proto/ui";

function Target({ x }: { x: Report }) {
  if (x.type === "store") {
    const s = storeBy(x.target);
    return s ? (
      <Link className="lk" href={`/admin/stores/${s.id}`}>
        {s.n}
      </Link>
    ) : (
      <>{x.target}</>
    );
  }
  const p = prodBy(x.target);
  return p ? (
    <a className="lk" href={`${BUYER_URL}/p/${p.id}`}>
      {p.n}
    </a>
  ) : (
    <>{x.target || "—"}</>
  );
}

export default function Reports() {
  const s = useDemo();
  const me = useMe();
  const toast = useToast();
  const [tab, setTab] = useState("open");
  const list = reportsList(s).filter((x) => tab === "all" || (tab === "open" ? x.st === "open" : x.st === "done"));
  const act = (id: string, v: "dismiss" | "remove" | "hide" | "warn") => toast.show(reportDecide(me, id, v));
  return (
    <>
      <AHead title="Signalements" crumb={[["Signalements"]]} />
      <div className="panel s-tools">
        <div className="otabs">
          {[
            ["open", "Ouverts"],
            ["done", "Traités"],
            ["all", "Tous"],
          ].map(([k, l]) => (
            <button key={k} className={tab === k ? "on" : ""} onClick={() => setTab(k)}>
              {l}
            </button>
          ))}
        </div>
      </div>
      {list.length ? (
        list.map((x) => (
          <article className="soc" key={x.id}>
            <header>
              <span>
                <b>{x.id}</b>
                <span className="cap">
                  {" "}
                  · {x.date} · par {x.by}
                </span>
              </span>
              <span className={`tag ${x.st === "open" ? "tag-warn" : "tag-ok"}`}>{x.st === "open" ? "Ouvert" : x.decision || "Traité"}</span>
            </header>
            <div className="rep">
              <span className="tag tag-neu">{x.type === "produit" ? "Produit" : x.type === "avis" ? "Avis" : "Store"}</span>
              <span>
                <b>{x.reason}</b>
                <span className="cap" style={{ display: "block" }}>
                  Cible : <Target x={x} />
                </span>
              </span>
            </div>
            {x.st === "open" ? (
              <div className="row-b">
                <button className="btn btn-o btn-sm" onClick={() => act(x.id, "dismiss")}>
                  Classer sans suite
                </button>
                {x.type === "produit" ? (
                  <button className="btn btn-p btn-sm" onClick={() => act(x.id, "remove")}>
                    Retirer le produit
                  </button>
                ) : x.type === "avis" ? (
                  <button className="btn btn-p btn-sm" onClick={() => act(x.id, "hide")}>
                    Masquer l&apos;avis
                  </button>
                ) : null}
                <button className="btn btn-o btn-sm" onClick={() => act(x.id, "warn")}>
                  Avertir le store
                </button>
              </div>
            ) : null}
          </article>
        ))
      ) : (
        <EmptyBox icon={<Fi r="flag" />} t="Aucun signalement" />
      )}
    </>
  );
}
