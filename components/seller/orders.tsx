"use client";

// Action de commande partagée (liste, détail) : annulation avec motif (modale du prototype).

import { cancelOrder } from "@/lib/demo/sellerActions";
import { useToast } from "@/components/ui/Toast";
import { useModal } from "@/components/proto/modal";

export function useCancelOrder() {
  const modal = useModal();
  const toast = useToast();
  return (id: string) =>
    modal.open(
      `Annuler la commande ${id}`,
      <>
        <p className="muted" style={{ marginBottom: 12 }}>
          L&apos;acheteur est remboursé intégralement sur son wallet. Trop d&apos;annulations retirent le statut de store de confiance.
        </p>
        <div className="fl">
          <label className="lbl" htmlFor="cr">
            Motif
          </label>
          <select className="field" id="cr">
            <option>Article en rupture</option>
            <option>Article endommagé avant retrait</option>
            <option>Autre</option>
          </select>
        </div>
        <button
          className="btn btn-p btn-block"
          onClick={() => {
            cancelOrder(id);
            modal.close();
            toast.show("Commande annulée, acheteur remboursé");
          }}
        >
          Confirmer l&apos;annulation
        </button>
      </>,
    );
}
