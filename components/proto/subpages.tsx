"use client";

// Sous-pages du compte du prototype : centre de messages, paramètres (et sections),
// centre d'aide (et articles), vus récemment, retours et litiges, mes avis.

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { prodBy, storeBy } from "@/lib/data/mock/seed";
import { productImage } from "@/lib/data/mock/images";
import { CITIES, FAQ, HELP, HELP_ALL, NOTIF_PREFS, SETS } from "@/lib/data/mock/content";
import { demo, useDemo } from "@/lib/demo/store";
import { logout, unread } from "@/lib/demo/actions";
import { ComingSoon } from "@/components/ui/ComingSoon";
import { SoonBadge } from "@/components/ui/Tag";
import { useToast } from "@/components/ui/Toast";
import { AccLayout } from "./account";
import { ProductCard } from "./cards";
import { DisputeForm, ReviewForm } from "./forms";
import { useModal } from "./modal";
import { SupportForm } from "./shell";
import { DataIcon, EmptyBox, Fi, NeedLogin, Page404, Ph, Stars } from "./ui";

export function Notifications() {
  const s = useDemo();
  if (!s.logged) return <NeedLogin what="Vos messages" next="/notifications" />;
  return (
    <AccLayout k="notifications" title="Centre de messages">
      <div className="panel">
        <div className="ph-h">
          <h2>Centre de messages</h2>
          {unread(s) ? (
            <button className="lk" onClick={() => demo.update((d) => d.notif.forEach((n) => (n.un = false)))}>
              Tout marquer comme lu
            </button>
          ) : null}
        </div>
        {s.notif.length ? (
          s.notif.map((x, i) => (
            <Link key={i} className={`nrow ${x.un ? "un" : ""}`} href={x.to} onClick={() => demo.update((d) => { d.notif[i].un = false; })}>
              <span className="ni">
                <DataIcon cls={x.i} />
              </span>
              <span className="nt">
                <b>{x.t}</b>
                <span className="cap">{x.p}</span>
              </span>
              <Fi s="chevron-right" />
            </Link>
          ))
        ) : (
          <EmptyBox icon={<Fi r="bell" />} t="Aucun message" p="Vos commandes et votre wallet vous écriront ici." />
        )}
      </div>
    </AccLayout>
  );
}

function useSaved() {
  const toast = useToast();
  return () => toast.show("Modifications enregistrées", "success");
}

