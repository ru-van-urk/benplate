import { migrateDb } from "@maribor/db/migrate";

import { db } from "./services";

// Run by the one-off `migrate` Compose service before the server starts; a failure exits non-zero,
// so the server stays down instead of running against an outdated schema
await migrateDb(db);
await db.$client.end();

console.log("Migrations applied");
