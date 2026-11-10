"use client";

// Formulaire produit (ajout / modification) — sProductForm du prototype : informations de base,
// photos, caractéristiques (3 axes max) et stock par combinaison, prix, description, remise et retour.

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CATS, TINTS, catBy, type Product } from "@/lib/data/mock/seed";
import { demo, useDemo, type ProductForm as PF } from "@/lib/demo/store";
import { AXES, formAxes, formError, formFrom, myStore, saveProduct, simulateModeration, statusOf, whyOf } from "@/lib/demo/sellerActions";
import { combos, hs } from "@/lib/demo/seller";
import { useToast } from "@/components/ui/Toast";
import { SoonBadge } from "@/components/ui/Tag";
import { ComingSoon } from "@/components/ui/ComingSoon";
import { SHead } from "@/components/seller/shell";
import { Fi, Ph } from "@/components/proto/ui";

const SECTIONS: [string, string][] = [["base", "Informations de base"], ["media", "Photos et vidéo"], ["sku", "Caractéristiques et stock"], ["price", "Prix"], ["desc", "Description"], ["ret", "Remise et retour"]];

function Sec({ id, title, sub, children }: { id: string; title: string; sub?: string; children: React.ReactNode }) {
  return (
    <section className="panel pf-s" id={`pf-${id}`}>
      <h2>{title}</h2>
      {sub ? (
        <p className="cap" style={{ margin: "-8px 0 14px" }}>
          {sub}
        </p>
      ) : null}
      {children}
    </section>
  );
}