export function Settings({ sec }: { sec?: string }) {
  const s = useDemo();
  const router = useRouter();
  const toast = useToast();
  const saved = useSaved();
  const [prefs, setPrefs] = useState(NOTIF_PREFS.map((_, i) => i < 4));
  const [lang, setLang] = useState("Français");
  if (!s.logged) return <NeedLogin what="Vos paramètres" next="/settings" />;
  if (!sec)
    return (
      <AccLayout k="settings" title="Paramètres">
        <div className="panel">
          <h2 className="ph-t">Paramètres</h2>
          {SETS.map(([k, icon, t]) => (
            <Link key={k} className="lrow" href={`/settings/${k}`}>
              <DataIcon cls={icon} />
              {t}
              <Fi s="chevron-right" />
            </Link>
          ))}
          <ComingSoon feature="dark_mode">
            <button className="lrow">
              <Fi r="moon" />
              Mode sombre
              <SoonBadge />
            </button>
          </ComingSoon>
          <button
            className="lrow"
            onClick={() => {
              logout();
              toast.show("Vous êtes déconnecté", "success");
              router.push("/");
            }}
          >
            <Fi s="arrow-right-from-bracket" />
            Se déconnecter
            <Fi s="chevron-right" />
          </button>
        </div>
      </AccLayout>
    );
  const t = SETS.find((x) => x[0] === sec);
  if (!t) return <Page404 />;
  let b;
  if (sec === "profil")
    b = (
      <>
        <div className="fl">
          <label className="lbl" htmlFor="s1">Nom affiché</label>
          <input className="field" id="s1" defaultValue={s.name} />
        </div>
        <div className="fl">
          <label className="lbl" htmlFor="s2">@username</label>
          <input className="field" id="s2" defaultValue={s.user} />
          <span className="cap">Visible sur vos avis et vos paniers partagés.</span>
        </div>
        <div className="fl">
          <label className="lbl" htmlFor="s3">E-mail</label>
          <input className="field" id="s3" type="email" defaultValue="marc@exemple.ht" />
        </div>
        <button className="btn btn-p" onClick={saved}>Enregistrer</button>
      </>
    );
  else if (sec === "secu")
    b = (
      <>
        <div className="fl">
          <label className="lbl" htmlFor="p1">Mot de passe actuel</label>
          <input className="field" id="p1" type="password" autoComplete="current-password" />
        </div>
        <div className="fl">
          <label className="lbl" htmlFor="p2">Nouveau mot de passe</label>
          <input className="field" id="p2" type="password" autoComplete="new-password" />
        </div>
        <button className="btn btn-p" onClick={saved}>Changer le mot de passe</button>
        <div className="hr" />
        <div className="lrow st">
          <Fi s="google" />
          Compte Google relié
          <Fi s="check" className="ok" />
        </div>
        <ComingSoon feature="phone_otp">
          <button className="lrow">
            <Fi s="phone" />
            Connexion par téléphone
            <SoonBadge />
          </button>
        </ComingSoon>
      </>
    );
  else if (sec === "notifs")
    b = (
      <>
        {NOTIF_PREFS.map((x, i) => (
          <label className="tgl" key={x}>
            <span>{x}</span>
            <input type="checkbox" checked={prefs[i]} onChange={() => setPrefs((p) => p.map((v, j) => (j === i ? !v : v)))} />
            <i />
          </label>
        ))}
        <p className="cap" style={{ marginTop: 12 }}>Canaux : application, WhatsApp, e-mail.</p>
      </>
    );
  else if (sec === "lang")
    b = (
      <>
        <div className="fl">
          <label className="lbl" htmlFor="l1">Langue</label>
          <select
            className="field"
            id="l1"
            value={lang}
            onChange={(e) => {
              if (e.target.value === "creole") {
                toast.soon();
                setLang("Français");
              } else setLang(e.target.value);
            }}
          >
            <option>Français</option>
            <option value="creole">Kreyòl (à venir)</option>
          </select>
        </div>
        <div className="fl">
          <label className="lbl" htmlFor="l2">Devise</label>
          <select className="field" id="l2">
            <option>HTG (gourde)</option>
          </select>
        </div>
        <button className="btn btn-p" onClick={saved}>Enregistrer</button>
      </>
    );
  else if (sec === "ville")
    b = CITIES.map((c, i) => (
      <button key={c} className="lrow" onClick={() => (i ? toast.show("Prélakay n'est pas encore disponible dans cette ville.") : saved())}>
        <Fi s="location-dot" />
        {c}
        {i ? <span className="soon-t">Bientôt</span> : <Fi s="check" className="ok" />}
      </button>
    ));
  else
    b = (
      <>
        <p>Vos pièces KYC ne sont jamais publiées. Vos avis affichent seulement votre @username.</p>
        <button className="btn btn-o" style={{ marginTop: 14 }} onClick={() => toast.show("Demande envoyée. Vous recevrez vos données par e-mail.", "success")}>
          Télécharger mes données
        </button>
      </>
    );
  return (
    <AccLayout k="settings" title={t[2]}>
      <div className="panel">
        <Link className="back-l" href="/settings">
          <Fi s="chevron-left" />
          Paramètres
        </Link>
        <h2 className="ph-t">{t[2]}</h2>
        {b}
      </div>
    </AccLayout>
  );
}

