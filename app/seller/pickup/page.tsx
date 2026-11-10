"use client";

// Valider un retrait — sPickup du prototype : code à 6 chiffres ou QR (scan simulé),
// liste des commandes prêtes ; le prototype montre le code pour la démonstration.

import { useSearchParams } from "next/navigation";
import { Suspense, useRef, useState } from "react";
import { prodBy } from "@/lib/data/mock/seed";
import { productImage } from "@/lib/data/mock/images";
import { useDemo } from "@/lib/demo/store";
import { orderById, sellerOrders, validatePickup, type PickupResult } from "@/lib/demo/sellerActions";
import { formatCode } from "@/lib/demo/seller";
import { formatHTG as htg } from "@/lib/format";
import { useToast } from "@/components/ui/Toast";
import { useModal } from "@/components/proto/modal";
import { SHead } from "@/components/seller/shell";
import { Fi, Ph } from "@/components/proto/ui";

function Pickup() {
  const s = useDemo();
  const toast = useToast();
  const modal = useModal();
  const pid = useSearchParams().get("id");
  const pre = pid ? orderById(s, pid) : undefined;
  const ready = sellerOrders(s).filter((o) => o.status === "ready");
  const [code, setCode] = useState("");
  const [res, setRes] = useState<PickupResult | null>(null);
  const inp = useRef<HTMLInputElement>(null);
  const validate = (c: string) => {
    const r = validatePickup(c);
    setRes(r);
    if (r.ok) {
      setCode("");
      toast.show("Retrait validé", "success");
    }
  };
  const scan = () =>
    modal.open(
      "Scanner le QR code",
      <>
        <div className="scan">
          <div className="scan-f">
            <i />
          </div>
          <p className="muted">Placez le QR code de l&apos;acheteur dans le cadre.</p>
        </div>
        <p className="cap">Prototype : la caméra n&apos;est pas utilisée. Choisissez une commande prête :</p>
        {ready.length ? (
          ready.map((x) => (
            <button
              key={x.id}
              className="lrow"
              onClick={() => {
                modal.close();
                validate(x.code!);
              }}
            >
              <Fi s="qrcode" />
              <span>
                {x.id} · {x.buyer}
              </span>
              <Fi s="chevron-right" />
            </button>
          ))
        ) : (
          <p className="muted">Aucune commande prête.</p>
        )}
      </>,
    );
  return (
    <>
      <SHead title="Valider un retrait" crumb={[["Commandes", "/seller/orders"], ["Valider un retrait"]]} />
      <div className="s-grid2">
        <div className="panel pk">
          <span className="pk-i">
            <Fi s="qrcode" />
          </span>
          <h2>Code de retrait de l&apos;acheteur</h2>
          <p className="muted">Saisissez le code à 6 chiffres affiché dans l&apos;app de l&apos;acheteur, ou scannez son QR code.</p>
          <form
            className="pk-f"
            onSubmit={(e) => {
              e.preventDefault();
              validate(code);
            }}
          >
            <input ref={inp} id="pkc" inputMode="numeric" maxLength={7} autoComplete="off" placeholder="000 000" aria-label="Code de retrait" value={code} onChange={(e) => setCode(e.target.value)} />
            <button className="btn btn-p btn-lg">Valider</button>
          </form>
          <div id="pkres" aria-live="polite">
            {res && !res.ok ? (
              <div className="err-box" style={{ margin: "12px 0" }}>
                <Fi s="circle-exclamation" />
                <span>{res.error}</span>
              </div>
            ) : res && res.ok ? (
              <div className="ok-box">
                <Fi s="circle-check" />
                <div>
                  <b>Retrait validé · {res.order.id}</b>
                  <span>
                    {res.order.buyer} · {htg(res.order.total)}. Remettez les articles à l&apos;acheteur.
                  </span>
                </div>
              </div>
            ) : null}
          </div>
          <button className="btn btn-o btn-block" onClick={scan}>
            <Fi s="camera" />
            Scanner le QR code
          </button>
          {pre && pre.status === "ready" ? (
            <p className="cap" style={{ marginTop: 12 }}>
              Commande attendue : <b>{pre.id}</b> · {pre.buyer}
            </p>
          ) : null}
        </div>
        <div className="panel">
          <h2 className="ph-t">Prêtes pour retrait ({ready.length})</h2>
          {ready.length ? (
            ready.map((o) => {
              const p = prodBy(o.items[0].p)!;
              return (
                <div className="s-orow st" key={o.id}>
                  <Ph icon={p.icon} tint={p.tint} cls="mini" img={productImage(p.id, 120)} alt={p.n} />
                  <span>
                    <b>
                      {o.id} · {o.buyer}
                    </b>
                    <span className="cap">
                      {p.n} · avant le {o.due}
                    </span>
                  </span>
                  <button
                    className="lk"
                    onClick={() => {
                      setCode(formatCode(o.code!));
                      inp.current?.focus();
                    }}
                  >
                    Prototype : code
                  </button>
                </div>
              );
            })
          ) : (
            <p className="muted">Aucune commande en attente de retrait.</p>
          )}
          <p className="cap" style={{ marginTop: 12 }}>
            Le prototype montre le code pour la démonstration. En production, seul l&apos;acheteur le voit.
          </p>
        </div>
      </div>
    </>
  );
}

export default function Page() {
  return (
    <Suspense>
      <Pickup />
    </Suspense>
  );
}
