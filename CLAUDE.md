# BenPlate

A full-stack template: React + TanStack Router (`apps/web`), Hono + oRPC (`apps/server`, `packages/contract`, `packages/api`), Better Auth (`packages/auth`), and a Drizzle schema with Kysely queries on Postgres (`packages/db`). The [README](README.md) explains the setup. These are the rules.

## Database

- Define tables with `snakeCase.table`, never `pgTable`. Use only the column modes listed at the top of `packages/db/src/index.ts`. Defaults are SQL only (`.default()`, `.defaultNow()`), never `$defaultFn` or `$onUpdate`: Kysely runs the queries, so Drizzle's runtime hooks never fire.
- Every table has `id: t.text().primaryKey()`, filled with `newId()` from `@benplate/db` on every insert. The database never generates ids: no column default, SQL extension or id function. Join tables use a composite primary key of their two foreign keys instead.
- Foreign keys are `t.text()`. Every table spreads `...timestamps` (`schema/columns.ts`) and gets an `updated_at` trigger in its own custom migration, like `planets_updated_at`.
- Ids are random, not time-ordered: sort by `createdAt`, and paginate with a `(createdAt, id)` cursor.
- Name unique constraints explicitly: `.unique("<table>_<column>_unique")`. Always pass that name to `isUniqueViolation(error, constraint)`, so only that constraint maps to `CONFLICT` and an id collision stays a 500.
- Auth tables (`schema/auth.ts`) follow the same rules. To add a Better Auth plugin, copy its tables and fields from the plugin's docs page into the schema and generate a migration. The server checks the auth schema at startup and refuses to start on a mismatch.
- Always pass `--name` to `pnpm db:generate` (`--custom --name` for hand-written SQL). Never edit a migration that has been deployed; add a new one. See [Schema changes](README.md#schema-changes).

## API

- Routes that need a signed-in user use `authedContract` in the contract and `protectedProcedure` in the router, which sets `context.session`. Public routes use `oc` and `os`, and never look up the session.
- The contract (`packages/contract`) ships to the browser: it imports only oRPC and Valibot, never `@benplate/db` or Drizzle (no `drizzle-orm/valibot`). Write its schemas by hand. Output schemas list exactly the fields clients see, with types only; input schemas carry the validation rules. See [Adding a resource](README.md#adding-a-resource).
- Declare expected errors in the contract (`.errors({ NOT_FOUND: {} })`) and throw them with `errors.NOT_FOUND()`. Map database errors to them in the handler.

## Web

- Forms use Formisch (`@formisch/react`), never TanStack Form. They validate with the contract's own schemas, exported from `@benplate/contract`, and map API errors to fields with `setErrors`.
- Read the session through `sessionQueryOptions` and get Better Auth's client from `loadAuthClient()` (`apps/web/src/utils/auth.ts`); never import `@benplate/auth/client` statically, which puts it back in every first page load.
- Pages that need a signed-in user live under `routes/_app/`; everything else under `routes/(public)/`. See [Web routes](README.md#web-routes).

## Server

- Read `process.env` only in `apps/server/src/env.ts`.
- Log through `context.log` in the API (`context.log.set({ … })` adds to the request's wide event) and through `log` from `apps/server/src/logger.ts` elsewhere. Never use `console`. See [Logging](README.md#logging).

## Before you finish

Run `pnpm fix`, then `pnpm check` (sherif, oxlint, oxfmt and tsc through uncheck, then knip). It must pass.
