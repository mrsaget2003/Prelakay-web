"use client";

// Coins — pageCoins du prototype : solde, comment gagner (50 / commande, 25 / avis ;
// bienvenue et bonus retrait à confirmer ; parrainage « À venir »), historique.

import { COINS_EARN, COINS_HISTORY } from "@/lib/data/mock/content";
import { useDemo } from "@/lib/demo/store";
import { ComingSoon } from "@/components/ui/ComingSoon";
import { AccLayout } from "@/components/proto/account";
import { StatHero } from "@/components/proto/blocks";
import { DataIcon, NeedLogin } from "@/components/proto/ui";

export default function CoinsPage() {
  const s = useDemo();
  if (!s.logged) return <NeedLogin what="Vos Coins" next="/coins" />;
  return (
    <AccLayout k="coins" title="Coins">
      <StatHero variant="light" icon="coins" label="Vos Coins" value={s.coins} sub={<>Utilisation des Coins : <b>règles à confirmer</b></>} />
      <div className="panel">
        <h3>Comment gagner des Coins</h3>
        {COINS_EARN.map(([icon, label, v]) => (
          <div className="txr" key={label}>
            <span className="ic">
              <DataIcon cls={icon} />
            </span>
            <div className="t">
              <b>{label}</b>
            </div>
            {v === "À venir" ? (
              <ComingSoon feature="referral">
                <button className="tag tag-neu">À venir</button>
              </ComingSoon>
            ) : (
              <span className="a">{v}</span>
            )}
          </div>
        ))}
      </div>
      <div className="panel">
        <h3>Historique</h3>
        {COINS_HISTORY.map(([icon, label, d, v]) => (
          <div className="txr" key={label}>
            <span className="ic">
              <DataIcon cls={icon} />
            </span>
            <div className="t">
              <b>{label}</b>
              <span className="cap">{d}</span>
            </div>
            <span className="a pos">{v}</span>
          </div>
        ))}
      </div>
    </AccLayout>
  );
}
