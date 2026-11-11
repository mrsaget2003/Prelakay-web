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
  const addBtn = mob ? page.locator("#mbuy .btn-s") : page.locator(".buy .btn-o");
  await addBtn.click();
  await expect(addBtn).toContainText("Ajouté");
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

test("pied de page → Devenir partenaire de livraison → candidature reçue", async ({ page }, info) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.setItem("pk-demo-v1", JSON.stringify({ introDone: true })));
  // le pied de page n'existe que sur desktop (mobile : coque de l'app, comme le prototype)
  if (info.project.name.startsWith("desktop")) {
    await page.goto("/");
    await page.locator("footer").getByRole("link", { name: "Devenir partenaire de livraison" }).click();
  } else await page.goto("/partenaires/livraison");
  await expect(page).toHaveURL(/\/partenaires\/livraison$/);
  await expect(page.getByRole("heading", { level: 1, name: "Devenir partenaire de livraison" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Comment ça marche" })).toBeVisible();
  await page.getByRole("button", { name: "Déposer ma candidature" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Indiquez votre véhicule." })).toBeVisible();
  await page.getByLabel("Nom et prénom").fill("Wilfrid Augustin");
  await page.getByLabel("Téléphone").fill("3712 3456");
  await page.getByLabel("Date de naissance").fill("1998-04-12");
  await page.getByLabel("Véhicule").selectOption("moto");
  await page.getByRole("button", { name: /Ajouter ma pièce d'identité/ }).click();
  await page.getByRole("button", { name: "Déposer ma candidature" }).click();
  await expect(page.getByText("Candidature reçue")).toBeVisible();
  await expect(page.getByText(/PL-\d{4}/)).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});

test("coupons : le vendeur crée un coupon, l'acheteur le garde puis l'applique au paiement", async ({ page }, info) => {
  test.setTimeout(120_000);
  const mob = info.project.name.startsWith("mobile") || info.project.name.startsWith("tablet");
  await page.goto("/");
  await page.evaluate(() => localStorage.setItem("pk-demo-v1", JSON.stringify({ introDone: true, kyc: "ok" })));
  await page.goto("/seller/marketing/coupons");
  await page.getByLabel("Code (vide = généré)").fill("ROBE15");
  await page.getByLabel("Réduction (%)").fill("15");
  await page.getByRole("button", { name: "Publier le coupon" }).click();
  await expect(page.getByRole("cell", { name: "ROBE15" })).toBeVisible();
  // l'acheteur voit le coupon dans l'onglet Promos du store et le garde
  await page.goto("/store/boutik-lakay/promos");
  const card = page.locator(".cpn", { hasText: "ROBE15" });
  await card.getByRole("button", { name: "Garder" }).click();
  await expect(card.getByText("Gardé")).toBeVisible();
  await page.goto("/p/mode-0");
  const add = mob ? page.locator("#mbuy .btn-s") : page.locator(".buy .btn-o");
  await add.click();
  await expect(add).toContainText("Ajouté");
  await page.goto("/checkout");
  await page.getByLabel("Code promo").fill("FAUX00");
  await page.getByRole("button", { name: "Appliquer" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Code inconnu." })).toBeVisible();
  await page.getByLabel("Code promo").fill("ROBE15");
  await page.getByRole("button", { name: "Appliquer" }).click();
  await expect(page.getByText("Coupon ROBE15 appliqué")).toBeVisible();
  if (!mob) await expect(page.locator("aside.sum")).toContainText("Coupon ROBE15");
  await (mob ? page.locator("#mbar").getByRole("button", { name: "Payer" }) : page.locator("aside.sum").getByRole("button", { name: /^Payer/ })).click();
  await expect(page).toHaveURL(/\/done\//, { timeout: 30_000 });
});

test("Prélakay+ : s'abonner depuis le compte, badge or ; parrainage : lien et Coins", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.setItem("pk-demo-v1", JSON.stringify({ introDone: true })));
  await page.goto("/plus");
  await page.getByRole("button", { name: /S'abonner/ }).click();
  await expect(page.getByText("Badge or actif")).toBeVisible();
  await page.goto("/account");
  await expect(page.locator(".bdg", { hasText: "Prélakay+" }).first()).toBeVisible();
  await page.goto("/invite");
  await expect(page.getByLabel("Lien de parrainage")).toHaveValue("https://prelakay.com/r/marckarlin");
  await page.getByRole("button", { name: "Prototype : 1re commande" }).click();
  await expect(page.getByText("+500 Coins").last()).toBeVisible();
});

test("connexion par téléphone avec le code de démonstration", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.setItem("pk-demo-v1", JSON.stringify({ introDone: true, logged: false })));
  await page.goto("/login");
  await page.getByRole("button", { name: "Avec mon numéro de téléphone" }).click();
  await page.getByLabel("Numéro de téléphone", { exact: true }).fill("12");
  await page.getByRole("button", { name: "Recevoir le code par SMS" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Numéro haïtien à 8 chiffres." })).toBeVisible();
  await page.getByLabel("Numéro de téléphone", { exact: true }).fill("3712 3456");
  await page.getByRole("button", { name: "Recevoir le code par SMS" }).click();
  const code = (await page.locator(".info-box b.tnum").textContent())!.trim();
  await page.getByLabel("Code à 6 chiffres").fill("000001");
  await page.getByRole("dialog").getByRole("button", { name: "Continuer" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Code incorrect." })).toBeVisible();
  await page.getByLabel("Code à 6 chiffres").fill(code);
  await page.getByRole("dialog").getByRole("button", { name: "Continuer" }).click();
  await expect(page).toHaveURL(/\/$/);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("pk-demo-v1")!).logged)).toBe(true);
});
