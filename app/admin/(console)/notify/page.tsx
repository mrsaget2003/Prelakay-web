"use client";

// Notifications — aNotify du prototype : destinataires, titre, message, lien, canaux ; historique.
// WhatsApp (Callmebot) et e-mail : simulés dans la démo.

import { useState } from "react";
import { STORES } from "@/lib/data/mock/seed";
import { useDemo } from "@/lib/demo/store";
import { notifySend } from "@/lib/demo/admin";
import { useToast } from "@/components/ui/Toast";
import { AHead, useMe } from "@/components/admin/shell";
import { Fi } from "@/components/proto/ui";

const LINKS: [string, string][] = [["/", "Accueil"], ["/discover?sort=new", "Nouveaux sur Prélakay"], ["/map", "Carte des stores"], ["/wallet", "Wallet"], ["/seller", "Espace vendeur"]];

export default function Notify() {
  const s = useDemo();
  const me = useMe();
  const toast = useToast();
  const [to, setTo] = useState("buyers");
  const [t, setT] = useState("");
  const [p, setP] = useState("");
  const [link, setLink] = useState("/");
  const [wa, setWa] = useState(false);
  const [mail, setMail] = useState(false);
  const [err, setErr] = useState(false);
  const audience: [string, string][] = [["buyers", "Tous les acheteurs"], ["stores", "Tous les stores"], ...STORES.map((x): [string, string] => [`store:${x.id}`, `Store : ${x.n}`]), ["me", `Acheteur : @${s.user}`]];
  const send = () => {
    if (!t.trim() || !p.trim()) return setErr(true);
    setErr(false);
    notifySend(me, { to, toLabel: audience.find((a) => a[0] === to)![1], t: t.trim(), p: p.trim(), link, wa, mail });
    setT("");
    setP("");
    toast.show("Notification envoyée", "success");
  };
  return (
    <>
      <AHead title="Notifications" crumb={[["Notifications"]]} />
      <div className="s-grid2">
        <div className="panel">
          <h2 className="ph-t">Nouvelle notification</h2>
          <div className="fl">
            <label className="lbl" htmlFor="nau">
              Destinataires
            </label>
            <select className="field" id="nau" value={to} onChange={(e) => setTo(e.target.value)}>
              {audience.map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </div>
          <div className="fl">
            <label className="lbl" htmlFor="nti">
              Titre
            </label>
            <input className="field" id="nti" maxLength={60} placeholder="Ex. Nouveaux stores à Les Cayes" value={t} onChange={(e) => setT(e.target.value)} />
          </div>
          <div className="fl">
            <label className="lbl" htmlFor="nme">
              Message
            </label>
            <textarea className="field" id="nme" rows={3} maxLength={160} placeholder="160 caractères maximum" value={p} onChange={(e) => setP(e.target.value)} />
          </div>
          <div className="fl">
            <label className="lbl" htmlFor="nli">
              Lien à l&apos;ouverture
            </label>
            <select className="field" id="nli" value={link} onChange={(e) => setLink(e.target.value)}>
              {LINKS.map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </div>
          <div className="fl">
            <span className="lbl">Canaux</span>
            <label className="ck">
              <input type="checkbox" checked disabled />
              Application (in-app)
            </label>
            <label className="ck">
              <input type="checkbox" id="nwa" checked={wa} onChange={(e) => setWa(e.target.checked)} />
              WhatsApp (Callmebot)
            </label>
            <label className="ck">
              <input type="checkbox" id="nem" checked={mail} onChange={(e) => setMail(e.target.checked)} />
              E-mail
            </label>
          </div>
          <div id="nerr">
            {err ? (
              <div className="err-box" style={{ marginBottom: 10 }} role="alert">
                <Fi s="circle-exclamation" />
                <span>Titre et message obligatoires.</span>
              </div>
            ) : null}
          </div>
          <button className="btn btn-p btn-block" onClick={send}>
            Envoyer
          </button>
        </div>
        <div className="panel">
          <h2 className="ph-t">Historique</h2>
          {s.admin.sent.length ? (
            s.admin.sent.map((x, i) => (
              <div className="aud" key={i}>
                <span className="ni">
                  <Fi r="bell" />
                </span>
                <span>
                  <b>{x.t}</b>
                  <span className="cap">
                    {x.to} · {x.ch} · {x.at}
                  </span>
                </span>
              </div>
            ))
          ) : (
            <p className="muted">Aucun envoi pendant cette session.</p>
          )}
        </div>
      </div>
    </>
  );
}
