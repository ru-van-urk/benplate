import { oc } from "@orpc/contract";
import * as v from "valibot";

// The shape of `newId()` from @benplate/db, so a malformed id is a 400 before it reaches the database
export const idSchema = v.pipe(v.string(), v.regex(/^[0-9a-z]{12}$/, "Invalid id"));

// Base for routes that need a signed-in user (implemented with `protectedProcedure`), so clients see
// UNAUTHORIZED as a typed error
export const authedContract = oc.errors({ UNAUTHORIZED: {} });
