// Renames a project created from the BenPlate template: `pnpm template:init <name> [Display Name]`.
// Node runs this file as is (type stripping), so it uses erasable TypeScript only
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const [name, displayNameArg] = process.argv.slice(2);

if (!name || !/^[a-z][a-z0-9-]*$/.test(name)) {
  console.error("Usage: pnpm template:init <name> [Display Name]");
  console.error(
    "<name> is the package scope and database name: lowercase letters, digits and dashes",
  );
  process.exit(1);
}

const displayName = displayNameArg ?? name;

// Spelled in parts, so this script survives its own replacements
const template = ["ben", "plate"].join("");
const templateDisplay = ["Ben", "Plate"].join("");

// Tracked files only, so node_modules, build output and .env files are left alone. The lockfile is rewritten by
// `pnpm install` below
const files = execFileSync("git", ["ls-files", "-z"], { encoding: "utf8" })
  .split("\0")
  .filter((file) => file && file !== "pnpm-lock.yaml");

let changed = 0;

for (const file of files) {
  const content = readFileSync(file, "utf8");

  // Binary files (images, fonts) contain NUL bytes; text files never do
  if (content.includes("\0")) {
    continue;
  }

  // `@benplate/*` scopes, the Compose database name and identifiers become `name`; the display name stays readable
  const next = content.replaceAll(templateDisplay, displayName).replaceAll(template, name);

  if (next !== content) {
    writeFileSync(file, next);
    changed++;
  }
}

console.log(`Renamed ${template} to ${name} in ${changed} files`);

execFileSync("pnpm", ["install"], { stdio: "inherit" });

console.log(`
Remaining steps:
  1. Describe the app: the description in apps/web/src/routes/__root.ts, and apps/web/public/favicon.svg
  2. Remove the Star Wars example once you no longer need it (see docs/getting-started.md)
  3. Run pnpm check and pnpm knip, then commit
`);
