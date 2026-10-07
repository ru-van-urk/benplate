import react from "@benplate/oxlint-config/react";
import { defineConfig } from "oxlint";

export default defineConfig({
  extends: [react],
  // Generated and committed; TanStack asks to keep linters and formatters off it
  ignorePatterns: ["src/routeTree.gen.ts"],
  rules: {
    // Components are `const` arrows. `no-use-before-define` stays off: a component may render one defined further
    // down, and tsc (TS2448) already rejects a value read before its declaration while the module loads
    "react/function-component-definition": [
      "error",
      { namedComponents: "arrow-function", unnamedComponents: "arrow-function" },
    ],
    "no-restricted-imports": [
      "error",
      {
        patterns: [
          {
            group: ["#/routes/*", "**/routes/*"],
            message:
              "Route files import their page, never the other way round: use getRouteApi('<route id>') instead.",
          },
        ],
      },
    ],
  },
});
