# Better Drizzle: fit with the BenPlate stack, and alternatives

Scope note: "Better Drizzle" exists and is a Drizzle tool. It is `better-drizzle` (npm), by almeidazs, Apache-2.0, repo github.com/almeidazs/better-drizzle, created 2026-06-22, about 347 stars, last push 2026-10-05 ([GitHub API, repo metadata](https://github.com/almeidazs/better-drizzle)). It is a **runtime repository/ORM layer on top of Drizzle's query builder** (Prisma-style `findMany`/`include`/`paginate` delegates plus plugins). It is **not** a schema, migration, codegen or Studio tool. That one fact settles most of the questions below.

Local repo facts used below come from the working tree on branch `chore-revert-ids`: `packages/db/package.json`, `packages/db/src/index.ts`, `packages/db/src/migrations/`, `packages/auth/src/index.ts`, `pnpm-workspace.yaml`. Catalog versions there: drizzle-orm and drizzle-kit `1.0.0-rc.4`, kysely `^0.29.6`, kysely-codegen `^0.20.0`, better-auth `^1.7.7`, oRPC `2.0.0-beta.40`.

## Q1. Can Better Drizzle be adopted while keeping Kysely for queries and kysely-codegen for types?

### Takeaway

No, not in any useful sense. Better Drizzle wraps a live Drizzle client (`better(drizzle({ client, relations }))`) and runs every query through Drizzle's runtime. Keeping Kysely for all queries means Better Drizzle does nothing. Adopting it means a second query layer (Drizzle runtime plus `defineRelations`) next to Kysely, or replacing Kysely. It neither replaces nor plugs into kysely-codegen: its types come from the Drizzle schema plus relations, not from the database.

### Cited Findings

- Self-description: "Type-safe repository helpers for Drizzle ORM ... It is still your Drizzle client underneath, and you can drop back to it at any line." — [README](https://github.com/almeidazs/better-drizzle#readme)
- Setup needs three steps: tables in the schema, relations declared with Drizzle's `defineRelations`, and a Drizzle instance built with those relations. "`better()` reads tables and relations from that instance": `better(drizzle({ connection: process.env.DATABASE_URL!, relations }))` — [README, Setup](https://github.com/almeidazs/better-drizzle#setup)
- "No codegen. No client process. No new schema language." Its typed delegates are "typed end to end from your Drizzle schema and `defineRelations(...)` config" — [README](https://github.com/almeidazs/better-drizzle#the-whole-idea)
- It is described as a runtime wrapper with no codegen that "generates optimized SQL queries and handles transaction management automatically" — [better-drizzle.com](https://better-drizzle.com/)
- "Queries compile to Drizzle and run on your driver, and raw Drizzle stays one line away." — [Why better-drizzle?](https://better-drizzle.com/docs/why)
- Escape hatches go back to _Drizzle_, not to Kysely or raw SQL clients. `$where()` "compiles the same typed `where` as `findMany` into a Drizzle `SQL` condition" — [README](https://github.com/almeidazs/better-drizzle#your-filters-inside-raw-drizzle). groupBy and aggregates: "Use the Drizzle query builder for those" — [Limitations](https://better-drizzle.com/docs/guides/limitations)
- A code search of the repo for "kysely" finds only a tsconfig and `explain.ts`/its test, with no Kysely integration in the docs or the API — [GitHub code search](https://github.com/search?q=repo%3Aalmeidazs%2Fbetter-drizzle+kysely&type=code)
- BenPlate today: Kysely types come from kysely-codegen reading the migrated database (`./generated/db.ts`), and the rule is "SQL defaults only ... never `$defaultFn` or `$onUpdate`: Drizzle's runtime never touches a query" — local `packages/db/src/index.ts`

### Inferences

- Keeping Kysely and adding Better Drizzle gives two query APIs, two type sources (codegen for Kysely, schema inference for Better Drizzle) and two connection setups. Kysely uses `PostgresDialect({ pool })`. Better Drizzle could share the same `pg` Pool through `drizzle({ client: pool, relations })`, but transactions would not span the two libraries.
- The BenPlate schema would also need a full `defineRelations(...)` config, which it does not have today. Nested relations are done by hand with `jsonObjectFrom`/`jsonArrayFrom`.
- Relation to kysely-codegen: it conflicts with the philosophy (DB-introspected types versus schema-inferred types) rather than technically. It would only _replace_ kysely-codegen if Kysely were dropped entirely.
- What it offers (Prisma-like `include`, `paginate`/`cursor`, relation writes) is the opposite of the developer's stated preference, which is Kysely's SQL-shaped query DX.

### Gaps

- No reports were found of anyone running Better Drizzle next to Kysely on one pool. No such combination is documented.

## Q2. Does it work with Drizzle v1 RC (snakeCase.table, pgEnum, identity columns, custom SQL migrations, drizzle migrator)? Does it change migrations?

### Takeaway

Its 0.3.x line targets exactly drizzle-orm `1.0.0-rc.4`, the version BenPlate pins, with a tight peer range (`<1.0.0-rc.5`). It does not touch drizzle-kit, the migration format, the folder layout or the migrator at all: those stay as they are. **Practical blocker as of 2026-10-07:** v0.3.0, the only Drizzle-1.x-compatible release, failed to publish. npm `latest` is 0.2.0, which supports Drizzle 0.x only.

### Cited Findings

- "better-drizzle supports only Drizzle ORM 1.x (`drizzle-orm` `>=1.0.0-rc.4 <1.0.0-rc.5`; later release candidates are not supported yet) ... `drizzle-orm` 0.x is not supported - projects on 0.x must stay on better-drizzle `0.2.x`." — [README](https://github.com/almeidazs/better-drizzle#readme)
- package.json peerDependencies: `"drizzle-orm": ">=1.0.0-rc.4 <1.0.0-rc.5"`, plus optional zod, eslint and ata-validator peers — [package.json](https://github.com/almeidazs/better-drizzle/blob/main/package.json)
- Upgrading guide: "0.3.0 supports only Drizzle ORM 1.x ... tested against 1.0.0-rc.4. Drizzle 1.x replaces the relations(...) helpers with defineRelations(...) (relational queries v2). better-drizzle now reads tables and relations from the Drizzle instance" (tables come from `db._.relations`) — [Upgrading](https://better-drizzle.com/docs/guides/upgrading)
- Drizzle 1.x "wraps driver errors in `DrizzleQueryError` ... with the driver error as `cause`". Better Drizzle's `isUniqueViolation`/`isForeignKeyViolation` read the wrapped error — [Upgrading](https://better-drizzle.com/docs/guides/upgrading)
- Release history: v0.3.0 tagged 2026-10-03, v0.2.0 on 2026-09-20, 0.1.x in June 2026 — [GitHub releases](https://github.com/almeidazs/better-drizzle/releases)
- Issue #66 (open, 2026-10-05): "v0.3.0 is not published to npm yet! ... the publish to npm workflow actually f[ailed]" — [Issue #66](https://github.com/almeidazs/better-drizzle/issues/66). `npm view better-drizzle` on 2026-10-07 shows versions 0.1.0, 0.1.1 and 0.2.0, with `latest` = 0.2.0 — [npm](https://www.npmjs.com/package/better-drizzle)
- Its docs say nothing about migrations, drizzle-kit or Studio. The Limitations page says "The project reads your Drizzle schema directly ... your schema remains the source of truth ... better-drizzle is not trying to invent a second modeling system" — [Limitations](https://better-drizzle.com/docs/guides/limitations). An open feature request asks for a "better-drizzle CLI" — [Issue #52](https://github.com/almeidazs/better-drizzle/issues/52)
- Loader limits: relations with a relation-level `where`, and `one` relations through a junction, cannot be loaded or filtered. `orderBy` takes columns only, with no expressions and no ordering by relation columns. There is no groupBy/sum/avg/min/max — [Limitations](https://better-drizzle.com/docs/guides/limitations)
- BenPlate's migrations are in drizzle-kit v1's per-migration folder layout (`src/migrations/<timestamp>_<name>/migration.sql` + `snapshot.json`, e.g. `20261003135315_planets_updated_at`), with custom SQL migrations for triggers and seeds — local `packages/db/src/migrations/`

### Inferences

- snakeCase.table, pgEnum and identity columns: Better Drizzle compiles queries through Drizzle's own builder, so column-name casing and enum/identity typing should come from Drizzle itself. It reads column metadata (for example `dataType` such as `"number int32"`) for plugins. I found no doc or test that names `snakeCase.table` or identity columns specifically. A repo code search for "casing" or "snakeCase" returned nothing.
- Identity columns: Better Drizzle's `create` would omit `id` (generated by default) like any Drizzle insert. The app would still have to supply `publicId` (nanoid) on every create, or wrap it in a custom plugin or `extends()`.
- Bleeding edge: the exact-RC peer pin means BenPlate could not move to drizzle-orm rc.5 or later until Better Drizzle releases a matching version. The schema/migration side gets coupled to a third party's release cadence (the peer range itself says "later release candidates are not supported yet").
- Until #66 is fixed, adopting it requires a git or tarball install of v0.3.0.

### Gaps

- No public test matrix shows Better Drizzle with `snakeCase.table` or `generatedByDefaultAsIdentity` on Postgres 18. Its docs examples use `pgTable` and `integer().primaryKey()`.
- I could not fetch Drizzle's own v1 RC docs page on the migration folder format. The per-folder layout claim rests on the local repo.

## Q3. Would it interfere with Better Auth's schema check or adapter?

### Takeaway

Not directly. Better Drizzle has no Better Auth integration and does not touch the database schema. Better Auth would keep using the app's Kysely instance (built-in Kysely adapter), and `checkAuthSchema` would be unaffected. Only if Kysely were dropped altogether would Better Auth need to move to `@better-auth/drizzle-adapter` (relations-v2 entry point). That swap changes how the CamelCasePlugin-based mapping works today.

### Cited Findings

- Better Auth: "PostgreSQL is supported under the hood via the Kysely adapter". It can take a Kysely instance as `database: { db, type: "postgres", schemaName }`. CLI generate/migrate is supported for PostgreSQL — [Better Auth PostgreSQL docs](https://www.better-auth.com/docs/adapters/postgresql)
- Better Auth Drizzle adapter: `drizzleAdapter(db, { provider, schema, usePlural, schemaName })`. Relations v1 by default; "Relations v2: Use `@better-auth/drizzle-adapter/relations-v2` with `defineRelations`". The CLI generates the schema and you run `drizzle-kit generate`/`migrate`. Experimental joins since 1.4 need Drizzle relations — [Better Auth Drizzle adapter](https://www.better-auth.com/docs/adapters/drizzle)
- BenPlate passes its own Kysely (with CamelCasePlugin) to Better Auth so camelCase fields map onto snake_case columns of the hand-written Drizzle auth schema. `checkAuthSchema` awaits `auth.$context` then `context.checkSchema?.()` and the server exits on failure — local `packages/auth/src/index.ts`, `apps/server/src/index.ts`

### Inferences

- Adding `defineRelations` for auth tables (needed if Better Drizzle should query `user`/`session`) is additive and does not change the DDL, so the schema check still passes.
- Writes to auth tables through Better Drizzle's timestamps plugin in `mode: 'app'` would diverge from Better Auth's own writes (Better Auth sets its own dates). Keeping the DB triggers avoids that.

### Gaps

- No Better Auth or Better Drizzle doc or issue mentions the other project.

## Q4. Which hand-rolled pieces would it remove, and which would it add?

### Takeaway

For this stack it removes almost nothing. It does not generate migrations or triggers, and does not replace kysely-codegen unless Kysely goes. Its timestamps plugin offers app-side `updatedAt` (relevant to the "app-only updated_at" debate), but only for writes made through Better Drizzle. It adds a Drizzle runtime client, a `defineRelations` config, plugins and an exact RC pin.

### Cited Findings

- Timestamps plugin: `mode: 'app'` (default) "sets the columns in plugin hooks". `create` sets both columns, `update`/`updateMany`/`updateEach`/`upsert*` set `updatedAt`. "The plugin always writes its own values" (caller values are overwritten). `mode: 'database'` "becomes a no-op - use it when the database owns timestamps (column defaults ..., triggers ...)" — [Timestamps plugin](https://better-drizzle.com/docs/plugins/timestamps) (source: `apps/web/content/docs/plugins/timestamps.mdx` in the repo)
- Timestamps column names "are the property keys in your Drizzle table definition, not the database column names". "Soft deletes ... run beneath the plugins, so they do not change `updatedAt`" — [Timestamps plugin](https://better-drizzle.com/docs/plugins/timestamps)
- Raw calls "bypass model transforms and CRUD hooks". Plugin transforms apply to the root query only, not to nested `include` loads — [Limitations](https://better-drizzle.com/docs/guides/limitations)
- Other plugins: soft-delete, rules (runtime guardrails), zod (`client.users.$zod`), ata (experimental JSON Schema validation), cache plus Redis store (experimental in 0.3.x, "options ... can change in a patch release"), and an ESLint plugin — [README, Plugins](https://github.com/almeidazs/better-drizzle#plugins)
- Performance claims (SQLite in-memory, the project's own benchmark): "9.1× faster relation loading" than equivalent hand-written Drizzle, "every other read within ~9%, writes within ~5%" — [README, Performance](https://github.com/almeidazs/better-drizzle#performance). The homepage says "~5% on reads" and "9.5×", so the two pages disagree slightly — [better-drizzle.com](https://better-drizzle.com/)
- Open feature request for a UUIDv7 plugin (relevant to app-generated ids) — [Issue #43](https://github.com/almeidazs/better-drizzle/issues/43)

### Inferences

- **Not removed:** the per-table `updated_at` triggers. App mode only covers writes through Better Drizzle, not Kysely writes, Better Auth writes, Studio edits or SQL seeds, so the triggers stay the only universal guarantee. Custom SQL migrations stay too, since Better Drizzle has no migration layer. The kysely-codegen step stays while Kysely remains.
- **Removable only if Kysely is replaced:** the `jsonObjectFrom`/`jsonArrayFrom` nesting (becomes `include`), the hand-rolled `(createdAt, id)` cursor pagination (becomes `cursor()`, which wants `orderBy` ending in a unique column), kysely-codegen and the CamelCasePlugin rules.
- **Added:** `defineRelations` config, a Drizzle runtime client (Drizzle's `$defaultFn`/`$onUpdate` would then fire, but only on Drizzle-path writes), plugin config, its error wrapper (`DrizzleQueryError`), and a hard coupling to one exact drizzle-orm RC.
- For BenPlate the zod plugin is irrelevant: the contract is hand-written Valibot and must not import DB code into the browser.

### Gaps

- No independent benchmarks on Postgres were found. All numbers come from the project.

## Q5. Migration path, effort, and lock-in

### Takeaway

There are two paths. (A) "Complement": add Better Drizzle next to Kysely, which is low effort and low lock-in but adds little and duplicates the query layer. (B) "Replace Kysely": rewrite every query in `packages/api`, switch Better Auth to the Drizzle adapter, drop kysely-codegen. That is medium-to-high effort and high API lock-in, because Prisma-style delegate calls would be spread through every handler. The schema and migrations stay pure Drizzle either way, so exit is a query-layer rewrite, never a data or schema migration.

### Cited Findings

- Install: `npm install better-drizzle drizzle-orm@1.0.0-rc.4` — [README](https://github.com/almeidazs/better-drizzle#the-whole-idea). v0.3.0 is not on npm yet — [Issue #66](https://github.com/almeidazs/better-drizzle/issues/66)
- Setup requires `defineRelations(schema, r => …)`, with many-to-many declared via `.through()` — [README](https://github.com/almeidazs/better-drizzle#relations-you-write-not-assemble)
- Raw Drizzle stays available "for anything listed here" (aggregates, expression ordering, filtered relations) — [Limitations](https://better-drizzle.com/docs/guides/limitations)
- Better Auth needs `@better-auth/drizzle-adapter/relations-v2` for Drizzle 1.x relations — [Better Auth Drizzle adapter](https://www.better-auth.com/docs/adapters/drizzle)

### Inferences

- Path A steps: (1) install v0.3.0 from git; (2) write `relations.ts` with `defineRelations` for planets, people and auth tables; (3) build `drizzle({ client: pool, relations })` on the existing `pg` Pool in `packages/db` and export `better(db, { plugins: [timestamps({ mode: 'database' })] })`; (4) use it in selected handlers. Roughly a day. Removal means deleting the file and the calls.
- Path B adds: rewrite every Kysely query (handlers in `packages/api`); replace `isUniqueViolation` with Better Drizzle's error helpers (they read `DrizzleQueryError.cause`); switch Better Auth to `drizzleAdapter` (relations-v2) and re-verify `checkAuthSchema`; delete kysely-codegen, its config, `generated/db.ts` and the `&& kysely-codegen` in `db:push`/`db:migrate`; update CLAUDE.md rules. Days to weeks depending on API size.
- Lock-in: the schema has zero lock-in, since tables and migrations stay plain Drizzle. The query layer has high lock-in under path B: calls like `findMany({ include, where: { posts: { some } } })` are a custom API, and leaving means rewriting them to Drizzle or Kysely. Exact RC pinning adds operational lock-in on upgrades.

### Gaps

- No public migration stories (Kysely to Better Drizzle) were found. The project is about 3.5 months old.

## Q6. Alternatives for the same pain points

### Takeaway

For a developer who loves Kysely's query DX and wants Drizzle's schema, migrations, push and Studio, the status quo (Drizzle v1 for DDL, Kysely plus kysely-codegen for queries, triggers for `updated_at`) already fits best. Better Drizzle solves a different problem (less Drizzle query glue). The only alternative that keeps Kysely as a first-class query API while changing the schema side is ZenStack v3, which uses ZModel and Prisma Migrate instead of Drizzle. Atlas is the only option that adds trigger-aware declarative migrations on top of a Drizzle schema, and that feature needs Atlas Pro.

### Cited Findings

**Plain Drizzle v1 for schema plus Kysely (status quo)**

- Drizzle Kit: `generate` creates SQL migrations from the schema, `push` syncs the schema directly, `studio` serves Drizzle Studio, `migrate` applies the migrations — [Drizzle Kit overview](https://orm.drizzle.team/docs/kit-overview)
- BenPlate already wires `db:push`/`db:migrate` to run `kysely-codegen` afterwards, so types always match the migrated DB — local `packages/db/package.json`

**Drizzle's own query builder instead of Kysely**

- Drizzle 1.x relational queries v2 use `defineRelations(...)` — [Better Drizzle upgrading guide](https://better-drizzle.com/docs/guides/upgrading)
- The Better Drizzle authors' own example of the raw-Drizzle equivalent of "page 2 of users with 3 latest posts each plus counts" needs a count query, a window-function subquery, a groupBy and manual stitching — [Why better-drizzle?](https://better-drizzle.com/docs/why)
- Better Auth supports Drizzle relations v2 via `@better-auth/drizzle-adapter/relations-v2` — [Better Auth Drizzle adapter](https://www.better-auth.com/docs/adapters/drizzle)

**Kysely-only (kysely-ctl plus kysely-codegen)**

- kysely-ctl offers migrations (make, latest, up, down, rollback), seeds, TypeScript migration files and a SQL command. It does **not** generate migrations from a schema diff: you write them via `migrate make` — [kysely-ctl](https://github.com/kysely-org/kysely-ctl)

**ZenStack v3**

- v3 "is a complete rewrite that removed Prisma as a runtime dependency", with an engine built from scratch on Kysely — [ZenStack docs](https://zenstack.dev/docs/)
- "The ORM client has a `$qb` property that provides the underlying Kysely query builder, and its typing is inferred from the ZModel schema." — [ZenStack query builder](https://zenstack.dev/docs/orm/query-builder)
- ZModel is a superset of Prisma Schema Language. "the migration engine is built on top of Prisma Migrate". Only PostgreSQL and SQLite are supported — [ZenStack: Migrating from Prisma](https://zenstack.dev/docs/3.x/migrate-prisma)

**Prisma 7**

- Prisma 7 removed the Rust query engine in favour of a TypeScript query compiler. Driver adapters are required, and Prisma claims about 90% smaller bundles and about 3x faster queries — [InfoQ](https://www.infoq.com/news/2026/01/prisma-7-performance); [Prisma 7 AMA](https://www.prisma.io/blog/prisma-7-ama-clearing-up-the-why-behind-the-changes)
- Prisma 7 adds `prisma.config.ts` and the new `prisma-client` generator, with generated code moved out of node_modules — [Prisma changelog](https://www.prisma.io/changelog.md)

**Atlas with a Drizzle schema**

- Atlas lets Drizzle users "define more advanced database objects such as composite types, domain types, and triggers" — [Atlas Drizzle guide](https://atlasgo.io/guides/orms/drizzle)
- Triggers with Drizzle use a `composite_schema` that combines the Drizzle schema (via `drizzle-kit export` / `external_schema`) with `triggers.sql`. `atlas migrate diff` and `apply` write to `atlas/migrations/` with checksums. "Atlas support for Triggers used in this guide is available exclusively to Pro users." — [Atlas: Drizzle triggers](https://atlasgo.io/guides/orms/drizzle/triggers)

### Inferences

Each option is judged against this stack:

| Option              | Pros                                                                                                                                                            | Cons                                                                                                                                               |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Status quo**      | Keeps the loved Kysely DX plus drizzle-kit generate/push/studio. Types come from the real DB. Triggers cover every writer (Kysely, Better Auth, Studio, seeds). | Two schema-ish sources (Drizzle TS plus generated `db.ts`), the codegen step, hand-written trigger migrations, and manual `jsonArrayFrom` nesting. |
| **Better Drizzle**  | Removes Drizzle query glue, has nice pagination and relation loading, keeps the Drizzle schema.                                                                 | Only pays off if Kysely is dropped. Exact RC pin. 0.3 not on npm. Removes no migration/trigger/codegen work in this stack.                         |
| **Drizzle RQB v2**  | Single library, no codegen, and Better Auth relations-v2 adapter support.                                                                                       | Loses Kysely DX. `$onUpdate` would work, but only on Drizzle writes, so triggers are still needed for auth/Studio/seeds.                           |
| **Kysely-only**     | One library, no Drizzle at all.                                                                                                                                 | Loses diff-generated migrations, push and Studio, which is exactly what the developer prefers Drizzle for.                                         |
| **ZenStack v3**     | Kysely `$qb` typed from the schema with no DB-introspection codegen, plus a Prisma-like high-level API.                                                         | Replaces Drizzle schema, push and Studio with ZModel and Prisma Migrate. Larger rewrite (schema, migrations, auth schema).                         |
| **Prisma 7**        | Mature migrations and a TS engine.                                                                                                                              | Replaces both halves (schema and queries), and is furthest from the Kysely preference.                                                             |
| **Atlas + Drizzle** | Could make triggers declarative (`updated_at` triggers in `triggers.sql` instead of per-table custom migrations), with linting.                                 | Pro-only for triggers. Replaces drizzle-kit's migration folder and migrator with Atlas's. Adds a Go binary and a login.                            |

- On the app-only `updated_at` question: every app-side mechanism (Better Drizzle timestamps app mode, Drizzle `$onUpdate`, a Kysely plugin) covers only writes through that layer. In BenPlate, Better Auth, Studio and SQL seeds also write. That is the concrete argument for keeping DB triggers.

### Gaps

- I did not find an official Prisma 7 to Kysely bridge (such as a maintained `prisma-kysely` generator for 7.x). I did not verify one.
- No source was found on whether ZenStack v3's migrations can coexist with Drizzle schemas, or on Better Auth's ZenStack support.
- Atlas's support for Drizzle 1.0 RC (`drizzle-kit export` on the v1 snapshot format) is not stated in the Atlas guides I fetched.
- No other tool was found that specifically bridges a Drizzle schema to Kysely types without DB introspection. I did not run a targeted search for one (for example a "drizzle-to-kysely" type generator), so this is unverified.
