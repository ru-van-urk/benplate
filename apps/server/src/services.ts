import { createDb } from "@maribor/db";

import { ENV } from "./env.server";

export const db = createDb(ENV);
