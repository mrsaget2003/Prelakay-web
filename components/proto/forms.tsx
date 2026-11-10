"use client";

// Contenus de modales du prototype : signalement (report), question (ask),
// avis (reviewModal), litige (disputeModal), reçu (receipt).

import { useState } from "react";
import { prodBy, storeBy } from "@/lib/data/mock/seed";
import { productImage } from "@/lib/data/mock/images";
import { demo, useDemo, type Order } from "@/lib/demo/store";
import { formatHTG as htg } from "@/lib/format";
import { useToast } from "@/components/ui/Toast";
import { useModal } from "./modal";
import { Fi, Ph } from "./ui";

const REPORT_REASONS = ["Produit interdit ou dangereux", "Contrefaçon", "Prix trompeur", "Photos qui ne correspondent pas", "Autre"];

export function ReportForm({ id, kind }: { id: string; kind: "produit" | "store" }) {
  const modal = useModal();
  const toast = useToast();
  const [why, setWhy] = useState(REPORT_REASONS[0]);
  return (
    <>
      {REPORT_REASONS.map((x) => (
        <label key={x} className="ck" style={{ display: "flex", gap: 10, padding: "10px 0", borderBottom: "1px solid var(--color-neutral-300)" }}>
          <input type="radio" name="rp" value={x} checked={why === x} onChange={() => setWhy(x)} />
          {x}
        </label>
      ))}
      <button
        className="btn btn-p btn-block"
        style={{ marginTop: 14 }}
        onClick={() => {
          demo.update((s) => {
            s.reports.unshift({ id: `SG-${400 + s.reports.length}`, type: kind, target: id, reason: why, by: `@${s.user}`, date: "6 nov. 2026", st: "open" });
          });
          modal.close();
          toast.show("Merci. Notre équipe examine ce signalement.", "success");
        }}
      >
        Envoyer
      </button>
    </>
  );
}

export function AskForm({ id }: { id: string }) {
  const modal = useModal();
  const toast = useToast();
  const [q, setQ] = useState("");
  return (
    <>
      <p className="cap" style={{ marginBottom: 10 }}>Le store répond publiquement : votre question aidera d&apos;autres acheteurs.</p>
      <div className="fl">
        <label className="lbl" htmlFor="aq">Votre question</label>
        <textarea className="field" id="aq" rows={3} style={{ height: "auto", padding: "10px 12px" }} value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <button
        className="btn btn-p btn-block"
        onClick={() => {
          const t = q.trim();
          if (!t) return toast.show("Écrivez votre question.", "error");
          demo.update((s) => {
            s.questions.push({ k: `uq-${s.questions.length + 1}`, p: id, q: t });
          });
          modal.close();
          toast.show("Question envoyée au store", "success");
        }}
      >
        Envoyer
      </button>
    </>
  );
}

function StarsPick({ v, onPick, label }: { v: number; onPick: (n: number) => void; label: string }) {
  return (
    <div className="rstars" data-v={v || undefined} aria-label={label}>
      {[1, 2, 3, 4, 5].map((i) => (
        <button key={i} type="button" onClick={() => onPick(i)} aria-label={`${i} étoile${i > 1 ? "s" : ""}`}>
          {i <= v ? <Fi s="star" /> : <Fi r="star" />}
        </button>
      ))}
    </div>
  );
}

export function ReviewForm({ order }: { order: Order }) {
  const modal = useModal();
  const toast = useToast();
  const p = prodBy(order.items[0].p)!;
  const [st, setSt] = useState<Record<string, number>>({ q: 0, c: 0, s: 0 });
  const [txt, setTxt] = useState("");
  const [err, setErr] = useState(false);
  return (
    <>
      <div className="oc" style={{ padding: 0, marginBottom: 12 }}>
        <div className="it">
          <Ph icon={p.icon} tint={p.tint} img={productImage(p.id, 160)} alt={p.n} />
          <div>
            <b style={{ fontWeight: 500 }}>{p.n}</b>
            <div className="cap">{storeBy(order.store)!.n} · avis vérifié</div>
          </div>
        </div>
      </div>
      {[["q", "Qualité du produit"], ["c", "Conformité à la description"], ["s", "Service du store"]].map(([k, l]) => (
        <div className="fl" key={k}>
          <span className="lbl">{l}</span>
          <StarsPick v={st[k]} label={l} onPick={(n) => setSt((x) => ({ ...x, [k]: n }))} />
        </div>
      ))}
      <div className="fl">
        <label className="lbl" htmlFor="rvt">Commentaire (facultatif)</label>
        <textarea className="field" id="rvt" rows={3} style={{ height: "auto", padding: "10px 12px" }} placeholder="Qu'avez-vous pensé du produit ?" value={txt} onChange={(e) => setTxt(e.target.value)} />
      </div>
      <label className="btn btn-s btn-sm" style={{ marginBottom: 12 }}>
        <input type="file" className="sr" accept="image/*" />
        <Fi s="camera" />
        Ajouter une photo
      </label>
      <div className="err-box" style={{ display: err ? "flex" : "none", marginBottom: 12 }}>
        <Fi s="circle-exclamation" />
        <span>Notez les trois critères pour publier votre avis.</span>
      </div>
      <button
        className="btn btn-p btn-block"
        onClick={() => {
          if (!st.q || !st.c || !st.s) return setErr(true);
          demo.update((s) => {
            const o = s.orders.find((x) => x.id === order.id);
            if (o) o.reviewed = true;
            s.coins += 25;
            s.myRevs.push({ k: `r-${order.id}`, p: p.id, st: Math.round((st.q + st.c + st.s) / 3), t: txt });
          });
          modal.close();
          toast.show("Avis publié · +25 Coins", "success");
        }}
      >
        Publier l&apos;avis · +25 Coins
      </button>
    </>
  );
}

