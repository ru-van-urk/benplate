import { existsSync } from "node:fs";

import { defineConfig } from "drizzle-kit";
import { z } from "zod";

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
    url: z.string().min(1).parse(process.env.DATABASE_URL),
  },
});
