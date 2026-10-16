# Database

Postgres with [Drizzle](https://orm.drizzle.team) (`packages/db`): the schema (`src/schema`), the migrations (`src/migrations`), `db:push` and `db:studio`, and every query, through the `Database` that `createDb` returns. Types come from the schema, so they change the moment you edit it.

## Schema changes

Deployed databases only receive committed migrations; `push` never runs against them.

1. Edit the schema in `packages/db/src/schema` and iterate locally with `pnpm run db:push`.
2. Once the change is settled, run `pnpm run db:generate --name <change>` (for example `--name add_starships`). Always pass `--name`. Drizzle asks here whether a changed column or table is a rename; answer in the terminal. Commit the migration folder together with the schema change.
3. For hand-written SQL (backfills, splitting a column, example data like `seed_star_wars`), `pnpm run db:generate --custom --name <name>` creates an empty migration to fill in. Data that only belongs in some environments doesn't go in a migration: every database runs all of them.

Never edit a migration that has been deployed. CI fails when the schema changed without a migration, and runs every migration on a fresh Postgres before booting the server on it.

## Tables

- **`snakeCase.table`, never `pgTable`.** Lint enforces it: camelCase keys in TypeScript, snake_case columns in Postgres.
- **A private `id: t.integer().primaryKey().generatedByDefaultAsIdentity()`.** Postgres numbers the rows, so inserts leave `id` out. Joins and foreign keys use it; the API never shows it. Join tables use a composite primary key of their two foreign keys instead.
- **A public `publicId`** on tables whose rows clients address: `t.text().notNull().unique("<table>_public_id_unique")`, filled on every insert with `newPublicId(publicIdPrefixes.<resource>)`. It's a short per-resource prefix and 12 random characters (`pl_u4apge8ke3bq`), the only id in the API and in URLs, so URLs reveal no row counts and an id says what it points to. All prefixes live in `publicIdPrefixes` (`packages/contract/src/common.ts`), so two resources can't share one.
- **`...timestamps`** (`src/schema/columns.ts`) adds `createdAt` and `updatedAt` (see [updated_at](#updated_at)).
- **Named unique constraints**, such as `.unique("planets_name_unique")`, mapped in the handler with `isUniqueViolation(error, "planets_name_unique")`. The name keeps any other violation from turning into a misleading `CONFLICT`: it stays a 500.
- **Enums for fixed sets of values**: `pgEnum("climate", […])`, never `t.text({ enum })`, so the database rejects anything else, not just TypeScript. Adding a value is a normal migration with one catch: the migrator runs all pending migrations in one transaction, and Postgres can't use a new enum value before the transaction that adds it commits. Ship a migration that uses a new value (a backfill, example data) in a later deploy than the one that adds it.

The auth tables follow the same rules except for ids (see [Authentication](auth.md)).

## Queries

- **Reads** go through relational queries, `db.query.<table>.findMany/findFirst`, with `where`, `orderBy` and `columns` as objects: `findFirst({ where: { publicId } })`.
- **Writes** use `db.insert/update/delete` with `.returning()` and `eq(...)` from `drizzle-orm`. `update().set()` skips undefined values, so a partial patch can be passed as it is. It refuses an empty one, which is why update inputs need at least one field (`hasChanges` in the contract).
- **Database errors** arrive wrapped in Drizzle's `DrizzleQueryError`; `isUniqueViolation` and `isForeignKeyViolation` look through it to pg's error.

## Relations

`people.homeworld_id` → `planets.id` shows the pattern.

- **Store the private id.** The column is `t.integer().notNull()`, with a named foreign key and an index:

  ```ts
  foreignKey({ name: "people_homeworld_id_fkey", columns: [table.homeworldId], foreignColumns: [planets.id] })
    .onDelete("restrict"),
  index("people_homeworld_id_idx").on(table.homeworldId),
  ```

- **Declare it** in `src/relations.ts` with `defineRelations`, in both directions: `people.homeworld` (one) and `planets.residents` (many).
- **Take the public id.** The contract names the input `<relation>PublicId` (`homeworldPublicId`) and validates its prefix. The handler looks up the planet first and answers `NOT_FOUND` when there is none (`findPlanet` in `router/person.ts`).
- **Load related rows in the same query** with `with`: `findFirst({ where: { publicId }, with: { homeworld: { columns: { publicId: true, name: true } } } })`. Pick the columns the contract shows, so private ids stay in the database.
- **Refuse deletes that would orphan rows.** `onDelete("restrict")` makes Postgres reject deleting Tatooine while people live there; the handler maps it with `isForeignKeyViolation(error, "people_homeworld_id_fkey")` to `CONFLICT`. Use `cascade` when the children mean nothing without the parent.
- **In the web app**, a mutation that changes a relation invalidates every query (`orpc.key()`), because a planet's residents change with its people.

## updated_at

Postgres has no `ON UPDATE` like MySQL's, so the app keeps `updated_at` current. `timestamps` gives it `.$onUpdate(() => new Date())`, which Drizzle adds to every `UPDATE` it runs. Better Auth sets its own on the auth tables. Writes outside the app (Drizzle Studio, psql, SQL migrations) leave it alone: a backfill that should count as an update sets `updated_at = now()` itself.

## Example data

The example planets and people are a migration (`seed_star_wars`, after [SWAPI](https://swapi.dev)), so every database starts with them. Their public ids are literal, so links work the same everywhere, and people find their homeworld by its public id, as the API does.
