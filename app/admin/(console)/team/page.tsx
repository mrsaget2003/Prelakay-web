"use client";

// Équipe et rôles — aTeam du prototype : membres (rôle, invitation, retrait) et matrice des permissions.

import { useState } from "react";
import { useDemo } from "@/lib/demo/store";
import { teamInvite, teamOf, teamRemove, teamRole, type Me } from "@/lib/demo/admin";
import { PERM, ROLES, ROLE_KEYS, type Role, type Section } from "@/lib/domain/admin";
import { useToast } from "@/components/ui/Toast";
import { useModal } from "@/components/proto/modal";
import { AHead, useMe } from "@/components/admin/shell";
import { Fi } from "@/components/proto/ui";

const M: [string, Section][] = [
  ["Dossiers KYC", "kyc"], ["Modération produits", "products"], ["Signalements", "reports"], ["Litiges", "disputes"], ["Stores", "stores"],
  ["Utilisateurs", "users"], ["Commandes", "orders"], ["Finances plateforme", "finance"], ["Bannières et events", "banners"], ["Notifications", "notify"],
  ["Catégories", "categories"], ["Équipe et rôles", "team"], ["Paramètres", "settings"], ["Journal d'activité", "audit"],
];

function Invite({ me, onDone }: { me: Me; onDone: () => void }) {
  const toast = useToast();
  const [e, setE] = useState("");
  const [r, setR] = useState<Role>("support");
  const [err, setErr] = useState<string | null>(null);
  return (
    <>
      <div className="fl">
        <label className="lbl" htmlFor="ie">
          E-mail
        </label>
        <input className="field" id="ie" type="email" placeholder="prenom@prelakay.ht" value={e} onChange={(x) => setE(x.target.value)} />
      </div>
      <div className="fl">
        <label className="lbl" htmlFor="ir">
          Rôle
        </label>
        <select className="field" id="ir" value={r} onChange={(x) => setR(x.target.value as Role)}>
          {ROLE_KEYS.map((k) => (
            <option key={k} value={k}>
              {ROLES[k]}
            </option>
          ))}
        </select>
      </div>
      {err ? (
        <div className="err-box" style={{ marginBottom: 10 }} role="alert">
          <Fi s="circle-exclamation" />
          <span>{err}</span>
        </div>
      ) : null}
      <button
        className="btn btn-p btn-block"
        onClick={() => {
          const x = teamInvite(me, e, r);
          if (x) return setErr(x);
          onDone();
          toast.show("Invitation envoyée", "success");
        }}
      >
        Envoyer l&apos;invitation
      </button>
    </>
  );
}

export default function Team() {
  const s = useDemo();
  const me = useMe();
  const toast = useToast();
  const modal = useModal();
  const T = teamOf(s);
  return (
    <>
      <AHead title="Équipe et rôles" crumb={[["Équipe et rôles"]]} />
      <div className="panel">
        <div className="ph-h">
          <h2>Membres</h2>
          <button className="btn btn-p btn-sm" onClick={() => modal.open("Inviter un membre", <Invite me={me} onDone={modal.close} />)}>
            <Fi s="user-plus" />
            Inviter
          </button>
        </div>
        <div className="tbl-w">
          <table className="tbl rsp">
            <thead>
              <tr>
                <th>Membre</th>
                <th>Rôle</th>
                <th>Dernière connexion</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {T.map((a) => (
                <tr key={a.e}>
                  <td data-l="Membre">
                    <b>{a.n}</b>
                    <br />
                    <span className="cap">{a.e}</span>
                  </td>
                  <td data-l="Rôle">
                    {a.e === me.e ? (
                      <span className="tag tag-new">{ROLES[a.role]} (vous)</span>
                    ) : (
                      <select
                        className="field sm"
                        aria-label={`Rôle de ${a.n}`}
                        value={a.role}
                        onChange={(e) => {
                          teamRole(me, a.e, e.target.value as Role);
                          toast.show("Rôle mis à jour", "success");
                        }}
                      >
                        {ROLE_KEYS.map((k) => (
                          <option key={k} value={k}>
                            {ROLES[k]}
                          </option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td data-l="Connexion">{a.pending ? <span className="tag tag-warn">Invitation envoyée</span> : a.last}</td>
                  <td>
                    {a.e === me.e ? null : (
                      <button
                        className="ib"
                        aria-label={`Retirer ${a.n}`}
                        onClick={() => {
                          teamRemove(me, a.e);
                          toast.show("Accès retiré");
                        }}
                      >
                        <Fi r="trash-can" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="panel tbl-w">
        <h2 className="ph-t">Permissions par rôle</h2>
        <table className="tbl perm">
          <thead>
            <tr>
              <th>Section</th>
              {ROLE_KEYS.map((k) => (
                <th key={k}>{ROLES[k]}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {M.map(([l, k]) => (
              <tr key={k}>
                <td>{l}</td>
                {ROLE_KEYS.map((r) => (
                  <td key={r}>{PERM[k].includes(r) ? <Fi s="check" className="ok-c" label="Oui" /> : <span className="cap">—</span>}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
