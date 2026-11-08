import { test, expect } from "@playwright/test";

// Sortie de Phase A (plan) : tokens, logos, icônes, composants, « À venir »,
// sans défilement horizontal à 360 px comme sur desktop.
test("style guide : logos, icônes, composants, « À venir », pas de débordement", async ({ page }) => {
  await page.goto("/style-guide");

  const logos = page.getByAltText("Prélakay");
  await expect(logos.first()).toBeVisible();
  expect(await logos.count()).toBeGreaterThanOrEqual(4);
  for (const src of ["full-logo-lagon.svg", "full-logo-white.svg", "secondary-logo-lagon.svg", "secondary-logo-white.svg"]) {
    await expect(page.locator(`img[src*="${src}"]`).first()).toBeAttached();
  }

  await expect(page.locator('[data-testid="icon-grid"] svg').first()).toBeVisible();
  expect(await page.locator('[data-testid="icon-grid"] [data-icon-name]').count()).toBeGreaterThanOrEqual(148);

  await page.getByRole("button", { name: /Mes coupons/ }).click();
  await expect(page.getByRole("status")).toHaveText(/À venir/);

  await page.getByRole("button", { name: "Ouvrir la modale" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});

test("une page d'une version future revient à l'accueil avec « À venir »", async ({ page }) => {
  await page.goto("/admin/events");
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("status")).toHaveText(/À venir/);
});