export function Help({ q }: { q: string }) {
  const s = useDemo();
  const router = useRouter();
  const modal = useModal();
  const [qIn, setQIn] = useState(q);
  const res = q ? HELP_ALL.filter((x) => `${x[1]} ${FAQ[x[1]] || ""}`.toLowerCase().includes(q.toLowerCase())) : null;
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const v = qIn.trim();
    router.push(`/help${v ? `?q=${encodeURIComponent(v)}` : ""}`);
  };
  return (
    <AccLayout k="help" title="Centre d'aide">
      <div className="panel help-h">
        <h2 className="ph-t">Bonjour, comment pouvons-nous vous aider ?</h2>
        <form className="hsearch" onSubmit={submit}>
          <input name="q" value={qIn} onChange={(e) => setQIn(e.target.value)} placeholder="Décrivez votre question" aria-label="Rechercher dans l'aide" />
          <button className="btn btn-p btn-sm" aria-label="Rechercher">
            <Fi s="magnifying-glass" />
          </button>
        </form>
      </div>
      {res ? (
        <div className="panel">
          <h3>
            {res.length} résultat{res.length > 1 ? "s" : ""} pour « {q} »
          </h3>
          {res.length ? (
            res.map((x) => (
              <Link key={x[1]} className="lrow" href={`/help/${HELP_ALL.indexOf(x)}`}>
                <Fi r="file-lines" />
                {x[1]}
                <Fi s="chevron-right" />
              </Link>
            ))
          ) : (
            <p className="muted">Aucun article. Contactez le support ci-dessous.</p>
          )}
        </div>
      ) : (
        <div className="help-g">
          {HELP.map(([icon, cat, qs]) => (
            <div className="panel" key={cat}>
              <h3 className="hh">
                <DataIcon cls={icon} />
                {cat}
              </h3>
              {qs.map((q2) => (
                <Link key={q2} className="lrow" href={`/help/${HELP_ALL.findIndex((x) => x[1] === q2)}`}>
                  {q2}
                  <Fi s="chevron-right" />
                </Link>
              ))}
            </div>
          ))}
        </div>
      )}
      <div className="panel help-c">
        <Fi r="comment-dots" />
        <div>
          <b>Besoin de parler à quelqu&apos;un ?</b>
          <span className="cap">L&apos;assistant Prélakay répond tout de suite, puis l&apos;équipe prend le relais.</span>
        </div>
        <button className="btn btn-p btn-sm" onClick={() => modal.open("Support Prélakay", <SupportForm user={s.user} />)}>
          Contacter le support
        </button>
      </div>
    </AccLayout>
  );
}

export function HelpArticle({ n }: { n: string }) {
  const s = useDemo();
  const toast = useToast();
  const modal = useModal();
  const a = HELP_ALL[+n];
  if (!a) return <Page404 />;
  return (
    <AccLayout k="help" title={a[1]}>
      <div className="panel">
        <Link className="back-l" href="/help">
          <Fi s="chevron-left" />
          Centre d&apos;aide · {a[0]}
        </Link>
        <h2 className="ph-t">{a[1]}</h2>
        <p className="art">{FAQ[a[1]] || ""}</p>
        <div className="hr" />
        <p className="cap">Cet article vous a-t-il aidé ?</p>
        <div className="row-b">
          <button className="btn btn-o btn-sm" onClick={() => toast.show("Merci pour votre retour", "success")}>
            Oui
          </button>
          <button className="btn btn-o btn-sm" onClick={() => modal.open("Support Prélakay", <SupportForm user={s.user} />)}>
            Non, contacter le support
          </button>
        </div>
      </div>
      <div className="panel">
        <h3>Articles liés</h3>
        {HELP_ALL.filter((x) => x[0] === a[0] && x[1] !== a[1]).map((x) => (
          <Link key={x[1]} className="lrow" href={`/help/${HELP_ALL.indexOf(x)}`}>
            <Fi r="file-lines" />
            {x[1]}
            <Fi s="chevron-right" />
          </Link>
        ))}
      </div>
    </AccLayout>
  );
}

