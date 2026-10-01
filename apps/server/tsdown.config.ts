import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["./src/index.ts", "./src/migrate.ts"],
  format: "esm",
  outDir: "./dist",
  clean: true,
  deps: {
    alwaysBundle: [/@maribor\/.*/],
  },
  // @maribor/db is bundled, so its migrations must sit next to the output (see packages/db/src/migrate.ts)
  copy: [{ from: "../../packages/db/src/migrations", to: "./dist" }],
});
