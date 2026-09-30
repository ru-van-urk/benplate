import { fileURLToPath } from "node:url";

import { migrate } from "drizzle-orm/libsql/migrator";

import type { Database } from "./index";

// Resolved next to this module; bundlers that inline this package must copy `migrations` next to their output
const migrationsFolder = fileURLToPath(new URL("./migrations", import.meta.url));

export async function migrateDb(db: Database) {
  await migrate(db, { migrationsFolder });
}
