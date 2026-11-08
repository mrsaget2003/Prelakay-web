import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

// Next.js 16 : `next lint` n'existe plus, ESLint s'appelle directement avec une
// configuration « flat ». Remplace .eslintrc.json (extends next/core-web-vitals).
export default defineConfig([
  ...nextVitals,
  {
    // Icônes : toujours via <Icon name="…">, jamais une classe Font Awesome en dur
    // (passage à Iconly Pro mécanique, design-prelakay §4 — plan A4).
    files: ["app/**/*.{ts,tsx}", "components/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "Literal[value=/\\bfa-(solid|regular|brands)\\b/]",
          message: "Utilisez <Icon name=\"…\"> (lib/icons/registry.ts) au lieu d'une classe Font Awesome.",
        },
        {
          selector: "TemplateElement[value.raw=/\\bfa-(solid|regular|brands)\\b/]",
          message: "Utilisez <Icon name=\"…\"> (lib/icons/registry.ts) au lieu d'une classe Font Awesome.",
        },
      ],
    },
  },
  // Trois projets en un (plan §1.0) : un espace n'importe jamais les composants d'un autre.
  ...[
    ["shop", ["seller", "admin"]],
    ["seller", ["shop", "admin"]],
    ["admin", ["shop", "seller"]],
  ].map(([space, others]) => ({
    files: [`components/${space}/**/*.{ts,tsx}`],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: others.flatMap((o) => [
            { group: [`@/components/${o}/*`, `@/components/${o}`], message: `Un espace ne dépend pas de components/${o} : passez par components/ui ou lib/.` },
            { group: [`../${o}/*`, `../${o}`], message: `Un espace ne dépend pas de components/${o} : passez par components/ui ou lib/.` },
          ]),
        },
      ],
    },
  })),
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "public/sw*",
    "public/swe-worker*",
    "prototype/**",
    "test-results/**",
    "playwright-report/**",
  ]),
]);
