import react from "@maribor/oxlint-config/react";
import { defineConfig } from "oxlint";

export default defineConfig({
  extends: [react],
  overrides: [
    {
      // TanStack Router route files export `Route` alongside local components; its Vite plugin handles HMR for them.
      files: ["src/routes/**"],
      rules: { "react/only-export-components": "off" },
    },
  ],
});
