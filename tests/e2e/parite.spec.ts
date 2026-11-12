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
test("carte des stores : repères cliquables, avec la vraie carte (clé MapTiler) ou le plan de repérage", async ({ page }) => {
  await demo(page, {});
  await page.goto("/map");
  // pas de networkidle : avec la vraie carte, les tuiles arrivent en continu
  await expect(page.locator(".mlmap, .map").first()).toBeVisible();
  const real = page.locator(".mlmap");
  if (await real.count()) {
    // clé configurée : MapLibre, un bouton par store
    const pin = page.locator(".mlmap .mk-pin").first();
    await expect(pin).toBeVisible({ timeout: 15_000 });
    await pin.click({ force: true });
  } else {
    const pin = page.locator(".map button.pin:not(.me)").first();
    await expect(pin).toBeVisible();
    await pin.click();
    await expect(page.locator(".map .note")).toContainText("NEXT_PUBLIC_MAPTILER_KEY");
  }
  await expect(page.locator(".srow.on")).toHaveCount(1);
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

// Ambassadeurs étudiants (11 nov. 2026) : questionnaire de profil, auto-complétion des
// universités et des facultés depuis lib/data/facultes.json.
test("ambassadeurs : le questionnaire refuse un profil incomplet puis accepte la candidature", async ({ page }) => {
  await demo(page, {});
  await page.goto("/ambassadeurs");
  await page.waitForLoadState("networkidle"); // le clic doit tomber après l'hydratation
  const form = page.locator("form.pt-form");
  await form.getByRole("button", { name: "Envoyer ma candidature" }).click();
  await expect(page.getByText("Indiquez votre université.")).toBeVisible();

  await form.getByLabel("Université").fill("Université d'État d'Haïti");
  // la liste des facultés suit l'université saisie
  await expect(page.locator("#amb-facs option").first()).toHaveAttribute("value", /Faculté/);
  await form.getByLabel("Faculté ou filière").fill("Faculté des Sciences");
  await form.getByLabel("Année d'étude").selectOption("3e année");
  await form.getByLabel("Ville", { exact: true }).fill("Les Cayes");
  await form.getByLabel("Téléphone").fill("3712 3456");
  await form.getByLabel("Réseau où vous êtes le plus actif").selectOption("Aucun");
  await form.getByRole("button", { name: "4 à 8 h" }).click();
  await form.getByLabel("Pourquoi vous ?").fill("Je parle à beaucoup d'étudiants de ma promotion et je peux les aider à commander.");
  await form.getByRole("button", { name: "Envoyer ma candidature" }).click();

  await expect(page.getByText("Candidature reçue")).toBeVisible();
  await expect(page.getByText("Faculté des Sciences · Université d'État d'Haïti · 3e année · Les Cayes")).toBeVisible();
});

// Filtres de Discovery (12 nov. 2026) : sur mobile, la feuille « Filtres » et la colonne
// cachée partageaient les mêmes noms de groupe radio — le clic dans la feuille était annulé.
test("filtres : sur mobile, choisir une catégorie dans la feuille la coche et filtre", async ({ page }, info) => {
  test.skip(info.project.name.startsWith("desktop"), "la feuille « Filtres » est la vue mobile");
  await demo(page, {});
  await page.goto("/discover");
  await page.waitForLoadState("networkidle");
  await page.locator(".fbtn").first().click();
  const mode = page.locator(".modal .ck").filter({ hasText: /^Mode$/ });
  await mode.click();
  await expect(mode.locator("input")).toBeChecked();
  for (const [g, t] of [["Distance", "Moins de 1 km"], ["Note", "et plus"]] as const) {
    const opt = page.locator(".modal .ck").filter({ hasText: t }).first();
    if (await opt.count()) {
      await opt.click();
      await expect(opt.locator("input"), g).toBeChecked();
    }
  }
});
