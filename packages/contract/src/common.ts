import { oc } from "@orpc/contract";
import * as v from "valibot";

// The range of a Postgres `integer` column, so an out-of-range number is a 400 instead of a database error
export const integerSchema = v.pipe(
  v.number(),
  v.integer(),
  v.minValue(-2_147_483_648),
  v.maxValue(2_147_483_647),
);

// Every table's `id` is a UUID, so a malformed id is a 400 before it reaches the database
export const idSchema = (message = "Invalid id") => v.pipe(v.string(message), v.uuid(message));

// Another resource, as a response embeds it (`with: { homeworld: … }`): enough to show and link it
export const referenceSchema = v.object({
  id: v.string(),
  name: v.string(),
});

// For update inputs: something besides the id has to change, since an UPDATE needs a value to set. An empty patch
// is a 400 instead of a no-op
export const hasChanges = <TInput extends { id: string }>(input: TInput) =>
  Object.entries(input).some(([key, value]) => key !== "id" && value !== undefined);

// Base for routes that need a signed-in user (implemented with `protectedProcedure`), so clients see
// UNAUTHORIZED as a typed error
export const authedContract = oc.errors({ UNAUTHORIZED: {} });
