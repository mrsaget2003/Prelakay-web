import { test, expect } from "@playwright/test";

// Parcours Click & Collect de démonstration : fiche produit → panier → paiement → confirmation.
test("achat de bout en bout (démo)", async ({ page, isMobile }, info) => {
  // intro de première visite déjà vue
  await page.goto("/");
  await page.evaluate(() => localStorage.setItem("pk-demo-v1", JSON.stringify({ introDone: true })));
  await page.goto("/p/tech-1");
  await expect(page.getByRole("heading", { level: 1, name: "Chargeur rapide 20 W" })).toBeVisible();
  const add = info.project.name === "mobile-360" ? page.locator("#mbuy").getByRole("button", { name: "Au panier" }) : page.locator(".buy").getByRole("button", { name: "Ajouter au panier" });
  await add.click();
  await expect(page.getByRole("status")).toContainText("Ajouté au panier");

  await page.goto("/cart");
  // desktop : titre h1 ; mobile : titre de la barre du haut (comme le prototype)
  await expect(page.getByText("Panier (1)").locator("visible=true").first()).toBeVisible();
  await page.goto("/checkout");
  await expect(page.getByText("Retrait chez Tech Sud")).toBeVisible();
  const pay = info.project.name === "mobile-360" ? page.locator("#mbar").getByRole("button", { name: "Payer" }) : page.locator("aside.sum").getByRole("button", { name: /^Payer/ });
  await pay.click();
  await expect(page).toHaveURL(/\/done\/PK-1043$/);
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
