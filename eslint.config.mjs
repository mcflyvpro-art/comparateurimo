import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Sorties de build de vérification, jetables.
    ".next-verif/**",
    // Prototypes/références hors application (non lintés).
    // Sans ces exclusions, `npm run lint` sort 1111 avertissements dont aucun
    // ne vient de `src/` : le signal utile devient introuvable dans le bruit.
    "simulateur-esio.jsx",
    "speedy-io-html/**",
    "firecrawl-crawl/**",
    "graphify-out/**",
    "proto/**",
    "public/proto/**",
    "animation-estio/**",
    // Bundles MapLibre minifiés, servis tels quels depuis `public/`.
    "public/maplibre-gl-*.mjs",
  ]),
]);

export default eslintConfig;
