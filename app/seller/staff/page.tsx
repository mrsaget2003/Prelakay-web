"use client";

// Comptes employés (ex-V2, actifs dans le prototype) : inviter un employé par téléphone,
// rôle Préparation ou Caisse. L'employé reçoit un SMS d'invitation (démonstration).

import { useState } from "react";
import { useDemo } from "@/lib/demo/store";
import { STAFF_ROLES, inviteStaff, removeStaff, type StaffRole } from "@/lib/demo/staff";
import { SHead } from "@/components/seller/shell";
import { EmptyBox, FieldErr, Fi } from "@/components/proto/ui";

export default function Staff() {
  const s = useDemo();
  const [n, setN] = useState("");
  const [tel, setTel] = useState("");
  const [role, setRole] = useState<StaffRole>("prep");
  const [err, setErr] = useState<string | null>(null);
  return (
    <>
      <SHead title="Employés" crumb={[["Profil du store", "/seller/store"], ["Employés"]]} />
      <div className="s-grid2">
        <div className="panel">
          <h2 className="ph-t">Inviter un employé</h2>
          <form
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              const r = inviteStaff({ n, tel, role });
              setErr(r);
              if (!r) {
                setN("");
                setTel("");
              }
            }}
          >
            <div className="fl">
              <label className="lbl" htmlFor="st-n">Nom</label>
              <input className="field" id="st-n" value={n} onChange={(e) => { setN(e.target.value); setErr(null); }} />
            </div>
            <div className="fl">
              <label className="lbl" htmlFor="st-t">Téléphone</label>
              <input className="field" id="st-t" inputMode="tel" placeholder="3712 3456" value={tel} onChange={(e) => { setTel(e.target.value); setErr(null); }} />
            </div>
            <div className="fl">
              <span className="lbl">Rôle</span>
              {(Object.keys(STAFF_ROLES) as StaffRole[]).map((k) => (
                <label className="lrow st" key={k}>
                  <input type="radio" name="role" checked={role === k} onChange={() => setRole(k)} />
                  <span>
                    {STAFF_ROLES[k][0]}
                    <span className="cap" style={{ display: "block" }}>{STAFF_ROLES[k][1]}</span>
                  </span>
                </label>
              ))}
            </div>
            <FieldErr msg={err} />
            <button className="btn btn-p btn-block">Envoyer l&apos;invitation par SMS</button>
          </form>
        </div>
        <div className="panel">
          <h2 className="ph-t">Équipe du store</h2>
          {s.seller.staff.length ? (
            s.seller.staff.map((m) => (
              <div className="lrow st" key={m.tel}>
                <Fi s="user" />
                <span>
                  {m.n}
                  <span className="cap" style={{ display: "block" }}>
                    {STAFF_ROLES[m.role][0]} · +509 {m.tel.replace(/(\d{4})(\d{4})/, "$1 $2")} · {m.st === "invited" ? "invitation envoyée" : "actif"}
                  </span>
                </span>
                <button className="btn btn-o btn-sm" onClick={() => removeStaff(m.tel)}>
                  Retirer
                </button>
              </div>
            ))
          ) : (
            <EmptyBox icon={<Fi s="users" />} t="Vous êtes seul pour l'instant" p="Invitez un employé pour préparer les commandes ou valider les retraits." />
          )}
        </div>
      </div>
    </>
  );
}