export function ProductForm({ product: p }: { product: Product | null }) {
  const s = useDemo();
  const router = useRouter();
  const toast = useToast();
  const st = myStore(s);
  const [F, setF] = useState<PF>(() => {
    const saved = demo.get().seller.form;
    return saved && saved.id === (p ? p.id : null) ? saved : formFrom(demo.get(), p);
  });
  const [err, setErr] = useState<string | null>(null);
  const set = (patch: Partial<PF>) => setF((f) => ({ ...f, ...patch }));
  const cat = catBy(F.cat) ?? CATS[0];
  const A = formAxes(F);
  const C = A.length ? combos(A) : [{}];
  const why = p ? whyOf(s, p.id) : null;
  const active = p ? statusOf(s, p) === "active" : false;

  const save = (mode: "draft" | "mod") => {
    const e = formError(F, mode);
    if (e) {
      setErr(e);
      window.scrollTo(0, 0);
      return;
    }
    const r = saveProduct(F, mode);
    toast.show(r.result === "draft" ? "Brouillon enregistré" : r.result === "updated" ? "Produit mis à jour" : "Envoyé en modération", "success");
    router.push("/seller/products");
    if (r.result === "mod") simulateModeration(r.id, (n) => toast.show(`Produit approuvé : ${n}`, "success"));
  };
  const jump = (k: string) => {
    const t = document.getElementById(`pf-${k}`);
    if (t) window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - (window.innerWidth >= 1024 ? 90 : 70), behavior: "smooth" });
  };
  const stockAll = () => {
    const vals = Object.values(F.stock).filter((x) => x !== "" && x != null);
    const base = vals[0] || "5";
    const next: Record<string, string> = { ...F.stock };
    for (const c of C) next[A.map((a) => c[a.k]).join("|")] = base;
    set({ stock: next });
  };

  return (
    <>
      <SHead title={p ? "Modifier le produit" : "Ajouter un produit"} crumb={[["Produits", "/seller/products"], [p ? p.n : "Ajouter un produit"]]} />
      <div className="pf">
        <div className="pf-main">
          {err ? (
            <div className="err-box" style={{ marginBottom: 12 }} role="alert">
              <Fi s="circle-exclamation" />
              <span>{err}</span>
            </div>
          ) : null}
          {why ? (
            <div className="err-box" style={{ marginBottom: 12 }}>
              <Fi s="circle-exclamation" />
              <span>Refusé par la modération : {why}</span>
            </div>
          ) : null}
          <Sec id="base" title="Informations de base">
            <div className="fl">
              <label className="lbl" htmlFor="pf-n">
                Titre du produit *
              </label>
              <input className="field" id="pf-n" maxLength={120} value={F.n} onChange={(e) => set({ n: e.target.value })} placeholder="Ex. Robe en lin brodée, taille ajustable" />
              <span className="cap">{F.n.length} / 120</span>
            </div>
            <div className="g2">
              <div className="fl">
                <label className="lbl" htmlFor="pf-c">
                  Catégorie *
                </label>
                <select className="field" id="pf-c" value={F.cat} onChange={(e) => set({ cat: e.target.value, sub: "" })}>
                  {CATS.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.n}
                    </option>
                  ))}
                </select>
              </div>
              <div className="fl">
                <label className="lbl" htmlFor="pf-sub">
                  Sous-catégorie *
                </label>
                <select className="field" id="pf-sub" value={F.sub} onChange={(e) => set({ sub: e.target.value })}>
                  <option value="">Choisir</option>
                  {cat.sub.map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </div>
            </div>
          </Sec>
          <Sec id="media" title="Photos et vidéo" sub="Jusqu'à 8 photos réelles du produit, fond clair. La première est la photo principale. Vidéo : 30 s maximum.">
            <div className="pf-ph">
              {Array.from({ length: 8 }, (_, i) =>
                i < F.photos ? (
                  <div className="pf-img" key={i}>
                    <Ph icon={cat.i} tint={TINTS[i % 5]} />
                    {i === 0 ? <span className="tag tag-new">Principale</span> : null}
                    <button className="ib" aria-label="Retirer la photo" onClick={() => set({ photos: Math.max(0, F.photos - 1) })}>
                      <Fi s="xmark" />
                    </button>
                  </div>
                ) : i === F.photos ? (
                  <label className="pf-add" key={i}>
                    <input type="file" className="sr" accept="image/*" multiple onChange={(e) => set({ photos: Math.min(8, F.photos + Math.max(1, e.target.files?.length ?? 1)) })} />
                    <Fi s="plus" />
                    <span>Ajouter</span>
                  </label>
                ) : null,
              )}
            </div>
          </Sec>
          <Sec id="sku" title="Caractéristiques et stock" sub="Chaque combinaison a son propre stock. Les variantes à 0 sont affichées « épuisé » aux acheteurs.">
            {F.axes.length ? (
              F.axes.map((a, i) => (
                <div className="ax" key={i}>
                  <select className="field" aria-label="Caractéristique" value={a.k} onChange={(e) => set({ axes: F.axes.map((x, j) => (j === i ? { ...x, k: e.target.value } : x)) })}>
                    {AXES.map((x) => (
                      <option key={x}>{x}</option>
                    ))}
                  </select>
                  <input
                    className="field"
                    defaultValue={a.v}
                    onBlur={(e) => set({ axes: F.axes.map((x, j) => (j === i ? { ...x, v: e.target.value } : x)) })}
                    placeholder="Valeurs séparées par des virgules : 160 cm, 220 cm"
                    aria-label="Valeurs"
                  />
                  <button className="ib" aria-label="Retirer" onClick={() => set({ axes: F.axes.filter((_, j) => j !== i) })}>
                    <Fi r="trash-can" />
                  </button>
                </div>
              ))
            ) : (
              <p className="muted" style={{ marginBottom: 10 }}>
                Sans caractéristique, le produit est vendu en modèle unique.
              </p>
            )}
            {F.axes.length < 3 ? (
              <button className="btn btn-o btn-sm" onClick={() => set({ axes: [...F.axes, { k: AXES.find((x) => !F.axes.some((y) => y.k === x))!, v: "" }] })}>
                <Fi s="plus" />
                Ajouter une caractéristique (couleur, taille, longueur, largeur…)
              </button>
            ) : (
              <p className="cap">3 caractéristiques maximum.</p>
            )}
            <div className="tbl-w" style={{ marginTop: 16 }}>
              <table className="tbl sm">
                <thead>
                  <tr>
                    <th>Variante</th>
                    <th>Stock *</th>
                    <th>Référence</th>
                  </tr>
                </thead>
                <tbody>
                  {C.map((c) => {
                    const key = A.map((a) => c[a.k]).join("|");
                    return (
                      <tr key={key}>
                        <td>{A.length ? A.map((a) => c[a.k]).join(" · ") : "Modèle unique"}</td>
                        <td>
                          <input
                            className="field sm"
                            type="number"
                            min={0}
                            inputMode="numeric"
                            value={F.stock[key] ?? ""}
                            onChange={(e) => set({ stock: { ...F.stock, [key]: e.target.value } })}
                            aria-label={`Stock ${key || "modèle unique"}`}
                          />
                        </td>
                        <td className="cap">{`${s.seller.store.slice(0, 3).toUpperCase()}-${(hs(key + F.n) % 9000) + 1000}`}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="row-b">
              <button className="lk" onClick={stockAll}>
                Même stock pour toutes les variantes
              </button>
            </div>
          </Sec>
          <Sec id="price" title="Prix">
            <div className="g2">
              <div className="fl">
                <label className="lbl" htmlFor="pf-p">
                  Prix de vente (HTG) *
                </label>
                <input className="field" id="pf-p" inputMode="numeric" value={F.price} onChange={(e) => set({ price: e.target.value })} />
              </div>
              <div className="fl">
                <label className="lbl" htmlFor="pf-w">
                  Prix barré (HTG)
                </label>
                <input className="field" id="pf-w" inputMode="numeric" value={F.was} onChange={(e) => set({ was: e.target.value })} />
                <span className="cap">Facultatif : prix habituel, plus élevé.</span>
              </div>
            </div>
            <p className="cap">Commission Prélakay : taux à confirmer. Paiement libéré {st.trust ? "24 h" : "3 jours"} après le retrait.</p>
          </Sec>
          <Sec id="desc" title="Description">
            <div className="fl">
              <label className="lbl" htmlFor="pf-d">
                Description
              </label>
              <textarea className="field" id="pf-d" rows={5} value={F.desc} onChange={(e) => set({ desc: e.target.value })} placeholder="Matière, dimensions, conseils d'entretien…" />
            </div>
            <div className="g2">
              <div className="fl">
                <label className="lbl" htmlFor="pf-wt">
                  Poids (kg)
                </label>
                <input className="field" id="pf-wt" inputMode="decimal" value={F.weight} onChange={(e) => set({ weight: e.target.value })} />
              </div>
              <div className="fl">
                <label className="lbl" htmlFor="pf-dm">
                  Dimensions (cm)
                </label>
                <input className="field" id="pf-dm" placeholder="L × l × h" value={F.dims} onChange={(e) => set({ dims: e.target.value })} />
              </div>
            </div>
          </Sec>
          <Sec id="ret" title="Remise et retour">
            <div className="lrow st">
              <Fi s="store" />
              <span>
                Retrait en magasin
                <span className="cap" style={{ display: "block" }}>
                  {st.addr}
                </span>
              </span>
              <span className="tag tag-ok">Actif</span>
            </div>
            <ComingSoon feature="delivery">
              <button className="lrow">
                <Fi s="truck" />
                <span>Livraison à domicile</span>
                <SoonBadge />
              </button>
            </ComingSoon>
            <Link className="lrow" href="/seller/policy">
              <Fi s="rotate-left" />
              <span>
                Politique de retour du store
                <span className="cap" style={{ display: "block" }}>
                  {s.seller.policy ? `Retour sous ${s.seller.policy.days} jours` : "Par défaut : 3 jours si non conforme ou endommagé"}
                </span>
              </span>
              <Fi s="chevron-right" />
            </Link>
          </Sec>
        </div>
        <aside className="pf-side">
          <div className="panel">
            <h3>Sections</h3>
            {SECTIONS.map(([k, l]) => (
              <a
                key={k}
                className="pf-nav"
                href={`#pf-${k}`}
                onClick={(e) => {
                  e.preventDefault();
                  jump(k);
                }}
              >
                {l}
              </a>
            ))}
            <div className="hr" />
            <p className="cap">Après envoi, l&apos;équipe Prélakay vérifie le produit (en général en moins de 24 h). Il devient visible quand il est « Actif ».</p>
          </div>
        </aside>
      </div>
      <div className="pf-foot">
        <Link className="btn btn-o" href="/seller/products">
          Annuler
        </Link>
        <button className="btn btn-s" onClick={() => save("draft")}>
          Enregistrer le brouillon
        </button>
        <button className="btn btn-p" onClick={() => save("mod")}>
          {active ? "Enregistrer" : "Envoyer en modération"}
        </button>
      </div>
    </>
  );
}
