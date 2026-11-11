"use client";

// Fiche utilisateur — aUsers(r.sub) du prototype : profil, commandes, réinitialisation, bannissement.

import Link from "next/link";
import { useParams } from "next/navigation";
import { storeBy } from "@/lib/data/mock/seed";
import { useDemo } from "@/lib/demo/store";
import { allOrders, auditLog, userBan, usersList } from "@/lib/demo/admin";
import { formatHTG as htg } from "@/lib/format";
import { useToast } from "@/components/ui/Toast";
import { AHead, useMe } from "@/components/admin/shell";
import { useDecide } from "@/components/admin/ui";
import { OTag } from "@/components/proto/tags";
import { Fi, Page404 } from "@/components/proto/ui";

export default function AdminUser() {
  const { id } = useParams<{ id: string }>();
  const s = useDemo();
  const me = useMe();
  const toast = useToast();
  const decide = useDecide();
  const u = usersList(s).find((x) => x.u.slice(1) === decodeURIComponent(id));
  if (!u) return <Page404 />;
  const O = allOrders(s).filter((o) => o.buyer === u.u);
  return (
    <>
      <AHead title={u.u} crumb={[["Utilisateurs", "/admin/users"], [u.u]]} />
      <div className="s-grid2 wide">
        <div>
          <div className="panel">
            <div className="who">
              <span className="avt">{u.name[0]}</span>
              <div>
                <b>{u.name}</b>
                <span className="cap">
                  {u.u} · {u.city} · membre depuis {u.since}
                </span>
              </div>
            </div>
            <div className="kpi">
              {(
                [
                  ["Commandes", u.orders],
                  ["Wallet", htg(u.wallet)],
                  ["Statut", u.st === "banned" ? "Banni" : "Actif"],
                ] as [string, string | number][]
              ).map(([l, v]) => (
                <div key={l}>
                  <span className="cap">{l}</span>
                  <b>{v}</b>
                </div>
              ))}
            </div>
            {u.st === "banned" ? (
              <div className="err-box">
                <Fi s="ban" />
                <span>Banni : {u.why}</span>
              </div>
            ) : null}
          </div>
          <div className="panel">
            <h2 className="ph-t">Commandes</h2>
            {O.length ? (
              O.map((o) => (
                <Link className="s-orow" key={o.id + o.store} href={`/admin/orders/${o.id}`}>
                  <span>
                    <b>{o.id}</b>
                    <span className="cap">
                      {storeBy(o.store)?.n} · {o.date}
                    </span>
                  </span>
                  <b className="tnum">{htg(o.total)}</b>
                  <OTag s={o.status} />
                </Link>
              ))
            ) : (
              <p className="muted">Aucune commande visible dans la démo.</p>
            )}
          </div>
        </div>
        <div>
          <div className="panel">
            <h3>Actions</h3>
            <button
              className="lrow"
              onClick={() => {
                auditLog(me, "Lien de réinitialisation envoyé", u.u);
                toast.show(`Lien de réinitialisation envoyé à ${u.u}`);
              }}
            >
              <Fi s="key" />
              <span>Envoyer un lien de réinitialisation</span>
              <Fi s="chevron-right" />
            </button>
            <button
              className={`btn ${u.st === "banned" ? "btn-p" : "btn-o"} btn-block`}
              style={{ marginTop: 12 }}
              onClick={() => {
                if (u.me) return toast.show("Prototype : le compte de démonstration ne peut pas être banni.", "error");
                if (u.st === "banned") {
                  userBan(me, u.u, null);
                  toast.show("Bannissement levé", "success");
                } else
                  decide(`Bannir ${u.u}`, "Motif", ["Fraude au paiement ou au remboursement", "Comportement abusif", "Faux avis", "Multi-comptes", "Autre"], (m) => {
                    userBan(me, u.u, m);
                    toast.show("Utilisateur banni");
                  }, { hold: true });
              }}
            >
              {u.st === "banned" ? "Lever le bannissement" : "Bannir l'utilisateur"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
