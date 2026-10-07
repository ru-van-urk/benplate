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
      drizzle: {
        config: [],
        entry: ["drizzle.config.ts", "src/schema/index.ts"],
      },
    },
  },
} satisfies KnipConfig;
