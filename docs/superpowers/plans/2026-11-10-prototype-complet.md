# Prototype complet — plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal :** activer dans le prototype tout ce qui était « À venir » (sauf natif, livreur, sourcing, créole), ajouter la livraison et les pages partenaires, passer les graphiques sur Nivo avec une carte des ventes, trier les toasts avec Sileo et donner de la vie à l'interface sans changer la mise en page au repos.

**Architecture :** même schéma que B7/B8. Règles pures dans `lib/domain/*.ts` (testées par Vitest), actions sur l'état de démo dans `lib/demo/*.ts` (via `demo.update`, journal admin et notifications comme aujourd'hui), pages dans `app/`, composants par espace (`components/shop|seller|admin`, partagés dans `components/proto`). Nouveaux styles dans `app/proto-next.css` ou des `*.module.css` ; `app/proto.css` n'est jamais modifié.

**Tech Stack :** Next.js 16 (build `--webpack`), React 19, Vitest, Playwright. Nouvelles dépendances (validées le 10 nov.) : `@nivo/core @nivo/line @nivo/bar @nivo/pie @nivo/heatmap @nivo/funnel @nivo/geo`, `sileo`, `motion`, `@number-flow/react`, `vaul`, `embla-carousel-react`.

**Spec :** `docs/superpowers/specs/2026-11-10-prototype-complet-design.md`

## Global Constraints

- `app/proto.css` intact ; captures côte à côte (scratchpad `cmps.sh`, 1280 et 360 px) identiques au prototype **au repos** pour toute page existante.
- Toute animation respecte `prefers-reduced-motion` (Motion : `useReducedMotion` / `MotionConfig reducedMotion="user"`).
- Mobile dès 360 px, sans défilement horizontal ; vouvoiement ; « escrow » jamais sur une page acheteur (test existant `escrow` à garder vert).
- Aucune dépendance hors de la liste ci-dessus. Aucune clé en dur.
- Points ⚠️ / [À CONFIRMER] : valeur de démo dans `lib/config/business.ts`, sous une clé `demo*` commentée « valeur de démonstration », jamais à la place d'une clé `null` existante.
- Restent « À venir » même en démo : `native_app`, `sourcing`, `creole`.
- Données de démo : seulement si `PRELAKAY_ENV` ≠ `production` (règle existante, `lib/config/env.ts`).
- ESLint : pas de littéral `fa-solid`/`fa-regular` dans `app/` ni `components/` (icônes dans `lib/`) ; `components/shop|seller|admin` ne s'importent pas entre eux.
- Toast : règle du §9 de la spec — pas de toast quand le résultat se voit à l'endroit de l'action.
- Chaque tâche finit par `npm run typecheck && npm run lint && npm test` verts, puis un commit sur `feat/phase-b9-prototype-complet`.

## Review Focus

1. **Release « all » qui fuit en production** : avec `PRELAKAY_ENV=production`, `isAvailable("coupons")` doit rester `false` et `/admin/finance` doit rediriger. → test dans la tâche 1.
2. **Coupon et paiement idempotent** : un double clic sur « Payer » avec un coupon appliqué ne paie et ne consomme le coupon qu'une fois ; un coupon épuisé ou expiré est refusé au paiement même s'il était appliqué au panier. → tests dans la tâche 8.
3. **Panier mixte retrait + livraison** : un panier de deux stores, l'un en retrait et l'autre en livraison, produit deux commandes avec le bon mode, les bons frais et un seul débit du wallet. → test dans la tâche 5.
4. **Carte des ventes sans ventes** : sur une période où une commune n'a aucune vente, la carte affiche 0 % · 0 HTG (couleur neutre), pas `NaN %` ; la somme des parts vaut 100 % à l'arrondi près. → test dans la tâche 4.
5. **Ancien état de démo** : un `localStorage` `pk-demo-v1` écrit avant ce lot (sans `coupons`, `delivery`, `partners`…) s'hydrate sans erreur avec les nouvelles tranches par défaut. → test dans la tâche 1 (et chaque tâche qui ajoute une tranche étend ce test).

---

### Task 1 : Versions « tout actif » en démo

**Files :**
- Modify : `lib/config/release.ts`, `next.config.mjs`, `lib/demo/store.ts` (hydratation défensive)
- Modify : `tests/unit/release.test.ts`, `tests/unit/demo-store.test.ts`
- Modify : `tests/e2e/*.spec.ts` (assertions « À venir » des fonctionnalités désormais actives)

**Interfaces :**
- Produces : `type Release = "1" | "1.x" | "1.1" | "2" | "3" | "all"` ; `HELD_IN_PROTOTYPE: readonly FeatureKey[] = ["native_app", "sourcing", "creole"]` ; `releaseFor(env: string | undefined): Release` (`"production"` → `"1"`, sinon `"all"`) ; `CURRENT_RELEASE = releaseFor(process.env.NEXT_PUBLIC_PRELAKAY_ENV)` ; `isAvailable(key, current = CURRENT_RELEASE)` : avec `"all"`, vrai sauf pour `HELD_IN_PROTOTYPE`.
- `next.config` expose `env: { NEXT_PUBLIC_PRELAKAY_ENV: process.env.PRELAKAY_ENV ?? "development" }`.

