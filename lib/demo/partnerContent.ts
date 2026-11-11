// Contenu des pages partenaires (spec §7, modèle des pages « Partner with us » d'AliExpress).
// Réécrit le 11 nov. 2026 : pages plus détaillées, tournées vers la candidature, et un
// discours « plateforme » et non « pilote des Cayes ».
//
// Règle tenue ici : **aucun chiffre inventé**. Ce qui n'est pas tranché (montant par
// course, commission, délais contractuels) est annoncé comme tel — c'est aussi ce qui
// rend la page crédible auprès d'un partenaire sérieux.

import type { PartnerKind } from "@/lib/domain/partners";
import { PARTNER_PHOTOS, type Photo } from "@/lib/data/mock/partnerImages";

export type PartnerPageContent = {
  title: string;
  crumb: string;
  /** Accroche courte, sous le titre. */
  promise: string;
  /** Deux lignes de réassurance posées sous le bouton du bandeau. */
  heroPoints: string[];
  heroIcon: string;
  heroPhoto: Photo;
  stats: [string, string][];
  benefits: [string, string, string][];
  /** « Ce que vous y gagnez » : trois affirmations concrètes + ce qui reste à fixer. */
  gains: { t: string; p: string; open?: boolean }[];
  steps: [string, string, string][];
  profiles: { t: string; i: string; items: string[] }[];
  needs: string[];
  /** Ce que Prélakay ne demande pas : lève les objections les plus courantes. */
  noNeed: string[];
  /** Nos engagements, en face des exigences. */
  promises: [string, string][];
  sidePhoto: Photo;
  faq: [string, string][];
  contact: string;
  /** Rappel d'appel à l'action, juste avant le formulaire. */
  ctaTitle: string;
  ctaText: string;
};

