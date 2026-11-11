import { test, expect, type Page } from "@playwright/test";

// Espace vendeur (Phase B7) : toutes les pages, et les parcours clés du store
// (commande → retrait validé, produit en modération, litige, retrait de fonds).

const ROUTES = [
  "/seller", "/seller/menu", "/seller/products", "/seller/products?q=robe", "/seller/products/new", "/seller/products/mode-0", "/seller/stock",
  "/seller/orders", "/seller/orders?tab=received", "/seller/orders/PK-980", "/seller/pickup", "/seller/disputes", "/seller/disputes/LT-225",
  "/seller/marketing", "/seller/marketing/coupons", "/seller/marketing/flash", "/seller/marketing/events", "/seller/marketing/boost", "/seller/share", "/seller/finance", "/seller/payouts", "/seller/reviews", "/seller/questions",
  "/seller/messages", "/seller/messages/c0", "/seller/stats", "/seller/store", "/seller/policy", "/seller/trust",
  "/seller/account", "/seller/notifications", "/seller/staff",
];

// Serveur de dev : chaque page compile à la première visite ; sous charge parallèle (4 largeurs),
// la navigation peut dépasser les délais par défaut (même réglage que le test d'achat).
const NAV = { timeout: 30_000 };
test.beforeEach(() => test.setTimeout(120_000));

async function asSeller(page: Page) {
  await page.goto("/");
  await page.evaluate(() => localStorage.setItem("pk-demo-v1", JSON.stringify({ introDone: true, kyc: "ok" })));
}

test("chaque page de l'Espace vendeur s'affiche, sans débordement ni erreur", async ({ page }) => {
  test.setTimeout(300_000);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error" && !/Download the React DevTools/.test(m.text())) errors.push(m.text().slice(0, 200));
  });
  await asSeller(page);
  for (const r of ROUTES) {
    await page.goto(r);
    await page.waitForLoadState("networkidle");
    await expect(page.locator(".sc-main h1"), r).toBeVisible();
    await expect(page.getByText("Cette page s'est perdue en chemin"), r).toHaveCount(0);
    await expect(page.getByText("introuvable"), r).toHaveCount(0);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, `débordement horizontal sur ${r}`).toBeLessThanOrEqual(0);
  }
  expect(errors, errors.join("\n")).toEqual([]);
});

