// CommonJS, because kysely-codegen loads its config synchronously: it can't read `default` from an ES module, and
// its TypeScript loader needs a TypeScript with a JS API (7 has none)
const { existsSync } = require("node:fs");

// The server app owns DATABASE_URL; an already-set env var (CI, Docker) takes precedence. Named only when it
// exists, because kysely-codegen fails on a missing env file
const serverEnvFile = "../../apps/server/.env";

// Kysely's types, read from the migrated database: `db:push` and `db:migrate` regenerate them, and CI fails when
// the committed file no longer matches the migrations
/** @type {import("kysely-codegen").Config} */
module.exports = {
  dialect: "postgres",
  url: "env(DATABASE_URL)",
  envFile: existsSync(serverEnvFile) ? serverEnvFile : undefined,
  outFile: "./src/generated/db.ts",
  // Matches the CamelCasePlugin in ./src/index.ts
  camelCase: true,
  // Leaves out Drizzle's own `drizzle.__drizzle_migrations`
  includePattern: "public.*",
};
