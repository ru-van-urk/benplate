import { oc } from "@orpc/contract";
import * as v from "valibot";

// The range of a Postgres `integer` column, so an out-of-range number is a 400 instead of a database error
export const integerSchema = v.pipe(
  v.number(),
  v.integer(),
  v.minValue(-2_147_483_648),
  v.maxValue(2_147_483_647),
);

// Every resource's public id prefix (`pl_k3m9x0q2a7zd`), in one place so two resources can't pick the same one.
// Short, like Stripe's `cus_`; the router passes them to `newPublicId` from @benplate/db
export const publicIdPrefixes = {
  planet: "pl",
  person: "ppl",
} as const;

type PublicIdPrefix = (typeof publicIdPrefixes)[keyof typeof publicIdPrefixes];

// The shape of `newPublicId(prefix)`, so a malformed id, or one of another resource, is a 400 before it reaches the
// database. Clients only ever see public ids; the integer `id` column stays private
export const publicIdSchema = (prefix: PublicIdPrefix, message = "Invalid id") =>
  v.pipe(v.string(message), v.regex(new RegExp(`^${prefix}_[0-9a-z]{12}$`), message));

// Another resource, as a response embeds it: enough to show and link it. JSON-built in the query
// (`jsonObjectFrom`), so it holds strings and numbers only; a date would arrive as a string
export const referenceSchema = v.object({
  publicId: v.string(),
  name: v.string(),
});

// Base for routes that need a signed-in user (implemented with `protectedProcedure`), so clients see
// UNAUTHORIZED as a typed error
export const authedContract = oc.errors({ UNAUTHORIZED: {} });