test("sans KYC approuvé, l'espace vendeur reste fermé", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.setItem("pk-demo-v1", JSON.stringify({ introDone: true, kyc: null })));
  await page.goto("/seller/orders");
  await expect(page.getByRole("heading", { name: "Espace vendeur" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Enregistrer son commerce" })).toBeVisible();
});

test("commande : préparer, marquer prête, valider le retrait avec le code", async ({ page }) => {
  await asSeller(page);
  await page.goto("/seller/orders/PK-980");
  await page.getByRole("button", { name: "Commencer la préparation" }).click();
  await page.getByRole("button", { name: "Marquer prête pour retrait" }).click();
  await expect(page.getByRole("status")).toContainText("code de retrait");
  await page.getByRole("link", { name: "Valider le retrait" }).first().click();
  await expect(page).toHaveURL(/\/seller\/pickup\?id=PK-980/, NAV);
  await page.getByLabel("Code de retrait").fill("000000");
  await page.getByRole("button", { name: "Valider", exact: true }).click();
  await expect(page.getByText("Code invalide ou commande déjà retirée")).toBeVisible();
  const row = page.locator(".s-orow", { hasText: "PK-980" });
  await row.getByRole("button", { name: "Prototype : code" }).click();
  await page.getByRole("button", { name: "Valider", exact: true }).click();
  await expect(page.getByText("Retrait validé · PK-980")).toBeVisible();
  await page.goto("/seller/orders/PK-980");
  await expect(page.locator(".ph-h .tag")).toHaveText("Retirée");
});

test("produit : refus du formulaire incomplet, envoi en modération", async ({ page }) => {
  await asSeller(page);
  await page.goto("/seller/products/new");
  await page.getByRole("button", { name: "Envoyer en modération" }).click();
  await expect(page.locator(".pf-main [role=alert]")).toHaveText("Ajoutez un titre.");
  await page.getByLabel("Titre du produit *").fill("Tote bag Lakay");
  await page.getByLabel("Sous-catégorie *").selectOption({ index: 1 });
  await page.getByLabel("Prix de vente (HTG) *").fill("1500");
  await page.locator(".pf-add input[type=file]").setInputFiles({ name: "a.png", mimeType: "image/png", buffer: Buffer.from("x") });
  await page.getByLabel("Stock modèle unique").fill("4");
  await page.getByRole("button", { name: "Envoyer en modération" }).click();
  await expect(page).toHaveURL(/\/seller\/products$/, NAV);
  // en modération, puis approuvé par la modération simulée (6 s) : la ligne existe dans « Tous »
  await expect(page.locator("tr", { hasText: "Tote bag Lakay" })).toBeVisible();
});

test("litige : remboursement partiel borné, puis contestation", async ({ page }) => {
  await asSeller(page);
  await page.goto("/seller/disputes/LT-225");
  await page.getByLabel("Montant du remboursement partiel (HTG)").fill("99999999");
  await page.getByRole("button", { name: "Proposer" }).click();
  await expect(page.getByRole("status")).toContainText("Montant invalide");
  await page.getByRole("button", { name: /Contester/ }).click();
  await expect(page.locator(".ph-h .tag")).toHaveText("Transmis à Prélakay");
});

test("retrait de fonds : moyen de retrait puis demande", async ({ page }) => {
  await asSeller(page);
  await page.goto("/seller/payouts");
  await expect(page.getByRole("button", { name: "Demander le retrait" })).toBeDisabled();
  await page.getByRole("button", { name: "Ajouter un moyen de retrait" }).click();
  await page.getByLabel("Numéro de téléphone ou de compte").fill("37123456");
  await page.getByRole("button", { name: "Enregistrer" }).click();
  await page.getByLabel("Montant (HTG)").fill("1000");
  await page.getByRole("button", { name: "Demander le retrait" }).click();
  await expect(page.locator("td", { hasText: "MonCash •••• 3456" })).toBeVisible();
});

test("statistiques : des graphiques Nivo dans chaque onglet, avec leur tableau", async ({ page }) => {
  await asSeller(page);
  await page.goto("/seller/stats", NAV);
  // l'onglet Produits n'a que des classements (barres HTML) et des jauges : pas de tracé Nivo
  for (const t of ["Ventes", "Trafic", "Acheteurs", "Opérations"]) {
    await page.locator(".vz-tabs").getByRole("button", { name: t, exact: true }).click();
    const chart = page.locator(".vz-nv").first();
    await expect(chart, t).toBeVisible();
    await expect(chart.locator("svg").first(), t).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText("Voir les données").first(), t).toBeVisible();
  }
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});

test("livraison : préparer puis remettre au livreur, onglet Livraisons", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() =>
    localStorage.setItem(
      "pk-demo-v1",
      JSON.stringify({
        introDone: true, kyc: "ok",
        orders: [{ id: "PK-2001", store: "boutik-lakay", items: [{ p: "mode-0", v: "Taille M", q: 1 }], status: "received", date: "6 nov. 2026", total: 3250, mode: "delivery", addr: { zone: "Bergeaud", mark: "près de l'église", phone: "37123456" }, fee: 200 }],
      }),
    ),
  );
  await page.goto("/seller/orders?tab=delivery", NAV);
  await expect(page.getByText("PK-2001").first()).toBeVisible();
  await page.goto("/seller/orders/PK-2001", NAV);
  await expect(page.getByText(/Livraison à Bergeaud/)).toBeVisible();
  await page.getByRole("button", { name: "Commencer la préparation" }).click();
  await expect(page.getByRole("button", { name: "Marquer prête pour retrait" })).toHaveCount(0);
  await page.getByRole("button", { name: "Remettre au livreur" }).click();
  await expect(page.locator(".ph-h .tag")).toHaveText("Remise au livreur");
  await expect(page.getByText(/Remise au livreur · /)).toBeVisible();
});

test("employés : inviter un employé, il apparaît dans le profil du store", async ({ page }) => {
  await asSeller(page);
  await page.goto("/seller/staff", NAV);
  await page.getByLabel("Nom").fill("Rose Michel");
  await page.getByLabel("Téléphone").fill("3712 3456");
  await page.getByRole("button", { name: "Envoyer l'invitation par SMS" }).click();
  await expect(page.getByText("Rose Michel")).toBeVisible();
  await page.goto("/seller/store", NAV);
  await expect(page.getByText("Rose Michel")).toBeVisible();
});
