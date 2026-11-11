import { test, expect } from "@playwright/test";

// Parcours Click & Collect de démonstration : fiche produit → panier → paiement → confirmation.
test("achat de bout en bout (démo)", async ({ page, isMobile }, info) => {
  // intro de première visite déjà vue
  await page.goto("/");
  await page.evaluate(() => localStorage.setItem("pk-demo-v1", JSON.stringify({ introDone: true })));
  await page.goto("/p/tech-1");
  await expect(page.getByRole("heading", { level: 1, name: "Chargeur rapide 20 W" })).toBeVisible();
  const add = info.project.name.startsWith("mobile") || info.project.name.startsWith("tablet") ? page.locator("#mbuy .btn-s") : page.locator(".buy .btn-o");
  await add.click();
  // tri des toasts (spec §9) : pas de toast, le bouton et le badge du panier réagissent
  await expect(add).toContainText("Ajouté");
  await expect(page.locator(".cnt").locator("visible=true").first()).toHaveText("1");
  await expect(page.getByRole("status").filter({ hasText: "Ajouté au panier" })).toHaveCount(0);

  await page.goto("/cart");
  // desktop : titre h1 ; mobile : titre de la barre du haut (comme le prototype)
  await expect(page.getByText("Panier (1)").locator("visible=true").first()).toBeVisible();
  await page.goto("/checkout");
  await expect(page.getByText("Retrait chez Tech Sud")).toBeVisible();
  const pay = info.project.name.startsWith("mobile") || info.project.name.startsWith("tablet") ? page.locator("#mbar").getByRole("button", { name: "Payer" }) : page.locator("aside.sum").getByRole("button", { name: /^Payer/ });
  await pay.click();
  // première compilation de /done/[ids] en dev : délai plus long sous charge parallèle
  await expect(page).toHaveURL(/\/done\/PK-1043$/, { timeout: 30_000 });
  await expect(page.getByRole("heading", { name: "Commande reçue" })).toBeVisible();
  void isMobile;
});

test("visiteur : le panier demande la connexion et y revient", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.setItem("pk-demo-v1", JSON.stringify({ logged: false })));
  await page.goto("/cart");
  await expect(page.getByText("Connectez-vous pour continuer")).toBeVisible();
  await expect(page.getByRole("link", { name: "Se connecter" }).last()).toHaveAttribute("href", "/login?next=%2Fcart");
});

test("livraison : payer en livraison, suivre la commande, valider le code", async ({ page }, info) => {
  test.setTimeout(120_000);
  const mob = info.project.name.startsWith("mobile") || info.project.name.startsWith("tablet");
  await page.goto("/");
  await page.evaluate(() => localStorage.setItem("pk-demo-v1", JSON.stringify({ introDone: true })));
  await page.goto("/p/tech-1");
  await (mob ? page.locator("#mbuy .btn-s") : page.locator(".buy .btn-o")).click();
  await page.goto("/checkout");
  await page.getByRole("button", { name: /Livraison à domicile/ }).click();
  await expect(page.getByText("Adresse de livraison")).toBeVisible();
  await page.getByLabel("Quartier").selectOption("Bergeaud");
  // sans repère ni téléphone : erreur sous le champ, pas de paiement
  const pay = mob ? page.locator("#mbar").getByRole("button", { name: "Payer" }) : page.locator("aside.sum").getByRole("button", { name: /^Payer/ });
  await pay.click();
  await expect(page.getByRole("alert").filter({ hasText: "Indiquez l'adresse de livraison." })).toBeVisible();
  await page.getByLabel("Repère").fill("près de l'église");
  await page.getByLabel("Téléphone pour le livreur").fill("3712 3456");
  if (!mob) await expect(page.locator("aside.sum")).toContainText("Livraison");
  await pay.click();
  await expect(page).toHaveURL(/\/done\/PK-1043$/, { timeout: 30_000 });
  // le livreur est en route (simulation avancée) : le code s'affiche, le bon code termine la livraison
  await page.evaluate(() => {
    const s = JSON.parse(localStorage.getItem("pk-demo-v1")!);
    const o = s.orders.find((x: { id: string }) => x.id === "PK-1043");
    Object.assign(o, { status: "enroute", code: "246810", track: 60, driver: { n: "Wilner Joseph", tel: "3712 4410" } });
    localStorage.setItem("pk-demo-v1", JSON.stringify(s));
  });
  await page.goto("/orders/PK-1043");
  await expect(page.getByText("Votre commande est en route")).toBeVisible();
  await expect(page.getByLabel("Code de livraison")).toContainText("246 810");
  await expect(page.getByText("Bergeaud").first()).toBeVisible();
  await page.getByLabel("Code saisi par le livreur").fill("111111");
  await page.getByRole("button", { name: "Valider la livraison" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Code incorrect." })).toBeVisible();
  await page.getByLabel("Code saisi par le livreur").fill("246810");
  await page.getByRole("button", { name: "Valider la livraison" }).click();
  await expect(page.getByText(/Livrée le/)).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});
