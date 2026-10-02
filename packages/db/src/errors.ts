import { DatabaseError } from "pg";

export function isUniqueViolation(error: unknown): error is DatabaseError {
  return error instanceof DatabaseError && error.code === "23505";
}
