import { defineConfig } from "oxlint";

import base from "@maribor/oxlint-config/base";

export default defineConfig({
  extends: [base],
  plugins: ["node"],
  env: {
    node: true,
  },
});
