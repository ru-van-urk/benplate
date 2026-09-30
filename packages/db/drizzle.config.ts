import { existsSync } from "node:fs";

import { defineConfig } from "drizzle-kit";
import * as v from "valibot";

// The server app owns DATABASE_URL; an already-set env var (CI, Docker) takes precedence.
const serverEnvFile = "../../apps/server/.env";
if (existsSync(serverEnvFile)) {
  process.loadEnvFile(serverEnvFile);
}

export default defineConfig({
  schema: "./src/schema/index.ts",
  out: "./src/migrations",
  dialect: "turso",
  dbCredentials: {
    url: v.parse(v.pipe(v.string(), v.nonEmpty()), process.env.DATABASE_URL),
  },
});
