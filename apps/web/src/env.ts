import { z } from "zod";

import { envSchema } from "./env.schema";

const result = envSchema.safeParse(import.meta.env);

if (!result.success) {
  throw new Error(`Invalid environment variables:\n${z.prettifyError(result.error)}`);
}

export const ENV = result.data;
