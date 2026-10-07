import { fileURLToPath } from "node:url";

import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";

import type { DatabaseConfig } from "./config";

// Resolved next to this module; bundlers that inline this package must copy `migrations` next to their output
const migrationsFolder = fileURLToPath(new URL("./migrations", import.meta.url));

// Applies all pending migrations in one transaction, so a failing migration leaves the database untouched.
// There is no lock: run it from a single process (the `migrate` Compose service), never per server replica.
// A short-lived connection of its own, closed when done; the server's pool comes from createDb (see ./index)
export async function migrateDb(env: DatabaseConfig) {
  const db = drizzle(env.DATABASE_URL);

  try {
    await migrate(db, { migrationsFolder });
  } finally {
    await db.$client.end();
  }
}
