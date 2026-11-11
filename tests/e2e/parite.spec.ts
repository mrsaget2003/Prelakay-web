import { test, expect, type Page } from "@playwright/test";

// Parité de comportement avec `prototype/prelakay-prototype.html` (audit du 11 nov. 2026).
// Chaque test reprend un écart relevé entre le prototype et l'application.

async function demo(page: Page, state: Record<string, unknown>) {
  await page.goto("/");
  await page.evaluate((s) => localStorage.setItem("pk-demo-v1", JSON.stringify(s)), { ...state });
}

/** Ajoute un produit au panier par l'interface, et attend que le clic ait pris :
 *  le bouton affiche « Ajouté » (tri des toasts, spec §9). Sans cette attente, un clic
 *  passé avant l'hydratation laisse le panier vide. */
async function addToCart(page: Page, id: string) {
  await page.goto(`/p/${id}`);
  const add = page.locator(".buy .btn-o, #mbuy .btn-s").locator("visible=true").first();
  await expect(add).toBeVisible();
  await add.click();
  await expect(add).toContainText("Ajouté");
}

test("panier → wishlist : l'article déplacé est annoncé (prototype : « Déplacé dans la wishlist »)", async ({ page }) => {
  await demo(page, {});
  await addToCart(page, "tech-1");
  await page.goto("/cart");
  await page.getByRole("button", { name: "Déplacer dans la wishlist" }).first().click();
  // les toasts Sileo sont doublés par une zone « role=status » masquée visuellement
  await expect(page.getByRole("status")).toContainText("Déplacé dans la wishlist");
  await page.goto("/wishlist");
  await expect(page.locator(".pc").first()).toBeVisible();
});

test("aperçu rapide ouvert depuis le panier : « Panier mis à jour » (le résultat est caché derrière la fenêtre)", async ({ page }) => {
  await demo(page, {});
  await addToCart(page, "mode-0");
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

// Carte des stores (11 nov. 2026) : MapLibre sur fond MapTiler quand la clé est
// configurée, plan de repérage sinon. Les parcours tournent sans clé.
test("carte des stores : sans clé MapTiler, le plan de repérage reste utilisable", async ({ page }) => {
  await demo(page, {});
  await page.goto("/map");
  const pins = page.locator(".map button.pin:not(.me)");
  await expect(pins.first()).toBeVisible();
  await pins.first().click();
  await expect(page.locator(".srow.on")).toHaveCount(1);
  await expect(page.locator(".map .note")).toContainText("NEXT_PUBLIC_MAPTILER_KEY");
});

// Le prix de l'offre flash doit être le même au rendu serveur et après hydratation :
// il part du prix catalogue, jamais du prix déjà remisé.
test("offre flash : même prix avant et après hydratation (pas d'erreur de rendu)", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await demo(page, {});
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  expect(errors.filter((e) => /Hydration/i.test(e)), errors.join("\n")).toEqual([]);
});
