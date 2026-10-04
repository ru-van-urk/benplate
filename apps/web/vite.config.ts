import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Mirrors the nginx proxy in production, so the client always calls its own origin
const serverUrl = "http://localhost:3001";

export default defineConfig({
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
    strictPort: true,
    proxy: {
      // xfwd sends X-Forwarded-For, the client IP Better Auth rate-limits by
      "/api": { target: serverUrl, xfwd: true },
    },
  },
});
