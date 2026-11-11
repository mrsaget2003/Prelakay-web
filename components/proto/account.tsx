"use client";

// Mise en page du compte (accLayout du prototype : fil d'Ariane, barre latérale
// AliExpress, carte « L'app Prélakay ») et carte de commande (orderCard).

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { prodBy, storeBy } from "@/lib/data/mock/seed";
import { productImage } from "@/lib/data/mock/images";
import { ACC } from "@/lib/data/mock/content";
import { demo, useDemo, type Order } from "@/lib/demo/store";
import { unread } from "@/lib/demo/actions";
import { formatHTG as htg, formatDistance as km } from "@/lib/format";
import type { FeatureKey } from "@/lib/config/release";
import { ComingSoon } from "@/components/ui/ComingSoon";
import { isAvailable } from "@/lib/config/release";
import { SoonBadge } from "@/components/ui/Tag";
import { useToast } from "@/components/ui/Toast";
import { DisputeForm, ReviewForm } from "./forms";
import { useModal } from "./modal";
import { DataIcon, Fi, Ph, Qr } from "./ui";

export function AccLayout({ k, title, children }: { k: string; title: string; children: ReactNode }) {
  const s = useDemo();
  const router = useRouter();
  const toast = useToast();
  const n = unread(s);
  return (
    <div className="wrap">
      <nav className="crumb acc-crumb">
        <Link href="/">Accueil</Link>
        <Fi s="chevron-right" />
        {k === "account" ? (
          <span>Compte</span>
        ) : (
          <>
            <Link href="/account">Compte</Link>
            <Fi s="chevron-right" />
            <span>{title}</span>
          </>
        )}
      </nav>
      <div className="acc">
        <aside className="side-w">
          <nav className="side" aria-label="Mon compte">
            <h4>Compte</h4>
            {ACC.map((a, i) => {
              if (a[0] === "-") return <hr key={i} />;
              const [key, icon, , , feat] = a as [string, string, string, string, FeatureKey?];
              let [, , label, href] = a as [string, string, string, string];
              if (key === "sell" && s.kyc === "ok") [label, href] = ["Espace vendeur", "/seller"];
              if (feat && !isAvailable(feat))
                return (
                  <ComingSoon key={key} feature={feat}>
                    <a href="#">
                      <DataIcon cls={icon} />
                      {label}
                      <SoonBadge />
                    </a>
                  </ComingSoon>
                );
              return (
                <Link key={key} href={href} prefetch={feat ? false : undefined} className={key === k ? "on" : ""}>
                  <DataIcon cls={icon} />
                  {label}
                  {key === "notifications" && n ? <span className="n">{n}</span> : null}
                </Link>
              );
            })}
            <hr />
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                demo.update((d) => { d.logged = false; });
                toast.show("Vous êtes déconnecté", "success");
                router.push("/");
              }}
            >
              <Fi s="arrow-right-from-bracket" />
              Se déconnecter
            </a>
          </nav>
          <div className="side app-card">
            <b>L&apos;app Prélakay</b>
            <span className="cap">Bientôt sur votre téléphone</span>
            <div className="qr">
              <Qr seed="prelakay-app" />
            </div>
            <SoonBadge />
          </div>
        </aside>
        <div className="acc-main">{children}</div>
      </div>
    </div>
  );
}

const HEAD: Record<string, string> = { received: "Commande reçue", prep: "En préparation", ready: "Prête pour retrait", done: "Retirée", expired: "Non retirée", cancelled: "Annulée par le store", handed: "Remise au livreur", enroute: "En route", delivered: "Livrée" };

export function useRoute() {
  const toast = useToast();
  return (storeId: string) => {
    const st = storeBy(storeId)!;
    toast.show(`Itinéraire vers ${st.n} (${km(st.km)})`);
  };
}

export function OrderCard({ o }: { o: Order }) {
  const toast = useToast();
  const modal = useModal();
  const route = useRoute();
  const st = storeBy(o.store)!;
  const it = o.items[0];
  const p = prodBy(it.p)!;
  const nItems = o.items.reduce((a, x) => a + x.q, 0);
  const b1 =
    o.status === "ready" ? (
      <Link className="btn btn-p btn-sm" href={`/orders/${o.id}`}>Code de retrait</Link>
    ) : o.status === "done" ? (
      o.reviewed ? (
        <Link className="btn btn-p btn-sm" href={`/p/${p.id}`}>Racheter</Link>
      ) : (
        <button className="btn btn-p btn-sm" onClick={() => modal.open("Votre avis", <ReviewForm order={o} />)}>Laisser un avis</button>
      )
    ) : (
      <Link className="btn btn-p btn-sm" href={`/orders/${o.id}`}>Suivre la commande</Link>
    );
  const b2 =
    o.status === "done" ? (
      <button className="btn btn-o btn-sm" onClick={() => modal.open("Signaler un problème", <DisputeForm order={o} />)}>Signaler un problème</button>
    ) : (
      <button className="btn btn-o btn-sm" onClick={() => route(st.id)}>Itinéraire</button>
    );
  return (
    <article className="oc">
      <header>
        <b>{HEAD[o.status]}</b>
        <div className="oc-meta">
          <span>Date : {o.date}</span>
          <span>
            N° : {o.id}{" "}
            <button
              className="lk"
              onClick={() => {
                try {
                  void navigator.clipboard.writeText(o.id);
                } catch {
                  /* presse-papiers indisponible */
                }
                toast.show(`Copié : ${o.id}`, "success");
              }}
            >
              Copier
            </button>
          </span>
        </div>
        <Link className="oc-d" href={`/orders/${o.id}`}>
          Détails <Fi s="chevron-right" />
        </Link>
      </header>
      <Link className="oc-st" href={`/store/${st.id}`}>
        <Fi s="store" />
        {st.n}
        <Fi s="chevron-right" />
      </Link>
      <div className="oc-b">
        <Link className="oc-it" href={`/orders/${o.id}`}>
          <Ph icon={p.icon} tint={p.tint} img={productImage(p.id, 160)} alt={p.n} />
          <div>
            <span className="nm">{p.n}</span>
            <span className="cap">{it.v}</span>
            <span className="cap">
              {htg(p.price)} × {it.q}
              {o.items.length > 1 ? ` · +${o.items.length - 1} autre(s) article(s)` : ""}
            </span>
          </div>
        </Link>
        <div className="oc-a">
          <div className="oc-t">
            Total : <b className="tnum">{htg(o.total)}</b>
            <span className="cap">
              {nItems} article{nItems > 1 ? "s" : ""}
            </span>
          </div>
          {b1}
          {b2}
        </div>
      </div>
    </article>
  );
}
