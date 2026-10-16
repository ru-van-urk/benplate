import { DrizzleQueryError } from "drizzle-orm";
import { DatabaseError } from "pg";

// Drizzle wraps the driver's error in a DrizzleQueryError, with pg's DatabaseError as its `cause`
function databaseError(error: unknown) {
  const cause = error instanceof DrizzleQueryError ? error.cause : error;

  return cause instanceof DatabaseError ? cause : undefined;
}

// Matches one named unique constraint, so a violation of any other constraint stays a 500 instead of a misleading
// conflict
export function isUniqueViolation(error: unknown, constraint: string) {
  const cause = databaseError(error);

  return cause?.code === "23505" && cause.constraint === constraint;
}

// Matches one named foreign key, such as `people_homeworld_id_fkey` when a planet that still has residents is
// deleted, so the handler can return CONFLICT for that case only. `ON DELETE RESTRICT` reports 23001
// (restrict_violation), every other refusal 23503 (foreign_key_violation)
export function isForeignKeyViolation(error: unknown, constraint: string) {
  const cause = databaseError(error);

  return (cause?.code === "23503" || cause?.code === "23001") && cause.constraint === constraint;
}
