import type { KnipConfig } from "knip";

export default {
  workspaces: {
    ".": {
      entry: ["taze.config.ts"],
    },
    "apps/web": {
      entry: ["src/routes/**/*.ts"],
      vite: {
        config: [],
        entry: ["vite.config.ts"],
      },
    },
    "packages/db": {
      entry: ["kysely-codegen.config.cjs"],
      // kysely-codegen exports every table's type; only `DB` is used
      ignore: ["src/generated/**"],
      drizzle: {
        config: [],
        entry: ["drizzle.config.ts", "src/schema/index.ts"],
      },
    },
  },
} satisfies KnipConfig;