- [ ] **Step 1 : tests qui échouent** (`tests/unit/release.test.ts`)

```ts
it("en démo, tout est actif sauf natif, sourcing et créole", () => {
  expect(isAvailable("coupons", "all")).toBe(true);
  expect(isAvailable("platform_finance", "all")).toBe(true);
  for (const k of HELD_IN_PROTOTYPE) expect(isAvailable(k, "all")).toBe(false);
});
it("en production, la version reste 1", () => {
  expect(releaseFor("production")).toBe("1");
  expect(isAvailable("coupons", releaseFor("production"))).toBe(false);
  expect(futureFeatureFor("/admin/finance", releaseFor("production"))).toBe("platform_finance");
});
it("démo et développement → all", () => {
  expect(releaseFor("demo")).toBe("all");
  expect(releaseFor(undefined)).toBe("all");
});
```

Et dans `demo-store.test.ts` : `it("hydrate un ancien état sans les nouvelles tranches")` — écrire dans `localStorage` un état `initialState()` privé de `coupons`, `delivery`, `partners`, `growth`, `marketing` (créées aux tâches suivantes : le test liste les clés de `initialState()` absentes de l'ancien objet et vérifie qu'après hydratation chacune est égale à sa valeur par défaut).

- [ ] **Step 2 :** `npx vitest run tests/unit/release.test.ts tests/unit/demo-store.test.ts` → FAIL (`releaseFor` non défini).
- [ ] **Step 3 :** implémenter dans `release.ts` ; hydratation : fusion superficielle de chaque tranche de premier niveau avec `initialState()` (déjà fait pour `admin`, généraliser).
- [ ] **Step 4 :** relancer → PASS.
- [ ] **Step 5 :** `npm run test:e2e` ; remplacer chaque assertion « À venir » d'une fonctionnalité désormais active par l'attente de la nouvelle destination ou d'aucun toast (garder celles de `native_app`, `sourcing`, `creole`). Option « Livraison » du paiement : l'assertion devient « l'option est sélectionnable » (le parcours complet arrive tâche 5). → e2e vert.
- [ ] **Step 6 :** commit `feat(proto): toutes les versions actives en démo (sauf natif, sourcing, créole)`.

### Task 2 : Sileo, tri des toasts et retours visuels

**Files :**
- Modify : `package.json` (installer **toutes** les dépendances validées ici : `npm i @nivo/core @nivo/line @nivo/bar @nivo/pie @nivo/heatmap @nivo/funnel @nivo/geo sileo motion @number-flow/react vaul embla-carousel-react`)
- Modify : `components/ui/Toast.tsx` (façade conservée : `useToast().show(msg, kind)` et `.soon()` → `sileo`), `app/proto-next.css` (styles Sileo aux tokens)
- Create : `components/ui/Feedback.tsx` — `useFlash(ms = 1600): [boolean, () => void]` (état « Ajouté ✓ / Copié » temporaire) et `<BumpBadge count>` (rebond Motion du badge panier)
- Create : `lib/ui/toastPolicy.ts` — `SILENT: ReadonlySet<string>` (messages qui ne passent plus en toast)
- Modify : appelants (liste du §9 de la spec) ; erreurs de champ → texte sous le champ (`<Field error>` existant)
- Test : `tests/unit/Toast.test.tsx`, `tests/unit/feedback.test.tsx`

**Interfaces :**
- Produces : `useToast(): { show(msg: string, kind?: "info"|"success"|"error"): void; soon(): void }` (inchangé) ; `useFlash` ; `<BumpBadge count={number} />` ; `<Toaster>` monté une fois dans `ToastProvider`, position `top-center` sous 768 px, `top-right` au-delà.

- [ ] **Step 1 : tests**
  - `Toast.test.tsx` : `show("Commande payée", "success")` rend un élément `role="status"` contenant le texte ; un deuxième `show` dans les 3 s ne laisse pas deux toasts identiques empilés.
  - `feedback.test.tsx` : `useFlash` vaut `true` après l'appel puis `false` après 1 600 ms (faux minuteurs).
  - e2e (`achat.spec.ts`) : `test("ajouter au panier : pas de toast, le bouton et le badge réagissent")` — clic « Ajouter au panier » sur une fiche → bouton contient « Ajouté », badge du panier = 1, `page.getByRole("status")` n'a pas le texte « Ajouté au panier ».
