import { defineConfig, devices } from "@playwright/test";

// Parcours navigateur. Deux largeurs de référence : 360 px (CLAUDE.md « Mobile
// partout ») et desktop (conteneur 1240 px, 03-design §9.1).
// Par défaut, les parcours tournent sur un build de production servi en mode démo (port 3100) :
// le serveur de dev compile chaque page à la demande et sature quand 4 largeurs tournent en
// parallèle (dépassements de délai sans rapport avec le code). PW_DEV=1 : serveur de dev (3000).
const DEV = !!process.env.PW_DEV;
const PORT = DEV ? 3000 : 3100;

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  workers: 4,
  retries: 0,
  reporter: [["list"]],
  use: { baseURL: `http://localhost:${PORT}`, trace: "retain-on-failure" },
  webServer: {
    command: DEV ? "npm run dev" : `npm run build && npm run start -- -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: true,
    timeout: 400_000,
    env: DEV ? {} : { PRELAKAY_ENV: "demo" },
  },
  projects: [
    {
      name: "mobile-360",
      use: { ...devices["Desktop Chrome"], viewport: { width: 360, height: 740 }, isMobile: false, hasTouch: true },
    },
    {
      name: "mobile-390",
      use: { ...devices["Desktop Chrome"], viewport: { width: 390, height: 844 }, isMobile: false, hasTouch: true },
    },
    {
      name: "tablet-768",
      use: { ...devices["Desktop Chrome"], viewport: { width: 768, height: 1024 } },
    },
    {
      name: "desktop-1240",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 } },
    },
  ],
});
