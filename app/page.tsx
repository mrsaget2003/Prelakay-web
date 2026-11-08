import Image from "next/image";

export default function Home() {
  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "var(--space-5)",
        padding: "var(--space-5)",
        textAlign: "center",
      }}
    >
      <Image
        src="/logo/PNG/logo-primary-TRANSPARENT.png"
        alt="Prélakay"
        width={96}
        height={96}
        priority
      />
      <h1>Hello Prélakay 👋</h1>
      <p style={{ color: "var(--color-neutral-700)", maxWidth: 360 }}>
        Cherchez-vous encore votre produit ? — déploiement de base, étape
        vérifiable Phase 0 (06-plan.md).
      </p>
      <a href="/style-guide" className="btn-primary" style={{ textDecoration: "none" }}>
        Voir le style guide
      </a>
    </main>
  );
}