- [ ] **Step 2 :** lancer → FAIL.
- [ ] **Step 3 :** implémenter ; retirer les toasts « Ajouté au panier », « Panier mis à jour », « Déplacé dans la wishlist », « Lien copié », « Ouverture de WhatsApp… », « Ouverture de Facebook… », « Indiquez un nom. », « Écrivez une réponse. », « Écrivez votre question. », « Numéro trop court. », « Collez un lien de panier ou un @username. » (ces cinq derniers deviennent des erreurs sous le champ). Les autres restent, classés par la règle de la spec.
- [ ] **Step 4 :** tests unitaires + e2e complets → PASS ; captures au repos inchangées.
- [ ] **Step 5 :** commit `feat(ui): toasts Sileo, tri des toasts, retours visuels sur les boutons`.

### Task 3 : Thème Nivo et migration des graphiques vendeur

**Files :**
- Create : `lib/charts/nivoTheme.ts` — `nivoTheme(mode: "light"|"dark"): Theme` (polices et couleurs de `design-prelakay.md`, palette `VZCAT` existante)
- Create : `components/charts/nivo.tsx` — enveloppes chargées côté client (`next/dynamic`, `ssr: false`, squelette pendant le chargement) : `NLine`, `NBars`, `NPie`, `NHeat`, `NFunnel`, chacune dans `VzCard` avec `VzTable` (« Voir les données ») conservé
- Modify : `components/seller/charts.tsx`, `app/seller/stats/page.tsx`, `app/seller/products/page.tsx` (sparklines : garder `VzSpark` SVG)
- Test : `tests/unit/nivo.test.tsx`

**Interfaces :**
- Consumes : `sData(store, d)` (`lib/charts/sellerData.ts`), `VzCard`, `VzTable`, `VzTile`, `VzSpark` (`components/charts/vz.tsx`).
- Produces : `NLine({ series: { id: string; data: { x: string; y: number }[] }[]; height?: number; money?: boolean; title: string; table: [string, ...string[]][] })`, idem pour les autres (`NBars` avec `keys: string[]; indexBy: string; data: Record<string, string|number>[]`, `NPie` avec `data: { id: string; label: string; value: number }[]`).

- [ ] **Step 1 :** test `nivo.test.tsx` : `NLine` rend son titre et le tableau « Voir les données » avec les valeurs (le graphique Nivo lui-même est simulé dans le test par `vi.mock("@nivo/line")`).
- [ ] **Step 2 :** FAIL → **Step 3 :** implémenter ; remplacer `VzLine`, `VzCols`, `VzHBars`, `VzHeat`, `VzFunnel`, `VzSeg` côté vendeur ; mêmes données, mêmes titres.
- [ ] **Step 4 :** `vendeur.spec.ts` vert ; ajouter `test("statistiques : un graphique Nivo par onglet et son tableau")` (un `svg` dans chaque carte, bouton « Voir les données » qui ouvre un tableau) ; capture 360 px sans débordement.
- [ ] **Step 5 :** commit `feat(charts): Nivo pour l'espace vendeur`.

### Task 4 : Graphiques admin et carte des ventes

**Files :**
- Create : `scripts/geo/build-sud.mjs` (hors bundle) — télécharge geoBoundaries HTI ADM2 (CC BY 4.0), garde les communes du département du Sud, simplifie et écrit `lib/data/geo/sud-communes.json` (commité ; < 150 Ko)
- Create : `lib/charts/salesMap.ts`, `components/admin/SalesMap.tsx`
- Modify : `lib/charts/adminData.ts` (ventes de démo par commune et par quartier), `components/admin/charts.tsx`, `app/admin/(console)/page.tsx` (aperçu), `app/admin/(console)/stats/page.tsx` (carte complète), `lib/data/credits.ts` (crédit geoBoundaries)
- Test : `tests/unit/sales-map.test.ts`

**Interfaces :**
- Produces : `type ZoneSale = { id: string; name: string; amount: number; orders: number }` ; `shares(rows: ZoneSale[], by: "amount"|"orders"): (ZoneSale & { pct: number })[]` ; `communeSales(d: 7|30|90): ZoneSale[]` ; `quarterSales(d): ZoneSale[]` (ids = noms de `ZONES`) ; `<SalesMap days by />` (choroplèthe `@nivo/geo` + classement + tableau ; bulles des quartiers des Cayes en SVG sur le fond `ZONES`).
- Libellé d'infobulle et de légende : `` `${pct} % · ${nfr(amount)} HTG` `` (ex. « 10 % · 48 200 HTG »).

- [ ] **Step 1 : tests**

```ts
it("les parts font 100 % à l'arrondi près", () => {
  const r = shares(communeSales(30), "amount");
  expect(Math.abs(r.reduce((a, x) => a + x.pct, 0) - 100)).toBeLessThanOrEqual(1);
});
it("une zone sans vente vaut 0 %, jamais NaN", () => {
  const r = shares([{ id: "a", name: "A", amount: 0, orders: 0 }, { id: "b", name: "B", amount: 500, orders: 2 }], "amount");
  expect(r[0].pct).toBe(0);
  expect(shares([{ id: "a", name: "A", amount: 0, orders: 0 }], "amount")[0].pct).toBe(0);
});
it("chaque commune de démo existe dans les contours du Sud", () => {
  const ids = new Set(sud.features.map((f) => f.id));
  for (const c of communeSales(30)) expect(ids.has(c.id)).toBe(true);
});
```

