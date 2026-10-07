# Better Drizzle: features, architecture and performance compared with Drizzle ORM 1.0 RC and drizzle-kit

Research date: 2026-10-07. Primary sources: the site (https://better-drizzle.com/), the GitHub repo (https://github.com/almeidazs/better-drizzle, cloned at commit `ad48e9e`, "docs: release 0.3.0"), the npm registry, and the Drizzle docs. Docs pages are cited by their source file in the repo (`apps/web/content/docs/...`), which are rendered at `https://better-drizzle.com/docs/<path>`.

**Main finding:** Better Drizzle exists, and it is a Drizzle tool. But it is **not** a schema, migration or drizzle-kit tool. It is a runtime **repository/query-API wrapper**, in the style of Prisma, that sits on top of a Drizzle 1.x client: `better(drizzle({ client, relations }))`. It does nothing about drizzle-kit, migrations, triggers, `updated_at` at the database level, rename prompts, enums, seeding, studio, RLS or push/migrate drift. Every query it runs goes through Drizzle's own query builder. It cannot be used when queries run through Kysely.

## Architecture: what kind of tool is it, what does it depend on, and does it support Drizzle v1 RC?

### Takeaway

Better Drizzle is a runtime wrapper library, not a fork, code generator or CLI. It takes a Drizzle 1.x database instance and exposes per-table delegates (`client.users.findMany(...)`), and it builds and runs every query through that same Drizzle instance. Release 0.3.0 requires exactly `drizzle-orm >=1.0.0-rc.4 <1.0.0-rc.5` and Drizzle's `defineRelations`. However, as of 2026-10-07, **0.3.0 is not on npm**: npm `latest` is still 0.2.0, which targets Drizzle 0.x.

### Cited Findings

- Tagline "Drizzle ORM, without the glue" / "Drizzle ORM, but better". The site describes it as a wrapper that adds a repository-style API on top of Drizzle ORM — [better-drizzle.com](https://better-drizzle.com/); [README](https://github.com/almeidazs/better-drizzle/blob/main/README.md)
- npm description: "Minimal, type-safe repository helpers for Drizzle ORM." License Apache-2.0 — [npm](https://www.npmjs.com/package/better-drizzle)
- "No codegen. No client process. No new schema language. It is still your Drizzle client underneath, and you can drop back to it at any line." — [README](https://github.com/almeidazs/better-drizzle/blob/main/README.md)
- "better-drizzle generates a repository API from the Drizzle schema you already have. It adds no schema language, no codegen step, and no second connection. Queries compile to Drizzle and run on your driver" — [why.mdx](https://better-drizzle.com/docs/why)
- The source confirms this. Reads and writes are built with the wrapped Drizzle instance's builders, for example `context.db.select(state.select).from(state.runtime.table)`, `context.db.insert(runtime.table).values(...)` with `.onConflictDoUpdate(...)`, and `context.db.update(...).set(...).where(...)` (`src/shared/client/operations.ts` lines ~1883, 2497–2526; `src/shared/client/relations.ts`) — [GitHub src](https://github.com/almeidazs/better-drizzle/tree/main/src)
- 0.3.0 changelog: "`better()` no longer takes `schema`. Tables and relations come from the Drizzle instance (`db._.relations`, built by `drizzle({ client, relations })`) … A Drizzle instance without `relations` throws … Only tables in the relations config get a delegate." — [changelog.mdx](https://better-drizzle.com/docs/changelog)
- Peer dependencies in 0.3.0 `package.json`: `drizzle-orm: ">=1.0.0-rc.4 <1.0.0-rc.5"`, `typescript: ^5` (required), plus optional `zod ^3.25 || ^4`, `eslint ^9`, `@typescript-eslint/parser ^8` and `ata-validator ^1.30.1`. Node `>=18`. It has no runtime `dependencies` (the README badge says "dependencies 0") — [package.json](https://github.com/almeidazs/better-drizzle/blob/main/package.json)
- The cap below rc.5 is explained in the changelog: "It is capped below `1.0.0-rc.5` because the typecheck fails against that snapshot. Projects on `drizzle-orm` 0.x must stay on `better-drizzle@~0.2.0`." — [changelog.mdx](https://better-drizzle.com/docs/changelog)
- 0.2.0 (the npm `latest`) has peer `drizzle-orm: ^0.30.0` — `npm view better-drizzle@0.2.0 peerDependencies` — [npm](https://www.npmjs.com/package/better-drizzle)
- npm registry on 2026-10-07: dist-tag `latest` = 0.2.0, versions 0.1.0, 0.1.1, 0.2.0. There is no 0.3.0 — [npm](https://www.npmjs.com/package/better-drizzle)
- The GitHub release v0.3.0 was published 2026-10-03, but its Release workflow run (id 37134862660) **failed**. Issue #66 "[BUG]: v0.3.0 is not published to npm yet!" is open — [GitHub releases](https://github.com/almeidazs/better-drizzle/releases/tag/v0.3.0); [issues](https://github.com/almeidazs/better-drizzle/issues/66)
- Sub-entrypoints in 0.3.0: `better-drizzle`, `/plugins`, `/rules`, `/eslint`, `/soft-delete`, `/timestamps`, `/zod`, `/ata`, `/cache`, `/cache/redis`. ESM and CJS, `sideEffects: false`. Built with tsdown — [package.json](https://github.com/almeidazs/better-drizzle/blob/main/package.json); [support-matrix.mdx](https://better-drizzle.com/docs/reference/support-matrix)
- Dialects: PostgreSQL, MySQL, SQLite. JSONB path filters and array operators work on Postgres only. The client "fails during client initialization if it cannot identify the provider's dialect" — [limitations.mdx](https://better-drizzle.com/docs/guides/limitations); [support-matrix.mdx](https://better-drizzle.com/docs/reference/support-matrix)
- Project maturity: the repo was created 2026-06-22. It has 347 stars and 7 forks. 319 of the commits are by `almeidazs`, and the next human contributor has 8. Sponsored by Neon. A single maintainer on npm (`eualmeida`). npm 0.2.0 is published with SLSA provenance — GitHub API (`gh repo view`, `/contributors`), [README](https://github.com/almeidazs/better-drizzle/blob/main/README.md), [npm](https://www.npmjs.com/package/better-drizzle)
- The project publishes a stability page (`reference/stability.mdx`) and marks `cache` and `ata` as experimental in 0.3.x: "options, `$cache` API, store interface, and entry format can change in a patch release." — [README](https://github.com/almeidazs/better-drizzle/blob/main/README.md)

### Inferences

- Better Drizzle is pre-1.0 (0.x), mostly written by one author, three and a half months old, and pinned to one Drizzle RC snapshot. Each Drizzle RC bump will need a matching Better Drizzle release, and the 0.3.0 publish to npm has already failed once.
- Today, the install command on the site and README (`npm i better-drizzle drizzle-orm@1.0.0-rc.4`) resolves to better-drizzle 0.2.0. That version peers on `drizzle-orm ^0.30.0`, so it is mismatched with rc.4 until #66 is fixed.
- BenPlate's catalog pins `drizzle-orm` and `drizzle-kit` to `1.0.0-rc.4` (`pnpm-workspace.yaml`), which is exactly the one snapshot 0.3.0 supports.

### Gaps

- No docs page mentions Drizzle 1.x casing helpers such as `snakeCase.table`. The `.explain()` path builds its own query config, with `getColumnCasing` returning `column.name` (`src/shared/client/explain.ts`). Whether this renders snake_case names correctly for `snakeCase.table` tables was not tested. Normal queries go through Drizzle's builder, so they should inherit Drizzle's casing, but this is also unverified.
- There is no source for a fix date for the npm 0.3.0 publish.

## Feature list, and which known Drizzle pain points it addresses

### Takeaway

All of its features are about queries and writes at runtime: Prisma-like finders, relation filters and includes, pagination, nested relation writes, bulk operations, atomic updates, transactions with savepoints and retries, hooks, plugins (timestamps, soft delete, Zod, rules, ESLint, cache, ata), `.explain()` and prepared statements. Of the schema and migration pain points in scope, it addresses **none** at the database or drizzle-kit level. The closest is a `timestamps` plugin that sets `updatedAt` in application code, which is the same runtime-only approach as Drizzle's `$onUpdate`. Its only overlap with "relations/relational queries" is that it is a different relational API built on Drizzle's `defineRelations`.

### Cited Findings: features it does add

- **Reads:** `findMany`, `findFirst`, `findOne`, `findUnique` (since 0.3.0 this requires a `where` that pins one row, else `UNIQUE_WHERE_REQUIRED`), `count`, `exists`, `paginate` (offset, returns `{ data, pagination: { page, perPage, total, pageCount, hasNext, hasPrevious } }`) and `cursor` — [support-matrix.mdx](https://better-drizzle.com/docs/reference/support-matrix); [why.mdx](https://better-drizzle.com/docs/why); [changelog.mdx](https://better-drizzle.com/docs/changelog)
- **Relation filters and loading:** `some` / `every` / `none` / `is` filters, nested `include` / `select`, per-parent `take` / `skip` (via `row_number()`), and `_count` (correlated subqueries). The batched loader runs "one query per relation node, never one per row". Many-to-many works only through Drizzle's `.through()` — [README](https://github.com/almeidazs/better-drizzle/blob/main/README.md); [support-matrix.mdx](https://better-drizzle.com/docs/reference/support-matrix)
- **Relation shapes it cannot load:** relations with a relation-level `where`, and `one` relations through a junction table, throw `Relation "x" on "t" cannot be loaded`. "They still work with Drizzle's own relational queries on the underlying `db`." — [limitations.mdx](https://better-drizzle.com/docs/guides/limitations)
- **Writes:** `create`, `update` and `delete` (since 0.3.0 these change at most one row), `upsert` (a native `ON CONFLICT` on a unique key), `createMany` (with `batchSize`), `updateMany` and `deleteMany` (return affected rows), `updateEach` (one `CASE` statement), and `upsertMany` (one `INSERT ... ON CONFLICT` per batch). Nested relation writes use `connect` / `disconnect` / `set` "in one transaction". Atomic updates: `increment`, `decrement`, `multiply`, `divide`, `toggle` — [README](https://github.com/almeidazs/better-drizzle/blob/main/README.md); [changelog.mdx](https://better-drizzle.com/docs/changelog); [limitations.mdx](https://better-drizzle.com/docs/guides/limitations)
- **Transactions:** savepoints for nested transactions, "automatic retries on deadlock and serialization failures", `afterCommit` / `afterRollback`, and isolation levels where the dialect supports them — [README](https://github.com/almeidazs/better-drizzle/blob/main/README.md)
- **Row locks:** `lock` on Postgres and MySQL reads. It is rejected together with general relation loading ("nested relation stages run as separate queries, so a root lock would not cover them") — [support-matrix.mdx](https://better-drizzle.com/docs/reference/support-matrix); [limitations.mdx](https://better-drizzle.com/docs/guides/limitations)
- **Escape hatches:** `$raw` and `$executeRaw` (tagged templates or Drizzle `sql` only, with their own hooks). `$rawUnsafe` is off by default. `$where()` compiles typed conditions for use inside raw Drizzle queries — [limitations.mdx](https://better-drizzle.com/docs/guides/limitations); [GitHub PR #63](https://github.com/almeidazs/better-drizzle/pull/63)
- **Not supported:** `groupBy` and aggregates other than count. `orderBy` takes columns only (no SQL expressions, no ordering by relation columns) — [limitations.mdx](https://better-drizzle.com/docs/guides/limitations)
- **Plugins:** `rules` (runtime guardrails, e.g. `noDeleteManyWithoutWhere`, `noRawMutation`), `eslint` (the static subset of those rules), `timestamps`, `softDelete` (with `restore()`), `zod` (`client.users.$zod` schemas), `ata` (experimental JSON-Schema validation), and `cache` / `cache/redis` (experimental; "concurrent reads and store failures can leave stale results cached"; "Raw Drizzle writes still need a manual `$cache.invalidate()`") — [README](https://github.com/almeidazs/better-drizzle/blob/main/README.md)
- **Plugin scope limit:** "Plugin `transform()` runs once per operation, on the root query. Relation loads … do not pass through transforms", so tenant scoping and soft-delete filters are not applied to nested relations. Soft delete does not filter `upsert` / `upsertMany` — [limitations.mdx](https://better-drizzle.com/docs/guides/limitations)
- **Tooling:** `.explain()` on any read returns the SQL, the params and the database plan without running the query. It also ships a first-party AI-agent "skill pack" (`skills/better-drizzle/SKILL.md`) — [README](https://github.com/almeidazs/better-drizzle/blob/main/README.md); [better-drizzle.com](https://better-drizzle.com/)

### Cited Findings: the pain points in scope

- **updated_at / `$onUpdate` runtime-only.** Upstream gap confirmed: Drizzle docs say of `$defaultFn` and `$onUpdateFn`: "This value does not affect the `drizzle-kit` behavior, it is only used at runtime in `drizzle-orm`" — [Drizzle PG column types](https://orm.drizzle.team/docs/column-types/pg). Better Drizzle's answer is the `timestamps` plugin. `mode: 'app'` (the default) "fills timestamp columns before the database call", and only for writes made through Better Drizzle delegates. `mode: 'database'` "becomes a no-op - use it when the database owns timestamps (column defaults like `DEFAULT now()`, `ON UPDATE`, triggers…)". It generates no trigger and no migration. It also overwrites caller-provided timestamps, and `$withoutPlugins()` opts out — [timestamps.mdx](https://better-drizzle.com/docs/plugins/timestamps)
- **Triggers and functions in migrations, custom SQL migrations, rename prompts, migration safety (transactions, locks, `CREATE INDEX CONCURRENTLY`), seeding, enums, identity columns, studio, push vs migrate drift, multi-schema, RLS/policies.** Not addressed. A grep of `src/` and all docs pages finds no migration code. drizzle-kit is mentioned only as the user's own tool: the testing guide says to run "your drizzle-kit migrations" or `drizzle-kit push`, and the arrays page says "generate the migration with drizzle-kit as usual". The limitations page says: "No codegen layer … your schema remains the source of truth" — [testing.mdx](https://better-drizzle.com/docs/guides/testing); [arrays.mdx](https://better-drizzle.com/docs/querying/arrays); [limitations.mdx](https://better-drizzle.com/docs/guides/limitations)
- Upstream context for custom SQL: drizzle-kit already supports `drizzle-kit generate --custom --name=<name>` for "DDL alternations currently not supported by Drizzle Kit or data seeding". v1 lays out migrations as one timestamped folder per migration (e.g. `20242409125510_init_sql/`). JS/TS migrations are still listed as not yet available — [Drizzle custom migrations](https://orm.drizzle.team/docs/kit-custom-migrations)
- **Type generation:** none. "No codegen." Result types are inferred from `typeof relations` plus the `include` / `select` you pass. 0.3.0 made unknown keys compile errors in `where`, `data`, `select`, `include`, `orderBy` and similar — [README](https://github.com/almeidazs/better-drizzle/blob/main/README.md); [changelog.mdx](https://better-drizzle.com/docs/changelog)
- **Relations / relational queries:** it consumes Drizzle 1.x `defineRelations` (RQB v2) and replaces `db.query` with its own batched loader. It is a different API, not a fix to RQB — [changelog.mdx](https://better-drizzle.com/docs/changelog)

### Inferences

- For a project whose pain points are drizzle-kit and migration hygiene (triggers, `updated_at`, custom SQL, rename prompts, safe index creation), Better Drizzle has nothing to offer. It solves a different problem: verbose query and repository code.
- Its `timestamps` plugin can be bypassed by raw Drizzle writes, `$raw` and other clients. It is weaker than a database trigger such as BenPlate's `planets_updated_at`, and it repeats the runtime-only limitation that BenPlate's CLAUDE.md already works around.

### Gaps

- I found no independent write-ups, blog posts or third-party reviews of Better Drizzle. Web searches for "better-drizzle" returned only unrelated results (dictionary pages, the old MySQL fork "Drizzle"). Everything about its features is vendor documentation, partly checked here against the source code.

## Can its features be used while queries run through Kysely?

### Takeaway

No. Better Drizzle is only a query layer, and it must wrap a live Drizzle 1.x client created with `relations`. It has no schema or migration features that could be used separately from that client. If queries run through Kysely, nothing in Better Drizzle applies, apart from reading its code as inspiration.

### Cited Findings

- "`better()` reads tables and relations from that instance"; the client is `better(drizzle({ connection, relations }))` — [README](https://github.com/almeidazs/better-drizzle/blob/main/README.md)
- "A Drizzle instance without `relations` throws `No tables found on the Drizzle instance.`" — [changelog.mdx](https://better-drizzle.com/docs/changelog)
- The source calls `context.db.select / insert / update / delete` on the Drizzle instance for every operation. Its only external imports are `drizzle-orm` (and its `pg-core`, `mysql-core`, `relations`, `sql` and `alias` subpaths), `zod`, `ata-validator` and `eslint`. There are no Kysely imports anywhere (grep of `src/`) — [GitHub src](https://github.com/almeidazs/better-drizzle/tree/main/src)

### Inferences

- Adopting it in BenPlate would mean adding a second runtime query path (a Drizzle client plus `defineRelations`) next to Kysely, against the project rule that "Kysely runs the queries".

### Gaps

- None found.

## Performance: benchmarks, who ran them, how, and the overhead

### Takeaway

The only benchmarks are the vendor's own, run with Bun on **in-memory SQLite** to isolate wrapper overhead. The published (vendor) figures: reads within about 3–11% of raw Drizzle, writes within about 3–4%, transactions within about 9%, prepared reads within about 4%, and a headline "9.5× faster" relation graph against Drizzle's `db.query`. The headline numbers differ between the site and the README. Nothing has been independently verified. There are no figures for bundle size, cold start, tsc time or migration speed.

### Cited Findings (all vendor claims)

- Method: "Generated by `bun run bench:report` on SQLite in-memory, to isolate wrapper overhead from I/O. Both sides of every pair are sampled in the same window, alternating which one leads, and the median across samples is reported. Measurement uses mitata's engine." The site warns: "Read the percentages, not the microseconds … the same lookup reads 53 µs on an idle machine and 93 µs under load." — [benchmarks.mdx](https://better-drizzle.com/docs/performance/benchmarks)
- Parity principle: "Raw Drizzle performs the same work and returns the same shape". The full suite checks each scenario with `deepStrictEqual` before timing it. A separate "manual Drizzle reference" group (flat joins, no metadata) is faster, and "is not a fair overhead claim" — [benchmark/README.md](https://github.com/almeidazs/better-drizzle/blob/main/benchmark/README.md)
- Published latency table, reads (Drizzle vs Better Drizzle): point lookup 25.21 vs 26.96 µs (+6.9%), filtered list +3.7%, simple PK order +2.8%, NULLS LAST order +11.3%, **relation graph 3.94 ms vs 414.30 µs (9.5× faster)**, relation counts +0.5%, active count +9.0%, exists +7.4%, offset pagination +3.1%, cursor pagination +5.0% — [benchmarks.mdx](https://better-drizzle.com/docs/performance/benchmarks)
- Prepared reads: +0.8% to +3.5% against Drizzle's `sql.placeholder()` + `.prepare()`. Preparing cut a point lookup from 48.45 µs to 15.57 µs — [benchmarks.mdx](https://better-drizzle.com/docs/performance/benchmarks)
- Writes: create+delete +3.3%, update+reload +4.0%. Transactions: simple +7.2%, multi-op −8.5%, read-only +9.0% — [benchmarks.mdx](https://better-drizzle.com/docs/performance/benchmarks)
- Memory (heap delta ranges): single read −45% to −50%, write −8% to −25%, **mixed read +165% to +210%, transaction +91% to +107%** — [benchmarks.mdx](https://better-drizzle.com/docs/performance/benchmarks)
- What the relation-graph pair measures: the raw side is `context.raw.query.users.findMany({ limit, with: { posts: { with: { comments: true } } } })`, which is Drizzle's own RQB v2. The Better Drizzle side is `users.findMany({ include: { posts: { include: { comments: true } } }, take })` (`benchmark/scenarios.ts` lines 129–151) — [GitHub](https://github.com/almeidazs/better-drizzle/blob/main/benchmark/scenarios.ts)
- **Conflicting headline numbers:**
  - The README says "9.1× faster relation loading (10.24 ms → 1.12 ms)", "every other read within ~9%, writes within ~5%". It says the win comes from "one query per relation node instead of the per-row work the equivalent hand-written code ends up doing" — [README](https://github.com/almeidazs/better-drizzle/blob/main/README.md)
  - The site says "9.5× faster" (414 µs vs 3.94 ms) and "~5%" overhead on reads — [better-drizzle.com](https://better-drizzle.com/)
  - The benchmarks page says reads are "within ~12% … most are within 9%" — [benchmarks.mdx](https://better-drizzle.com/docs/performance/benchmarks)
- **An older table in `benchmark/README.md` gives larger overheads:** filtered list +28.2%, read-only transaction +21.8%, simple transaction +12.5%. Memory: transaction +29.8% time and +82.4% heap. It is labelled "a historical Bun 1.3.14 snapshot" on an AMD Ryzen 5 7520U — [benchmark/README.md](https://github.com/almeidazs/better-drizzle/blob/main/benchmark/README.md)
- The vendor admits the JSONB/Postgres suite is I/O-bound and that the "two sides land within noise of each other". Its typed JSONB filter adds an extra `jsonb_typeof` predicate that hand-written SQL omits — [benchmarks.mdx](https://better-drizzle.com/docs/performance/benchmarks)
- CI runs `bun run bench` and `bench:memory` on `ubuntu-latest` with Bun `latest` on pushes to main, and uploads the results as artifacts. It is not run against Postgres — [benchmarks.yml](https://github.com/almeidazs/better-drizzle/blob/main/.github/workflows/benchmarks.yml)
- Cache: "The wrapper-overhead tables do not establish a cache speedup." — [benchmark/README.md](https://github.com/almeidazs/better-drizzle/blob/main/benchmark/README.md)

### Inferences

- The "9.5× faster" claim is relative to Drizzle's single-statement RQB on in-memory SQLite, where an extra round trip costs almost nothing. On networked Postgres, Better Drizzle's one-query-per-relation-node strategy adds round trips, so the ratio could shrink or reverse. This is untested, and the vendor runs no Postgres latency benchmark.
- In every published figure, the wrapper costs a few percent of CPU per call and more heap for mixed and transactional workloads. This adds to Drizzle's own overhead and does not replace it. For a Kysely-based stack, it would add a second ORM runtime.

### Gaps

- No bundle-size, cold-start (serverless), tsc / type-check time or editor-latency measurements exist. This matters because it uses deep conditional types over `typeof relations`.
- Migration-generation speed is not applicable, since it has no migration features.
- No independent or third-party benchmark was found.

## DX: setup, configuration, types and error messages

### Takeaway

Setup is a single function call around an existing Drizzle 1.x client that has `defineRelations`. Configuration happens through `better(db, { plugins, transaction, raw })`. Types are inferred, with strict unknown-key errors. Errors are a typed `BetterDrizzleError` with codes and HTTP-like statuses. The main DX risks right now are the broken npm release and the narrow Drizzle RC pin.

### Cited Findings

- Setup: define tables, then relations with `defineRelations(schema, r => ...)` (or `defineRelations(schema)` with no callback), then `better(drizzle({ connection, relations }))` — [README](https://github.com/almeidazs/better-drizzle/blob/main/README.md)
- Install with an explicit Drizzle version, "until Drizzle 1.0 is tagged `latest`, a plain install resolves to 0.x" — [README](https://github.com/almeidazs/better-drizzle/blob/main/README.md)
- Type parameters are `typeof relations` (`BetterDrizzleClient`, `BetterTableKey`, `WhereArg`) — [changelog.mdx](https://better-drizzle.com/docs/changelog)
- Errors: since 0.3.0, invalid arguments throw `INVALID_ARGS` (status 400) instead of `OPERATION_ERROR` (500). Helpers `isUniqueViolation`, `isForeignKeyViolation`, `isNotNullViolation`, `isCheckViolation` and `getDatabaseErrorInfo` unwrap Drizzle 1.x `DrizzleQueryError.cause` — [changelog.mdx](https://better-drizzle.com/docs/changelog)
- Fail-fast checks: unsupported transaction options are handled by `transaction.unsupportedOptions: 'warn' | 'throw' | 'ignore'`. Plugins declare required columns and fail at bootstrap with `PLUGIN_REQUIRED_COLUMN_MISSING` / `PLUGIN_REQUIRED_COLUMN_TYPE` — [limitations.mdx](https://better-drizzle.com/docs/guides/limitations); [timestamps.mdx](https://better-drizzle.com/docs/plugins/timestamps); [changelog.mdx](https://better-drizzle.com/docs/changelog)
- Since 0.3.0, reads are lazy thenables, like Drizzle builders: "A read that is never awaited does not run." — [changelog.mdx](https://better-drizzle.com/docs/changelog)
- Docs include migrating-from-drizzle, multi-tenancy (`$withContext`), observability, testing, troubleshooting and upgrading guides (doc file list under `apps/web/content/docs/guides/`) — [GitHub docs source](https://github.com/almeidazs/better-drizzle/tree/main/apps/web/content/docs)
- Recent closed bug #61, "The export normalizeRelation was not found in module", points to packaging issues in recent releases — [GitHub issues](https://github.com/almeidazs/better-drizzle/issues/61)

### Inferences

- 0.3.0 lists many breaking and behavior changes, such as `update` / `delete` now changing at most one row, soft-delete scope changes, and lazy reads. The API is still moving fast between minor versions.

### Gaps

- There is no hands-on measurement of editor responsiveness or type-check cost on a real schema.
