"use client";

// Wallet — pageWallet du prototype : solde + Coins, Recharger (passerelles, montants),
// Payer pour un proche, Historique. Jamais le mot « escrow » côté acheteur (03-design §9.12).

import { useRouter } from "next/navigation";
import { useState } from "react";
import { GATEWAYS } from "@/lib/data/mock/content";
import { GatewayLogos } from "@/components/proto/PayLogos";
import { useDemo } from "@/lib/demo/store";
import { topUp } from "@/lib/demo/actions";
import { formatHTG as htg } from "@/lib/format";
import { useProtoRoute } from "@/components/proto/shell";
import { AccLayout } from "@/components/proto/account";
import { PageTabs, StatHero } from "@/components/proto/blocks";
import { DataIcon, FieldErr, Fi, NeedLogin } from "@/components/proto/ui";
import { Money } from "@/components/proto/Money";

export default function WalletPage() {
  const s = useDemo();
  const r = useProtoRoute();
  const router = useRouter();
  const [tab, setTab] = useState(r.params.topup ? "topup" : r.params.tab || "topup");
  const [gw, setGw] = useState("moncash");
  const [amt, setAmt] = useState(100000);
  const [pr, setPr] = useState("");
  const [prErr, setPrErr] = useState<string | null>(null);
  if (!s.logged) return <NeedLogin what="Votre wallet" next="/wallet" />;

  let body;
  if (tab === "topup")
    body = (
      <>
        <div className="panel">
          <h3>Choisissez une passerelle</h3>
          <div className="gw">
            {GATEWAYS.map(([k, label, origin]) => (
              <button key={k} className={gw === k ? "on" : ""} onClick={() => setGw(k)}>
                <GatewayLogos gateway={k} height={22} />
                <b>{label}</b>
                <small>{origin}</small>
              </button>
            ))}
          </div>
          <p className="cap" style={{ marginTop: 8 }}>Passerelles actives au lancement : à confirmer.</p>
        </div>
        <div className="panel">
          <h3>Montant</h3>
          <div className="amts">
            {[50000, 100000, 250000, 500000].map((a) => (
              <button key={a} className={amt === a ? "on" : ""} onClick={() => setAmt(a)}>
                {htg(a)}
              </button>
            ))}
          </div>
          <button className="btn btn-p btn-block" onClick={() => topUp(amt, GATEWAYS.find((g) => g[0] === gw)![1])}>
            Recharger {htg(amt)}
          </button>
        </div>
      </>
    );
  else if (tab === "proche")
    body = (
      <div className="panel">
        <h3>Payer le panier d&apos;un proche</h3>
        <p className="muted" style={{ marginBottom: 12 }}>Collez le lien du panier qu&apos;il vous a partagé, ou saisissez son @username.</p>
        <div className="fl">
          <label className="lbl" htmlFor="pr">Lien de panier ou @username</label>
          <input className="field" id="pr" placeholder="prelakay.com/panier/… ou @username" value={pr} aria-invalid={prErr ? true : undefined} onChange={(e) => { setPr(e.target.value); setPrErr(null); }} />
        </div>
        <FieldErr msg={prErr} />
        <button className="btn btn-p btn-block" onClick={() => (pr.trim() ? router.push("/shared/lili_cayes") : setPrErr("Collez un lien de panier ou un @username."))}>
          Voir le panier
        </button>
        <div className="info-box" style={{ marginTop: 12 }}>
          <Fi s="globe" />
          <span>Depuis l&apos;étranger : rechargez avec Wise, une carte ou Meru, puis payez. Votre proche retire en magasin.</span>
        </div>
      </div>
    );
  else
    body = (
      <div className="panel">
        {s.txs.map((t, i) => (
          <div className="txr" key={i}>
            <span className="ic">
              <DataIcon cls={t[0]} />
            </span>
            <div className="t">
              <b>{t[1]}</b>
              <span className="cap">
                {t[2]}
                {t[4] ? ` · ${t[4]}` : ""}
              </span>
            </div>
            <span className={`a tnum ${t[3] > 0 ? "pos" : ""}`}>
              {t[3] > 0 ? "+" : "−"}
              {htg(Math.abs(t[3]))}
            </span>
          </div>
        ))}
      </div>
    );

  return (
    <AccLayout k="wallet" title="Wallet">
      <StatHero icon="wallet" label="Solde disponible" value={<Money v={s.wallet} />} sub={<>Coins : <b>{s.coins}</b></>} />
      <PageTabs
        label="Wallet"
        value={tab}
        onChange={setTab}
        tabs={[{ id: "topup", label: "Recharger" }, { id: "proche", label: "Payer pour un proche" }, { id: "hist", label: "Historique" }]}
      />
      {body}
    </AccLayout>
  );
}
