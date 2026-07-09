// Purpose: Configures ESLint for the Next.js App Router foundation.
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTypescript,
  globalIgnores([
    ".next/**",
    "dist/**",
    "node_modules/**",
    "next-env.d.ts",
    "output/chrome-cdp-profile*/**",
    "src/**",
  ]),
]);
