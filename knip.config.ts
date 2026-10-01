import type { KnipConfig } from "knip";

export default {
  ignoreBinaries: ["turso"],
  workspaces: {
    ".": {
      entry: ["taze.config.ts"],
    },
    "apps/server": {
      // Never imported by the server's source, but the bundled @libsql/client imports this native module
      // at runtime, and tsdown leaves it external because it is listed here
      ignoreDependencies: ["libsql"],
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
