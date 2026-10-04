import { defineConfig } from "oxlint";

import base from "@benplate/oxlint-config/base";

export default defineConfig({
  extends: [base],
  plugins: ["react", "react-perf", "jsx-a11y"],
  rules: {
    "react-hooks/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { allowConstantExport: true }],
  },
});
