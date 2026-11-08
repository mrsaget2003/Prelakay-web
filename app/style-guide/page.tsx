import {
  Search,
  MapPin,
  Wallet,
  User,
  ShoppingBasket,
  AlertTriangle,
} from "BoxIcons-react";

const colors: { name: string; varName: string }[] = [
  { name: "white", varName: "--color-white" },
  { name: "black", varName: "--color-black" },
  { name: "lagon-100", varName: "--color-lagon-100" },
  { name: "lagon-300", varName: "--color-lagon-300" },
  { name: "lagon-500", varName: "--color-lagon-500" },
  { name: "lagon-700", varName: "--color-lagon-700" },
  { name: "lagon-900", varName: "--color-lagon-900" },
  { name: "neutral-100", varName: "--color-neutral-100" },
  { name: "neutral-300", varName: "--color-neutral-300" },
  { name: "neutral-500", varName: "--color-neutral-500" },
  { name: "neutral-700", varName: "--color-neutral-700" },
  { name: "neutral-900", varName: "--color-neutral-900" },
  { name: "success", varName: "--color-success" },
  { name: "error", varName: "--color-error" },
  { name: "warning", varName: "--color-warning" },
];

const spacing = [4, 8, 12, 16, 24, 32, 48, 64];

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section style={{ marginBottom: "var(--space-8)" }}>
      <h2 style={{ marginBottom: "var(--space-4)" }}>{title}</h2>
      {children}
    </section>
  );
}

export default function StyleGuide() {
  return (
    <main style={{ padding: "var(--space-6)", maxWidth: 960, margin: "0 auto" }}>
      <h1 style={{ marginBottom: "var(--space-2)" }}>Style guide — Prélakay</h1>
      <p style={{ color: "var(--color-neutral-700)", marginBottom: "var(--space-8)" }}>
        Source de vérité : docs/docs/design-prelakay.md v1.1 (29 oct 2026).
        Toute valeur ci-dessous vient de ce document — rien n&apos;est
        improvisé ici.
      </p>

      <Section title="Couleurs">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
            gap: "var(--space-4)",
          }}
        >
          {colors.map((c) => (
            <div key={c.varName}>
              <div
                style={{
                  height: 64,
                  borderRadius: "var(--radius-sm)",
                  background: `var(${c.varName})`,
                  border: "1px solid var(--color-neutral-300)",
                }}
              />
              <p style={{ marginTop: "var(--space-2)", fontSize: 13 }}>
                {c.name}
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Typographie">
        <h1>H1 — Fraunces SemiBold 28/36</h1>
        <h2>H2 — Fraunces Medium 22/30</h2>
        <h3>H3 — Fraunces Medium 18/26</h3>
        <p style={{ fontSize: 16, lineHeight: "24px" }}>
          Body Large — Onest Regular 16/24 (description produit)
        </p>
        <p>Body — Onest Regular 14/20 (texte courant)</p>
        <p style={{ fontSize: 13, lineHeight: "18px", fontWeight: 500 }}>
          Label — Onest Medium 13/18
        </p>
        <p style={{ fontSize: 12, lineHeight: "16px", color: "var(--color-neutral-500)" }}>
          Caption — Onest Regular 12/16
        </p>
        <p
          style={{
            fontFamily: "var(--font-wordmark)",
            fontSize: 24,
            marginTop: "var(--space-3)",
          }}
        >
          Prélakay — Surgena (wordmark uniquement)
        </p>
      </Section>

      <Section title="Espacement (grille 8pt)">
        <div style={{ display: "flex", alignItems: "flex-end", gap: "var(--space-2)" }}>
          {spacing.map((s) => (
            <div key={s} style={{ textAlign: "center" }}>
              <div
                style={{
                  width: s,
                  height: s,
                  background: "var(--color-lagon-500)",
                  borderRadius: 2,
                }}
              />
              <p style={{ fontSize: 11, marginTop: "var(--space-1)" }}>{s}px</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Rayons">
        <div style={{ display: "flex", gap: "var(--space-4)" }}>
          <div
            style={{
              width: 80,
              height: 80,
              background: "var(--color-lagon-100)",
              borderRadius: "var(--radius-sm)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
            }}
          >
            sm · 10px
          </div>
          <div
            style={{
              width: 80,
              height: 80,
              background: "var(--color-lagon-100)",
              borderRadius: "var(--radius-lg)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
            }}
          >
            lg · 20px
          </div>
        </div>
      </Section>

      <Section title="Composants">
        <div style={{ display: "flex", gap: "var(--space-4)", flexWrap: "wrap", alignItems: "center" }}>
          <button className="btn-primary">Bouton primaire</button>
          <button className="btn-primary" disabled>
            Désactivé
          </button>
        </div>

        <div className="card-product" style={{ marginTop: "var(--space-5)", maxWidth: 280 }}>
          <h3>Carte produit</h3>
          <p style={{ color: "var(--color-neutral-700)" }}>radius-lg · padding 16 · shadow-card</p>
        </div>

        <input
          className="field"
          placeholder="Champ de formulaire"
          style={{ marginTop: "var(--space-5)", maxWidth: 320, display: "block" }}
        />

        <div className="message-error" style={{ marginTop: "var(--space-5)", maxWidth: 400 }}>
          <AlertTriangle size={18} strokeWidth={2} />
          <span>Quelque chose a échoué. Réessayez.</span>
        </div>
      </Section>

      <Section title="Iconographie — fallback BoxIcons (en attendant Iconly Pro)">
        <p style={{ color: "var(--color-neutral-700)", marginBottom: "var(--space-4)" }}>
          Icône pleine + calque à 20% d&apos;opacité pour simuler le duotone
          (état actif) · outline simple neutral-500 (état inactif). Table de
          correspondance à tenir pour un remplacement mécanique par Iconly
          Pro — design-prelakay.md §4.
        </p>
        <div style={{ display: "flex", gap: "var(--space-6)" }}>
          {[
            { Icon: Search, label: "Recherche" },
            { Icon: MapPin, label: "Découverte" },
            { Icon: Wallet, label: "Wallet" },
            { Icon: User, label: "Profil" },
            { Icon: ShoppingBasket, label: "Panier" },
          ].map(({ Icon, label }) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div style={{ position: "relative", width: 32, height: 32 }}>
                <Icon
                  size={32}
                  color="var(--color-lagon-500)"
                  style={{ position: "absolute", opacity: 0.2 }}
                />
                <Icon
                  size={32}
                  color="var(--color-lagon-500)"
                  strokeWidth={1.5}
                  style={{ position: "absolute" }}
                />
              </div>
              <p style={{ fontSize: 11, marginTop: "var(--space-1)" }}>{label}</p>
            </div>
          ))}
        </div>
      </Section>
    </main>
  );
}
