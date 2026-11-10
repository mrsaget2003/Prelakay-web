"use client";

// Tableau de bord admin — aDash du prototype : files d'attente, graphiques, activité, alertes.

import Link from "next/link";
import { useDemo } from "@/lib/demo/store";
import { queues } from "@/lib/demo/admin";
import { ADASH_ALERTS, AQUEUE_CARDS } from "@/lib/demo/adminMenu";
import { can, ROLES } from "@/lib/domain/admin";
import { AHead, useMe } from "@/components/admin/shell";
import { AdminDashCharts } from "@/components/admin/charts";
import { DataIcon, Fi } from "@/components/proto/ui";

export default function AdminDash() {
  const s = useDemo();
  const me = useMe();
  const Q = queues(s);
  const cards = AQUEUE_CARDS.filter(([k]) => can(me.role, k));
  const alerts = ADASH_ALERTS.filter((a) => can(me.role, a[4]));
  return (
    <>
      <AHead title={`Bonjour, ${me.n.split(" ")[0]}`} sub={<p className="sc-sub">{ROLES[me.role]} · pilote Les Cayes · 6 nov. 2026</p>} />
      {cards.length ? (
        <div className="panel">
          <div className="ph-h">
            <h2>Files d&apos;attente</h2>
          </div>
          <div className="tasks">
            {cards.map(([k, label, icon, qk]) => (
              <Link key={k} className={`task${Q[qk] ? " hot" : ""}`} href={`/admin/${k}`}>
                <DataIcon cls={icon} />
                <b>{Q[qk]}</b>
                <span>{label}</span>
              </Link>
            ))}
          </div>
        </div>
      ) : null}
      <AdminDashCharts />
      <div className="vz-g2" style={{ marginBottom: 12 }}>
        <div className="panel">
          <div className="ph-h">
            <h2>Activité récente</h2>
            {can(me.role, "audit") ? (
              <Link href="/admin/audit">
                Journal <Fi s="chevron-right" />
              </Link>
            ) : null}
          </div>
          {s.admin.audit.length ? (
            s.admin.audit.slice(0, 6).map((a, i) => (
              <div className="aud" key={i}>
                <span className="avt sm">{a.who[0]}</span>
                <span>
                  <b>{a.a}</b>
                  <span className="cap">
                    {a.t} · {a.who} · {a.at}
                  </span>
                </span>
              </div>
            ))
          ) : (
            <p className="muted">Aucune action pendant cette session.</p>
          )}
        </div>
        <div className="panel">
          <h2 className="ph-t">Alertes</h2>
          {alerts.map(([i, t, p, h]) => (
            <Link className="lrow" href={h} key={t}>
              <DataIcon cls={i} />
              <span>
                {t}
                <span className="cap" style={{ display: "block" }}>
                  {p}
                </span>
              </span>
              <Fi s="chevron-right" />
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
