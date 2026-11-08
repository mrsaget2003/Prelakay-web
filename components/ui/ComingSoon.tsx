"use client";

import { cloneElement, type MouseEvent, type ReactElement } from "react";
import { isAvailable, type FeatureKey } from "@/lib/config/release";
import { useToast } from "./Toast";

// CHANGELOG règle 3 : le déclencheur d'une fonctionnalité d'une version future
// reste visible ; son clic affiche « À venir », sans navigation ni changement d'état.
// `asOption` : option d'un choix (ex. « Livraison » au paiement), grisée.

type TriggerProps = {
  onClickCapture?: (e: MouseEvent) => void;
  "aria-disabled"?: boolean | "true" | "false";
  "data-soon"?: string;
};

export function ComingSoon({
  feature,
  children,
  asOption = false,
}: {
  feature: FeatureKey;
  children: ReactElement<TriggerProps>;
  asOption?: boolean;
}) {
  const toast = useToast();
  if (isAvailable(feature)) return children;

  return cloneElement(children, {
    "data-soon": feature,
    ...(asOption ? { "aria-disabled": "true" as const } : {}),
    onClickCapture: (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      toast.soon();
    },
  });
}
