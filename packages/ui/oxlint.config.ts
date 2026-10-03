import react from "@benplate/oxlint-config/react";
import { defineConfig } from "oxlint";

export default defineConfig({
  extends: [react],
  rules: {
    "react/only-export-components": "off",
  },
  overrides: [
    {
      // Generic wrapper: `htmlFor` or the wrapped control is supplied by the caller.
      files: ["src/components/label.tsx"],
      rules: { "jsx-a11y/label-has-associated-control": "off" },
    },
    {
      // `role="group"` on a div matches upstream (a fieldset brings UA styling), and the addon's click
      // only forwards focus to the input, which is keyboard-reachable on its own.
      files: ["src/components/input-group.tsx"],
      rules: {
        "jsx-a11y/prefer-tag-over-role": "off",
        "jsx-a11y/click-events-have-key-events": "off",
        "jsx-a11y/no-noninteractive-element-interactions": "off",
      },
    },
  ],
});
