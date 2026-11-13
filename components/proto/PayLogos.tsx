// Logos des moyens de paiement (11 nov. 2026) : passerelles du wallet, bandeau
// « moyens acceptés » du panier et du pied de page, retraits du vendeur.

import Image from "next/image";
import { ACCEPTED, logosOfGateway, type PayLogo } from "@/lib/data/payment";

/** Un logo, hauteur fixe, largeur déduite des proportions du fichier. */
export function PayMark({ logo, height = 20 }: { logo: PayLogo; height?: number }) {
  const img = (
    <Image
      className="paym"
      src={logo.src}
      alt={logo.alt}
      height={height}
      width={Math.round((logo.w / logo.h) * height)}
      style={{ height, width: "auto" }}
    />
  );
  // fichier prévu pour un fond sombre (NatCash : « nat » en blanc) : pastille noire
  return logo.dark ? <span className="paym-dark">{img}</span> : img;
}

/** Logos d'une passerelle de recharge ; rien si nous n'avons pas son logo. */
export function GatewayLogos({ gateway, height = 20 }: { gateway: string; height?: number }) {
  const logos = logosOfGateway(gateway);
  if (!logos.length) return null;
  return (
    <span className="paym-row" aria-hidden="true">
      {logos.map((l) => (
        <PayMark key={l.src} logo={l} height={height} />
      ))}
    </span>
  );
}

/** Bandeau « moyens acceptés ». */
export function AcceptedPayments({ height = 20, label = "Moyens de paiement acceptés" }: { height?: number; label?: string }) {
  return (
    <div className="paym-row" role="list" aria-label={label}>
      {ACCEPTED.map((l) => (
        <span role="listitem" key={l.src}>
          <PayMark logo={l} height={height} />
        </span>
      ))}
    </div>
  );
}
