import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

// Next.js 16 : `next lint` n'existe plus, ESLint s'appelle directement avec une
// configuration « flat ». Remplace .eslintrc.json (extends next/core-web-vitals).
export default defineConfig([
  ...nextVitals,
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
