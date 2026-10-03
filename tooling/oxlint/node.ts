import { defineConfig } from "oxlint";

import base from "@benplate/oxlint-config/base";

export default defineConfig({
  extends: [base],
  plugins: ["node"],
  rules: {
    // Read env through one validated module per package instead (apps/server/src/env.ts)
    "node/no-process-env": "error",
  },
});
