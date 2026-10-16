# API

[oRPC](https://orpc.dev), contract first. `packages/contract` declares every route, schema and error; `packages/api` implements it (`src/server`) and ships the typed client (`src/client`). The server serves it as REST under `/api`, which the web app uses too.

## The contract

The contract ships to the browser, so it imports only oRPC and Valibot, never `@benplate/db` or Drizzle. Its schemas are written by hand:

- **The output schema is what clients see.** A new column, like the private `id`, stays out of responses until you list it: the output schema strips everything else. It holds types only (`v.string()`, `v.nullable(…)`), no input rules, so a row stored before a rule was tightened still passes the server's output validation.
- **Input schemas carry the rules** (`v.nonEmpty`, `v.minValue`, `integerSchema` for `integer` columns), and the web forms validate with them. Columns that are nullable or have a default are optional.
- **Ids are UUIDs.** Outputs list `id: v.string()`; inputs validate it with `idSchema()`, so a malformed id is a 400. A relation is an input named `<relation>Id` and an embedded `referenceSchema` (`{ id, name }`) in the output (see [Relations](database.md#relations)).
- **The router checks both against the table.** A handler that returns a row the output schema can't hold, or inserts input the table doesn't accept, fails to type-check. A contract that drifts from the table fails `pnpm check`, which is also why an enum list such as `climates` can be written in both packages.

## Procedures

- **Names say what they promise:** `get` returns one record by id or throws `NOT_FOUND`; `list` returns a collection, possibly empty.
- **Errors are declared** in the contract (`.errors({ NOT_FOUND: {}, CONFLICT: {} })`) and thrown with `errors.NOT_FOUND()`. Map database errors to them in the handler with `isUniqueViolation` and `isForeignKeyViolation`, by constraint name. Only the common codes (`NOT_FOUND`, `CONFLICT`, `BAD_REQUEST`, …) have an HTTP status; any other code becomes a 500.
- **Public routes** use `oc` in the contract and `os` in the router, and never look up the session. **Routes for signed-in users** start from `authedContract` and use `protectedProcedure`, which sets `context.session` (see [Authentication](auth.md)).
- **Logging** goes through `context.log` (see [Tooling](tooling.md#logging)).
