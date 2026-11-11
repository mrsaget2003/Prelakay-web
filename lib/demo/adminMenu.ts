// Navigation de la console admin (AMENU et onglets mobiles du prototype).

import type { FeatureKey } from "@/lib/config/release";
import type { Section } from "@/lib/domain/admin";

/** [section, icône, libellé, chemin, fonctionnalité d'une version future] ou [« - », titre de groupe]. */
export type AMenuItem = [Section, string, string, string, FeatureKey?];
export type AMenuEntry = AMenuItem | ["-", string];

export const AMENU: AMenuEntry[] = [
  ["dash", "fa-solid fa-gauge", "Tableau de bord", ""],
  ["stats", "fa-solid fa-chart-column", "Statistiques", "stats"],
  ["-", "Validation"],
  ["kyc", "fa-solid fa-id-card", "Dossiers KYC", "kyc"],
  ["products", "fa-solid fa-box", "Produits à modérer", "products"],
  ["reports", "fa-regular fa-flag", "Signalements", "reports"],
  ["disputes", "fa-solid fa-scale-balanced", "Litiges", "disputes"],
  ["partners", "fa-solid fa-users", "Partenaires", "partners"],
  ["-", "Opérations"],
  ["stores", "fa-solid fa-store", "Stores", "stores"],
  ["users", "fa-solid fa-users", "Utilisateurs", "users"],
  ["orders", "fa-solid fa-receipt", "Commandes", "orders"],
  ["deliveries", "fa-solid fa-truck", "Livraisons", "deliveries"],
  ["finance", "fa-solid fa-chart-line", "Finances plateforme", "finance", "platform_finance"],
  ["-", "Contenu"],
  ["banners", "fa-regular fa-images", "Bannières", "banners"],
  ["coupons", "fa-solid fa-ticket", "Coupons", "coupons"],
  ["growth", "fa-solid fa-user-plus", "Croissance", "growth"],
  ["events", "fa-regular fa-calendar", "Events et flash-offers", "events", "events"],
  ["notify", "fa-regular fa-bell", "Notifications", "notify"],
  ["categories", "fa-solid fa-sitemap", "Catégories", "categories"],
  ["-", "Système"],
  ["team", "fa-solid fa-user-shield", "Équipe et rôles", "team"],
  ["settings", "fa-solid fa-sliders", "Paramètres", "settings"],
  ["audit", "fa-solid fa-clock-rotate-left", "Journal d'activité", "audit"],
];

/** Onglets mobiles : Accueil, les 3 premières files accessibles au rôle, Plus. */
export const ATAB_CANDIDATES: [Section, string, string][] = [
  ["kyc", "fa-solid fa-id-card", "KYC"],
  ["reports", "fa-regular fa-flag", "Signalements"],
  ["disputes", "fa-solid fa-scale-balanced", "Litiges"],
  ["orders", "fa-solid fa-receipt", "Commandes"],
  ["banners", "fa-regular fa-images", "Bannières"],
  ["notify", "fa-regular fa-bell", "Notifier"],
  ["categories", "fa-solid fa-sitemap", "Catégories"],
  ["stores", "fa-solid fa-store", "Stores"],
  ["users", "fa-solid fa-users", "Utilisateurs"],
];

/** Alertes du tableau de bord. */
export const ADASH_ALERTS: [string, string, string, string, Section][] = [
  ["fa-solid fa-triangle-exclamation", "Litiges sans réponse du store après 48 h", "Escalade automatique vers un admin.", "/admin/disputes", "disputes"],
  ["fa-regular fa-clock", "Commandes prêtes depuis plus de 2 jours", "Rappels J+1 et J+2 envoyés aux acheteurs.", "/admin/orders", "orders"],
  ["fa-solid fa-circle-info", "Taux de commission et frais de restockage", "Valeurs encore à confirmer dans Paramètres.", "/admin/settings", "settings"],
];

export const AQUEUE_CARDS: [Section, string, string, "kyc" | "products" | "reports" | "disputes"][] = [
  ["kyc", "Dossiers KYC à traiter", "fa-solid fa-id-card", "kyc"],
  ["products", "Produits à modérer", "fa-solid fa-box", "products"],
  ["reports", "Signalements ouverts", "fa-regular fa-flag", "reports"],
  ["disputes", "Litiges à trancher", "fa-solid fa-scale-balanced", "disputes"],
];

/** Icônes des onglets fixes (Accueil, Plus). */
export const ATAB_ICONS = { home: "fa-solid fa-gauge", more: "fa-solid fa-bars" };

/** Icône d'une nouvelle bannière. */
export const BANNER_NEW_ICON = "fa-solid fa-bullhorn";
