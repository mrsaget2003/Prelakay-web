"use client";

// Caractéristiques (fonction optsHtml du prototype) : un bloc .sku par axe, un
// bouton .sv par choix ; un choix épuisé est barré (.out) et refuse la sélection.

import { COLORS, optsOf, stockFor, type Product, type Choice } from "@/lib/data/mock/seed";
import { useToast } from "@/components/ui/Toast";
import { Fi } from "./ui";

export function SkuOptions({ p, o, onPick }: { p: Product; o: Choice; onPick: (k: string, v: string) => void }) {
  const toast = useToast();
  return (
    <>
      {optsOf(p).map((a) => {
        const cur = o[a.k];
        return (
          <div className="sku" key={a.k}>
            <div className="sku-h">
              {a.k} : <b>{cur || ""}</b>
            </div>
            <div className="sku-v">
              {a.v.map((v) => {
                const ok = stockFor(p, { ...o, [a.k]: v }) > 0;
                return (
                  <button
                    key={v}
                    className={`sv${a.t === "color" ? " col" : ""}${cur === v ? " on" : ""}${ok ? "" : " out"}`}
                    aria-disabled={ok ? undefined : "true"}
                    title={v + (ok ? "" : " (épuisé)")}
                    onClick={() => (ok ? onPick(a.k, v) : toast.show("Ce choix est épuisé.", "error"))}
                  >
                    {a.t === "color" ? <span className="sw" style={{ background: COLORS[v] || "#d8dada" }} /> : null}
                    <span>{v}</span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </>
  );
}

/** Bloc « Quantité » de l'aperçu rapide et de la fiche produit. */
export function QtyRow({ q, stock, onQ }: { q: number; stock: number; onQ: (q: number) => void }) {
  return (
    <div className="sku">
      <div className="sku-h">Quantité</div>
      <div className="qrow">
        <span className="qty">
          <button disabled={q <= 1} aria-label="Moins" onClick={() => onQ(Math.max(1, q - 1))}>
            <MinusPlus minus />
          </button>
          <input value={q} readOnly aria-label="Quantité" />
          <button disabled={q >= stock} aria-label="Plus" onClick={() => onQ(q + 1)}>
            <MinusPlus />
          </button>
        </span>
        <span className="cap">{stock ? (stock <= 3 ? `Plus que ${stock} en stock` : `${stock} disponibles`) : "Épuisé pour ce choix"}</span>
      </div>
    </div>
  );
}

function MinusPlus({ minus }: { minus?: boolean }) {
  return <Fi s={minus ? "minus" : "plus"} />;
}
