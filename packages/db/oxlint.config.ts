import node from "@maribor/oxlint-config/node";
import { defineConfig } from "oxlint";

export default defineConfig({
  extends: [node],
  rules: {
    "no-restricted-imports": [
      "error",
      {
        paths: [
          {
            name: "drizzle-orm/pg-core",
            importNames: ["pgTable"],
            message:
              "Use snakeCase.table so columns are snake_case, matching Kysely's CamelCasePlugin",
          },
        ],
      },
    ],
  },
  overrides: [
    {
      // drizzle-kit runs outside the server, so it reads DATABASE_URL itself
      files: ["drizzle.config.ts"],
      rules: { "node/no-process-env": "off" },
    },
  ],
});