export function DisputeForm({ order }: { order: Order }) {
  const modal = useModal();
  const toast = useToast();
  const [why, setWhy] = useState("");
  const [txt, setTxt] = useState("");
  const [photo, setPhoto] = useState(false);
  const [err, setErr] = useState("");
  const labels: Record<string, string> = { nc: "Article non conforme", end: "Article endommagé", man: "Article manquant", aut: "Autre" };
  return (
    <>
      <p className="cap" style={{ marginBottom: 12 }}>
        Commande {order.id} · vous avez 3 jours après le retrait. Le paiement du store reste bloqué pendant l&apos;examen.
      </p>
      <div className="fl">
        <label className="lbl" htmlFor="dr">Motif</label>
        <select className="field" id="dr" value={why} onChange={(e) => setWhy(e.target.value)}>
          <option value="">Choisissez un motif</option>
          {Object.entries(labels).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
      </div>
      <div className="fl">
        <label className="lbl" htmlFor="dt">Décrivez le problème</label>
        <textarea className="field" id="dt" rows={3} style={{ height: "auto", padding: "10px 12px" }} value={txt} onChange={(e) => setTxt(e.target.value)} />
      </div>
      <div className="fl">
        <span className="lbl">
          Photo <span className="cap">(obligatoire si non conforme ou endommagé)</span>
        </span>
        <label className="btn btn-s btn-sm" style={photo ? { borderColor: "var(--color-success)" } : undefined}>
          <input type="file" className="sr" id="dph" accept="image/*" onChange={(e) => setPhoto(!!e.target.files?.length)} />
          <Fi s="camera" />
          <span>{photo ? "Ajoutée ✓" : "Ajouter une photo"}</span>
        </label>
      </div>
      <div className="err-box" style={{ display: err ? "flex" : "none", marginBottom: 12 }}>
        <Fi s="circle-exclamation" />
        <span>{err}</span>
      </div>
      <button
        className="btn btn-p btn-block"
        onClick={() => {
          if (!why) return setErr("Choisissez un motif.");
          if ((why === "nc" || why === "end") && !photo) return setErr("Ajoutez une photo de l'article.");
          demo.update((s) => {
            s.disputes.unshift({ id: order.id, why: labels[why], txt: txt.trim() });
          });
          modal.close();
          toast.show("Signalement envoyé. Le store a 48 heures pour répondre.", "success");
        }}
      >
        Envoyer le signalement
      </button>
    </>
  );
}

export function Receipt({ order }: { order: Order }) {
  const modal = useModal();
  const toast = useToast();
  return (
    <>
      <p className="cap">
        {storeBy(order.store)!.n} · {order.date}
      </p>
      <div className="hr" />
      {order.items.map((it, i) => {
        const p = prodBy(it.p)!;
        return (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 10, padding: "6px 0" }}>
            <span>
              {p.n} × {it.q}
            </span>
            <b className="tnum">{htg(p.price * it.q)}</b>
          </div>
        );
      })}
      <div className="hr" />
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <b>Total (wallet)</b>
        <b className="tnum">{htg(order.total)}</b>
      </div>
      <button className="btn btn-s btn-block" style={{ marginTop: 14 }} onClick={() => { modal.close(); toast.show("Reçu envoyé par e-mail.", "success"); }}>
        Recevoir par e-mail
      </button>
    </>
  );
}

/** Réutilisé par les pages pour vérifier la connexion avant une action. */
export function useLogged() {
  return useDemo().logged;
}
