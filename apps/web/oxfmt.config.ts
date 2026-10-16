import react from "@benplate/oxfmt-config/react";
import { defineConfig } from "oxfmt";

export default defineConfig({
  ...react,
  // Generated and committed; TanStack asks to keep linters and formatters off it
  ignorePatterns: [...react.ignorePatterns, "src/routeTree.gen.ts"],
  sortTailwindcss: {
    ...react.sortTailwindcss,
    stylesheet: "../../packages/ui/src/styles/globals.css",
  },
});
