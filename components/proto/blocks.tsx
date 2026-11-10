"use client";

// Composants partagés issus du lot « polish » :
// - StatHero (B.4) : carte de résumé — solde wallet, Coins, carte wallet du compte ;
// - PageTabs (B.2) : onglets soulignés de section de page (wallet, commandes).

import Link from "next/link";
import type { ReactNode } from "react";
import type { IconName } from "@/components/ui/Icon";
import { Fi } from "./ui";

export function StatHero({
  variant = "dark",
  icon,
  label,
  value,
  sub,
  action,
  href,
}: {
  variant?: "dark" | "light";
  icon: IconName;
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  action?: ReactNode;
  href?: string;
}) {
  const inner = (
    <>
      <span className="sh-ic" aria-hidden="true">
        <Fi s={icon} />
      </span>
      <span className="sh-tx">
        <small>{label}</small>
        <b className="amt">{value}</b>
        {sub ? <span className="sub">{sub}</span> : null}
      </span>
      {action}
    </>
  );
  const cls = `stathero${variant === "light" ? " light" : ""}`;
  return href ? (
    <Link className={cls} href={href}>
      {inner}
    </Link>
  ) : (
    <div className={cls}>{inner}</div>
  );
}

export type PageTab = { id: string; label: ReactNode; href?: string };

/** Onglets soulignés : liens (href) ou boutons (onChange) ; aria-current sur l'onglet actif. */
export function PageTabs({ tabs, value, onChange, label }: { tabs: PageTab[]; value: string; onChange?: (id: string) => void; label: string }) {
  return (
    <nav className="ptabs" aria-label={label}>
      {tabs.map((t) => {
        const on = t.id === value;
        const props = { className: on ? "on" : undefined, "aria-current": on ? ("page" as const) : undefined };
        return t.href ? (
          <Link key={t.id} href={t.href} {...props}>
            {t.label}
          </Link>
        ) : (
          <button key={t.id} type="button" {...props} onClick={() => onChange?.(t.id)}>
            {t.label}
          </button>
        );
      })}
    </nav>
  );
}
