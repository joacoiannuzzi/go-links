// Biome (via Ultracite) handles formatting and general linting.
// ESLint is kept only for type-aware rules that Biome cannot check.
import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig([
  {
    extends: [tseslint.configs.strictTypeChecked],
    files: ["src/**/*.ts", "src/**/*.tsx"],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // No escape hatches: every value is typed by inference, a schema or a type guard.
      "@typescript-eslint/consistent-type-assertions": [
        "error",
        { assertionStyle: "never" },
      ],
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { fixStyle: "inline-type-imports" },
      ],
      "@typescript-eslint/explicit-module-boundary-types": "error",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-non-null-assertion": "error",
      "@typescript-eslint/no-unsafe-type-assertion": "error",
      "@typescript-eslint/strict-boolean-expressions": "error",
      "@typescript-eslint/switch-exhaustiveness-check": "error",
    },
  },
  {
    // Server actions must be async even when nothing inside awaits.
    files: ["src/app/actions.ts"],
    rules: { "@typescript-eslint/require-await": "off" },
  },
  globalIgnores([".next/**"]),
]);
