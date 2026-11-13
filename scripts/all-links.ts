// Génère ALL-LINKS.md : toutes les pages du projet en localhost, chaque produit, store,
// commande, litige… compris. Mêmes fonctions que les pages, sur l'état de démonstration
// au démarrage (initialState). Relancer après un ajout de route ou de données :
//   npx tsx scripts/all-links.ts
// (13 nov. 2026, demande de Marc-Karlin : « tous les liens, pas des exemples »)

import { writeFileSync } from "node:fs";
import { CATS, P, STORES } from "@/lib/data/mock/seed";
import { HELP_ALL, SETS } from "@/lib/data/mock/content";
import { LEGAL_DOCS } from "@/lib/data/credits";
import { initialState } from "@/lib/demo/store";
import { allDisputes, allOrders, kycList, modQueue, usersList } from "@/lib/demo/admin";
import { myProducts, myStore, sellerConvs, sellerDisputes, sellerOrders } from "@/lib/demo/sellerActions";
import { partnersFor } from "@/lib/demo/partners";
import { eventsList } from "@/lib/demo/marketing";

const BASE = "http://localhost:3000";
const s = initialState();
const out: string[] = [];
let count = 0;
const h = (t: string, note?: string) => {
  out.push("", t);
  if (note) out.push("", note);
  out.push("");
};
const link = (path: string, label?: string) => {
  count++;
  out.push(`- ${BASE}${path}${label ? ` — ${label}` : ""}`);
};
const uniq = <T,>(a: T[]) => [...new Set(a)];

/* ---------------- Acheteur ---------------- */
h("## Espace acheteur");

h("### Accueil, découverte, recherche");
["/", "/categories", "/discover", "/discover?flash=1", "/discover?sort=new", "/discover?ready=1", "/map", "/search"].forEach((p) => link(p));

h("### Catégories (onglet Catégories)");
for (const c of CATS) link(`/categories?c=${c.id}`, c.n);

h("### Produits par catégorie et sous-catégorie (Discover)");
for (const c of CATS) {
  link(`/discover?cat=${c.id}`, c.n);
  for (const sub of c.sub) link(`/discover?cat=${c.id}&sub=${encodeURIComponent(sub)}`, `${c.n} › ${sub}`);
}

h(`### Fiches produit (${P.length} produits)`, "Chaque fiche a aussi sa page d'avis (`/reviews`).");
for (const p of P) {
  link(`/p/${p.id}`, p.n);
  link(`/p/${p.id}/reviews`, `${p.n} — avis`);
}

const TABS: [string, string][] = [["", "Accueil"], ["/products", "Produits"], ["/top", "Meilleures ventes"], ["/new", "Nouveautés"], ["/reviews", "Avis"], ["/about", "À propos"], ["/promos", "Promos"]];
h(`### Stores (${STORES.length} stores × ${TABS.length} onglets)`);
for (const st of STORES) {
  out.push("", `**${st.n}**`, "");
  for (const [t, l] of TABS) link(`/store/${st.id}${t}`, l);
}

h("### Panier, paiement, confirmation");
link("/cart");
link("/checkout");
for (const o of s.orders) link(`/done/${o.id}`, `confirmation ${o.id}`);
link("/shared/lili_cayes", "panier partagé d'un proche");

h(`### Commandes (${s.orders.length})`);
link("/orders");
for (const o of s.orders) link(`/orders/${o.id}`, STORES.find((x) => x.id === o.store)?.n);
link("/disputes", "retours et litiges");

h("### Compte et wallet");
["/account", "/account/coupons", "/wallet", "/wallet?tab=hist", "/wallet?topup=1", "/coins", "/wishlist", "/viewed", "/myreviews", "/notifications", "/invite", "/plus"].forEach((p) => link(p));

h("### Paramètres");
link("/settings");
for (const [k, , n] of SETS) link(`/settings/${k}`, n);

h("### Connexion");
link("/login");
link("/signup");

h("### Vendre, partenaires, programmes");
link("/sell", "Enregistrer son commerce (KYC)");
link("/partenaires/livraison");
link("/partenaires/paiement");
link("/ambassadeurs");
for (const e of eventsList(s)) link(`/events/${e.id}`, e.n);

h(`### Centre d'aide (${HELP_ALL.length} articles)`);
link("/help");
HELP_ALL.forEach((x, i) => link(`/help/${i}`, String(x[0])));

h("### Légal et crédits");
link("/legal");
for (const d of LEGAL_DOCS) link(`/legal/${d.slug}`, d.title);
link("/credits");

h("### Pages techniques");
link("/~offline", "page hors connexion de la PWA");
link("/robots.txt");
link("/style-guide", "guide de style interne");
out.push(
  "- Images de partage (fiche produit, store) : adresse avec un suffixe généré par Next, à lire dans la balise `og:image` de la page.",
  "- Page 404 : toute adresse inconnue, ex. " + BASE + "/une-adresse-inconnue",
);

