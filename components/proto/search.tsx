"use client";

// Recherche du header (desktop .sbox, mobile .msb) et autocomplétion (acHtml du prototype).

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { CATS, PICONS, TINTS, STORES, allProducts, catBy } from "@/lib/data/mock/seed";
import { useDemo, demo } from "@/lib/demo/store";
import { pushHistory } from "@/lib/demo/actions";
import { formatDistance as km } from "@/lib/format";
import { ComingSoon } from "@/components/ui/ComingSoon";
import { SoonBadge } from "@/components/ui/Tag";
import { Fi, Ph } from "./ui";

function Bold({ s, q }: { s: string; q: string }) {
  const i = s.toLowerCase().indexOf(q.toLowerCase());
  if (i < 0) return <>{s}</>;
  return (
    <>
      {s.slice(0, i)}
      <b>{s.slice(i, i + q.length)}</b>
      {s.slice(i + q.length)}
    </>
  );
}

function Autocomplete({ q, close }: { q: string; close: () => void }) {
  const s = useDemo();
  if (!q) {
    const picked = Object.keys(s.picked).filter((k) => s.picked[k])[0];
    const c = catBy(picked || "beaute")!;
    return (
      <div className="ac-2">
        <div>
          {s.hist.length ? (
            <>
              <h5>
                Recherches récentes{" "}
                <button
                  className="cap"
                  style={{ textTransform: "none", letterSpacing: 0 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    demo.update((d) => { d.hist = []; });
                  }}
                >
                  Effacer
                </button>
              </h5>
              {s.hist.slice(0, 5).map((t) => (
                <Link key={t} href={`/search?q=${encodeURIComponent(t)}`} onClick={close}>
                  <Fi r="clock" />
                  {t}
                </Link>
              ))}
            </>
          ) : null}
          <h5>Recherches populaires</h5>
          {["Écouteurs sans fil", "Huile de ricin", "Café des Cayes", "Sac à dos scolaire", "Casque moto"].map((t) => (
            <Link key={t} href={`/search?q=${encodeURIComponent(t)}`} onClick={close}>
              <Fi s="arrow-trend-up" />
              {t}
            </Link>
          ))}
          <ComingSoon feature="voice_search">
            <a href="#">
              <Fi s="microphone" />
              Recherche vocale
              <SoonBadge />
            </a>
          </ComingSoon>
        </div>
        <div>
          <h5>
            Découvrir plus · {c.n}
            <Link href={`/discover?cat=${c.id}`} className="cap" style={{ textTransform: "none", letterSpacing: 0, color: "var(--color-lagon-700)" }} onClick={close}>
              Tout voir ›
            </Link>
          </h5>
          <div className="tiles">
            {c.sub.map((sub, i) => (
              <Link key={sub} href={`/discover?cat=${c.id}&sub=${encodeURIComponent(sub)}`} onClick={close}>
                <Ph icon={PICONS[c.id][i] || c.i} tint={TINTS[i % 5]} />
                <span>{sub}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }
  const ql = q.toLowerCase();
  const seen: Record<string, 1> = {};
  const sug: string[] = [];
  const add = (t: string) => {
    const k = t.toLowerCase();
    if (seen[k] || k.indexOf(ql) < 0) return;
    seen[k] = 1;
    sug.push(t);
  };
  allProducts().forEach((p) => add(p.n));
  CATS.forEach((c) => {
    c.sub.forEach(add);
    add(c.n);
  });
  sug.sort((a, b) => a.toLowerCase().indexOf(ql) - b.toLowerCase().indexOf(ql) || a.length - b.length);
  const ss = STORES.filter((x) => x.n.toLowerCase().indexOf(ql) > -1).slice(0, 3);
  if (!sug.length && !ss.length)
    return (
      <Link href={`/search?q=${encodeURIComponent(q)}`} onClick={close}>
        <Fi s="magnifying-glass" />
        Chercher « <b>{q}</b> »
      </Link>
    );
  return (
    <div className="ac-l">
      {sug.slice(0, 10).map((t) => (
        <Link key={t} href={`/search?q=${encodeURIComponent(t)}`} onClick={() => { pushHistory(t); close(); }}>
          <Fi s="magnifying-glass" />
          <span>
            <Bold s={t} q={q} />
          </span>
        </Link>
      ))}
      {ss.map((st) => (
        <Link key={st.id} href={`/store/${st.id}`} onClick={close}>
          <Fi s="store" />
          <span>
            <Bold s={st.n} q={q} />
          </span>
          <span className="cap" style={{ marginLeft: "auto" }}>Store · {km(st.km)}</span>
        </Link>
      ))}
    </div>
  );
}

/** Formulaire de recherche : `variant` desktop (.sbox) ou mobile (.msb, avec ou sans retour). */
export function SearchBox({ variant, initial, back, onFocusOpen }: { variant: "desk" | "mob"; initial: string; back?: boolean; onFocusOpen?: () => void }) {
  const router = useRouter();
  const [q, setQ] = useState(initial);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const out = (e: Event) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("click", out);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("click", out);
      document.removeEventListener("keydown", esc);
    };
  }, []);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const v = q.trim();
    setOpen(false);
    if (v) pushHistory(v);
    router.push(v ? `/search?q=${encodeURIComponent(v)}` : "/discover");
  };
  const input = (
    <input
      id={variant === "desk" ? "q" : "mq"}
      name="q"
      autoComplete="off"
      placeholder="Cherchez-vous encore votre produit ?"
      value={q}
      aria-label="Rechercher"
      onChange={(e) => {
        setQ(e.target.value);
        setOpen(true);
      }}
      onFocus={() => {
        onFocusOpen?.();
        setOpen(true);
      }}
    />
  );
  const ac: ReactNode = (
    <div className={`ac${open ? " open" : ""}`} id={variant === "desk" ? "ac" : "mac"}>
      {open ? <Autocomplete q={q.trim()} close={() => setOpen(false)} /> : null}
    </div>
  );
  const camera = (cls?: string) => (
    <ComingSoon feature="photo_search">
      <button type="button" className={cls} aria-label="Recherche par photo">
        <Fi s="camera" />
      </button>
    </ComingSoon>
  );

  if (variant === "desk")
    return (
      <form className="sbox" role="search" onSubmit={submit} ref={ref}>
        {input}
        {camera("ic")}
        <button type="submit" className="go" aria-label="Rechercher">
          <Fi s="magnifying-glass" />
        </button>
        {ac}
      </form>
    );
  return (
    <form className="msb" role="search" onSubmit={submit} ref={ref}>
      {back ? (
        <button type="button" className="mb" onClick={() => router.back()} aria-label="Retour">
          <Fi s="chevron-left" />
        </button>
      ) : null}
      <label className="msb-i">
        <Fi s="magnifying-glass" />
        {input}
        {camera()}
      </label>
      {back ? null : (
        <button type="submit" className="msb-go">
          Chercher
        </button>
      )}
      {ac}
    </form>
  );
}
