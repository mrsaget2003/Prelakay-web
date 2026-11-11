"use client";

// Montant animé (NumberFlow, validé le 10 nov. 2026) : les chiffres défilent quand le montant
// change (solde, Coins, totaux). Même format que formatHTG : « 450 000 HTG ».

import NumberFlow from "@number-flow/react";

export function Money({ v, unit = "HTG" }: { v: number; unit?: string }) {
  return (
    <span className="tnum money" aria-label={`${new Intl.NumberFormat("fr-FR").format(Math.round(v))} ${unit}`}>
      <NumberFlow value={Math.round(v)} locales="fr-FR" format={{ maximumFractionDigits: 0 }} suffix={unit ? ` ${unit}` : ""} willChange={false} />
    </span>
  );
}