export const PARTNER_PAGES: Record<PartnerKind, PartnerPageContent> = {
  payment: {
    title: "Devenir un partenaire de paiement",
    crumb: "Partenaire de paiement",
    promise:
      "Branchez votre service au wallet Prélakay. Chaque recharge, chaque paiement de commande et chaque envoi depuis la diaspora passe par un partenaire comme vous.",
    heroPoints: [
      "Candidature en 3 minutes, sans engagement",
      "Une réponse de notre équipe conformité, par téléphone",
    ],
    heroIcon: "fa-solid fa-wallet",
    heroPhoto: PARTNER_PHOTOS.paymentHero,
    stats: [
      ["Wallet", "au cœur de chaque achat sur la plateforme"],
      ["6", "moyens de recharge prévus au lancement"],
      ["Haïti + diaspora", "des acheteurs ici et à l'étranger"],
    ],
    benefits: [
      ["fa-solid fa-users", "Des transactions qui reviennent", "Un acheteur ne recharge pas une fois : il recharge à chaque commande. Votre service entre dans une habitude, pas dans un achat isolé."],
      ["fa-solid fa-globe", "Le canal diaspora", "Un proche à l'étranger recharge le wallet d'un parent en Haïti, ou paie son panier directement. Ce flux passe par vous."],
      ["fa-solid fa-shield-halved", "Moins de litiges", "L'argent est gardé jusqu'au retrait ou à la livraison. Les contestations tombent, et avec elles les frais de gestion."],
      ["fa-solid fa-chart-line", "Un volume qui suit les stores", "Chaque store qui ouvre amène ses clients. Votre volume grandit au rythme de la plateforme, sans effort commercial de votre côté."],
    ],
    gains: [
      { t: "Votre marque dans le parcours d'achat", p: "Votre logo apparaît dans « Recharger le wallet », au moment où l'acheteur décide de payer." },
      { t: "Une intégration documentée", p: "API ou réseau d'agents : nous nous adaptons à ce que vous avez déjà, sans vous imposer un développement." },
      { t: "Un interlocuteur unique", p: "Une personne chez Prélakay suit votre dossier du premier appel à la mise en service." },
      { t: "Les conditions commerciales", p: "Elles se fixent au cas par cas, pendant la vérification. Nous ne publions pas de grille : ce serait vous engager sur un chiffre que nous n'avons pas encore arrêté.", open: true },
    ],
    steps: [
      ["Candidature", "Vous présentez votre organisation et votre service.", "3 minutes"],
      ["Vérification", "Notre équipe étudie la conformité, l'agrément et les conditions.", "délai à confirmer"],
      ["Intégration", "Connexion technique ou réseau d'agents, puis des tests de bout en bout.", "selon votre service"],
      ["Lancement", "Votre service apparaît dans « Recharger le wallet » pour tous les acheteurs.", "le jour de la mise en service"],
    ],
    profiles: [
      { t: "Mobile money", i: "fa-solid fa-mobile-screen-button", items: ["Opérateurs agréés", "Recharge et paiement depuis un téléphone"] },
      { t: "Banques", i: "fa-solid fa-building-columns", items: ["Cartes et virements locaux", "Comptes d'encaissement"] },
      { t: "Transferts diaspora", i: "fa-solid fa-paper-plane", items: ["Envois depuis l'étranger vers le wallet", "Change et frais transparents"] },
      { t: "Points de recharge", i: "fa-solid fa-store", items: ["Commerces et caisses qui encaissent des espèces", "Aucun développement nécessaire"] },
    ],
    needs: [
      "Un agrément ou une licence pour l'activité de paiement",
      "Une API, ou un réseau d'agents capable d'encaisser",
      "Un interlocuteur technique et un interlocuteur conformité",
      "La capacité de rapprocher les transactions quotidiennement",
    ],
    noNeed: [
      "Aucun minimum de volume pour candidater",
      "Aucun développement de votre côté si vous passez par un réseau d'agents",
      "Aucune exclusivité : vous gardez vos autres partenaires",
    ],
    promises: [
      ["Un seul interlocuteur", "Votre dossier n'est pas renvoyé d'un service à l'autre."],
      ["Des tests avant la mise en service", "Rien n'est ouvert aux acheteurs avant que vous l'ayez validé."],
      ["Vos données restent les vôtres", "Nous ne revendons aucune donnée de transaction."],
    ],
    sidePhoto: PARTNER_PHOTOS.paymentShop,
    faq: [
      ["Combien coûte l'intégration ?", "Les conditions commerciales se fixent au cas par cas pendant la vérification. Nous ne publions pas de grille tarifaire tant qu'elle n'est pas arrêtée."],
      ["Faut-il obligatoirement une API ?", "Non. Un réseau d'agents qui encaisse des espèces peut recharger les wallets sans aucun développement."],
      ["Qui garde l'argent des acheteurs ?", "Le fonctionnement exact du wallet fait l'objet d'une étude légale en cours. Nous le précisons noir sur blanc pendant la vérification, avant toute signature."],
      ["Sommes-nous engagés en déposant une candidature ?", "Non. La candidature sert à ouvrir la discussion. Rien ne vous engage avant un accord écrit."],
      ["Travaillez-vous déjà avec un concurrent ?", "Nous n'avons pas d'exclusivité. Plusieurs moyens de recharge coexistent dans le wallet, et l'acheteur choisit."],
      ["Combien de temps avant la mise en service ?", "Cela dépend de votre service et de votre agrément. Nous vous donnons une date pendant la vérification, pas avant."],
    ],
    contact: "partenaires@prelakay.ht",
    ctaTitle: "Parlons de votre service",
    ctaText: "Remplissez le formulaire : nous revenons vers vous par téléphone. Rien ne vous engage.",
  },

  delivery: {
    title: "Devenir partenaire de livraison",
    crumb: "Partenaire de livraison",
    promise:
      "Livrez les commandes des stores de la plateforme, à moto, à vélo ou en voiture. Vous choisissez vos horaires, et chaque course terminée est payée sur votre wallet.",
    heroPoints: [
      "Candidature en 3 minutes, depuis votre téléphone",
      "Vous gardez votre véhicule et vos horaires",
    ],
    heroIcon: "fa-solid fa-truck",
    heroPhoto: PARTNER_PHOTOS.deliveryHero,
    stats: [
      ["Vos horaires", "aucun minimum imposé"],
      ["Wallet", "chaque course payée sur votre compte"],
      ["18 ans", "l'âge minimum pour candidater"],
    ],
    benefits: [
      ["fa-solid fa-coins", "Un revenu par course", "Chaque livraison terminée est payée sur votre wallet, que vous pouvez retirer comme n'importe quel solde Prélakay."],
      ["fa-regular fa-clock", "Vos horaires, vraiment", "Vous vous rendez disponible quand cela vous arrange. Personne ne vous retire de courses parce que vous avez pris une journée."],
      ["fa-solid fa-location-dot", "Des courses courtes", "Du store au client, dans votre quartier et les quartiers voisins. Pas de longues distances imposées."],
      ["fa-solid fa-shield-halved", "Un cadre clair", "Code de livraison, contact du client, et l'équipe Prélakay joignable si quelque chose se passe mal."],
    ],
    gains: [
      { t: "Vous êtes payé à la course", p: "Pas de salaire, pas de contrat de travail : une course terminée, un montant crédité sur votre wallet." },
      { t: "Vous voyez vos gains en direct", p: "Chaque course apparaît dans votre wallet, avec sa date et son montant. Rien n'est calculé en coulisses." },
      { t: "Vous n'avancez rien", p: "L'acheteur a déjà payé. Vous ne manipulez pas l'argent de la commande et ne faites pas crédit." },
      { t: "Le montant par course", p: "Il est en cours de définition. Nous vous le donnons par téléphone avant votre première livraison, et il ne change pas en route.", open: true },
    ],
    steps: [
      ["Candidature", "Vous remplissez le formulaire avec votre pièce d'identité et votre véhicule.", "3 minutes"],
      ["Vérification", "Nous vérifions vos pièces, puis nous vous appelons.", "délai à confirmer"],
      ["Formation", "Une courte séance : récupérer une commande, utiliser le code, clore la course.", "moins d'une heure"],
      ["Premières courses", "Vous vous rendez disponible et recevez vos premières livraisons.", "dès la formation finie"],
    ],
    profiles: [
      { t: "Livreur indépendant", i: "fa-solid fa-user", items: ["Moto, vélo ou voiture", "18 ans et plus", "Un téléphone Android"] },
      { t: "Société de livraison", i: "fa-solid fa-building-columns", items: ["Plusieurs livreurs", "Couverture d'un ou plusieurs quartiers", "Un responsable qui suit l'équipe"] },
    ],
    needs: [
      "Avoir 18 ans et plus",
      "Une pièce d'identité (NIF ou NINU), recto et verso",
      "Un permis et un véhicule en règle (moto, voiture)",
      "Un téléphone Android avec un forfait internet",
    ],
    noNeed: [
      "Aucun diplôme demandé",
      "Aucune avance d'argent : l'acheteur a déjà payé",
      "Aucun minimum d'heures par semaine",
    ],
    promises: [
      ["Une course, un montant", "Le montant est annoncé avant que vous acceptiez la course."],
      ["Un code à la remise", "Le client vous donne un code : c'est lui qui clôt la course et déclenche votre paiement."],
      ["Quelqu'un au bout du fil", "Adresse introuvable, client absent, colis abîmé : l'équipe répond."],
    ],
    sidePhoto: PARTNER_PHOTOS.deliveryWork,
    faq: [
      ["Combien gagne-t-on par livraison ?", "Le montant par course est en cours de définition. Nous vous le donnons par téléphone avant votre première livraison : nous préférons ne rien afficher plutôt qu'annoncer un chiffre qui bougerait."],
      ["Qui fournit le véhicule ?", "Vous utilisez le vôtre. La question de l'assurance est encore ouverte et sera tranchée avant l'ouverture aux livreurs."],
      ["Comment suis-je payé ?", "Sur votre wallet Prélakay, une fois le code de livraison saisi par le client. Vous retirez ensuite votre solde comme n'importe quel utilisateur."],
      ["Et si le client n'est pas là ?", "Vous prévenez l'équipe depuis l'application. La règle de remboursement en cas d'échec de livraison est encore à fixer."],
      ["Suis-je salarié de Prélakay ?", "Non. Vous êtes indépendant : vous choisissez vos disponibilités et vous n'avez pas de quota à tenir."],
      ["Faut-il livrer tous les jours ?", "Non. Aucun minimum n'est imposé. Vous vous rendez disponible quand vous le souhaitez."],
      ["Dois-je encaisser de l'argent ?", "Non. La commande est déjà payée : vous remettez le colis et saisissez le code, rien de plus."],
    ],
    contact: "livraison@prelakay.ht",
    ctaTitle: "Prêt à faire votre première course ?",
    ctaText: "Trois minutes suffisent. Gardez votre pièce d'identité à portée de main : recto et verso.",
  },
};

export const VEHICLES: [string, string][] = [["moto", "Moto"], ["velo", "Vélo"], ["voiture", "Voiture"], ["camionnette", "Camionnette"]];
