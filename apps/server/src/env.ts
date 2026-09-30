import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  CORS_ORIGIN: z.url(),
  DATABASE_URL: z.string().min(1),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error(`Invalid environment variables:\n${z.prettifyError(result.error)}`);
  process.exit(1);
}

export const ENV = result.data;
