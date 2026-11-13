import { test, expect } from "@playwright/test";

// Toutes les pages et sous-pages de l'Acheteur (02-app-flow §6, plan §2.2).
const ROUTES = [
  "/", "/discover", "/discover?cat=mode", "/search?q=caf%C3%A9", "/map", "/categories", "/categories?c=tech",
  "/p/mode-0", "/p/mode-0/reviews", "/store/bel-soley", "/store/bel-soley/products", "/store/bel-soley/top",
  "/store/bel-soley/new", "/store/bel-soley/reviews", "/store/bel-soley/about", "/store/bel-soley/promos", "/cart", "/checkout", "/shared/lili_cayes",
  "/orders", "/orders/PK-1042", "/orders/PK-1021", "/wallet", "/wallet?tab=hist", "/coins", "/wishlist", "/account", "/account/coupons", "/events/EV-01", "/invite", "/plus", "/ambassadeurs",
  "/sell", "/notifications", "/settings", "/settings/profil", "/settings/secu", "/settings/notifs", "/settings/lang",
  "/settings/ville", "/settings/privacy", "/viewed", "/disputes", "/myreviews", "/help", "/help/0", "/help?q=wallet",
  "/login", "/signup", "/legal", "/legal/conditions", "/legal/confidentialite", "/legal/mentions", "/credits", "/partenaires/paiement", "/partenaires/livraison",
];

test("chaque route de l'Acheteur s'affiche, sans débordement, sans erreur, sans « escrow »", async ({ page }) => {
  test.setTimeout(240_000);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error" && !/Download the React DevTools/.test(m.text())) errors.push(m.text().slice(0, 200));
  });
  await page.goto("/");
  await page.evaluate(() => localStorage.setItem("pk-demo-v1", JSON.stringify({})));
  for (const r of ROUTES) {
    await page.goto(r);
    // /map avec une clé MapTiler : la vraie carte charge des tuiles en continu, le réseau
    // n'est jamais au repos — on attend la carte (ou le plan de repérage) elle-même.
    if (r === "/map") await expect(page.locator(".mlmap, .map").first()).toBeVisible();
    else await page.waitForLoadState("networkidle");
    await expect(page.locator("main#app"), r).toBeVisible();
    await expect(page.getByText("Cette page s'est perdue en chemin"), r).toHaveCount(0);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, `débordement horizontal sur ${r}`).toBeLessThanOrEqual(0);
    const text = (await page.locator("body").innerText()).toLowerCase();
    expect(text.includes("escrow"), `« escrow » visible sur ${r}`).toBe(false);
  }
  expect(errors, errors.join("\n")).toEqual([]);
});
