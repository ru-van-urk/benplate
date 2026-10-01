import { drizzle } from "drizzle-orm/node-postgres";

import type { DatabaseConfig } from "./config";
import { relations } from "./relations";

export function createDb(env: DatabaseConfig) {
  return drizzle(env.DATABASE_URL, { relations });
}

export type Database = ReturnType<typeof createDb>;

// Kysely (planned): Drizzle stays the source of truth for the schema and migrations, Kysely is only a query builder.
// v1 dropped `drizzle-orm/kysely`, so this is its `Kyselify` ported to TS keys: `CamelCasePlugin` maps them onto the
// `snakeCase.table` columns. Keep column names free of digits and acronym runs so both libraries convert them alike

// import type { InferInsertModel, InferSelectModel, Table } from "drizzle-orm";
// import { CamelCasePlugin, Kysely, PostgresDialect, type ColumnType } from "kysely";
// import type * as schema from "./schema";

// type Kyselify<T> = T extends Table
//   ? {
//       [K in keyof InferSelectModel<T>]: ColumnType<
//         InferSelectModel<T>[K],
//         InferInsertModel<T>[K & keyof InferInsertModel<T>],
//         InferInsertModel<T>[K & keyof InferInsertModel<T>]
//       >;
//     }
//   : never;
//
// // Keyed by the schema export name, which `CamelCasePlugin` turns into the table name (`planets` -> "planets")
// export type KyselyDB = {
//   [K in keyof typeof schema as (typeof schema)[K] extends Table ? K : never]: Kyselify<(typeof schema)[K]>;
// };
//
// // Shares Drizzle's pool instead of opening a second one
// export function createKysely(db: Database) {
//   return new Kysely<KyselyDB>({
//     dialect: new PostgresDialect({ pool: db.$client }),
//     plugins: [new CamelCasePlugin()],
//   });
// }
