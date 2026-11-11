// Contenu des pages partenaires (spec §7, modèle des pages « Partner with us » d'AliExpress).
// Chiffres « pilote » = données de démonstration. Avantages chiffrés : [À CONFIRMER].

import type { PartnerKind } from "@/lib/domain/partners";

export type PartnerPageContent = {
  title: string;
  crumb: string;
  promise: string;
  heroIcon: string;
  stats: [string, string][];
  benefits: [string, string, string][];
  steps: [string, string][];
  profiles: { t: string; i: string; items: string[] }[];
  needs: string[];
  faq: [string, string][];
  contact: string;
};

export const PARTNER_PAGES: Record<PartnerKind, PartnerPageContent> = {
  payment: {
    title: "Devenir un partenaire de paiement",
    crumb: "Partenaire de paiement",
    promise: "Connectez votre service au wallet Prélakay : recharges, paiements et transferts de la diaspora, pour les acheteurs et les stores du Sud.",
    heroIcon: "fa-solid fa-wallet",
    stats: [["30", "stores pilotes visés aux Cayes"], ["6", "moyens de recharge prévus"], ["Haïti + diaspora", "acheteurs ici et à l'étranger"]],
    benefits: [
      ["fa-solid fa-users", "Une clientèle nouvelle", "Les acheteurs rechargent leur wallet pour payer leurs commandes en ligne et en magasin."],
      ["fa-solid fa-globe", "L'angle diaspora", "Les proches à l'étranger rechargent et paient le panier d'un parent aux Cayes."],
      ["fa-solid fa-shield-halved", "Des paiements protégés", "L'argent est gardé jusqu'au retrait ou à la livraison : moins de litiges, plus de confiance."],
      ["fa-solid fa-chart-line", "Un volume qui grandit", "Chaque store pilote amène ses clients ; le volume suit l'ouverture de nouveaux quartiers."],
    ],
    steps: [
      ["Candidature", "Vous présentez votre organisation et votre service."],
      ["Vérification", "Notre équipe étudie la conformité et les conditions (sous 10 jours ouvrés, à confirmer)."],
      ["Intégration", "Connexion technique (API) ou réseau d'agents, puis tests en démonstration."],
      ["Lancement", "Votre service apparaît dans « Recharger le wallet » pour tous les acheteurs."],
    ],
    profiles: [
      { t: "Mobile money", i: "fa-solid fa-mobile-screen-button", items: ["MonCash, NatCash et opérateurs agréés"] },
      { t: "Banques", i: "fa-solid fa-building-columns", items: ["Cartes et virements locaux"] },
      { t: "Transferts diaspora", i: "fa-solid fa-paper-plane", items: ["Envois depuis l'étranger vers le wallet"] },
      { t: "Points de recharge", i: "fa-solid fa-store", items: ["Commerces et caisses qui encaissent des espèces"] },
    ],
    needs: ["Agrément ou licence de l'activité de paiement", "Une API ou un réseau d'agents", "Un interlocuteur technique et un interlocuteur conformité"],
    faq: [
      ["Combien coûte l'intégration ?", "Les conditions commerciales sont fixées au cas par cas avec chaque partenaire (à confirmer)."],
      ["Faut-il une API ?", "Non : un réseau d'agents qui encaisse des espèces peut aussi recharger les wallets."],
      ["Qui garde l'argent des acheteurs ?", "Le fonctionnement exact du wallet est en cours d'étude légale ; nous le précisons pendant la vérification."],
    ],
    contact: "partenaires@prelakay.ht",
  },
  delivery: {
    title: "Devenir partenaire de livraison",
    crumb: "Partenaire de livraison",
    promise: "Livrez les commandes des stores des Cayes à moto, à vélo ou en voiture, à vos horaires, et soyez payé sur votre wallet.",
    heroIcon: "fa-solid fa-truck",
    stats: [["9", "quartiers des Cayes couverts"], ["≈ 45 min", "par livraison (démonstration)"], ["Wallet", "paiement de chaque course"]],
    benefits: [
      ["fa-solid fa-coins", "Un revenu par course", "Chaque livraison terminée est payée sur votre wallet (montant par course à confirmer)."],
      ["fa-regular fa-clock", "Vos horaires", "Vous choisissez quand vous êtes disponible ; pas de minimum imposé pendant le pilote."],
      ["fa-solid fa-location-dot", "Près de chez vous", "Des courses courtes, du store au client, dans votre quartier et les quartiers voisins."],
      ["fa-solid fa-shield-halved", "Un cadre clair", "Code de livraison, contact du client, aide de l'équipe Prélakay en cas de problème."],
    ],
    steps: [
      ["Candidature", "Vous remplissez le formulaire avec votre pièce d'identité et votre véhicule."],
      ["Vérification", "Nous vérifions vos pièces et vous appelons (sous 7 jours, à confirmer)."],
      ["Formation", "Une courte séance : récupérer une commande, utiliser le code, encaisser."],
      ["Premières livraisons", "Vous recevez vos premières courses et suivez vos gains sur votre wallet."],
    ],
    profiles: [
      { t: "Livreur indépendant", i: "fa-solid fa-user", items: ["Moto, vélo ou voiture", "18 ans et plus"] },
      { t: "Société de livraison", i: "fa-solid fa-building-columns", items: ["Plusieurs livreurs", "Couverture d'un ou plusieurs quartiers"] },
    ],
    needs: ["Avoir 18 ans et plus", "Pièce d'identité (NIF ou NINU), recto et verso", "Permis et véhicule en règle (moto, voiture)", "Un téléphone Android"],
    faq: [
      ["Combien gagne-t-on par livraison ?", "Le montant par course est en cours de définition pendant le pilote (à confirmer)."],
      ["Qui fournit le véhicule ?", "Vous utilisez votre propre véhicule. L'assurance est à confirmer."],
      ["Comment suis-je payé ?", "Sur votre wallet Prélakay, après la saisie du code de livraison du client."],
    ],
    contact: "livraison@prelakay.ht",
  },
};

export const VEHICLES: [string, string][] = [["moto", "Moto"], ["velo", "Vélo"], ["voiture", "Voiture"], ["camionnette", "Camionnette"]];
