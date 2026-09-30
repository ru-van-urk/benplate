import { z } from "zod";

// Only `VITE_`-prefixed variables reach the client bundle. vite.config.ts validates them at dev/build time.
export const envSchema = z.object({
  VITE_SERVER_URL: z.url(),
});

declare global {
  interface ImportMetaEnv extends z.infer<typeof envSchema> {}
}