export function Viewed() {
  const s = useDemo();
  if (!s.logged) return <NeedLogin what="Vos produits vus" next="/viewed" />;
  const L = s.viewed.map((id) => prodBy(id)).filter((p): p is NonNullable<typeof p> => !!p);
  return (
    <AccLayout k="viewed" title="Vus récemment">
      {L.length ? (
        <div className="panel">
          <div className="ph-h">
            <h2>Vus récemment</h2>
            <button className="lk" onClick={() => demo.update((d) => { d.viewed = []; })}>
              Effacer
            </button>
          </div>
          <div className="grid acc-grid">
            {L.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        </div>
      ) : (
        <EmptyBox icon={<Fi s="clock-rotate-left" />} t="Aucun produit vu" p="Les produits que vous ouvrez apparaîtront ici.">
          <Link className="btn btn-p" href="/discover">
            Découvrir
          </Link>
        </EmptyBox>
      )}
    </AccLayout>
  );
}

export function Disputes() {
  const s = useDemo();
  const modal = useModal();
  if (!s.logged) return <NeedLogin what="Vos retours" next="/disputes" />;
  const done = s.orders.filter((o) => o.status === "done");
  return (
    <AccLayout k="disputes" title="Retours et litiges">
      <div className="panel">
        <h2 className="ph-t">Retours et litiges</h2>
        <div className="info-box">
          <Fi s="circle-info" />
          <span>Vous avez 3 jours après le retrait pour signaler un article non conforme, endommagé ou manquant. Le paiement du store reste bloqué pendant l&apos;examen.</span>
        </div>
        {s.disputes.length ? (
          <>
            <h3 style={{ marginTop: 16 }}>En cours</h3>
            {s.disputes.map((d, i) => (
              <div className="lrow st" key={i}>
                <Fi s="triangle-exclamation" />
                <span>
                  {d.id} · {d.why}
                  <span className="cap" style={{ display: "block" }}>Le store a 48 heures pour répondre</span>
                </span>
                <span className="tag tag-warn">En examen</span>
              </div>
            ))}
          </>
        ) : null}
        <h3 style={{ marginTop: 16 }}>Commandes retirées</h3>
        {done.length ? (
          done.map((o) => {
            const p = prodBy(o.items[0].p)!;
            return (
              <div className="lrow st" key={o.id}>
                <Ph icon={p.icon} tint={p.tint} cls="mini" img={productImage(p.id, 120)} alt={p.n} />
                <span>
                  {p.n}
                  <span className="cap" style={{ display: "block" }}>
                    {o.id} · {o.date}
                  </span>
                </span>
                <button className="btn btn-o btn-sm" onClick={() => modal.open("Signaler un problème", <DisputeForm order={o} />)}>
                  Signaler
                </button>
              </div>
            );
          })
        ) : (
          <p className="muted">Aucune commande retirée.</p>
        )}
      </div>
    </AccLayout>
  );
}

export function MyReviews() {
  const s = useDemo();
  const modal = useModal();
  if (!s.logged) return <NeedLogin what="Vos avis" next="/myreviews" />;
  const todo = s.orders.filter((o) => o.status === "done" && !o.reviewed);
  const done = s.orders.filter((o) => o.reviewed);
  const row = (o: (typeof s.orders)[number], b: React.ReactNode) => {
    const p = prodBy(o.items[0].p)!;
    return (
      <div className="lrow st" key={o.id}>
        <Ph icon={p.icon} tint={p.tint} cls="mini" img={productImage(p.id, 120)} alt={p.n} />
        <span>
          {p.n}
          <span className="cap" style={{ display: "block" }}>
            {storeBy(o.store)!.n} · {o.date}
          </span>
        </span>
        {b}
      </div>
    );
  };
  return (
    <AccLayout k="myreviews" title="Mes avis">
      <div className="panel">
        <h2 className="ph-t">À évaluer ({todo.length})</h2>
        {todo.length ? (
          todo.map((o) =>
            row(
              o,
              <button className="btn btn-p btn-sm" onClick={() => modal.open("Votre avis", <ReviewForm order={o} />)}>
                Laisser un avis
              </button>,
            ),
          )
        ) : (
          <p className="muted">Rien à évaluer pour l&apos;instant.</p>
        )}
      </div>
      <div className="panel">
        <h2 className="ph-t">Publiés ({done.length})</h2>
        {done.length ? (
          done.map((o) =>
            row(
              o,
              <span className="stars">
                <Stars r={5} />
              </span>,
            ),
          )
        ) : (
          <p className="muted">Aucun avis publié.</p>
        )}
      </div>
    </AccLayout>
  );
}
