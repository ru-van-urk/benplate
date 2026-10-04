import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["./src/index.ts", "./src/migrate.ts"],
  format: "esm",
  outDir: "./dist",
  clean: true,
  // Everything is bundled, so the runtime image ships dist only; pg loads `pg-native` on demand, never here
  deps: {
    alwaysBundle: [/.*/],
    onlyBundle: false,
  },
  // @benplate/db is bundled, so its migrations must sit next to the output (see packages/db/src/migrate.ts)
  copy: [{ from: "../../packages/db/src/migrations", to: "./dist" }],
});
