import { DatabaseError } from "pg";

// Matches one named unique constraint, so a primary key collision stays a 500 instead of a misleading conflict
export function isUniqueViolation(error: unknown, constraint: string): error is DatabaseError {
  return (
    error instanceof DatabaseError && error.code === "23505" && error.constraint === constraint
  );
}
