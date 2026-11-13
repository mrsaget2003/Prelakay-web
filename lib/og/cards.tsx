// Images de partage (Open Graph, 1200 × 630) des fiches produit et des stores (12 nov. 2026).
// design-prelakay.md §6 : « OG listing = template dynamique, nom + photo + logo ». Générées par
// `next/og` (fourni par Next, aucune dépendance ajoutée). Police : celle de `next/og` — Satori
// ne lit pas le woff2 d'Onest / Fraunces.

import { LOGO_LAGON, LOGO_WHITE } from "./logoSvg";
import type { Product, Store } from "@/lib/data/mock/seed";
import { formatCount as k, formatDistance as km, formatHTG as htg } from "@/lib/format";

export const OG_SIZE = { width: 1200, height: 630 };

const C = { white: "#fffaf7", black: "#0b0c10", lagon500: "#0e6b74", lagon700: "#0a4c52", lagon900: "#052a2e", lagon100: "#dbf8fb", n700: "#575b5c", error: "#c62a2a" };

/** Logo complet (SVG embarqué : le PNG d'origine fait 10 000 px de large). */
const logo = (tone: "lagon" | "white") => (tone === "lagon" ? LOGO_LAGON : LOGO_WHITE);
const LOGO_RATIO = 2440.34 / 1080;

/** Fiche produit : la photo pleine hauteur à gauche ; à droite le nom, le prix, le store et sa distance. */
export function ProductOg({ p, st, photo }: { p: Product; st: Store; photo?: string }) {
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", background: C.white, color: C.black }}>
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photo} alt="" width={600} height={630} style={{ width: 600, height: 630, objectFit: "cover" }} />
      ) : (
        <div style={{ width: 600, height: 630, display: "flex", alignItems: "center", justifyContent: "center", background: C.lagon900 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logo("white")} alt="" width={320} height={Math.round(320 / LOGO_RATIO)} />
        </div>
      )}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "52px 56px", justifyContent: "space-between" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logo("lagon")} alt="" width={150} height={Math.round(150 / LOGO_RATIO)} />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 46, lineHeight: 1.15, fontWeight: 700, display: "flex", maxHeight: 160, overflow: "hidden" }}>{p.n}</div>
          <div style={{ display: "flex", alignItems: "baseline", marginTop: 24 }}>
            <span style={{ fontSize: 60, fontWeight: 700, color: p.was ? C.error : C.black }}>{htg(p.price)}</span>
            {p.was ? <span style={{ fontSize: 30, marginLeft: 18, color: C.n700, textDecoration: "line-through" }}>{htg(p.was)}</span> : null}
          </div>
          <div style={{ fontSize: 30, marginTop: 20, color: C.lagon700, fontWeight: 600, display: "flex" }}>
            {st.n} · {km(st.km)}
          </div>
        </div>
        <div style={{ fontSize: 24, color: C.n700, display: "flex" }}>Retrait en magasin · argent protégé jusqu&apos;au retrait</div>
      </div>
    </div>
  );
}

/** Store : fond lagon foncé, la photo du store en rond, son nom, ses chiffres et sa distance. */
export function StoreOg({ s, photo, products }: { s: Store; photo?: string; products: number }) {
  const facts = [s.trust ? "Store de confiance" : null, s.rate ? `note ${s.rate.toFixed(1).replace(".", ",")} / 5` : null, s.sold ? `${k(s.sold)} ventes` : null, `${products} produits`].filter(Boolean);
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "60px 72px", background: C.lagon900, color: C.white }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={logo("white")} alt="" width={170} height={Math.round(170 / LOGO_RATIO)} />
      <div style={{ display: "flex", alignItems: "center" }}>
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt="" width={220} height={220} style={{ width: 220, height: 220, borderRadius: 110, objectFit: "cover", border: `6px solid ${C.lagon500}` }} />
        ) : (
          <div style={{ width: 220, height: 220, borderRadius: 110, background: C.lagon500, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 96, fontWeight: 700 }}>
            {s.n[0]}
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", marginLeft: 48, flex: 1 }}>
          <div style={{ fontSize: 68, fontWeight: 700, lineHeight: 1.1, display: "flex" }}>{s.n}</div>
          <div style={{ fontSize: 30, marginTop: 18, color: C.lagon100, display: "flex" }}>{facts.join(" · ")}</div>
          <div style={{ fontSize: 30, marginTop: 10, color: C.lagon100, display: "flex" }}>
            {s.type === "physique" ? `${km(s.km)} · ${s.addr.split(",")[0]}` : "Store en ligne · retrait au point Prélakay"}
          </div>
        </div>
      </div>
      <div style={{ fontSize: 26, color: C.lagon100, display: "flex" }}>Commandez en ligne, retirez au comptoir.</div>
    </div>
  );
}