- [ ] **Step 2 :** FAIL → **Step 3 :** lancer `node scripts/geo/build-sud.mjs`, implémenter, migrer `AdminDashCharts` et la page Statistiques vers les enveloppes de la tâche 3.
- [ ] **Step 4 :** `admin.spec.ts` + `test("carte des ventes : % et montant par commune, bascule ventes/commandes, 7/30/90 j")` ; la commune « Les Cayes » affiche un libellé `/\d+ % · [\d  ]+ HTG/`.
- [ ] **Step 5 :** commit `feat(admin): graphiques Nivo et carte des ventes du Sud`.

### Task 5 : Livraison — règles et parcours acheteur

**Files :**
- Create : `lib/domain/delivery.ts`
- Modify : `lib/config/business.ts` (`demoDeliveryFee: Record<string, number>` par quartier de `ZONES`, `demoDeliveryMinutes: 45` — commentés « valeur de démonstration, ⚠️ ouvert »)
- Modify : `lib/demo/store.ts` (`Order` : `mode?: "pickup"|"delivery"`, `addr?: { zone: string; mark: string; phone: string }`, `fee?: number`, `driver?: { n: string; tel: string }`, `track?: number` (0-100) ; `OrderStatus` + `"handed" | "enroute" | "delivered"`), `lib/demo/actions.ts` (`payCart`)
- Modify : `app/(shop)/checkout/page.tsx` (choix par store), `app/(shop)/orders/[id]/page.tsx` (suivi), `app/(shop)/p/[id]/page.tsx` (ligne livraison active), `app/(shop)/orders/page.tsx` (libellés de statut)
- Create : `components/shop/DeliveryTrack.tsx` (frise + position simulée sur le plan `ZONES`)
- Test : `tests/unit/delivery.test.ts`, `tests/e2e/achat.spec.ts`

**Interfaces :**
- Produces : `DELIVERY_STEPS = ["received","prep","handed","enroute","delivered"] as const` ; `deliveryFee(zone: string): number` ; `nextDeliveryStatus(s: OrderStatus): OrderStatus | null` ; `validateDeliveryCode(order: Order, code: string): boolean` ; `payCart(key: string, opts?: { modes?: Record<storeId, "pickup"|"delivery">; addr?: Order["addr"]; coupon?: string })` — retourne comme aujourd'hui `{ ok: true; ids: string[] } | { ok: false; error: string }` ; le total débité inclut les frais.
- Livraison validée par le code → statut `delivered`, Coins de commande crédités ; le bonus « retrait plutôt que livraison » ne s'applique qu'aux commandes `pickup`.

- [ ] **Step 1 : tests**
  - `it("panier de deux stores : un retrait, une livraison → deux commandes, frais sur la seule livraison, un seul débit")` — `payCart("k", { modes: { "bel-soley": "pickup", "tech-sud": "delivery" }, addr: { zone: "Bergeaud", mark: "près de l'église", phone: "37000000" } })` ; wallet diminué de `total1 + total2 + deliveryFee("Bergeaud")` ; second appel avec la même clé → mêmes `ids`, wallet inchangé.
  - `it("livraison sans adresse refusée")` → `{ ok: false, error: "Indiquez l'adresse de livraison." }`.
  - `it("statuts de livraison dans l'ordre ; le code libère la commande")`.
- [ ] **Step 2 :** FAIL → **Step 3 :** implémenter ; en démo, la progression `handed → enroute → delivered` avance seule (minuteur comme la modération simulée), sauf la dernière étape qui attend le code.
- [ ] **Step 4 :** e2e `test("payer en livraison puis suivre la commande")` à 360 et 1280 px ; captures du paiement au repos (option « Retrait » sélectionnée) identiques.
- [ ] **Step 5 :** commit `feat(livraison): choix au paiement, frais, suivi et code de livraison`.

### Task 6 : Livraison — vendeur et admin

**Files :**
- Modify : `lib/demo/sellerActions.ts` (`handToDriver(orderId)`), `app/seller/orders/[id]/page.tsx`, `app/seller/orders/page.tsx` (filtre « Livraison »), `components/seller/ProductForm.tsx` (ligne « Livraison » active, champ `deliverable: boolean`), `app/seller/policy/page.tsx` (zones livrées)
- Create : `app/admin/(console)/deliveries/page.tsx`, `lib/demo/admin.ts` (`deliveriesList`, `assignDriver(me, orderId, driver)`, `deliveryIncident(me, orderId, note)` — journalisées)
- Modify : `lib/domain/admin.ts` (`Section` + `"deliveries" | "partners"` ; `PERM.deliveries = ["super","support"]`), `lib/demo/adminMenu.ts` (entrée « Livraisons » dans Opérations)
- Test : `tests/unit/seller-actions.test.ts`, `tests/unit/admin-actions.test.ts`, e2e vendeur/admin

