import react from "@benplate/oxlint-config/react";
import { defineConfig } from "oxlint";

export default defineConfig({
  extends: [react],
  // Generated and committed; TanStack asks to keep linters and formatters off it
  ignorePatterns: ["src/routeTree.gen.ts"],
  overrides: [
    {
      // TanStack Router route files export `Route` alongside local components; its Vite plugin handles HMR for them.
      files: ["src/routes/**"],
      rules: { "react/only-export-components": "off" },
    },
  ],
});
