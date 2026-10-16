# Database

Postgres with [Drizzle](https://orm.drizzle.team) (`packages/db`): the schema (`src/schema`), the migrations (`src/migrations`), `db:push` and `db:studio`, and every query, through the `Database` that `createDb` returns. Types come from the schema, so they change the moment you edit it.

## Schema changes

Deployed databases only receive committed migrations; `push` never runs against them.

1. Edit the schema in `packages/db/src/schema` and iterate locally with `pnpm run db:push`.
2. Once the change is settled, run `pnpm run db:generate --name <change>` (for example `--name add_starships`). Always pass `--name`. Drizzle asks here whether a changed column or table is a rename; answer in the terminal. Commit the migration folder together with the schema change.
3. For hand-written SQL (backfills, splitting a column), `pnpm run db:generate --custom --name <name>` creates an empty migration to fill in. Data that only belongs in some environments doesn't go in a migration: every database runs all of them.

Never edit a migration that has been deployed. CI fails when the schema changed without a migration, and runs every migration on a fresh Postgres before booting the server on it.

## Tables

- **`snakeCase.table`, never `pgTable`.** Lint enforces it: camelCase keys in TypeScript, snake_case columns in Postgres.
- **``id: t.uuid().primaryKey().default(sql`uuidv7()`)``.** Postgres generates a UUIDv7 on insert, so inserts leave `id` out. It's the one id: foreign keys, the API and URLs all use it. UUIDs don't reveal row counts, and v7 starts with a timestamp, so new rows land at the end of the primary key index instead of all over it. Join tables use a composite primary key of their two foreign keys instead.
- **`...timestamps`** (`src/schema/columns.ts`) adds `createdAt` and `updatedAt` (see [updated_at](#updated_at)).
- **Named unique constraints**, such as `.unique("planets_name_unique")`, mapped in the handler with `isUniqueViolation(error, "planets_name_unique")`. The name keeps any other violation from turning into a misleading `CONFLICT`: it stays a 500.
- **Enums for fixed sets of values**: `pgEnum("climate", […])`, never `t.text({ enum })`, so the database rejects anything else, not just TypeScript. Adding a value is a normal migration with one catch: the migrator runs all pending migrations in one transaction, and Postgres can't use a new enum value before the transaction that adds it commits. Ship a migration that uses a new value (a backfill, example data) in a later deploy than the one that adds it.

The auth tables follow the same rules except for ids (see [Authentication](auth.md)).

## Queries

- **Reads** go through relational queries, `db.query.<table>.findMany/findFirst`, with `where`, `orderBy` and `columns` as objects: `findFirst({ where: { id } })`.
- **Writes** use `db.insert/update/delete` with `.returning()` and `eq(...)` from `drizzle-orm`. `update().set()` skips undefined values, so a partial patch can be passed as it is. It refuses an empty one, which is why update inputs need at least one field (`hasChanges` in the contract).
- **Database errors** arrive wrapped in Drizzle's `DrizzleQueryError`; `isUniqueViolation` and `isForeignKeyViolation` look through it to pg's error.

## Relations

`people.homeworld_id` → `planets.id` shows the pattern.

- **Store the other row's id.** The column is `t.uuid().notNull()`, with a named foreign key and an index:

  ```ts
  foreignKey({ name: "people_homeworld_id_fkey", columns: [table.homeworldId], foreignColumns: [planets.id] })
    .onDelete("restrict"),
  index("people_homeworld_id_idx").on(table.homeworldId),
  ```

- **Declare it** in `src/relations.ts` with `defineRelations`, in both directions: `people.homeworld` (one) and `planets.residents` (many).
- **Take the id as input.** The contract names the input `<relation>Id` (`homeworldId`) and validates it as a UUID. The handler inserts it as it is; when the planet doesn't exist, the foreign key refuses and the handler maps `isForeignKeyViolation(error, "people_homeworld_id_fkey")` to `NOT_FOUND` (`router/person.ts`).
- **Load related rows in the same query** with `with`: `findFirst({ where: { id }, with: { homeworld: { columns: { id: true, name: true } } } })`. Pick the columns the contract shows.
- **Refuse deletes that would orphan rows.** `onDelete("restrict")` makes Postgres reject deleting Tatooine while people live there; the handler maps it with `isForeignKeyViolation(error, "people_homeworld_id_fkey")` to `CONFLICT`. Use `cascade` when the children mean nothing without the parent.
- **In the web app**, a mutation that changes a relation invalidates every query (`orpc.key()`), because a planet's residents change with its people.

## updated_at

Postgres has no `ON UPDATE` like MySQL's, so the app keeps `updated_at` current. `timestamps` gives it `.$onUpdate(() => new Date())`, which Drizzle adds to every `UPDATE` it runs. Better Auth sets its own on the auth tables. Writes outside the app (Drizzle Studio, psql, SQL migrations) leave it alone: a backfill that should count as an update sets `updated_at = now()` itself.

## Example data

The example planets and people (after [SWAPI](https://swapi.dev)) are a seed, `packages/db/src/seed.ts`, not a migration: migrations hold only the schema and real data changes, and run in every database. `pnpm run db:seed` inserts them locally and `pnpm run docker:seed` into the Compose stack; rows that already exist are skipped, so both can run again. Their ids are literal, so links work the same everywhere.
