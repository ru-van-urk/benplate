import node from "@maribor/oxlint-config/node";
import { defineConfig } from "oxlint";

export default defineConfig({
  extends: [node],
  overrides: [
    {
      // The one module that reads and validates process.env; everything else imports ENV from it
      files: ["src/env.ts"],
      rules: { "node/no-process-env": "off" },
    },
  ],
});
