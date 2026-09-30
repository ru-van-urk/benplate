import { createDb } from "@maribor/db";

import { ENV } from "./env";

export const db = createDb(ENV);
