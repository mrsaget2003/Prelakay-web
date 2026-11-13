"use client";

// Confirmation — pageDone du prototype : une commande par store, statut « Reçue ».
// 13 nov. 2026 : le moment de fin du parcours d'achat (peak-end) — l'écran confirme le paiement
// (le logo se trace), puis imprime le reçu : stores, articles, total, moyen de paiement, et la
// promesse « argent protégé jusqu'au retrait ». Bureau : impression ligne par ligne ;
// mobile : sortie continue, plus courte. Mouvement réduit : le reçu est déjà là.

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";
import { prodBy, storeBy } from "@/lib/data/mock/seed";
import { useDemo } from "@/lib/demo/store";
import { formatHTG as htg } from "@/lib/format";
import { payLabel } from "@/lib/domain/payment";
import { useIsDesk } from "@/lib/proto/useIsDesk";
import { ReceiptPrinter, type ReceiptPrinterStage } from "@/components/proto/receipt";
import { StTag } from "@/components/proto/ui";

const PROCESS_MS = 900;

export default function DonePage() {
  const { ids } = useParams<{ ids: string }>();
  const list = decodeURIComponent(ids).split(",");
  const s = useDemo();
  const os = s.orders.filter((o) => list.includes(o.id));
  const desk = useIsDesk();
  const reduce = useReducedMotion();
  const feedSeconds = desk ? 1.75 : 1;
  const [timeline, setStage] = useState<ReceiptPrinterStage>("processing");
  const stage: ReceiptPrinterStage = reduce ? "complete" : timeline;

  useEffect(() => {
    if (reduce) return;
    const t1 = setTimeout(() => setStage("printing"), PROCESS_MS);
    const t2 = setTimeout(() => setStage("complete"), PROCESS_MS + feedSeconds * 1000 + 100);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [reduce, feedSeconds]);

  const total = os.reduce((a, o) => a + o.total, 0);
  const allPickup = os.every((o) => o.mode !== "delivery");
  const first = storeBy(os[0]?.store ?? "boutik-lakay")!;

  return (
    <div className="wrap done">
      <div className="done-p">
        <ReceiptPrinter.Root stage={stage} feed={desk ? "stepped" : "smooth"} feedSeconds={feedSeconds}>
          <ReceiptPrinter.Machine>
            <ReceiptPrinter.Screen>
              <div className="rp-sum">
                <span>
                  {os.length > 1 ? `${os.length} commandes` : "1 commande"} · {payLabel(os[0]?.pay)}
                </span>
                <b className="tnum">{htg(total)}</b>
              </div>
              <ReceiptPrinter.Status />
            </ReceiptPrinter.Screen>
          </ReceiptPrinter.Machine>
          <ReceiptPrinter.Output>
            <ReceiptPrinter.Paper>
              <header className="rc-h">
                <b>Prélakay</b>
                <span>{os[0]?.date}</span>
              </header>
              {os.map((o) => (
                <section className="rc-o" key={o.id}>
                  <div className="rc-row rc-st">
                    <b>{storeBy(o.store)!.n}</b>
                    <span>{o.id}</span>
                  </div>
                  {o.items.map((it, i) => (
                    <div className="rc-row" key={`${it.p}-${i}`}>
                      <span>{prodBy(it.p)?.n ?? it.p}</span>
                      <span className="tnum">× {it.q}</span>
                    </div>
                  ))}
                  <div className="rc-row">
                    <span>{o.mode === "delivery" ? "Livraison" : "Retrait en magasin"}</span>
                    <span className="tnum">{htg(o.total)}</span>
                  </div>
                </section>
              ))}
              <div className="rc-row rc-tot">
                <b>Total payé</b>
                <b className="tnum">{htg(total)}</b>
              </div>
              <p className="rc-f">
                Argent protégé jusqu&apos;{allPickup ? "au retrait" : "à la remise de votre commande"}.
                <br />+{50 * os.length} Coins après le retrait.
              </p>
            </ReceiptPrinter.Paper>
          </ReceiptPrinter.Output>
        </ReceiptPrinter.Root>
      </div>

      <div className="done-tx">
        <h1>Commande reçue</h1>
        <p className="muted">
          {os.length > 1 ? "Les stores la préparent." : `${first.n} la prépare.`} Vous serez prévenu dès qu&apos;elle sera prête
          {allPickup ? " pour le retrait" : ""}.
        </p>
        <div className="done-os">
          {os.map((o) => (
            <div className="done-o" key={o.id}>
              <span>
                <b>{storeBy(o.store)!.n}</b>
                <span className="cap">{o.id}</span>
              </span>
              <StTag s={o.status} />
            </div>
          ))}
        </div>
        <div className="done-a">
          <Link className="btn btn-p" href="/orders">
            Suivre mes commandes
          </Link>
          <Link className="btn btn-s" href="/">
            Continuer mes achats
          </Link>
        </div>
      </div>
    </div>
  );
}
