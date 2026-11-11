"use client";

// Accueil — pageHome du prototype (03-design §9.3) : bannières, raccourcis de
// catégories, bande de confiance, Près de vous, Nouveaux sur Prélakay, Prêts à
// retirer aujourd'hui, Pour vous + « Voir plus ».

import Link from "next/link";
import { useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { CATS, STORES, P, TINTS, prodBy } from "@/lib/data/mock/seed";
import { bannerImage } from "@/lib/data/mock/images";
import { bannersOf } from "@/lib/demo/admin";
import { useDemo } from "@/lib/demo/store";
import { useIsDesk } from "@/lib/proto/useIsDesk";
import { ProductCard, StoreCard } from "@/components/proto/cards";
import { Countdown } from "@/components/proto/Countdown";
import { Reveal } from "@/components/proto/motion";
import { DataIcon, Fi, Ph, SecHead } from "@/components/proto/ui";

function Hero() {
  // bannières gérées dans la console admin (ordre, en ligne / masquée)
  const B = bannersOf(useDemo());
  const slides = B.filter((x) => x.on).length ? B.filter((x) => x.on) : [B[0]];
  // Embla (validé le 10 nov. 2026) : glisser au doigt ; mêmes classes que le prototype
  const [ref, api] = useEmblaCarousel({ loop: slides.length > 1 });
  const [i, setI] = useState(0);
  const [auto, setAuto] = useState(true);
  useEffect(() => {
    if (!api) return;
    const on = () => setI(api.selectedScrollSnap());
    const stop = () => setAuto(false);
    api.on("select", on).on("pointerDown", stop);
    return () => {
      api.off("select", on).off("pointerDown", stop);
    };
  }, [api]);
  useEffect(() => {
    if (!auto || !api) return;
    const t = setInterval(() => api.scrollNext(), 6000);
    return () => clearInterval(t);
  }, [auto, api]);
  const go = (n: number) => {
    api?.scrollTo((n + slides.length) % slides.length);
    setAuto(false);
  };
  return (
    <section className="hero em" aria-label="À la une" ref={ref}>
      <div className="hero-track" id="track">
        {slides.map((s) => {
          const img = bannerImage(s.id);
          return (
            <div key={s.id} className={`slide ${s.c}`}>
              <div className="tx">
                <small>{s.k}</small>
                <h2>{s.h}</h2>
                <Link className="btn btn-p" href={s.href}>
                  {s.b}
                  <Fi s="arrow-right" />
                </Link>
              </div>
              <DataIcon cls={`${s.i} art`} />
              {img ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img className="art-img" src={img} alt="" loading="lazy" />
              ) : null}
            </div>
          );
        })}
      </div>
      <button className="harr l" onClick={() => go(i - 1)} aria-label="Précédent">
        <Fi s="chevron-left" />
      </button>
      <button className="harr r" onClick={() => go(i + 1)} aria-label="Suivant">
        <Fi s="chevron-right" />
      </button>
      <div className="dots">
        {slides.map((_, j) => (
          <button key={j} onClick={() => go(j)} className={j === i % slides.length ? "on" : ""} aria-label={`Bannière ${j + 1}`} />
        ))}
      </div>
    </section>
  );
}

export default function HomePage() {
  const s = useDemo();
  const desk = useIsDesk();
  // offres flash validées ; l'expiration est revérifiée à chaque mise à jour de l'état (syncCatalog)
  const flash = s.marketing.flash.filter((f) => f.st === "live");
  const [more, setMore] = useState(0);
  const near = STORES.filter((x) => x.type === "physique").sort((a, b) => a.km - b.km);
  const nw = P.filter((p) => p.isNew).slice(0, 10);
  const rd = P.filter((p) => p.ready).slice(0, 10);
  const fy = P.slice(0)
    .sort((a, b) => ((a.id.length * 7 + a.price) % 13) - ((b.id.length * 7 + b.price) % 13))
    .slice(0, desk ? 20 : 12);
  const extra: typeof P = [];
  for (let m = 1; m <= more; m++) extra.push(...P.slice().sort((x, y) => ((x.price * (m + 3)) % 17) - ((y.price * (m + 3)) % 17)).slice(0, 10));

  return (
    <div className="wrap">
      <div className="home-top">
        <Hero />
      </div>
      <nav className="qcats" aria-label="Catégories rapides">
        {CATS.map((c, i) => (
          <Link key={c.id} href={`/discover?cat=${c.id}`}>
            <Ph icon={c.i} tint={TINTS[i % 5]} />
            {c.n.split(" ")[0]}
          </Link>
        ))}
      </nav>
      <div className="trust">
        {(
          [
            ["store", "Retrait en magasin"],
            ["wallet", "Paiement par wallet"],
            ["shield-halved", "Argent protégé"],
            ["circle-check", "Avis vérifiés"],
          ] as const
        ).map(([ic, t]) => (
          <div key={t}>
            <Fi s={ic} />
            {t}
          </div>
        ))}
      </div>
      {flash.length ? (
        <section className="sec fl-sec">
          <SecHead icon={<Fi s="bolt" />} title="Offres flash" sub="24 h seulement, dans des stores de confiance" href="/discover?flash=1" />
          <div className="fl-cd">
            Se termine dans <Countdown ends={flash[0].ends} />
          </div>
          <div className="rail">
            {flash.map((f) => {
              const fp = prodBy(f.product);
              return fp ? <ProductCard key={f.id} p={fp} badge="Flash" /> : null;
            })}
          </div>
        </section>
      ) : null}
      <section className="sec">
        <SecHead icon={<Fi s="location-dot" />} title="Près de vous" sub={`Stores physiques autour de ${s.city}`} href="/map" label="Voir la carte" />
        <div className="rail">
          {near.map((st) => (
            <StoreCard key={st.id} s={st} products={P} />
          ))}
        </div>
      </section>
      <section className="sec">
        <SecHead icon={<Fi s="rocket" />} title="Nouveaux sur Prélakay" sub="Des stores et des produits qui viennent d'arriver" href="/discover?sort=new" />
        <div className="grid">
          {nw.slice(0, desk ? 5 : 4).map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      </section>
      <section className="sec">
        <SecHead icon={<Fi r="clock" />} title="Prêts à retirer aujourd'hui" sub="En stock dans un store près de vous" href="/discover?ready=1" />
        <div className="rail">
          {rd.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      </section>
      <section className="sec">
        <SecHead icon={<Fi r="heart" />} title="Pour vous" />
        <div className="grid" id="fy">
          <Reveal>
            {[...fy, ...extra].map((p, i) => (
              <ProductCard key={`${p.id}-${i}`} p={p} />
            ))}
          </Reveal>
        </div>
        <div className="more-btn">
          {more >= 3 ? (
            <p className="cap">Vous avez tout vu pour aujourd&apos;hui. Revenez demain pour de nouveaux produits.</p>
          ) : (
            <button className="btn btn-s" onClick={() => setMore((m) => m + 1)}>
              Voir plus de produits
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
