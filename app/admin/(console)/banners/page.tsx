"use client";

// Bannières de l'accueil — aBanners du prototype : aperçu, en ligne / masquée, ordre,
// modification, suppression. Le carrousel de l'accueil acheteur suit cette liste.

import { useState } from "react";
import type { Banner } from "@/lib/data/mock/content";
import { useDemo } from "@/lib/demo/store";
import { BANNER_NEW_ICON } from "@/lib/demo/adminMenu";
import { bannerDelete, bannerMove, bannerSave, bannersOf, bannerToggle, type Me } from "@/lib/demo/admin";
import { useToast } from "@/components/ui/Toast";
import { useModal } from "@/components/proto/modal";
import { AHead, useMe, BUYER_URL } from "@/components/admin/shell";
import { Fi } from "@/components/proto/ui";

const LINKS: [string, string][] = [["/", "Accueil"], ["/map", "Carte des stores"], ["/wallet", "Wallet"], ["/discover?sort=new", "Nouveaux sur Prélakay"], ["/discover?ready=1", "Prêts à retirer"], ["/seller", "Espace vendeur"]];
const THEMES: [string, string][] = [["s1", "Lagon foncé"], ["s2", "Noir"], ["s3", "Lagon clair"]];

function BannerForm({ b0, me, onDone }: { b0: Banner | null; me: Me; onDone: () => void }) {
  const toast = useToast();
  const [b, setB] = useState<Banner>(b0 ?? { id: "", on: true, c: "s1", k: "", h: "", b: "Découvrir", href: "/", from: "6 nov. 2026", to: "31 déc. 2026", i: BANNER_NEW_ICON });
  const [err, setErr] = useState(false);
  const set = (p: Partial<Banner>) => setB((x) => ({ ...x, ...p }));
  return (
    <>
      <div className="fl">
        <label className="lbl" htmlFor="bk">
          Surtitre
        </label>
        <input className="field" id="bk" maxLength={30} value={b.k} onChange={(e) => set({ k: e.target.value })} />
      </div>
      <div className="fl">
        <label className="lbl" htmlFor="bh">
          Titre
        </label>
        <input className="field" id="bh" maxLength={70} value={b.h} onChange={(e) => set({ h: e.target.value })} />
      </div>
      <div className="g2">
        <div className="fl">
          <label className="lbl" htmlFor="bb">
            Bouton
          </label>
          <input className="field" id="bb" maxLength={24} value={b.b} onChange={(e) => set({ b: e.target.value })} />
        </div>
        <div className="fl">
          <label className="lbl" htmlFor="bl">
            Lien
          </label>
          <select className="field" id="bl" value={b.href} onChange={(e) => set({ href: e.target.value })}>
            {LINKS.map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="fl">
        <span className="lbl">Thème</span>
        <div className="row-b" style={{ margin: 0 }}>
          {THEMES.map(([v, l]) => (
            <label className="ck" key={v}>
              <input type="radio" name="bt" value={v} checked={b.c === v} onChange={() => set({ c: v })} />
              {l}
            </label>
          ))}
        </div>
      </div>
      <div className="g2">
        <div className="fl">
          <label className="lbl" htmlFor="bf">
            Du
          </label>
          <input className="field" id="bf" value={b.from} onChange={(e) => set({ from: e.target.value })} />
        </div>
        <div className="fl">
          <label className="lbl" htmlFor="bto">
            Au
          </label>
          <input className="field" id="bto" value={b.to} onChange={(e) => set({ to: e.target.value })} />
        </div>
      </div>
      {err ? (
        <div className="err-box" style={{ marginBottom: 10 }} role="alert">
          <Fi s="circle-exclamation" />
          <span>Surtitre et titre obligatoires.</span>
        </div>
      ) : null}
      <button
        className="btn btn-p btn-block"
        onClick={() => {
          if (!b.h.trim() || !b.k.trim()) return setErr(true);
          bannerSave(me, { ...b, id: b.id || `b${Date.now() % 100000}`, h: b.h.trim(), k: b.k.trim(), b: b.b.trim() || "Découvrir" }, !b0);
          onDone();
          toast.show("Bannière enregistrée", "success");
        }}
      >
        Enregistrer
      </button>
    </>
  );
}

export default function Banners() {
  const s = useDemo();
  const me = useMe();
  const toast = useToast();
  const modal = useModal();
  const L = bannersOf(s);
  const edit = (b: Banner | null) => modal.open(b ? "Modifier la bannière" : "Nouvelle bannière", <BannerForm b0={b} me={me} onDone={modal.close} />);
  return (
    <>
      <AHead title="Bannières de l'accueil" crumb={[["Bannières"]]} />
      <div className="s-bar" style={{ marginBottom: 12 }}>
        <span className="cap">Elles s&apos;affichent dans le carrousel de l&apos;accueil, dans cet ordre.</span>
        <button className="btn btn-p btn-sm" style={{ marginLeft: "auto" }} onClick={() => edit(null)}>
          <Fi s="plus" />
          Nouvelle bannière
        </button>
      </div>
      {L.map((b, i) => (
        <div className="panel bnr" key={b.id}>
          <div className={`bnr-pv slide ${b.c}`}>
            <div className="tx">
              <small>{b.k}</small>
              <b>{b.h}</b>
              <span className={`btn btn-sm ${b.c === "s3" ? "btn-dark" : "btn-p"}`}>{b.b}</span>
            </div>
          </div>
          <div className="bnr-i">
            <div className="row-b" style={{ margin: 0 }}>
              <span className={`tag ${b.on ? "tag-ok" : "tag-neu"}`}>{b.on ? "En ligne" : "Masquée"}</span>
              <span className="cap">
                {b.from} → {b.to}
              </span>
            </div>
            <span className="cap">Lien : {b.href}</span>
            <div className="row-b">
              <label className="tgl sm" title="En ligne">
                <input
                  type="checkbox"
                  checked={b.on}
                  aria-label={`En ligne : ${b.h}`}
                  onChange={(e) => {
                    const err = bannerToggle(me, b.id, e.target.checked);
                    if (err) toast.show(err, "error");
                  }}
                />
                <i />
              </label>
              <button className="ib" disabled={i === 0} aria-label="Monter" onClick={() => bannerMove(me, b.id, -1)}>
                <Fi s="arrow-up" />
              </button>
              <button className="ib" disabled={i === L.length - 1} aria-label="Descendre" onClick={() => bannerMove(me, b.id, 1)}>
                <Fi s="arrow-down" />
              </button>
              <button className="ib" aria-label="Modifier" onClick={() => edit(b)}>
                <Fi r="pen-to-square" />
              </button>
              <button
                className="ib"
                aria-label="Supprimer"
                onClick={() => {
                  const err = bannerDelete(me, b.id);
                  toast.show(err ?? "Bannière supprimée", err ? "error" : "info");
                }}
              >
                <Fi r="trash-can" />
              </button>
              <a className="lk" href={`${BUYER_URL}/`}>
                Voir l&apos;accueil
              </a>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
