import type { InferInsertModel, InferSelectModel, Table } from "drizzle-orm";
import { CamelCasePlugin, Kysely, PostgresDialect, type ColumnType } from "kysely";
import { Pool } from "pg";

import type { DatabaseConfig } from "./config";
import type * as schema from "./schema";

// Drizzle stays the source of truth for the schema and migrations, Kysely is the query builder.
// v1 dropped `drizzle-orm/kysely`, so this is its `Kyselify` ported to TS keys: `CamelCasePlugin` maps them onto the
// `snakeCase.table` columns. Keep column names free of digits and acronym runs so both libraries convert them alike
type Kyselify<T> = T extends Table
  ? {
      [K in keyof InferSelectModel<T>]: ColumnType<
        InferSelectModel<T>[K],
        InferInsertModel<T>[K & keyof InferInsertModel<T>],
        InferInsertModel<T>[K & keyof InferInsertModel<T>]
      >;
    }
  : never;

// Keyed by the schema export name, which `CamelCasePlugin` turns into the table name (`planets` -> "planets")
type DB = {
  [K in keyof typeof schema as (typeof schema)[K] extends Table ? K : never]: Kyselify<
    (typeof schema)[K]
  >;
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
    plugins: [new CamelCasePlugin()],
  });
}

export type Database = ReturnType<typeof createDb>;
