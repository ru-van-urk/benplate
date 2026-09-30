import { defineConfig } from "oxlint";

export default defineConfig({
  plugins: ["eslint", "unicorn", "typescript", "oxc", "import"],
  categories: {
    correctness: "error",
  },
  options: { typeAware: true, reportUnusedDisableDirectives: "error", maxWarnings: 0 },
  rules: {
    "no-unused-vars": [
      "warn",
      { varsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_", argsIgnorePattern: "^_" },
    ],

    "typescript/consistent-type-imports": [
      "warn",
      { prefer: "type-imports", fixStyle: "inline-type-imports" },
    ],
    "typescript/no-misused-promises": ["error", { checksVoidReturn: { attributes: false } }],
  },
  env: {
    builtin: true,
  },
});
