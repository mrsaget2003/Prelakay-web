"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ComingSoon } from "@/components/ui/ComingSoon";
import { Modal, BottomSheet } from "@/components/ui/Modal";
import { Tabs } from "@/components/ui/Tabs";
import { QtyStepper } from "@/components/ui/QtyStepper";
import { RoundCheck } from "@/components/ui/RoundCheck";
import { SoonBadge } from "@/components/ui/Tag";
import { Icon } from "@/components/ui/Icon";
import { useToast } from "@/components/ui/Toast";
import styles from "./style-guide.module.css";

// Démonstrations interactives du style guide (composants client).
export function Demos() {
  const toast = useToast();
  const [modal, setModal] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [tab, setTab] = useState("all");
  const [qty, setQty] = useState(1);
  const [all, setAll] = useState(true);

  return (
    <div className={styles.stack}>
      <div className={styles.row}>
        <ComingSoon feature="coupons">
          <button type="button" className={styles.menuRow}>
            <Icon name="tag" />
            <span>Mes coupons</span>
            <SoonBadge />
          </button>
        </ComingSoon>
        <ComingSoon feature="delivery" asOption>
          <button type="button" className={styles.option}>
            <Icon name="truck" />
            <span>Livraison</span>
            <SoonBadge />
          </button>
        </ComingSoon>
      </div>

      <div className={styles.row}>
        <Button variant="dark" size="sm" onClick={() => toast.show("Ajouté au panier", "success")}>Toast succès</Button>
        <Button variant="outline" size="sm" onClick={() => toast.show("Le paiement n'est pas passé. Vérifiez votre solde et réessayez.", "error")}>Toast erreur</Button>
        <Button variant="outline" size="sm" onClick={() => setModal(true)}>Ouvrir la modale</Button>
        <Button variant="outline" size="sm" onClick={() => setSheet(true)}>Ouvrir la feuille</Button>
      </div>

      <Tabs
        label="Statut des commandes"
        value={tab}
        onChange={setTab}
        tabs={[
          { id: "all", label: "Toutes", count: 12 },
          { id: "received", label: "Reçues", count: 2 },
          { id: "ready", label: "Prêtes pour retrait", count: 1 },
          { id: "promos", label: "Promos", feature: "coupons" },
        ]}
      />

      <div className={styles.row}>
        <QtyStepper value={qty} max={5} onChange={setQty} />
        <RoundCheck checked={all} onChange={setAll} label="Tout" />
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Partager ce produit">
        <p className={styles.muted}>WhatsApp en premier, puis copier le lien et QR code (03-design §9.5).</p>
        <div className={styles.row} style={{ marginTop: 16 }}>
          <Button variant="primary"><Icon name="whatsapp" /> WhatsApp</Button>
          <Button variant="outline"><Icon name="copy" /> Copier le lien</Button>
        </div>
      </Modal>
      <BottomSheet open={sheet} onClose={() => setSheet(false)} title="Choisir les caractéristiques">
        <p className={styles.muted}>Feuille du bas (mobile) : photo, prix, stock, choix, quantité.</p>
      </BottomSheet>
    </div>
  );
}
