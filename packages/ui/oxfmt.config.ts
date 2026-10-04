import react from "@benplate/oxfmt-config/react";
import { defineConfig } from "oxfmt";

export default defineConfig({
  ...react,
  sortTailwindcss: {
    ...react.sortTailwindcss,
    stylesheet: "./src/styles/globals.css",
  },
});
