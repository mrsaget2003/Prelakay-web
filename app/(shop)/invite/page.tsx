"use client";

// Inviter des amis (parrainage, ex-V1.x actif dans le prototype) : lien personnel, filleuls,
// 500 Coins par filleul qui passe sa première commande. Anti-abus : ⚠️ point ouvert.

import { useDemo } from "@/lib/demo/store";
import { REFERRAL_COINS, completeReferral, refLink } from "@/lib/demo/growth";
import { waLink } from "@/lib/proto/shareLinks";
import { useFlash } from "@/components/ui/Feedback";
import { AccLayout } from "@/components/proto/account";
import { StatHero } from "@/components/proto/blocks";
import { Fi, NeedLogin } from "@/components/proto/ui";

export default function Invite() {
  const s = useDemo();
  const [copied, flash] = useFlash();
  if (!s.logged) return <NeedLogin what="Le parrainage" next="/invite" />;
  const url = `https://${refLink(s)}`;
  const done = s.growth.referrals.filter((r) => r.st === "done").length;
  return (
    <AccLayout k="invite" title="Inviter des amis">
      <StatHero icon="user-plus" label="Coins gagnés en parrainant" value={`${done * REFERRAL_COINS}`} href="/coins" action={<span className="btn btn-s btn-sm">Mes Coins</span>} />
      <div className="panel">
        <h3>Votre lien</h3>
        <p className="cap" style={{ marginBottom: 10 }}>
          Votre ami s&apos;inscrit avec ce lien et passe sa première commande : vous recevez {REFERRAL_COINS} Coins.
        </p>
        <div className="cp">
          <input className="field" value={url} readOnly aria-label="Lien de parrainage" />
          <button
            className="btn btn-p btn-sm"
            aria-live="polite"
            onClick={() => {
              try {
                void navigator.clipboard.writeText(url);
              } catch {
                /* presse-papiers indisponible */
              }
              flash();
            }}
          >
            {copied ? "Copié" : "Copier"}
          </button>
        </div>
        <a className="btn btn-s btn-block" style={{ marginTop: 10 }} href={waLink(url, "Rejoins-moi sur Prélakay, le marché des Cayes en ligne :")} target="_blank" rel="noopener noreferrer">
          <Fi s="whatsapp" />
          Inviter par WhatsApp
        </a>
      </div>
      <div className="panel">
        <h3>Vos filleuls</h3>
        {s.growth.referrals.map((r) => (
          <div className="lrow st" key={r.u}>
            <Fi s="user" />
            <span>
              {r.u}
              <span className="cap" style={{ display: "block" }}>Invité le {r.date}</span>
            </span>
            {r.st === "done" ? (
              <span className="tag tag-ok">+{REFERRAL_COINS} Coins</span>
            ) : (
              <button className="btn btn-o btn-sm" onClick={() => completeReferral(r.u)} title="Simuler la première commande du filleul">
                Simuler la 1re commande
              </button>
            )}
          </div>
        ))}
      </div>
    </AccLayout>
  );
}