**Interfaces :**
- Consumes : `Order.mode`, `DELIVERY_STEPS` (tâche 5).
- Produces : `handToDriver(orderId: string): string | null` (erreur ou `null`) ; `DEMO_DRIVERS: { n: string; tel: string }[]` dans `lib/demo/delivery.ts`.

- [ ] **Step 1 : tests** — `it("le store remet au livreur une commande prête en livraison ; refus pour une commande en retrait")` ; `it("Marketing n'a pas accès aux livraisons")` (`can("marketing","deliveries") === false`) ; `it("affecter un livreur est journalisé et visible chez l'acheteur")`.
- [ ] **Step 2 :** FAIL → **Step 3 :** implémenter → **Step 4 :** PASS + e2e (`test("vendeur : préparer puis remettre au livreur")`, `test("admin : liste des livraisons et affectation")`).
- [ ] **Step 5 :** commit `feat(livraison): remise au livreur (vendeur) et suivi des livraisons (admin)`.

### Task 7 : Pages partenaires et file Admin → Partenaires

**Files :**
- Create : `components/proto/partners.tsx` — `PartnerPage({ kind: "payment"|"delivery" })` (sections 1 à 8 de la spec §7), `lib/demo/partners.ts` (contenu des deux pages : avantages, étapes, profils, FAQ, champs — icônes ici), `app/(shop)/partenaires/livraison/page.tsx`
- Modify : `app/(shop)/partenaires/paiement/page.tsx` (utilise `PartnerPage`), `components/proto/legal.tsx` (retirer l'ancien `PaymentPartner`), `components/proto/shell.tsx` (pied de page : « Devenir partenaire de livraison » sous « Devenir un partenaire de paiement » ; libellé de route `partenaires`), `lib/demo/store.ts` (tranche `partners: PartnerApp[]`)
- Create : `app/admin/(console)/partners/page.tsx`, `app/admin/(console)/partners/[id]/page.tsx` ; actions dans `lib/demo/admin.ts`
- Modify : `lib/domain/admin.ts` (`PERM.partners = ["super","support","finance"]` ; Finance ne voit que `kind === "payment"`), `lib/demo/adminMenu.ts` (« Partenaires » dans Validation)
- Test : `tests/unit/partners.test.ts`, e2e acheteur et admin

**Interfaces :**
- Produces : `type PartnerApp = { id: string; kind: "payment"|"delivery"; who: "person"|"company"; name: string; phone: string; email?: string; zone?: string; vehicle?: string; org?: string; orgType?: string; volume?: string; msg?: string; docs: boolean; st: "recu"|"verif"|"ok"|"rej"|"docs"; why?: string; date: string }` ; `submitPartner(input): { ok: true; id: string } | { ok: false; errors: Record<string,string> }` (id `PL-xxxx` livraison / `PP-xxxx` paiement) ; `partnersFor(role: Role, s: DemoState): PartnerApp[]` ; `partnerDecide(me, id, "ok"|"rej"|"docs", why?)`.
- Validation livraison : 18 ans et plus (réutiliser la règle d'âge de `lib/domain/kyc.ts`), téléphone haïtien 8 chiffres, véhicule obligatoire ; paiement : organisation, type, e-mail.

- [ ] **Step 1 : tests** — `it("candidature livreur sans véhicule refusée, champ en erreur")` ; `it("candidature valide → numéro PL-… et apparition dans la file admin")` ; `it("Finance ne voit que les candidatures de paiement")` ; `it("rejet avec motif journalisé")`.
- [ ] **Step 2 :** FAIL → **Step 3 :** implémenter → **Step 4 :** PASS ; e2e `test("pied de page → Devenir partenaire de livraison → candidature reçue")` aux 4 largeurs ; capture de la page à 360 px.
- [ ] **Step 5 :** commit `feat(partenaires): pages paiement et livraison, file admin des candidatures`.

### Task 8 : Coupons

**Files :**
- Create : `lib/domain/coupons.ts`, `app/(shop)/account/coupons/page.tsx` (« Mes coupons »), `app/seller/marketing/coupons/page.tsx`, `app/admin/(console)/coupons/page.tsx`
- Modify : `lib/demo/store.ts` (tranche `coupons: { list: Coupon[]; mine: string[]; used: Record<string, number> }`, coupons de démo), `lib/demo/actions.ts` (`payCart` consomme le coupon), `app/(shop)/cart/page.tsx`, `app/(shop)/checkout/page.tsx` (champ « Code promo »), onglet Promos de `app/(shop)/store/[id]/page.tsx`, `app/seller/marketing/page.tsx`, `lib/domain/admin.ts` (`PERM.coupons = ["super","marketing"]`), `lib/demo/adminMenu.ts`
- Test : `tests/unit/coupons.test.ts`

**Interfaces :**
- Produces : `type Coupon = { code: string; store: string | null; pct: number; min: number; from: string; to: string; stock: number; on: boolean; welcome?: boolean }` ; `couponCheck(c: Coupon | undefined, ctx: { store: string; subtotal: number; today: string; used: number }): { ok: true; off: number } | { ok: false; error: string }` ; `createCoupon(input): { ok: true; code: string } | { ok: false; errors: Record<string,string> }` (code 6 caractères majuscules/chiffres, généré si vide).
- Messages : « Code inconnu. », « Ce coupon a expiré. », « Montant minimum : {min} HTG. », « Ce coupon est épuisé. », « Ce coupon ne s'applique pas à ce store. ».

- [ ] **Step 1 : tests** — un test par message ci-dessus ; `it("remise = pct du sous-total du store, arrondie à l'HTG")` ; `it("double paiement avec coupon : un seul débit, une seule utilisation")` ; `it("coupon appliqué au panier puis épuisé avant paiement → paiement refusé avec « Ce coupon est épuisé. »")`.
- [ ] **Step 2 :** FAIL → **Step 3 :** implémenter → **Step 4 :** PASS + e2e `test("vendeur crée un coupon, l'acheteur l'applique au paiement")`.
- [ ] **Step 5 :** commit `feat(coupons): création vendeur, code promo acheteur, suivi admin`.

### Task 9 : Offres flash, events, boost et badges

**Files :**
- Create : `lib/domain/marketing.ts`, `app/admin/(console)/events/page.tsx` (remplace la redirection), `app/(shop)/events/[id]/page.tsx`, `app/seller/marketing/flash/page.tsx`, `app/seller/marketing/events/page.tsx`, `app/seller/marketing/boost/page.tsx`, `components/proto/Countdown.tsx`
- Modify : `lib/demo/store.ts` (tranche `marketing: { flash: Flash[]; events: Event[]; boosts: Boost[] }`), `lib/config/release.ts` (retirer `/admin/events` de `FUTURE_ROUTES` n'est **pas** fait : la règle s'applique toujours en production ; la route marche car `isAvailable` est vrai en démo), accueil (bandeau flash), résultats de recherche (« Sponsorisé »), cartes produit et store (badges), `lib/config/business.ts` (`demoFlashTrustMin`, `demoBadgeRules` — valeurs de démonstration)
- Test : `tests/unit/marketing.test.ts`

**Interfaces :**
- Produces : `type Flash = { id: string; product: string; price: number; ends: string; st: "pending"|"live"|"ended"|"rej" }` ; `proposeFlash(store, product, price): string | null` (refus si points de confiance < `demoFlashTrustMin` ou prix ≥ prix normal) ; `type Event = { id: string; n: string; from: string; to: string; noCommission: boolean; stores: string[] }` ; `type Boost = { id: string; product: string; budget: number; spent: number; on: boolean }` ; `boostProduct(product, budget): string | null` (débite le solde vendeur, refus si insuffisant) ; `badgesOf(kind: "buyer"|"store", id: string, s: DemoState): string[]`.
- Ordre de tri : un produit boosté passe en tête de sa page de résultats, marqué « Sponsorisé », au plus 1 sur 4 positions (même logique que le quota « Nouveaux sur Prélakay »).

- [ ] **Step 1 : tests** — `it("offre flash refusée sous le seuil de confiance")`, `it("flash terminée → prix normal")` (horloge injectée), `it("boost : solde insuffisant refusé")`, `it("au plus un sponsorisé toutes les 4 positions")`, `it("badge VIP après N commandes de démo")`.
- [ ] **Step 2 :** FAIL → **Step 3 :** implémenter → **Step 4 :** PASS + e2e (`test("admin crée un event, le vendeur y participe, l'acheteur voit la page event")`).
- [ ] **Step 5 :** commit `feat(marketing): offres flash, events, boost et badges`.

### Task 10 : Parrainage, ambassadeurs et Prelakay+

**Files :**
- Create : `lib/domain/growth.ts`, `app/(shop)/invite/page.tsx`, `app/(shop)/ambassadeurs/page.tsx`, `app/(shop)/plus/page.tsx`, `app/admin/(console)/growth/page.tsx` (parrainages, ambassadeurs, abonnés)
- Modify : `lib/demo/store.ts` (tranche `growth: { refCode: string; referrals: {u: string; st: "pending"|"done"; date: string}[]; amb: null | { st: "recu"|"ok"|"rej"; school: string }; plus: null | { since: string; next: string } }`), `app/(shop)/coins/page.tsx`, pied de page (Ambassadeurs), `lib/domain/admin.ts` (`PERM.growth = ["super","marketing"]`)
- Test : `tests/unit/growth.test.ts`

**Interfaces :**
- Produces : `REFERRAL_COINS = 500` (CHANGELOG ; **anti-abus ⚠️ non implémenté**, commentaire et mention sur la page admin) ; `subscribePlus(): string | null` (débite 1 500 HTG du wallet ; « Solde insuffisant. Rechargez votre wallet. ») ; `cancelPlus()` ; `applyAmbassador(school: string): string | null`.

- [ ] **Step 1 : tests** — `it("abonnement Prelakay+ débite 1 500 HTG et affiche le badge or")`, `it("solde insuffisant refusé")`, `it("parrainage terminé crédite 500 Coins une fois")`.
- [ ] **Step 2 :** FAIL → **Step 3 :** implémenter → **Step 4 :** PASS + e2e `test("s'abonner à Prelakay+ depuis le compte")`.
- [ ] **Step 5 :** commit `feat(croissance): parrainage, ambassadeurs, Prelakay+`.

### Task 11 : Téléphone + SMS, comptes employés, recherches vocale, photo et code-barres

**Files :**
- Modify : `components/proto/auth.tsx` (inscription / connexion par téléphone : numéro → code à 6 chiffres affiché dans le bandeau démo → compte), `components/proto/subpages.tsx` (ajout du téléphone dans les paramètres), `components/proto/search.tsx` (micro, photo), `app/seller/store/page.tsx` (employés), `components/seller/ProductForm.tsx` (scan)
- Create : `lib/domain/phone.ts`, `lib/ui/speech.ts`, `lib/ui/barcode.ts`, `app/seller/staff/page.tsx`
- Modify : `lib/demo/store.ts` (`seller.staff: { n: string; tel: string; role: "prep"|"cash"; st: "invited"|"active" }[]`)
- Test : `tests/unit/phone.test.ts`, `tests/unit/speech.test.ts`

**Interfaces :**
- Produces : `normalizeHtPhone(raw: string): string | null` (8 chiffres, préfixe `+509` facultatif) ; `demoOtp(): string` ; `startDictation(onText: (t: string) => void): { stop(): void } | null` (`null` si `SpeechRecognition`/`webkitSpeechRecognition` absent → message « La recherche vocale n'est pas disponible sur ce navigateur. ») ; `scanBarcode(video: HTMLVideoElement): Promise<string | null>` (`BarcodeDetector` ; sinon champ de saisie) ; recherche par photo : choisir un fichier → catégorie de démo déterminée par `hash(nom du fichier) % catégories` → page de résultats « Résultats proches de votre photo ».
- Employés : rôle `prep` voit Commandes et Retrait ; rôle `cash` voit Retrait seulement (simulation par sélecteur « Voir comme »).

- [ ] **Step 1 : tests** — `normalizeHtPhone("+509 3712-3456") === "37123456"`, `normalizeHtPhone("1234") === null` ; `startDictation` renvoie `null` sans API (jsdom).
- [ ] **Step 2 :** FAIL → **Step 3 :** implémenter → **Step 4 :** PASS + e2e `test("inscription par téléphone avec le code de démo")`, `test("vendeur invite un employé")`.
- [ ] **Step 5 :** commit `feat(comptes): téléphone + SMS, employés, recherches vocale, photo et code-barres`.

### Task 12 : Dispute Center complet et finances plateforme

**Files :**
- Modify : `app/admin/(console)/disputes/[id]/page.tsx` (fil de messages acheteur / store / admin, pièces, étapes, décision existante), `lib/demo/admin.ts` (`disputeMessage(me, id, text)`, `disputeRequest(me, id, from: "buyer"|"store")`)
- Create : `app/admin/(console)/finance/page.tsx` (GMV, commissions, escrow en circulation, retraits en attente ; graphiques Nivo de la tâche 3), `lib/charts/financeData.ts`
- Test : `tests/unit/finance.test.ts`, `tests/unit/admin-actions.test.ts`

**Interfaces :**
- Produces : `platformFinance(s: DemoState, d: 7|30|90): { gmv: number; commission: number | null; escrow: number; payoutsPending: number; series: … }` — `commission` = `null` tant que `BUSINESS.commissionRate` est `null` ; la page affiche « — » et « Taux ⚠️ à confirmer » (jamais calculé, règle existante). L'aperçu `?preview=1` du prototype n'est pas porté : la page entière le remplace.

- [ ] **Step 1 : tests** — `it("commission non calculée tant que le taux est ouvert")` ; `it("escrow en circulation = somme des commandes payées non libérées")` ; `it("message admin dans un litige journalisé et visible par le store")`.
- [ ] **Step 2 :** FAIL → **Step 3 :** implémenter → **Step 4 :** PASS + e2e `test("Finance ouvre les finances plateforme ; Marketing reçoit Accès refusé")`.
- [ ] **Step 5 :** commit `feat(admin): Dispute Center complet et finances plateforme`.

### Task 13 : Mode sombre

**Files :**
- Create : `app/theme-dark.css` (redéfinit les tokens de `design-prelakay.md` §7 sous `:root[data-theme="dark"]` ; aucun changement de `proto.css`), `lib/ui/theme.ts`
- Modify : `app/layout.tsx` (script d'initialisation avant le rendu, pas de flash), `components/proto/subpages.tsx` (interrupteur actif), `lib/charts/nivoTheme.ts` (déjà prêt)
- Test : `tests/unit/theme.test.ts`, e2e

**Interfaces :**
- Produces : `getTheme(): "light"|"dark"|"system"`, `setTheme(t)` (clé `localStorage` `pk-theme`, try/catch) ; attribut `data-theme` sur `<html>`.

- [ ] **Step 1 :** tests — `setTheme("dark")` pose `data-theme="dark"` ; `"system"` suit `matchMedia`.
- [ ] **Step 2 :** FAIL → **Step 3 :** implémenter → **Step 4 :** PASS + e2e `test("mode sombre : fond sombre, contraste du texte ≥ 4,5:1 sur l'accueil, la fiche produit et le tableau de bord admin")` (calcul du contraste depuis `getComputedStyle`) ; captures claires inchangées.
- [ ] **Step 5 :** commit `feat(ui): mode sombre`.

### Task 14 : Vie de l'interface (Motion, NumberFlow, Vaul, Embla, composants Spectrum)

**Files :**
- Create : `components/proto/motion.tsx` — `<Reveal>` (apparition au défilement, décalage 40 ms entre enfants, max 8), `<LikeButton>` (wishlist), `<HoldToConfirm ms={1200}>` (bannir, suspendre, annuler une commande), `<SlidingTabs>` (soulignement qui glisse, utilisé par `components/ui/Tabs.tsx`), `<UndoPill>`, `<NotifBell count>`
- Modify : `components/ui/Modal.tsx` et la feuille du bas (Vaul pour la feuille, même balisage de classes du prototype), carrousel de l'accueil et galerie produit (Embla, mêmes classes), wallet / Coins / tuiles / totaux (`@number-flow/react`), `components/ui/Tabs.tsx`, pages admin concernées par `HoldToConfirm`, suivi de commande et de livraison (frise animée)
- Avant d'écrire chaque composant : consulter le serveur MCP `spectrum-ui` (disponible après redémarrage de la session) pour l'interaction de référence, puis la réécrire avec nos classes et tokens, sans Tailwind.
- Test : `tests/unit/motion.test.tsx`, e2e

**Interfaces :**
- Produces : `HoldToConfirm({ onConfirm: () => void; label: string; ms?: number; children })` — appui maintenu (souris, doigt, touche Entrée ou Espace maintenue) ; relâché avant la fin → rien.

- [ ] **Step 1 : tests** — `HoldToConfirm` : relâcher à 600 ms n'appelle pas `onConfirm`, 1 200 ms l'appelle une fois (faux minuteurs) ; `<Reveal>` rend ses enfants immédiatement quand `prefers-reduced-motion: reduce`.
- [ ] **Step 2 :** FAIL → **Step 3 :** implémenter → **Step 4 :** PASS ; e2e complet (adapter les tests admin qui cliquent « Bannir » / « Suspendre » à l'appui maintenu) ; **captures au repos de toutes les pages comparées : identiques** ; vérifier la fluidité en émulation mobile (Playwright `cpuThrottling` ×4 : aucune tâche longue > 200 ms pendant l'ouverture de la feuille du bas).
- [ ] **Step 5 :** commit `feat(ui): mouvement et micro-interactions`.

### Task 15 : Documentation, vérification finale et branches

**Files :**
- Modify : `CHANGELOG.md` (section « Prototype (10 nov. 2026) » : toutes les versions actives en démo, sauf natif, sourcing, créole ; livraison ajoutée à la V1 ; nouvelles dépendances ; le tableau des limites reste la règle de production), `docs/04-trd.md` (Nivo remplace la proposition `recharts`), `docs/01-prd.md` §3 (livraison au lancement, points ouverts listés), `CLAUDE.md` « Décisions encore ouvertes » (ajouter : frais et zones de livraison, paiement du livreur, libération de l'escrow à la livraison, échec de livraison)

- [ ] **Step 1 :** `npm run typecheck && npm run lint && npm test && npm run build && npm run test:e2e` → tout vert (relancer seul un test en échec réseau et le signaler).
- [ ] **Step 2 :** captures côte à côte des trois espaces (1280 et 360 px).
- [ ] **Step 3 :** commit `docs: prototype complet (CHANGELOG, PRD, TRD, CLAUDE.md)` ; fusion `--no-ff` dans `main` ; `git branch -f acheteur main && git branch -f vendeur main && git branch -f admin main`. **Pas de push** sans accord.
