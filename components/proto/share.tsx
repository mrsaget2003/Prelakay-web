"use client";

// Partage (shareModal du prototype) : WhatsApp en premier, copier le lien, QR code
// (03-design §9.5). Contenu de la modale ; le titre est posé par l'appelant.

import { useState } from "react";
import { useDemo } from "@/lib/demo/store";
import { useFlash } from "@/components/ui/Feedback";
import { fbLink, waLink } from "@/lib/proto/shareLinks";
import { Fi, Qr } from "./ui";

export function shareTitle(kind: string) {
  return `Partager ${kind === "panier" ? "votre panier" : `ce ${kind}`}`;
}

export function ShareModal({ kind, id }: { kind: "produit" | "store" | "panier"; id: string }) {
  const s = useDemo();
  const [copied, flashCopied] = useFlash();
  const [qr, setQr] = useState(false);
  const url = "prelakay.com/" + (kind === "produit" ? `p/${id}` : kind === "store" ? `store/${id}` : `panier/pk-${s.user}`);
  return (
    <>
      <p className="cap" style={{ marginBottom: 12 }}>
        {kind === "panier" ? "Votre proche pourra le consulter et le payer avec son wallet." : "Un lien vers Prélakay, prêt à envoyer."}
      </p>
      <div className="share-g">
        <a href={waLink("https://" + url)} target="_blank" rel="noopener noreferrer">
          <span>
            <Fi s="whatsapp" />
          </span>
          WhatsApp
        </a>
        <button
          onClick={() => {
            try {
              void navigator.clipboard.writeText("https://" + url);
            } catch {
              /* presse-papiers indisponible */
            }
            flashCopied();
          }}
        >
          <span>
            {copied ? <Fi s="check" /> : <Fi s="link" />}
          </span>
          {copied ? "Lien copié" : "Copier le lien"}
        </button>
        <button onClick={() => setQr(true)}>
          <span>
            <Fi s="qrcode" />
          </span>
          QR code
        </button>
        <a href={fbLink("https://" + url)} target="_blank" rel="noopener noreferrer">
          <span>
            <Fi s="facebook-f" />
          </span>
          Facebook
        </a>
      </div>
      <div id="shqr">
        {qr ? (
          <div className="qrbox" style={{ marginTop: 14 }}>
            <Qr seed={url} />
            <p className="cap">Scannez pour ouvrir le lien</p>
          </div>
        ) : null}
      </div>
      <div className="field" style={{ marginTop: 14, display: "flex", alignItems: "center", fontSize: 13, color: "var(--color-neutral-700)", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
        {url}
      </div>
    </>
  );
}
