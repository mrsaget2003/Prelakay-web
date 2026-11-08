import { assertDataSource } from "@/lib/config/env";
import { appSpace } from "@/lib/config/space";

// Exécuté une fois au démarrage du serveur : une configuration interdite
// (données de démo en production, espace inconnu) empêche le démarrage au lieu
// d'afficher de faux produits (CHANGELOG règle 4, plan Review Focus n° 1).
export function register() {
  assertDataSource(process.env);
  appSpace(process.env);
}
