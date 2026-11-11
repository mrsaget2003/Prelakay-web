import { test, expect } from "@playwright/test";

// Parité de comportement avec `prototype/prelakay-prototype.html` (audit du 11 nov. 2026).
// Chaque test reprend un écart relevé entre le prototype et l'application.

async function demo(page: import("@playwright/test").Page, state: Record<string, unknown>) {
  await page.goto("/");
  await page.evaluate((s) => localStorage.setItem("pk-demo-v1", JSON.stringify(s)), { introDone: true, ...state });
}

test("panier → wishlist : l'article déplacé est annoncé (prototype : « Déplacé dans la wishlist »)", async ({ page }) => {
  await demo(page, {});
  await page.goto("/p/tech-1");
  await page.locator(".buy .btn-o, #mbuy .btn-s").first().click();
  await page.goto("/cart");
  await page.getByRole("button", { name: "Déplacer dans la wishlist" }).first().click();
  // les toasts Sileo sont doublés par une zone « role=status » masquée visuellement
  await expect(page.getByRole("status")).toContainText("Déplacé dans la wishlist");
  await page.goto("/wishlist");
  await expect(page.locator(".pc").first()).toBeVisible();
});

test("aperçu rapide ouvert depuis le panier : « Panier mis à jour » (le résultat est caché derrière la fenêtre)", async ({ page }) => {
  await demo(page, {});
  await page.goto("/p/mode-0");
  await page.locator(".buy .btn-o, #mbuy .btn-s").first().click();
  await page.goto("/cart");
  await page.locator(".vchip").first().click();
  await page.getByRole("button", { name: "Mettre à jour" }).locator("visible=true").click();
  await expect(page.getByRole("status")).toContainText("Panier mis à jour");
});

test("carte de commande : « Suivre la commande », comme le prototype", async ({ page }) => {
  await demo(page, {});
  await page.goto("/orders");
  await expect(page.getByRole("link", { name: "Suivre la commande" }).first()).toBeVisible();
});

test("store suspendu par un admin : sa page dit qu'il est indisponible", async ({ page }) => {
  await demo(page, { admin: { stores: { "bel-soley": { suspended: true, why: "Produits non conformes" } } } });
  await page.goto("/store/bel-soley");
  await expect(page.getByText("Ce store est temporairement indisponible")).toBeVisible();
  await expect(page.getByText("Ses produits ne sont plus en vente pour le moment.")).toBeVisible();
  await expect(page.locator(".pc")).toHaveCount(0);
});
