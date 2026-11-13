"use client";

// Employés du store (ex-V2, actifs dans le prototype) : rôle Préparation ou Caisse.
// Deux façons d'inviter (12 nov. 2026) : par SMS, ou par un lien que l'on copie ou partage
// (WhatsApp, Facebook, e-mail, SMS) — ou que l'employé scanne au comptoir.

import { useState } from "react";
import { useDemo } from "@/lib/demo/store";
import { STAFF_ROLES, createStaffLink, inviteStaff, removeStaff, type StaffRole } from "@/lib/demo/staff";
import { fbLink, mailLink, smsLink, waLink } from "@/lib/proto/shareLinks";
import { useFlash } from "@/components/ui/Feedback";
import { useModal } from "@/components/proto/modal";
import { SHead } from "@/components/seller/shell";
import { EmptyBox, FieldErr, Fi, Qr } from "@/components/proto/ui";

const INVITE_TEXT = (role: StaffRole) =>
  `Vous êtes invité à rejoindre notre store sur Prélakay (rôle : ${STAFF_ROLES[role][0]}). Ouvrez ce lien pour créer votre accès :`;

function RolePicker({ role, setRole, name }: { role: StaffRole; setRole: (r: StaffRole) => void; name: string }) {
  return (
    <div className="fl">
      <span className="lbl">Rôle</span>
      {(Object.keys(STAFF_ROLES) as StaffRole[]).map((k) => (
        <label className="lrow st" key={k}>
          <input type="radio" name={name} checked={role === k} onChange={() => setRole(k)} />
          <span>
            {STAFF_ROLES[k][0]}
            <span className="cap" style={{ display: "block" }}>{STAFF_ROLES[k][1]}</span>
          </span>
        </label>
      ))}
    </div>
  );
}

/** Fenêtre de partage du lien d'invitation. */
function InviteLink({ url, role }: { url: string; role: StaffRole }) {
  const [copied, flash] = useFlash();
  const text = INVITE_TEXT(role);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      /* presse-papiers indisponible : le lien reste sélectionnable */
    }
    flash();
  };
  return (
    <div className="inv-link">
      <p className="muted">
        Envoyez ce lien à votre employé. Il crée son accès et rejoint le store avec le rôle <b>{STAFF_ROLES[role][0]}</b>.
      </p>
      <div className="cp">
        <input className="field" value={url} readOnly aria-label="Lien d'invitation" onFocus={(e) => e.currentTarget.select()} />
        <button className="btn btn-p btn-sm" onClick={copy}>
          {copied ? "Copié" : "Copier"}
        </button>
      </div>
      <div className="share-g inv-share">
        <a href={waLink(url, text)} target="_blank" rel="noopener noreferrer">
          <span><Fi s="whatsapp" /></span>
          WhatsApp
        </a>
        <a href={fbLink(url)} target="_blank" rel="noopener noreferrer">
          <span><Fi s="facebook-f" /></span>
          Facebook
        </a>
        <a href={mailLink(url, "Invitation à rejoindre notre store sur Prélakay", text)}>
          <span><Fi s="envelope" /></span>
          E-mail
        </a>
        <a href={smsLink(url, text)}>
          <span><Fi s="comment-dots" /></span>
          SMS
        </a>
      </div>
      <div className="inv-qr">
        <div className="qr">
          <Qr seed={url} />
        </div>
        <span className="cap">Au comptoir, votre employé peut aussi scanner ce code avec son téléphone.</span>
      </div>
    </div>
  );
}

export default function Staff() {
  const s = useDemo();
  const modal = useModal();
  const [how, setHow] = useState<"sms" | "lien">("sms");
  const [n, setN] = useState("");
  const [tel, setTel] = useState("");
  const [role, setRole] = useState<StaffRole>("prep");
  const [err, setErr] = useState<string | null>(null);

  const openLink = () => {
    const { url } = createStaffLink(role, n);
    setN("");
    modal.open("Lien d'invitation", <InviteLink url={url} role={role} />);
  };

  return (
    <>
      <SHead title="Employés" crumb={[["Profil du store", "/seller/store"], ["Employés"]]} />
      <div className="s-grid2">
        <div className="panel">
          <h2 className="ph-t">Inviter un employé</h2>
          <div className="otabs sm inv-how" role="group" aria-label="Moyen d'invitation">
            <button type="button" className={how === "sms" ? "on" : ""} aria-pressed={how === "sms"} onClick={() => { setHow("sms"); setErr(null); }}>
              <Fi s="comment-dots" />
              Par SMS
            </button>
            <button type="button" className={how === "lien" ? "on" : ""} aria-pressed={how === "lien"} onClick={() => { setHow("lien"); setErr(null); }}>
              <Fi s="link" />
              Par lien
            </button>
          </div>
          {how === "sms" ? (
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
              <RolePicker role={role} setRole={setRole} name="role-sms" />
              <FieldErr msg={err} />
              <button className="btn btn-p btn-block">Envoyer l&apos;invitation par SMS</button>
            </form>
          ) : (
            <div>
              <p className="cap" style={{ marginBottom: 12 }}>
                Pas besoin de son numéro : vous obtenez un lien à copier ou à partager sur WhatsApp, Facebook, par e-mail ou par SMS.
              </p>
              <div className="fl">
                <label className="lbl" htmlFor="st-ln">Nom <span className="cap">(facultatif, pour vous y retrouver)</span></label>
                <input className="field" id="st-ln" value={n} onChange={(e) => setN(e.target.value)} />
              </div>
              <RolePicker role={role} setRole={setRole} name="role-lien" />
              <button className="btn btn-p btn-block" onClick={openLink}>
                <Fi s="link" />
                Créer le lien d&apos;invitation
              </button>
            </div>
          )}
        </div>
        <div className="panel">
          <h2 className="ph-t">Équipe du store</h2>
          {s.seller.staff.length ? (
            s.seller.staff.map((m) => {
              const key = m.token ?? m.tel;
              return (
                <div className="lrow st" key={key}>
                  <Fi s={m.via === "lien" ? "link" : "user"} />
                  <span>
                    {m.n}
                    <span className="cap" style={{ display: "block" }}>
                      {STAFF_ROLES[m.role][0]}
                      {m.tel ? ` · +509 ${m.tel.replace(/(\d{4})(\d{4})/, "$1 $2")}` : ""}
                      {" · "}
                      {m.st === "invited" ? (m.via === "lien" ? "lien envoyé, en attente" : "invitation envoyée") : "actif"}
                    </span>
                  </span>
                  <button className="btn btn-o btn-sm" onClick={() => removeStaff(key)}>
                    {m.st === "invited" ? "Annuler" : "Retirer"}
                  </button>
                </div>
              );
            })
          ) : (
            <EmptyBox icon={<Fi s="users" />} t="Vous êtes seul pour l'instant" p="Invitez un employé pour préparer les commandes ou valider les retraits." />
          )}
        </div>
      </div>
    </>
  );
}
