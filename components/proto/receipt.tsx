"use client";

// Imprimante de reçu (13 nov. 2026) — composant ReceiptPrinter fourni par Marc-Karlin, traduit
// dans nos styles : Font Awesome / logo Prélakay au lieu de Phosphor, CSS du projet au lieu de
// Tailwind, aucune dépendance ajoutée (motion est déjà validé).
//
// Trois étapes : « processing » (l'écran confirme), « printing » (le ticket sort), « complete ».
// Le ticket se comporte comme du papier : il sort de la fente et ne s'efface jamais en vue.
// Bureau : avance ligne par ligne (« stepped ») ; mobile : avance continue, plus courte.
// Mouvement réduit : le ticket est déjà sorti, rien ne bouge.

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { createContext, useContext, type ReactNode } from "react";
import { LogoTraceLoader } from "@/components/brand/LogoTraceLoader";
import { Fi } from "./ui";

export type ReceiptPrinterStage = "processing" | "printing" | "complete";
export type ReceiptFeedMotion = "smooth" | "stepped";

const easeOut = [0.23, 1, 0.32, 1] as const;
const easeInOut = [0.77, 0, 0.175, 1] as const;

// bord dentelé du ticket (papier thermique déchiré) : 40 dents de 4 px
const TEETH = 40;
const DEPTH = 4;
const teeth = Array.from({ length: TEETH * 2 }, (_, i) => {
  const x = 100 - ((i + 1) * 100) / (TEETH * 2);
  const y = i % 2 === 0 ? "100%" : `calc(100% - ${DEPTH}px)`;
  return `${x}% ${y}`;
}).join(", ");
const clipPath = `polygon(0 0, 100% 0, 100% calc(100% - ${DEPTH}px), ${teeth})`;

// avance du papier ligne par ligne : chaque palier, puis une pause
const STEPS = ["translateY(calc(-100% + 2px))", "translateY(-91%)", "translateY(-91%)", "translateY(-81%)", "translateY(-81%)", "translateY(-70%)", "translateY(-70%)", "translateY(-58%)", "translateY(-58%)", "translateY(-45%)", "translateY(-45%)", "translateY(-32%)", "translateY(-32%)", "translateY(-20%)", "translateY(-20%)", "translateY(-10%)", "translateY(-10%)", "translateY(-3%)", "translateY(-3%)", "translateY(0%)"];
const STEP_TIMES = [0, 0.075, 0.105, 0.18, 0.21, 0.285, 0.315, 0.39, 0.42, 0.495, 0.525, 0.6, 0.63, 0.705, 0.735, 0.81, 0.84, 0.915, 0.945, 1];

const LABELS: Record<ReceiptPrinterStage, string> = {
  processing: "Confirmation du paiement",
  printing: "Impression du reçu",
  complete: "Commande reçue",
};

type Ctx = { stage: ReceiptPrinterStage; feed: ReceiptFeedMotion; move: boolean; feedSeconds: number };
const PrinterCtx = createContext<Ctx | null>(null);
function usePrinter() {
  const c = useContext(PrinterCtx);
  if (!c) throw new Error("ReceiptPrinter.* doit être dans ReceiptPrinter.Root");
  return c;
}

function Root({ stage, feed = "stepped", feedSeconds = 1.75, children, label = "Reçu de commande" }: { stage: ReceiptPrinterStage; feed?: ReceiptFeedMotion; feedSeconds?: number; children: ReactNode; label?: string }) {
  const reduce = useReducedMotion();
  return (
    <PrinterCtx.Provider value={{ stage, feed, move: !reduce, feedSeconds }}>
      <section className="rp" aria-label={label} data-stage={stage}>
        {children}
      </section>
    </PrinterCtx.Provider>
  );
}

function Machine({ children }: { children: ReactNode }) {
  return (
    <div className="rp-m">
      {children}
      <div className="rp-slot" aria-hidden="true" />
    </div>
  );
}

function Screen({ children }: { children: ReactNode }) {
  return <div className="rp-scr">{children}</div>;
}

function Status() {
  const { stage, move } = usePrinter();
  return (
    <div className="rp-st">
      <span className="rp-st-i" aria-hidden="true">
        <AnimatePresence initial={false} mode="popLayout">
          {stage === "complete" ? (
            <motion.span key="ok" className="rp-ok" initial={move ? { opacity: 0, transform: "scale(0.3)", filter: "blur(3px)" } : false} animate={{ opacity: 1, transform: "scale(1)", filter: "blur(0px)" }} exit={{ opacity: 0 }} transition={{ type: "spring", duration: 0.35, bounce: 0 }}>
              <Fi s="circle-check" />
            </motion.span>
          ) : (
            <motion.span key="work" initial={false} exit={move ? { opacity: 0, transform: "scale(0.6)", filter: "blur(3px)" } : { opacity: 0 }} transition={{ duration: 0.14, ease: easeOut }}>
              <LogoTraceLoader size={18} strokeWidth={22} loading={stage === "processing"} ariaLabel={LABELS[stage]} />
            </motion.span>
          )}
        </AnimatePresence>
      </span>
      <span className="rp-st-t" role="status" aria-live="polite">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.span key={stage} initial={move ? { opacity: 0, transform: "translateY(6px)" } : { opacity: 0 }} animate={{ opacity: 1, transform: "translateY(0px)" }} exit={move ? { opacity: 0, transform: "translateY(-6px)" } : { opacity: 0 }} transition={{ duration: 0.18, ease: easeOut }}>
            {LABELS[stage]}
          </motion.span>
        </AnimatePresence>
      </span>
    </div>
  );
}

function Output({ children }: { children: ReactNode }) {
  const { stage, feed, move, feedSeconds } = usePrinter();
  const visible = stage !== "processing";
  const stepped = feed === "stepped" && stage === "printing" && move;
  return (
    <div className="rp-out">
      <motion.div
        className="rp-feed"
        aria-hidden={stage !== "complete"}
        initial={false}
        animate={{
          opacity: visible || !move ? 1 : 0,
          transform: !move || stage === "complete" ? "translateY(0%)" : stage === "printing" ? (stepped ? STEPS : "translateY(0%)") : "translateY(calc(-100% + 2px))",
        }}
        transition={{
          opacity: { duration: move ? 0.16 : 0, ease: easeOut },
          transform: { duration: move ? feedSeconds : 0, ease: stepped ? "linear" : easeInOut, times: stepped ? STEP_TIMES : undefined },
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}

function Paper({ children }: { children: ReactNode }) {
  return (
    <article className="rp-paper" style={{ clipPath }}>
      {children}
    </article>
  );
}

export const ReceiptPrinter = { Root, Machine, Screen, Status, Output, Paper };
