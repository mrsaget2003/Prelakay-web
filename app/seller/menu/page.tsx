"use client";

// Menu mobile de l'espace vendeur (onglet « Plus ») — sMenu du prototype.

import Link from "next/link";
import { SMENU } from "@/lib/demo/sellerMenu";
import { SHead, BUYER_URL } from "@/components/seller/shell";
import { DataIcon, Fi } from "@/components/proto/ui";

export default function Menu() {
  return (
    <>
      <SHead title="Menu" />
      <div className="smenu">
        {SMENU.filter((m) => m[0] !== "home").map(([k, icon, label, items]) => {
          const L = typeof items === "string" ? [[items, label] as [string, string]] : items;
          return (
            <div className="panel" key={k}>
              <h3 className="hh">
                <DataIcon cls={icon} />
                {label}
              </h3>
              {L.map(([h, l]) => (
                <Link key={h} className="lrow" href={`/seller/${h}`}>
                  {l}
                  <Fi s="chevron-right" />
                </Link>
              ))}
            </div>
          );
        })}
        <div className="panel">
          <a className="lrow" href={`${BUYER_URL}/`}>
            <Fi s="arrow-right-from-bracket" />
            Retour aux achats
            <Fi s="chevron-right" />
          </a>
        </div>
      </div>
    </>
  );
}
