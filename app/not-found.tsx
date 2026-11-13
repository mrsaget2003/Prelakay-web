import Link from "next/link";
import Image from "next/image";
import { Logo } from "@/components/brand/Logo";
import { photoUrl } from "@/lib/data/mock/partnerImages";
import { SCENE_PHOTOS } from "@/lib/data/mock/sceneImages";

// C.3 — page 404 aux couleurs de Prélakay (remplace la page noire par défaut de Next.js),
// pour toute adresse inconnue et les espaces non servis par un déploiement (APP_SPACE).
// 13 nov. 2026 : même écran de passage que la boutique (photo « en chemin », texte posé dessus).
export default function NotFound() {
  const ph = SCENE_PHOTOS.lost;
  return (
    <main className="nf">
      <Logo variant="full" tone="lagon" height={40} href="/" />
      <section className="door" aria-labelledby="door-t">
        <Image className="door-bg" src={photoUrl(ph, 1600, 900)} alt={ph.alt} fill priority sizes="(max-width: 1023px) 100vw, 1240px" />
        <div className="door-p">
          <h1 id="door-t">Cette page s&apos;est perdue en chemin</h1>
          <p className="muted">Le lien est peut-être ancien, ou cette partie de Prélakay n&apos;est pas encore ouverte.</p>
          <div className="door-a">
            <Link className="btn btn-p" href="/">
              Retour à l&apos;accueil
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
