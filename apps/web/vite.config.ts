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
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          // Libraries in a chunk of their own, so a deploy that only changes app code leaves its hash, and the
          // browser's cached copy, untouched
          groups: [
            {
              name: "vendor",
              test: /[\\/]node_modules[\\/](?:react|react-dom|scheduler|@tanstack)[\\/]/,
            },
          ],
        },
      },
    },
  },
  server: {
    port: 3000,
    strictPort: true,
    proxy: {
      // xfwd sends X-Forwarded-For, the client IP Better Auth rate-limits by
      "/api": { target: serverUrl, xfwd: true },
    },
  },
});
