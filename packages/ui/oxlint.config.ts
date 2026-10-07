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
      // `role="group"` on a div matches upstream; FieldSet is the fieldset variant
      files: ["src/components/field.tsx"],
      rules: { "jsx-a11y/prefer-tag-over-role": "off" },
    },
  ],
});
