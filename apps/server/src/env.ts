import * as v from "valibot";

import { log } from "./logger";

const envSchema = v.object({
  NODE_ENV: v.optional(v.picklist(["development", "production", "test"]), "development"),
  DATABASE_URL: v.pipe(v.string(), v.nonEmpty()),
  PORT: v.pipe(v.optional(v.string(), "3001"), v.toNumber(), v.integer(), v.minValue(1)),
});

const result = v.safeParse(envSchema, process.env);

if (!result.success) {
  log.error("env", `Invalid environment variables:\n${v.summarize(result.issues)}`);
  process.exit(1);
}

export const ENV = result.output;
