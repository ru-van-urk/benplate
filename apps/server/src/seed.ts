import { seedDb } from "@benplate/db/seed";

import { getDatabaseEnv } from "./env";
import { log } from "./logger";

// Inserts the example data: `pnpm db:seed` locally, `pnpm docker:seed` for the Compose stack
await seedDb(getDatabaseEnv());

log.info("seed", "Example data inserted");
