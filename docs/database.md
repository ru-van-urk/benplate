# Database

Postgres, with three tools that each do one job (`packages/db`):

- **Drizzle** owns the schema (`src/schema`) and the migrations (`src/migrations`), plus `db:push` and `db:studio`.
- **Kysely** runs every query, through the `Database` that `createDb` returns.
- **[kysely-codegen](https://github.com/RobinBlomberg/kysely-codegen)** writes Kysely's types from the migrated database into `src/generated/db.ts`, so they describe what Postgres and `pg` actually return: `timestamptz` is a `Date`, `bigint` a string, an enum a union.

## Schema changes

Deployed databases only receive committed migrations; `push` never runs against them.

1. Edit the schema in `packages/db/src/schema` and iterate locally with `pnpm run db:push`. Push and `db:migrate` both regenerate the Kysely types afterwards (`pnpm run db:codegen` does only that), so queries type-check against your local database.
2. Once the change is settled, run `pnpm run db:generate --name <change>` (for example `--name add_starships`). Always pass `--name`. Drizzle asks here whether a changed column or table is a rename; answer in the terminal. Commit the migration folder together with the schema change and `src/generated/db.ts`.
3. For hand-written SQL (backfills, splitting a column, example data like `seed_star_wars`), `pnpm run db:generate --custom --name <name>` creates an empty migration to fill in. Data that only belongs in some environments doesn't go in a migration: every database runs all of them.

Never edit a migration that has been deployed, and never edit the generated types by hand. CI fails when the schema changed without a migration, when the committed types don't match a database that ran every migration, and when a table with `updated_at` lacks its trigger.

## Tables

- **`snakeCase.table`, never `pgTable`.** Lint enforces it, because Kysely's `CamelCasePlugin` maps camelCase keys onto snake_case columns. Keep column names free of digits and acronym runs (`address_line_2`), so kysely-codegen and the plugin convert them alike.
- **SQL defaults only** (`.default()`, `.defaultNow()`, `.generatedByDefaultAsIdentity()`), never `$defaultFn` or `$onUpdate`: Kysely runs the queries, so Drizzle's runtime hooks never fire.
- **A private `id: t.integer().primaryKey().generatedByDefaultAsIdentity()`.** Postgres numbers the rows, so inserts leave `id` out. Joins and foreign keys use it; the API never shows it. Join tables use a composite primary key of their two foreign keys instead.
- **A public `publicId`** on tables whose rows clients address: `t.text().notNull().unique("<table>_public_id_unique")`, filled on every insert with `newPublicId(publicIdPrefixes.<resource>)`. It's a short per-resource prefix and 12 random characters (`pl_u4apge8ke3bq`), the only id in the API and in URLs, so URLs reveal no row counts and an id says what it points to. All prefixes live in `publicIdPrefixes` (`packages/contract/src/common.ts`), so two resources can't share one.
- **`...timestamps`** (`src/schema/columns.ts`) adds `createdAt` and `updatedAt`. A trigger in the table's migration keeps `updatedAt` current (see [updated_at](#updated_at)).
- **Named unique constraints**, such as `.unique("planets_name_unique")`, mapped in the handler with `isUniqueViolation(error, "planets_name_unique")`. The name keeps any other violation from turning into a misleading `CONFLICT`: it stays a 500.
- **Enums for fixed sets of values**: `pgEnum("climate", […])`, never `t.text({ enum })`, so the database rejects anything else and the generated types hold the union. Adding a value is a normal migration with one catch: the migrator runs all pending migrations in one transaction, and Postgres can't use a new enum value before the transaction that adds it commits. Ship a migration that uses a new value (a backfill, example data) in a later deploy than the one that adds it.

The auth tables follow the same rules except for ids (see [Authentication](auth.md)).

## Relations

`people.homeworld_id` → `planets.id` shows the pattern.

- **Store the private id.** The column is `t.integer().notNull()`, with a named foreign key and an index:

  ```ts
  foreignKey({ name: "people_homeworld_id_fkey", columns: [table.homeworldId], foreignColumns: [planets.id] })
    .onDelete("restrict"),
  index("people_homeworld_id_idx").on(table.homeworldId),
  ```

- **Take the public id.** The contract names the input `<relation>PublicId` (`homeworldPublicId`) and validates its prefix. The handler looks up the private id first and answers `NOT_FOUND` when there is none (`findPlanetId` in `router/person.ts`).
- **Embed related rows in the same query** with `jsonObjectFrom` and `jsonArrayFrom` (exported from `@benplate/db`): a person comes with `homeworld: { publicId, name }`, a planet with its `residents`. Postgres builds that JSON, so pg's parsers never see it: select strings and numbers only, because a date arrives as a string and a `bigint` as a number. The `CamelCasePlugin` camelCases the nested keys too, which also applies to what a `jsonb` column holds: store camelCase keys in one.
- **Refuse deletes that would orphan rows.** `onDelete("restrict")` makes Postgres reject deleting Tatooine while people live there; the handler maps it with `isForeignKeyViolation(error, "people_homeworld_id_fkey")` to `CONFLICT`. Use `cascade` when the children mean nothing without the parent.
- **In the web app**, a mutation that changes a relation invalidates every query (`orpc.key()`), because a planet's residents change with its people.

## updated_at

The database keeps `updated_at` current, whatever writes the row: `set_updated_at()` sets it on every `UPDATE`, through a `<table>_updated_at` trigger per table. Postgres has no column-level `ON UPDATE` like MySQL's, and Drizzle's `$onUpdate` only runs in Drizzle's own query builder, so the trigger is the database's way.

Drizzle doesn't track triggers, so add it by hand: generate the table's migration, then end that same file with the trigger before committing, as the `star_wars` migration does:

```sql
--> statement-breakpoint
CREATE TRIGGER "<table>_updated_at" BEFORE UPDATE ON "<table>"
FOR EACH ROW EXECUTE FUNCTION "set_updated_at"();
```

`db:push` doesn't create triggers, so during local iteration `updated_at` only changes when the app sets it (handlers do, in every update). CI fails a pull request when a table with `updated_at` has no trigger.

## Example data

The example planets and people are a migration (`seed_star_wars`, after [SWAPI](https://swapi.dev)), so every database starts with them. Their public ids are literal, so links work the same everywhere, and people find their homeworld by its public id, as the API does.
