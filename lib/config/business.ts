// Règles chiffrées du pilote (PRD, 02-app-flow, 03-design §9, CHANGELOG).
// `null` = point ⚠️ ouvert ou [À CONFIRMER] : affiché « — », jamais calculé
// (CLAUDE.md règle 2). Les valeurs modifiables par le Superadmin (escrow, Coins,
// délais) partiront en base en Phase C ; celles-ci sont les valeurs par défaut.

export const BUSINESS = {
  /** Libération de l'escrow après retrait : 3 jours… */
  escrowDays: 3,
  /** … ou 24 h pour un store de confiance. */
  escrowTrustedHours: 24,
  /** Délai de garde en magasin avant non-retrait. */
  pickupHoldDays: 3,
  /** Rappels J+1 et J+2. */
  reminderDays: [1, 2],
  coinsPerOrder: 50,
  coinsPerReview: 25,
  /** [À CONFIRMER] montant des Coins de bienvenue (20-30 proposé). */
  coinsWelcome: null,
  /** Ouverture d'un litige : 3 jours après le retrait. */
  disputeWindowDays: 3,
  /** Délai de réponse du store à un litige avant escalade admin. */
  storeReplyHours: 48,
  /** Quota « Nouveaux sur Prélakay » : 1 nouveau toutes les 4 positions (🟡 valeur du prototype). */
  newcomerEvery: 4,
  maxProductPhotos: 8,
  maxSkuAxes: 3,
  /** Code de retrait : 6 chiffres (03-design §9.9 ; plan §1.2 n° 5). */
  pickupCodeLength: 6,
  minSellerAge: 18,
  /** Politique de retour minimale d'un store. */
  minReturnDays: 3,
  adminMaxFailures: 5,
  adminSessionHours: 8,
  /** [À CONFIRMER] durée du blocage après 5 échecs (20 s dans le prototype de démo). */
  adminLockMinutes: null,
  /** ⚠️ ouvert : 5-10 %. */
  commissionRate: null,
  /** ⚠️ ouvert : frais de restockage en cas de non-retrait, et à qui ils reviennent. */
  restockFee: null,
  /** [À CONFIRMER] critères « Store de confiance ». */
  trustedStoreCriteria: null,
  /** Livraison (CLAUDE.md 10 nov. 2026) — valeurs de démonstration, ⚠️ frais et zones ouverts. */
  demoDeliveryFee: {
    "Centre-ville": 150, "Quatre Chemins": 175, Bergeaud: 200, Laborde: 225, "Gelée": 200,
    "Torbeck (route)": 300, Simon: 225, Bourdet: 250, "Camp-Perrin (route)": 350,
  },
  /** Valeur de démonstration : quartier hors liste. */
  demoDeliveryFeeDefault: 250,
  /** Valeur de démonstration : délai affiché d'une livraison. */
  demoDeliveryMinutes: 45,
  /** Badges (valeurs de démonstration ; seuils de points de confiance ⚠️ ouverts). */
  demoVipOrders: 3,
  demoTopSellerSold: 1000,
} as const;
