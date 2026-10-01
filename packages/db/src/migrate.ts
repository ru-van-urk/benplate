import { fileURLToPath } from "node:url";

import { migrate } from "drizzle-orm/node-postgres/migrator";

import type { Database } from "./index";

// Resolved next to this module; bundlers that inline this package must copy `migrations` next to their output
const migrationsFolder = fileURLToPath(new URL("./migrations", import.meta.url));

// Applies all pending migrations in one transaction, so a failing migration leaves the database untouched.
// There is no lock: run it from a single process (the `migrate` Compose service), never per server replica
export async function migrateDb(db: Database) {
  await migrate(db, { migrationsFolder });
}
