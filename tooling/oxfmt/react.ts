import { defineConfig } from "oxfmt";

import base from "@benplate/oxfmt-config/base";

export default defineConfig({
  ...base,
  sortTailwindcss: {
    functions: ["cn", "cva"],
  },
});
