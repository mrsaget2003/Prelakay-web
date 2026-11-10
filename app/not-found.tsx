import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { Icon } from "@/components/ui/Icon";

// C.3 — page 404 aux couleurs de Prélakay (remplace la page noire par défaut de Next.js),
// pour toute adresse inconnue et les espaces non servis par un déploiement (APP_SPACE).
export default function NotFound() {
  return (
    <main className="nf">
      <Logo variant="full" tone="lagon" height={40} href="/" />
      <div className="empty">
        <Icon name="map" variant="regular" />
        <b>Cette page s&apos;est perdue en chemin</b>
        <p className="muted">Le lien est peut-être ancien, ou cette partie de Prélakay n&apos;est pas encore ouverte.</p>
        <Link className="btn btn-p" href="/">
          Retour à l&apos;accueil
        </Link>
      </div>
    </main>
  );
}
