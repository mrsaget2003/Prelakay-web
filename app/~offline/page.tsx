import Image from "next/image";

// Servie par le service worker (app/sw.ts) quand une navigation échoue
// sans réseau — contrainte "dégradation réseau fréquente en Haïti"
// documentée dans 04-trd.md. Ne contient aucune donnée dynamique : elle
// doit pouvoir s'afficher sans jamais toucher le réseau.
export default function Offline() {
  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "var(--space-4)",
        padding: "var(--space-5)",
        textAlign: "center",
      }}
    >
      <Image
        src="/logo/PNG/logo-primary-TRANSPARENT.png"
        alt="Prélakay"
        width={72}
        height={72}
      />
      <h2>Pas de connexion</h2>
      <p style={{ color: "var(--color-neutral-700)", maxWidth: 320 }}>
        Vérifiez votre connexion et réessayez. Les pages déjà visitées
        restent disponibles.
      </p>
    </main>
  );
}
