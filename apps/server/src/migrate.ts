import { migrateDb } from "@benplate/db/migrate";

import { ENV } from "./env";
import { log } from "./logger";

// Run by the one-off `migrate` Compose service before the server starts; a failure exits non-zero,
// so the server stays down instead of running against an outdated schema
await migrateDb(ENV);

log.info("migrate", "Migrations applied");
