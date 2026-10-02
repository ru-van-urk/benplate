import type { InferInsertModel, InferSelectModel, Table } from "drizzle-orm";
import { CamelCasePlugin, Kysely, PostgresDialect, type ColumnType } from "kysely";
import { Pool } from "pg";

import type { DatabaseConfig } from "./config";
import type * as schema from "./schema";

export { isUniqueViolation } from "./errors";

// Drizzle stays the source of truth for the schema and migrations, Kysely is the query builder.
// v1 dropped `drizzle-orm/kysely`, so this is its `Kyselify` ported to TS keys: `CamelCasePlugin` maps them onto the
// `snakeCase.table` columns. Keep column names free of digits and acronym runs so both libraries convert them alike.
//
// The types come from Drizzle, but Kysely returns values parsed by pg's defaults and Drizzle's own parsers and
// `$defaultFn` hooks never run. Only use column modes where both agree:
// - `date({ mode: "date" })`, `bigint({ mode: "string" })`, default-mode `numeric` and
//   `timestamp({ withTimezone: true })`; `date()` returns a `Date` and number-mode `bigint`/`numeric` a string
// - SQL defaults only (`.default()`, `.defaultNow()`, `.defaultRandom()`), never `$defaultFn` or `$onUpdate`
type Kyselify<T> = T extends Table
  ? {
      [K in keyof InferSelectModel<T>]: ColumnType<
        InferSelectModel<T>[K],
        InferInsertModel<T>[K & keyof InferInsertModel<T>],
        InferInsertModel<T>[K & keyof InferInsertModel<T>]
      >;
    }
  : never;

// Keyed by the SQL table name Drizzle carries in its type, so the export name does not matter
type DB = {
  [
    K in keyof typeof schema as (typeof schema)[K] extends Table
      ? (typeof schema)[K]["_"]["name"]
      : never
  ]: Kyselify<(typeof schema)[K]>;
};

export function createDb(env: DatabaseConfig) {
  const pool = new Pool({ connectionString: env.DATABASE_URL });

  // An idle client losing its connection (Postgres restart, failover) emits on the pool, and an unhandled
  // `error` event crashes the process; the pool drops that client and opens a new one on the next query
  pool.on("error", (error) => {
    console.error("Idle Postgres client error", error);
  });

  return new Kysely<DB>({
    dialect: new PostgresDialect({ pool }),
    plugins: [new CamelCasePlugin({ maintainNestedObjectKeys: true })],
  });
}

export type Database = ReturnType<typeof createDb>;
