import { defineConfig } from "oxfmt";

import base from "@maribor/oxfmt-config/base";

export default defineConfig({
  ...base,
  sortTailwindcss: {
    functions: ["cn", "cva"],
  },
});
