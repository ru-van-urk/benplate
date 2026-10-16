# BenPlate

A full-stack template: React + TanStack Router (`apps/web`), Hono + oRPC (`apps/server`, `packages/contract`, `packages/api`), Better Auth (`packages/auth`), and Postgres with Drizzle (`packages/db`). The [docs](docs/) explain the setup; these are the rules.

## Database

- Drizzle does everything: schema, migrations and queries. Define tables with `snakeCase.table`, never `pgTable`.
- Always pass `--name` to `pnpm db:generate` (`--custom --name` for hand-written SQL). Never edit a committed migration; add a new one. See [Schema changes](docs/database.md#schema-changes).
- Every table has a private `id: t.integer().primaryKey().generatedByDefaultAsIdentity()` that the API never exposes, and spreads `...timestamps`, whose `$onUpdate` keeps `updatedAt` current. No triggers.
- Tables whose rows clients address have `publicId: t.text().notNull().unique("<table>_public_id_unique")`, filled with `newPublicId(publicIdPrefixes.<resource>)`. Every prefix lives in `publicIdPrefixes` (`packages/contract/src/common.ts`).
- Name constraints: `.unique("<table>_<column>_unique")`, `foreignKey({ name: "<table>_<column>_fkey", … })`. Map them by name with `isUniqueViolation` and `isForeignKeyViolation`, so any other violation stays a 500.
- A relation stores the private id (`homeworldId: t.integer()`), with a named foreign key and an index, and is declared in `src/relations.ts`. Reads load it with `db.query…({ with })`, picking only the columns the contract shows. See [Relations](docs/database.md#relations).
- A fixed set of values is a `pgEnum`, never `t.text({ enum })`. A migration can't use an enum value added in the same deploy.
- Auth tables (`schema/auth.ts`) keep Better Auth's random `text` ids, so a foreign key to `user` is `t.text()`. Add a Better Auth plugin by copying its tables from its docs into the schema.

## API

- The contract (`packages/contract`) ships to the browser: it imports only oRPC and Valibot, never `@benplate/db` or Drizzle. Write its schemas by hand. Output schemas list exactly the fields clients see, with types only (`publicId: v.string()`, never `id`); input schemas carry the rules (`publicId: publicIdSchema(publicIdPrefixes.planet)`). See [The contract](docs/api.md#the-contract).
- A relation is an input named `<relation>PublicId`; the handler looks up the private id and throws `NOT_FOUND` when there is none.
- Routes that need a signed-in user use `authedContract` and `protectedProcedure`, which sets `context.session`. Public routes use `oc` and `os`, and never look up the session.
- Name procedures after what they promise: `get` returns one record or throws `NOT_FOUND`; `list` returns a collection, possibly empty.
- Declare expected errors in the contract (`.errors({ NOT_FOUND: {} })`) and throw them with `errors.NOT_FOUND()`. Only common codes have an HTTP status.
- Update inputs pipe through `v.check(hasChanges, …)`: Drizzle refuses an UPDATE with nothing to set.

## Web

- Route files (`src/routes/`) are `.ts` and only declare the route (`context`, `loader`, `beforeLoad`, `validateSearch`, `component`). The page lives in `src/features/<feature>/` and reads its route through `getRouteApi("<route id>")`, never by importing a route file. Id params are `$publicId`.
- Routes own their data: `context` builds the query options, named after the procedure (`getPlanetQueryOptions` for `planet.get`), `loader` prefetches them, and the page passes the same options to `useSuspenseQuery`. Search params that change the data go through `loaderDeps`. Loaders turn `NOT_FOUND` into `notFound()`. See [Data](docs/web.md#data).
- Routes that need a signed-in user live under `routes/_app/`; everything else under `routes/(public)/`.
- After a mutation, invalidate `orpc.<resource>.key()`, or `orpc.key()` when a relation changes another resource too.
- Forms use Formisch, never TanStack Form, validate with the contract's schemas (`@benplate/contract`), and map API errors to fields with `setErrors`.
- Read the session through `sessionQueryOptions`; use Better Auth's client through `authClient` (`src/utils/auth.ts`).
- Components are `const` arrow functions (`packages/ui` keeps shadcn's `function` style). Keep `no-use-before-define` off.

## Server

- Read `process.env` only in `apps/server/src/env.ts`.
- Log through `context.log` in the API and `log` from `apps/server/src/logger.ts` elsewhere. Never `console`. See [Logging](docs/tooling.md#logging).

## Before you finish

Run `pnpm check` (fixes with sherif, oxlint and oxfmt, then tsc; it stops at the first failure), then `pnpm knip`. Both must pass.
