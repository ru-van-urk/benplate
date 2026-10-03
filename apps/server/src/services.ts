import { createDb } from "@benplate/db";

import { ENV } from "./env";
import { log } from "./logger";

export const db = createDb(ENV, {
  onError: (error) => {
    log.error("db", `Idle Postgres client error: ${error.message}`);
  },
});
