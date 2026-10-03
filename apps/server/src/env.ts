import * as v from "valibot";

import { log } from "./logger";

const databaseEnvSchema = v.object({
  DATABASE_URL: v.pipe(v.string(), v.nonEmpty()),
});

const serverEnvSchema = v.object({
  ...databaseEnvSchema.entries,
  NODE_ENV: v.optional(v.picklist(["development", "production", "test"]), "development"),
  PORT: v.pipe(v.optional(v.string(), "3001"), v.toNumber(), v.integer(), v.minValue(1)),
  // The public origin of the web app, which serves the API and auth under /api
  APP_URL: v.pipe(v.string(), v.url()),
  BETTER_AUTH_SECRET: v.pipe(v.string(), v.minLength(32)),
  AUTH_DISABLE_SIGNUP: v.pipe(
    v.optional(v.picklist(["true", "false"]), "false"),
    v.transform((value) => value === "true"),
  ),
});

function parseEnv<TSchema extends v.GenericSchema<unknown, unknown>>(schema: TSchema) {
  const result = v.safeParse(schema, process.env);

  if (!result.success) {
    log.error("env", `Invalid environment variables:\n${v.summarize(result.issues)}`);
    process.exit(1);
  }

  return result.output;
}

// Each entry point validates only what it uses: the `migrate` Compose service runs without the auth secrets
export const getServerEnv = () => parseEnv(serverEnvSchema);
export const getDatabaseEnv = () => parseEnv(databaseEnvSchema);
