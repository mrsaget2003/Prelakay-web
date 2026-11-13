"use client";

// Profil du store — sStore du prototype : identité, adresse et carte, horaires, aperçu,
// comptes (employés : V2, « À venir »).

import Link from "next/link";
import { CATS } from "@/lib/data/mock/seed";
import { storeImage } from "@/lib/data/mock/images";
import { useDemo } from "@/lib/demo/store";
import { myStore } from "@/lib/demo/sellerActions";
import { formatDistance } from "@/lib/format";
import { useToast } from "@/components/ui/Toast";
import { ComingSoon } from "@/components/ui/ComingSoon";
import { StoreMapBox } from "@/components/proto/StoreMapBox";
import { SoonBadge } from "@/components/ui/Tag";
import { SHead, BUYER_URL } from "@/components/seller/shell";
import { Fi, Ph } from "@/components/proto/ui";

const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

export default function StoreProfile() {
  const s = useDemo();
  const toast = useToast();
  const st = myStore(s);
  const [open, close] = st.hours.split("–").map((x) => x.trim());
  return (
    <>
      <SHead title="Profil du store" crumb={[["Mon store"], ["Profil"]]} />
      <div className="s-grid2 wide">
        <div>
          <div className="panel">
            <h2 className="ph-t">Identité</h2>
            <div className="sp-ban">
              <Ph icon={st.i} tint="g4" cls="sav big" img={storeImage(st.id, 200)} alt={st.n} />
              <div>
                <label className="btn btn-o btn-sm">
                  <input type="file" className="sr" accept="image/*" onChange={() => toast.show("Logo prêt à être enregistré")} />
                  Changer le logo
                </label>
                <label className="btn btn-o btn-sm">
                  <input type="file" className="sr" accept="image/*" onChange={() => toast.show("Bannière prête à être enregistrée")} />
                  Changer la bannière
                </label>
              </div>
            </div>
            <div className="fl">
              <label className="lbl" htmlFor="sn">
                Nom du store
              </label>
              <input className="field" id="sn" defaultValue={st.n} />
              <span className="cap">Un changement de nom passe par la modération.</span>
            </div>
            <div className="fl">
              <label className="lbl" htmlFor="sd">
                Description
              </label>
              <textarea className="field" id="sd" rows={3} defaultValue="Retrait en magasin, paiement par wallet." />
            </div>
            <div className="g2">
              <div className="fl">
                <label className="lbl" htmlFor="sc">
                  Catégorie principale
                </label>
                <select className="field" id="sc" defaultValue={st.cat}>
                  {CATS.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.n}
                    </option>
                  ))}
                </select>
              </div>
              <div className="fl">
                <label className="lbl" htmlFor="stp">
                  Type
                </label>
                <select className="field" id="stp" defaultValue={st.type}>
                  <option value="physique">Store physique (avec adresse)</option>
                  <option value="virtuel">Store en ligne (retrait au point Prélakay)</option>
                </select>
              </div>
            </div>
          </div>
          <div className="panel">
            <h2 className="ph-t">Adresse et retrait</h2>
            <div className="fl">
              <label className="lbl" htmlFor="sa">
                Adresse
              </label>
              <input className="field" id="sa" defaultValue={st.addr} />
            </div>
            <StoreMapBox stores={[st]} sel={st.id} zoom={15} className="mlbox-mini" />
            <p className="cap" style={{ marginTop: 6 }}>
              Déplacez le point en production pour ajuster la position sur la carte.
            </p>
          </div>
          <div className="panel">
            <h2 className="ph-t">Horaires d&apos;ouverture</h2>
            {DAYS.map((d, i) => (
              <div className="hrow" key={d}>
                <span>{d}</span>
                <label className="tgl sm">
                  <input type="checkbox" defaultChecked={i < 6} aria-label={`Ouvert le ${d.toLowerCase()}`} />
                  <i />
                </label>
                <input className="field sm" defaultValue={i < 6 ? open || "8 h" : ""} aria-label={`Ouverture ${d}`} />
                <span>–</span>
                <input className="field sm" defaultValue={i < 6 ? close || "17 h" : ""} aria-label={`Fermeture ${d}`} />
              </div>
            ))}
          </div>
          <div className="pf-foot in">
            <a className="btn btn-o" href={`${BUYER_URL}/store/${st.id}`}>
              Voir mon store
            </a>
            <button className="btn btn-p" onClick={() => toast.show("Profil du store enregistré", "success")}>
              Enregistrer
            </button>
          </div>
        </div>
        <div>
          <div className="panel">
            <h3>Aperçu</h3>
            <a className="storec" href={`${BUYER_URL}/store/${st.id}`}>
              <div className="top">
                <Ph icon={st.i} tint="g4" cls="av" img={storeImage(st.id, 120)} alt={st.n} />
                <div style={{ minWidth: 0 }}>
                  <b>{st.n}</b>
                  <span className="cap">
                    {formatDistance(st.km)} · {st.addr.split(",")[0]}
                  </span>
                </div>
              </div>
              <div className="row">
                {st.trust ? <span className="tag tag-new">Store de confiance</span> : null}
                <span className="tag tag-neu">Retrait en magasin</span>
              </div>
            </a>
          </div>
          <div className="panel">
            <h3>Comptes</h3>
            <div className="lrow st">
              <Fi r="user" />
              <span>
                {s.name}
                <span className="cap" style={{ display: "block" }}>
                  Propriétaire
                </span>
              </span>
            </div>
            {s.seller.staff.map((m) => (
              <div className="lrow st" key={m.tel}>
                <Fi s="user" />
                <span>
                  {m.n}
                  <span className="cap" style={{ display: "block" }}>
                    {m.role === "prep" ? "Préparation" : "Caisse"} · {m.st === "invited" ? "invitation envoyée" : "actif"}
                  </span>
                </span>
              </div>
            ))}
            <ComingSoon feature="staff_accounts">
              <Link className="lrow" href="/seller/staff">
                <Fi s="user-plus" />
                <span>Ajouter un employé</span>
                <Fi s="chevron-right" />
              </Link>
            </ComingSoon>
          </div>
        </div>
      </div>
    </>
  );
}
