import react from "@maribor/oxfmt-config/react";
import { defineConfig } from "oxfmt";

export default defineConfig({
  ...react,
  sortTailwindcss: {
    ...react.sortTailwindcss,
    stylesheet: "../../packages/ui/src/styles/globals.css",
  },
});
