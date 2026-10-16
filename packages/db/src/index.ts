import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import type { DatabaseConfig } from "./config";
import { relations } from "./relations";

export { isForeignKeyViolation, isUniqueViolation } from "./errors";

export type CreateDbOptions = {
  // An idle client losing its connection (Postgres restart, failover) emits on the pool, and an unhandled
  // `error` event crashes the process; the pool drops that client and opens a new one on the next query
  onError: (error: Error) => void;
};

// Drizzle runs the queries: `db.query` for reads with relations, `db.insert/update/delete` for writes
export function createDb(env: DatabaseConfig, { onError }: CreateDbOptions) {
  const pool = new Pool({ connectionString: env.DATABASE_URL });

  pool.on("error", onError);

  return drizzle({ client: pool, relations });
}

export type Database = ReturnType<typeof createDb>;
