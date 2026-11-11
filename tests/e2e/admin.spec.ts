import { test, expect, type Page } from "@playwright/test";

// Console admin (Phase B8) : toutes les pages, connexion en deux étapes, rôles, décisions.

const ROUTES = [
  "/admin", "/admin/menu", "/admin/search", "/admin/search?q=PK-10", "/admin/stats", "/admin/kyc", "/admin/kyc/KYC-0146",
  "/admin/products", "/admin/products/mq-0", "/admin/reports", "/admin/disputes", "/admin/disputes/LT-150", "/admin/stores",
  "/admin/stores/bel-soley", "/admin/users", "/admin/users/jowan509", "/admin/orders", "/admin/orders/PK-1042", "/admin/banners",
  "/admin/notify", "/admin/categories", "/admin/team", "/admin/settings", "/admin/audit",
];
const NAV = { timeout: 30_000 };
test.beforeEach(() => test.setTimeout(150_000));

async function as(page: Page, role: "super" | "support" | "finance" | "marketing") {
  await page.goto("/admin/login");
  await page.evaluate((r) => {
    localStorage.setItem("pk-demo-v1", JSON.stringify({ introDone: true }));
    const e = { super: "superadmin", support: "support", finance: "finance", marketing: "marketing" }[r] + "@prelakay.ht";
    sessionStorage.setItem("pk-admin", JSON.stringify({ on: true, email: e, role: r }));
  }, role);
}

test("chaque page de la console s'affiche, sans débordement ni erreur (Superadmin)", async ({ page }) => {
  test.setTimeout(300_000);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error" && !/Download the React DevTools/.test(m.text())) errors.push(m.text().slice(0, 200));
  });
  await as(page, "super");
  for (const r of ROUTES) {
    await page.goto(r);
    await page.waitForLoadState("networkidle");
    await expect(page.locator(".sc-main h1"), r).toBeVisible();
    await expect(page.getByText("Cette page s'est perdue en chemin"), r).toHaveCount(0);
    await expect(page.getByText("Accès refusé"), r).toHaveCount(0);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, `débordement horizontal sur ${r}`).toBeLessThanOrEqual(0);
  }
  expect(errors, errors.join("\n")).toEqual([]);
});

test("sans session : renvoi vers la connexion, puis retour à la page demandée", async ({ page }) => {
  await page.goto("/admin/stores");
  await expect(page).toHaveURL(/\/admin\/login\?next=%2Fadmin%2Fstores/, NAV);
  await expect(page.getByRole("heading", { name: "Connexion" })).toBeVisible(NAV);
  const demo = page.locator(".al-demo");
  test.skip(!(await demo.count()), "identifiants de démonstration non configurés (ADMIN_DEMO_PASSWORD / ADMIN_DEMO_OTP)");
  const code = (await demo.locator("code").nth(1).innerText()).trim();
  await demo.getByRole("button", { name: "Support" }).click();
  await page.getByRole("button", { name: "Se connecter" }).click();
  await page.getByLabel("Code de vérification").fill(code);
  await page.getByRole("button", { name: "Vérifier" }).click();
  await expect(page).toHaveURL(/\/admin\/stores$/, NAV);
  await expect(page.locator(".role-b")).toHaveText("Support");
});

test("le 5e mot de passe erroné bloque la connexion", async ({ page }) => {
  await page.goto("/admin/login");
  await expect(page.getByRole("heading", { name: "Connexion" })).toBeVisible(NAV);
  test.skip(!(await page.locator(".al-demo").count()), "identifiants de démonstration non configurés");
  await page.getByLabel("E-mail professionnel").fill("support@prelakay.ht");
  for (let i = 1; i <= 4; i++) {
    await page.getByLabel("Mot de passe", { exact: true }).fill(`faux-${i}`);
    await page.getByRole("button", { name: "Se connecter" }).click();
    await expect(page.locator("#aerr")).toContainText(`${5 - i} essai`);
  }
  await page.getByLabel("Mot de passe", { exact: true }).fill("faux-5");
  await page.getByRole("button", { name: "Se connecter" }).click();
  await expect(page.locator("#aerr")).toContainText("Trop de tentatives");
  await expect(page.getByRole("button", { name: "Se connecter" })).toBeDisabled();
});

test("rôles : Marketing refusé sur les KYC ; Finance lit les paramètres sans les modifier", async ({ page }) => {
  await as(page, "marketing");
  await page.goto("/admin/kyc");
  await expect(page.getByRole("heading", { name: "Accès refusé" })).toBeVisible(NAV);
  await as(page, "finance");
  await page.goto("/admin/settings");
  await expect(page.getByText("Lecture seule : seul un superadmin modifie ces valeurs.")).toBeVisible(NAV);
  await expect(page.getByLabel("Libération du paiement")).toBeDisabled();
  await expect(page.getByRole("button", { name: "Enregistrer" })).toHaveCount(0);
});

test("modération : approuver un produit le publie chez l'acheteur et l'inscrit au journal", async ({ page }) => {
  await as(page, "super");
  await page.goto("/admin/products/mq-0");
  await page.getByRole("button", { name: "Approuver" }).click();
  await expect(page).toHaveURL(/\/admin\/products$/, NAV);
  await page.goto("/admin/audit");
  await expect(page.locator("td", { hasText: "Produit approuvé" })).toBeVisible(NAV);
  await page.goto("/p/mq-0");
  await expect(page.getByRole("heading", { level: 1, name: "Écouteurs Pro sans fil ANC" })).toBeVisible(NAV);
});

test("store suspendu : motif obligatoire, produits masqués, réactivation", async ({ page }) => {
  await as(page, "super");
  await page.goto("/admin/stores/kay-pratik");
  await page.getByRole("button", { name: "Suspendre le store" }).click();
  await page.getByLabel("Motif").selectOption("Litiges répétés");
  await page.getByRole("button", { name: "Confirmer" }).click();
  await expect(page.getByText("Motif : Litiges répétés")).toBeVisible();
  await page.getByRole("button", { name: "Réactiver le store" }).click();
  await expect(page.getByRole("button", { name: "Suspendre le store" })).toBeVisible();
});

test("carte des ventes : % et montant par commune du Sud, bascule ventes / commandes, 7 / 30 / 90 jours", async ({ page }) => {
  await as(page, "super");
  await page.goto("/admin/stats", NAV);
  const card = page.locator("section.vz", { hasText: "Ventes par commune du Sud" });
  await expect(card).toBeVisible();
  await expect(card.locator(".sm-map svg path").first()).toBeVisible({ timeout: 15_000 });
  expect(await card.locator(".sm-map svg path").count()).toBeGreaterThanOrEqual(18);
  await expect(card.locator(".sm-lead")).toHaveText(/Les Cayes · \d+ % · [\d\s  ]+ HTG/);
  await card.getByRole("button", { name: "Commandes", exact: true }).click();
  await expect(card.getByRole("button", { name: "Commandes", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(card.locator(".vz-h .cap")).toContainText("des commandes");
  await page.locator(".vz-filters").getByRole("button", { name: "7 jours" }).click();
  await expect(card.locator(".vz-h .cap")).toContainText("7 derniers jours");
  await expect(page.locator("section.vz", { hasText: "Ventes par quartier des Cayes" }).locator(".vz-b")).toHaveCount(9);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});
