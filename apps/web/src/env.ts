import * as v from "valibot";

import { envSchema } from "./env.schema";

const result = v.safeParse(envSchema, import.meta.env);

if (!result.success) {
  throw new Error(`Invalid environment variables:\n${v.summarize(result.issues)}`);
}

export const ENV = result.output;
