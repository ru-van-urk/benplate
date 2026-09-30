import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import * as v from "valibot";

import { envSchema } from "./src/env.schema.ts";

export default defineConfig(({ mode }) => {
  const env = v.safeParse(envSchema, loadEnv(mode, process.cwd(), "VITE_"));
  if (!env.success) {
    throw new Error(`Invalid environment variables:\n${v.summarize(env.issues)}`);
  }

  return {
    resolve: {
      tsconfigPaths: true,
    },
    plugins: [
      tailwindcss(),
      tanstackRouter({
        target: "react",
        autoCodeSplitting: true,
      }),
      react(),
    ],
    server: {
      port: 3000,
    },
  };
});
