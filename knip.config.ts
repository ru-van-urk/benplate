import type { KnipConfig } from "knip";

export default {
  ignoreBinaries: ["turso"],
  workspaces: {
    ".": {
      entry: ["taze.config.ts"],
    },
    "apps/web": {
      entry: ["src/routes/**/*.tsx"],
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
