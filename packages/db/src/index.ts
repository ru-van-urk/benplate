import { CamelCasePlugin, Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";

import type { DatabaseConfig } from "./config";
import type { DB } from "./generated/db";

export { isForeignKeyViolation, isUniqueViolation } from "./errors";
export { newPublicId } from "./ids";

// Nest related rows in one query (a person's homeworld, a planet's residents); see docs/database.md#relations
export { jsonArrayFrom, jsonObjectFrom } from "kysely/helpers/postgres";

// Drizzle owns the schema and migrations, Kysely runs the queries. Kysely's types come from kysely-codegen, which
// reads the migrated database (./generated/db.ts), so they describe what pg actually returns. Two rules remain:
// - SQL defaults only (`.default()`, `.defaultNow()`, `.generatedByDefaultAsIdentity()`), never `$defaultFn` or
//   `$onUpdate`: Drizzle's runtime never touches a query
// - Column names free of digits and acronym runs (`address_line_2`), so kysely-codegen's camelCase and the
//   `CamelCasePlugin` convert them alike

export type CreateDbOptions = {
  // An idle client losing its connection (Postgres restart, failover) emits on the pool, and an unhandled
  // `error` event crashes the process; the pool drops that client and opens a new one on the next query
  onError: (error: Error) => void;
};

export function createDb(env: DatabaseConfig, { onError }: CreateDbOptions) {
  const pool = new Pool({ connectionString: env.DATABASE_URL });

  pool.on("error", onError);

  return new Kysely<DB>({
    dialect: new PostgresDialect({ pool }),
    // Also camelCases the keys of nested JSON, so `jsonObjectFrom` and `jsonArrayFrom` results match the
    // contract. That includes what a `jsonb` column holds: store camelCase keys in one
    plugins: [new CamelCasePlugin()],
  });
}

export type Database = ReturnType<typeof createDb>;
