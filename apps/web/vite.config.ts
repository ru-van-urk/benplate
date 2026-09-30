import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import { z } from "zod";

import { envSchema } from "./src/env.ts";

export default defineConfig(({ mode }) => {
  const env = envSchema.safeParse(loadEnv(mode, process.cwd(), "VITE_"));
  if (!env.success) {
    throw new Error(`Invalid environment variables:\n${z.prettifyError(env.error)}`);
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
      proxy: {
        "/api": {
          target: "http://localhost:3001",
          changeOrigin: true,
        },
      },
    },
  };
});
