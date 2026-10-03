import { createDb } from "@benplate/db";

import { ENV } from "./env";

export const db = createDb(ENV);