/* ---------------- Vendeur ---------------- */
const st = myStore(s);
h(
  "## Espace vendeur",
  `Accès : KYC approuvé (démo : finir le parcours de la page \`/sell\`, ou mettre \`{"kyc":"ok"}\` dans la clé \`pk-demo-v1\` du localStorage). ` +
    `Les pages de détail ci-dessous sont celles du store par défaut, **${st.n}** ; le sélecteur de store de l'en-tête vendeur en montre d'autres.`,
);
h("### Pages");
[
  "/seller", "/seller/menu", "/seller/notifications", "/seller/products", "/seller/products/new", "/seller/stock",
  "/seller/orders", "/seller/orders?tab=received", "/seller/orders?tab=ready", "/seller/pickup", "/seller/disputes",
  "/seller/marketing", "/seller/marketing/coupons", "/seller/marketing/flash", "/seller/marketing/events", "/seller/marketing/boost", "/seller/share",
  "/seller/finance", "/seller/payouts", "/seller/reviews", "/seller/questions", "/seller/messages", "/seller/stats",
  "/seller/store", "/seller/policy", "/seller/trust", "/seller/staff", "/seller/account",
].forEach((p) => link(p));
const mp = myProducts(s);
h(`### Produits du store (${mp.length})`);
for (const p of mp) link(`/seller/products/${encodeURIComponent(p.id)}`, p.n);
const so = sellerOrders(s);
h(`### Commandes du store (${so.length})`);
for (const o of so) link(`/seller/orders/${o.id}`);
const sd = sellerDisputes(s);
h(`### Litiges du store (${sd.length})`);
for (const d of sd) link(`/seller/disputes/${d.id}`);
const sc = sellerConvs(s);
h(`### Messages (${sc.length} conversations)`);
for (const c of sc) link(`/seller/messages/${c.id}`, c.who);

/* ---------------- Admin ---------------- */
h(
  "## Espace admin",
  `Accès : ${BASE}/admin/login (démo : mot de passe + code à 6 chiffres ; rôles Superadmin, Support, Finance, Marketing). ` +
    "Les listes ci-dessous sont celles du Superadmin.",
);
h("### Pages");
[
  "/admin/login", "/admin", "/admin/menu", "/admin/search", "/admin/stats", "/admin/kyc", "/admin/products", "/admin/reports",
  "/admin/disputes", "/admin/stores", "/admin/users", "/admin/orders", "/admin/deliveries", "/admin/partners",
  "/admin/banners", "/admin/notify", "/admin/coupons", "/admin/events", "/admin/growth", "/admin/finance",
  "/admin/categories", "/admin/team", "/admin/settings", "/admin/audit",
].forEach((p) => link(p));
const kyc = kycList(s);
h(`### Dossiers KYC (${kyc.length})`);
for (const k of kyc) link(`/admin/kyc/${k.id}`);
const mq = modQueue(s);
h(`### Produits en modération (${mq.length})`);
for (const p of mq) link(`/admin/products/${encodeURIComponent(p.id)}`, p.n);
h(`### Stores (${STORES.length})`);
for (const x of STORES) link(`/admin/stores/${x.id}`, x.n);
const us = usersList(s);
h(`### Utilisateurs (${us.length})`);
for (const u of us) link(`/admin/users/${u.u.slice(1)}`, u.name);
const ao = allOrders(s);
h(`### Commandes (${ao.length})`);
for (const id of uniq(ao.map((o) => o.id))) link(`/admin/orders/${id}`);
const ad = allDisputes(s);
h(`### Litiges (${ad.length})`);
for (const id of uniq(ad.map((d) => d.id))) link(`/admin/disputes/${id}`);
const pa = partnersFor("super", s);
h(`### Candidatures partenaires (${pa.length})`);
for (const p of pa) link(`/admin/partners/${p.id}`);

/* ---------------- Fichier ---------------- */
const head = [
  "# Tous les liens du projet (localhost)",
  "",
  "Généré par `npx tsx scripts/all-links.ts` à partir des données de démonstration (état de départ) :",
  "chaque produit, store, commande, litige, dossier… a sa ligne. À relancer après un ajout de route ou de données.",
  "",
  `**${count} liens.** Serveur de dev : \`npm run dev\` → ${BASE}`,
  "",
  "En production, chaque espace a son domaine (CLAUDE.md, 11 nov. 2026) : acheteur `app.prelakay.com`, vendeur",
  "`vendeur.prelakay.com`, admin `admin.prelakay.com` (la landing `www.prelakay.com` est hors de cette application).",
  "Les pages créées pendant une session (nouvelle commande, nouveau litige…) ont des identifiants qui n'existent pas au départ :",
  "elles ne sont pas listées.",
];
writeFileSync("ALL-LINKS.md", [...head, ...out, ""].join("\n"), "utf8");
console.log(`ALL-LINKS.md : ${count} liens`);
