import { defineConfig } from "oxfmt";

export default defineConfig({
  // Written by tools that check their own output (drizzle-kit, kysely-codegen --verify)
  ignorePatterns: ["migrations", "generated"],
});
