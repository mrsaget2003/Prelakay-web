import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Logo } from "@/components/brand/Logo";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Card } from "@/components/ui/Card";
import { Tag } from "@/components/ui/Tag";
import { Price } from "@/components/ui/Price";
import { Stars } from "@/components/ui/Stars";
import { EmptyState } from "@/components/ui/EmptyState";
import { ICONS, type IconName } from "@/lib/icons/registry";
import { Demos } from "./Demos";
import styles from "./style-guide.module.css";

// Sortie de Phase A (plan) : tout le socle commun aux trois projets en un coup d'œil.
// Source : design-prelakay.md v1.1 (couleurs, polices, composants) et 03-design.md.

export const metadata: Metadata = { title: "Style guide · Prélakay" };

const colors = [
  "white", "black", "lagon-100", "lagon-300", "lagon-500", "lagon-700", "lagon-900",
  "neutral-100", "neutral-300", "neutral-500", "neutral-700", "neutral-900", "success", "error", "warning",
];
const spacing = [4, 8, 12, 16, 24, 32, 48, 64];
const iconNames = Object.keys(ICONS) as IconName[];

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className={styles.section}>
      <h2>{title}</h2>
      {children}
    </section>
  );
}

export default function StyleGuide() {
  return (
    <main className={styles.page}>
      <header className={styles.head}>
        <Logo variant="full" tone="lagon" height={44} priority />
        <h1>Style guide</h1>
        <p className={styles.muted}>
          Socle commun des trois projets (Acheteur, Espace vendeur, Espace admin). Valeurs : design-prelakay.md v1.1 ;
          structure : 03-design.md §9.
        </p>
      </header>

      <Section title="Logos">
        <p className={styles.muted}>Logo complet = icône + wordmark (full-logo-*). Icône seule = secondary-logo-*.</p>
        <div className={styles.logos}>
          <figure className={styles.logoBox} data-bg="white">
            <Logo variant="full" tone="lagon" height={48} />
            <figcaption>full · lagon · fond blanc (usage par défaut)</figcaption>
          </figure>
          <figure className={styles.logoBox} data-bg="lagon">
            <Logo variant="full" tone="white" height={48} />
            <figcaption>full · blanc · fond Lagon</figcaption>
          </figure>
          <figure className={styles.logoBox} data-bg="black">
            <Logo variant="full" tone="white" height={48} />
            <figcaption>full · blanc · fond noir</figcaption>
          </figure>
          <figure className={styles.logoBox} data-bg="white">
            <Logo variant="mark" tone="lagon" height={40} />
            <figcaption>mark · lagon (secondary)</figcaption>
          </figure>
          <figure className={styles.logoBox} data-bg="dark">
            <Logo variant="mark" tone="white" height={40} />
            <figcaption>mark · blanc (secondary)</figcaption>
          </figure>
        </div>
      </Section>

      <Section title="Couleurs">
        <div className={styles.swatches}>
          {colors.map((c) => (
            <div key={c}>
              <div className={styles.swatch} style={{ background: `var(--color-${c})` }} />
              <p className={styles.cap}>{c}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Typographie">
        <p className={styles.display}>Display — Fraunces SemiBold 32/40</p>
        <h1>H1 — Fraunces SemiBold 28/36</h1>
        <h2>H2 — Fraunces Medium 22/30</h2>
        <h3>H3 — Fraunces Medium 18/26</h3>
        <p className={styles.bodyL}>Body Large — Onest Regular 16/24</p>
        <p>Body — Onest Regular 14/20</p>
        <p className={styles.label}>Label — Onest Medium 13/18</p>
        <p className={styles.cap}>Caption — Onest Regular 12/16</p>
      </Section>

      <Section title="Espacement et rayons">
        <div className={styles.row}>
          {spacing.map((s) => (
            <div key={s} className={styles.spaceItem}>
              <div style={{ width: s, height: s }} className={styles.spaceBox} />
              <p className={styles.cap}>{s}</p>
            </div>
          ))}
        </div>
        <div className={styles.row} style={{ marginTop: 16 }}>
          <div className={styles.radius} style={{ borderRadius: "var(--radius-sm)" }}>sm · 10 px</div>
          <div className={styles.radius} style={{ borderRadius: "var(--radius-lg)" }}>lg · 20 px</div>
        </div>
      </Section>

      <Section title={`Icônes — Font Awesome 6 Free (${iconNames.length})`}>
        <p className={styles.muted}>
          Actif = plein + pastille 20 % (duotone simulé) ; repos = contour. Correspondance Iconly Pro : docs/icon-mapping.md.
        </p>
        <div className={styles.row} style={{ marginBottom: 16 }}>
          <span className={styles.iconDemo}><Icon name="house" active size={20} /> actif</span>
          <span className={styles.iconDemo}><Icon name="heart" size={20} /> repos</span>
          <span className={styles.iconDemo}><Icon name="heart" active size={20} /> actif</span>
        </div>
        <ul className={styles.iconGrid} data-testid="icon-grid">
          {iconNames.map((n) => (
            <li key={n} data-icon-name={n} title={n}>
              <Icon name={n} size={20} />
              <span>{n}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Composants">
        <div className={styles.row}>
          <Button variant="primary">Bouton primaire</Button>
          <Button variant="primary" disabled>Désactivé</Button>
          <Button variant="outline">Secondaire</Button>
          <Button variant="primary" loading>Paiement…</Button>
        </div>

        <div className={styles.grid2}>
          <Card>
            <h3>Carte</h3>
            <p className={styles.muted}>radius-lg · padding 16 · ombre unique</p>
            <div style={{ marginTop: 12 }}>
              <Price amount={1250} was={1500} />
            </div>
            <div className={styles.row} style={{ marginTop: 8 }}>
              <Stars value={4.6} />
              <span className={styles.cap}>4,6 · 860 vendus</span>
            </div>
          </Card>
          <div>
            <Field label="E-mail" type="email" placeholder="vous@exemple.com" hint="Nous ne le partageons jamais." />
            <Field label="NIF" defaultValue="12345" error="Le NIF doit contenir 10 chiffres. Vérifiez-le." />
          </div>
        </div>

        <div className={styles.row}>
          <Tag tone="neu">Reçue</Tag>
          <Tag tone="warn">En préparation</Tag>
          <Tag tone="new">Prête pour retrait</Tag>
          <Tag tone="ok">Retirée</Tag>
          <Tag tone="err">Non retirée</Tag>
        </div>
      </Section>

      <Section title="Interactions et « À venir »">
        <Demos />
      </Section>

      <Section title="État vide">
        <Card flat>
          <EmptyState icon="cart-shopping" title="Votre panier attend encore son premier article." text="Parcourez les stores près de vous." />
        </Card>
      </Section>
    </main>
  );
}
