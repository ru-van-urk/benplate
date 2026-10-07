import { DatabaseError } from "pg";

// Matches one named unique constraint, so a violation of any other constraint stays a 500 instead of a misleading
// conflict
export function isUniqueViolation(error: unknown, constraint: string): error is DatabaseError {
  return (
    error instanceof DatabaseError && error.code === "23505" && error.constraint === constraint
  );
}

// Matches one named foreign key, such as `people_homeworld_id_fkey` when a planet that still has residents is
// deleted, so the handler can return CONFLICT for that case only. `ON DELETE RESTRICT` reports 23001
// (restrict_violation), every other refusal 23503 (foreign_key_violation)
export function isForeignKeyViolation(error: unknown, constraint: string): error is DatabaseError {
  return (
    error instanceof DatabaseError &&
    (error.code === "23503" || error.code === "23001") &&
    error.constraint === constraint
  );
}
