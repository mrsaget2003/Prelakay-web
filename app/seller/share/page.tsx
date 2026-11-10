"use client";

// Partager mon store — sShare du prototype : lien, partage, affiche de vitrine avec QR code.

import { storeImage } from "@/lib/data/mock/images";
import { useDemo } from "@/lib/demo/store";
import { myStore } from "@/lib/demo/sellerActions";
import { useToast } from "@/components/ui/Toast";
import { SHead, BUYER_URL } from "@/components/seller/shell";
import { Fi, Ph, Qr } from "@/components/proto/ui";

export default function Share() {
  const s = useDemo();
  const toast = useToast();
  const st = myStore(s);
  const url = `prelakay.com/store/${st.id}`;
  const copy = () => {
    try {
      void navigator.clipboard.writeText(`https://${url}`);
    } catch {
      /* presse-papiers indisponible */
    }
    toast.show(`Copié : https://${url}`, "success");
  };
  return (
    <>
      <SHead title="Partager mon store" crumb={[["Marketing", "/seller/marketing"], ["Partager mon store"]]} />
      <div className="s-grid2">
        <div className="panel">
          <h2 className="ph-t">Lien du store</h2>
          <div className="cp">
            <input className="field" value={`https://${url}`} readOnly aria-label="Lien du store" />
            <button className="btn btn-p btn-sm" onClick={copy}>
              Copier
            </button>
          </div>
          <div className="share-g" style={{ marginTop: 18 }}>
            <button onClick={() => toast.show("Ouverture de WhatsApp…")}>
              <span>
                <Fi s="whatsapp" />
              </span>
              WhatsApp
            </button>
            <button onClick={() => toast.show("Ouverture de Facebook…")}>
              <span>
                <Fi s="facebook-f" />
              </span>
              Facebook
            </button>
            <button onClick={copy}>
              <span>
                <Fi s="link" />
              </span>
              Copier
            </button>
            <a href={`${BUYER_URL}/store/${st.id}`} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, fontSize: 12 }}>
              <span style={{ width: 52, height: 52, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, background: "var(--color-neutral-100)" }}>
                <Fi r="eye" />
              </span>
              Voir
            </a>
          </div>
          <p className="cap" style={{ marginTop: 14 }}>
            Chaque lien porte un identifiant de suivi : vous verrez dans Statistiques combien de visites il apporte.
          </p>
        </div>
        <div className="panel poster">
          <div className="pst">
            <Ph icon={st.i} tint="g4" cls="sav" img={storeImage(st.id, 160)} alt={st.n} />
            <b>{st.n}</b>
            <span>Commandez en ligne, retirez ici.</span>
            <div className="qr">
              <Qr seed={url} />
            </div>
            <small>prelakay.com · Les Cayes</small>
          </div>
          <button className="btn btn-o btn-sm" onClick={() => toast.show("Affiche envoyée à l'impression")}>
            <Fi s="print" />
            Imprimer l&apos;affiche de vitrine
          </button>
        </div>
      </div>
    </>
  );
}
