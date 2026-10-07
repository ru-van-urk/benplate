import { oc } from "@orpc/contract";
import * as v from "valibot";

// The shape of `newId()` from @benplate/db, so a malformed id is a 400 before it reaches the database
export const idSchema = v.pipe(v.string(), v.regex(/^[0-9a-z]{12}$/, "Invalid id"));

// The range of a Postgres `integer` column, so an out-of-range number is a 400 instead of a database error
export const integerSchema = v.pipe(
  v.number(),
  v.integer(),
  v.minValue(-2_147_483_648),
  v.maxValue(2_147_483_647),
);

// Base for routes that need a signed-in user (implemented with `protectedProcedure`), so clients see
// UNAUTHORIZED as a typed error
export const authedContract = oc.errors({ UNAUTHORIZED: {} });
