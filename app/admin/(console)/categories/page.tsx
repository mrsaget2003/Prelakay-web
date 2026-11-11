"use client";

// Catégories — aCategories du prototype : catégories, sous-catégories (suppression impossible si
// elles contiennent des produits), gabarit d'attributs proposé dans le formulaire produit.

import { useState } from "react";
import { P } from "@/lib/data/mock/seed";
import { useDemo } from "@/lib/demo/store";
import { attrAdd, attrDelete, catCreate, catsOf, subAdd, subDelete } from "@/lib/demo/admin";
import { AXES } from "@/lib/demo/sellerActions";
import { useToast } from "@/components/ui/Toast";
import { useModal } from "@/components/proto/modal";
import { AHead, useMe } from "@/components/admin/shell";
import { DataIcon, FieldErr, Fi } from "@/components/proto/ui";

const count = (cid: string, sub?: string) => P.filter((p) => p.cat === cid && (!sub || p.sub === sub)).length;

function NewCat({ onCreate }: { onCreate: (n: string) => void }) {
  const toast = useToast();
  const [n, setN] = useState("");
  const [err, setErr] = useState<string | null>(null);
  return (
    <>
      <div className="fl">
        <label className="lbl" htmlFor="cn">
          Nom
        </label>
        <input className="field" id="cn" maxLength={30} value={n} aria-invalid={err ? true : undefined} onChange={(e) => { setN(e.target.value); setErr(null); }} />
      </div>
      <FieldErr msg={err} />
      <button className="btn btn-p btn-block" onClick={() => (n.trim() ? onCreate(n.trim()) : setErr("Indiquez un nom."))}>
        Créer
      </button>
    </>
  );
}

export default function Categories() {
  const s = useDemo();
  const me = useMe();
  const toast = useToast();
  const modal = useModal();
  const C = catsOf(s);
  const [cid, setCid] = useState(C[0].id);
  const c = C.find((x) => x.id === cid) ?? C[0];
  const [ns, setNs] = useState("");
  const attrs = s.admin.attrs[c.id] ?? [];
  const free = AXES.filter((a) => !attrs.includes(a));
  const [na, setNa] = useState("");
  return (
    <>
      <AHead title="Catégories" crumb={[["Catégories"]]} />
      <div className="catadm">
        <div className="panel cl">
          {C.map((x) => (
            <button key={x.id} className={x.id === c.id ? "on" : ""} onClick={() => setCid(x.id)}>
              <DataIcon cls={x.i} />
              <span>{x.n}</span>
              <span className="cap">{count(x.id)}</span>
            </button>
          ))}
          <button
            onClick={() =>
              modal.open(
                "Nouvelle catégorie",
                <NewCat
                  onCreate={(n) => {
                    setCid(catCreate(me, n));
                    modal.close();
                    toast.show("Catégorie créée", "success");
                  }}
                />,
              )
            }
          >
            <Fi s="plus" />
            <span>Nouvelle catégorie</span>
          </button>
        </div>
        <div>
          <div className="panel">
            <div className="ph-h">
              <h2>{c.n} · sous-catégories</h2>
            </div>
            {c.sub.map((x, i) => {
              const n = count(c.id, x);
              return (
                <div className="lrow st" key={x}>
                  <Fi s="folder" />
                  <span>
                    {x}
                    <span className="cap" style={{ display: "block" }}>
                      {n} produit{n > 1 ? "s" : ""}
                    </span>
                  </span>
                  <button className="ib" disabled={!!n} title={n ? "Contient des produits" : undefined} aria-label={`Supprimer ${x}`} onClick={() => subDelete(me, c.id, i)}>
                    <Fi r="trash-can" />
                  </button>
                </div>
              );
            })}
            <form
              className="sq-f"
              onSubmit={(e) => {
                e.preventDefault();
                if (!ns.trim()) return toast.show("Indiquez un nom.", "error");
                const err = subAdd(me, c.id, ns.trim());
                if (err) return toast.show(err, "error");
                setNs("");
                toast.show("Sous-catégorie ajoutée", "success");
              }}
            >
              <input className="field" id="nsub" placeholder="Nouvelle sous-catégorie" aria-label="Nouvelle sous-catégorie" value={ns} onChange={(e) => setNs(e.target.value)} />
              <button className="btn btn-p btn-sm">Ajouter</button>
            </form>
          </div>
          <div className="panel">
            <h2 className="ph-t">Gabarit d&apos;attributs</h2>
            <p className="cap" style={{ margin: "-8px 0 12px" }}>
              Caractéristiques proposées aux stores dans le formulaire produit de cette catégorie.
            </p>
            <div className="row-b" style={{ margin: "0 0 12px" }}>
              {attrs.map((a, i) => (
                <span className="chip on" key={a}>
                  {a}
                  <button aria-label={`Retirer ${a}`} style={{ color: "inherit", marginLeft: 4 }} onClick={() => attrDelete(c.id, i)}>
                    <Fi s="xmark" />
                  </button>
                </span>
              ))}
            </div>
            <div className="sq-f">
              <select className="field" id="nattr" aria-label="Attribut à ajouter" value={free.includes(na) ? na : free[0] ?? ""} onChange={(e) => setNa(e.target.value)}>
                {free.map((a) => (
                  <option key={a}>{a}</option>
                ))}
              </select>
              <button
                className="btn btn-o btn-sm"
                onClick={() => {
                  const a = free.includes(na) ? na : free[0];
                  if (a) attrAdd(me, c.id, a);
                }}
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
