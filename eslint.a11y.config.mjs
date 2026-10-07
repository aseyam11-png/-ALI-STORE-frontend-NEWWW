import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import jsxA11y from "eslint-plugin-jsx-a11y";

export default defineConfig([
  ...nextVitals,
  ...nextTypescript,
  { files: ["**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}"], ...jsxA11y.flatConfigs.recommended },
  globalIgnores([".next/**", "node_modules/**", "coverage/**", "out/**", "artifacts/**"]),
]);
