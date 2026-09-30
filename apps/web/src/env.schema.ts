import * as v from "valibot";

// Only `VITE_`-prefixed variables reach the client bundle. vite.config.ts validates them at dev/build time.
export const envSchema = v.object({
  VITE_SERVER_URL: v.pipe(v.string(), v.url()),
});

declare global {
  interface ImportMetaEnv extends v.InferOutput<typeof envSchema> {}
}
