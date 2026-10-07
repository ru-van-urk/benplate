# Better Drizzle: product and project profile (as of 2026-10-07)

All metrics were collected on 2026-10-07 from the GitHub REST API (`gh api repos/almeidazs/better-drizzle ...`), the npm registry (`registry.npmjs.org/better-drizzle`) and the npm downloads API (`api.npmjs.org/downloads/...`), unless a different date is given. The repository was also shallow-cloned at commit HEAD of `main` (pushed 2026-10-05) to read docs and source.

## What exactly is Better Drizzle, and what does it claim to do?

### Takeaway

The site exists and is about Drizzle. `better-drizzle` is an open-source TypeScript library (npm package `better-drizzle`) that wraps a Drizzle ORM instance with a Prisma-style "repository" / delegate API (`client.users.findMany({ where, include, ... })`). It is not a fork, not a CLI (a CLI is only a feature request), and not a hosted service. Queries compile to Drizzle and run on the user's own driver.

### Cited Findings

- Taglines on the homepage: "Drizzle ORM, without the glue", "ORM, but better", and "The patterns every service ends up re-implementing, generated from your schema and kept typed". The page title is "better-drizzle - Type-safe Repository API for Drizzle ORM". — [better-drizzle.com](https://better-drizzle.com/)
- Claimed features: relation filters, nested includes, pagination, relation writes and plugins for every table; "zero codegen"; works with existing Drizzle databases without migration; PostgreSQL (with JSONB and array features), MySQL and SQLite. — [better-drizzle.com](https://better-drizzle.com/)
- In its own words (docs, "Why"): "better-drizzle generates a repository API from **the Drizzle schema you already have**. It adds no schema language, no codegen step, and no second connection. Queries compile to Drizzle and run on your driver, and raw Drizzle stays one line away." — [Why better-drizzle?](https://better-drizzle.com/docs/why) (source: `apps/web/content/docs/why.mdx` in the [repo](https://github.com/almeidazs/better-drizzle))
- GitHub description: "ORM, but better". Topics include drizzle, drizzle-orm, orm, postgresql, mysql, sqlite, neon, typescript. — [GitHub repo](https://github.com/almeidazs/better-drizzle)
- Core API (support matrix): `findMany`, `findFirst`, `findOne`, `findUnique`, `count`, `exists`, `paginate`, `cursor`, `create`, `update`, `delete`, `upsert`, `createMany`, `updateMany`, `deleteMany`, `updateEach` (single `CASE` statement), `repository(name)`, `extends(...)`, `$withContext`, `$withState`, `$withoutPlugins`, `$where`, all marked as supported on PostgreSQL, SQLite and MySQL. — [Support matrix](https://better-drizzle.com/docs/reference/support-matrix)
- Shipped as one package with subpath exports: `.`, `./plugins`, `./eslint`, `./rules`, `./soft-delete`, `./timestamps`, `./zod`, `./ata`, `./cache`, `./cache/redis` (from `package.json` on `main`, version 0.3.0). ESM, CJS and types for every entrypoint. — [repo package.json](https://github.com/almeidazs/better-drizzle/blob/main/package.json); [Support matrix](https://better-drizzle.com/docs/reference/support-matrix)
- Built-in plugins: soft delete, timestamps, Zod validation, caching (Redis, experimental), ATA JSON Schema validation (experimental), runtime "rules" guardrails, plus an ESLint plugin. — [better-drizzle.com](https://better-drizzle.com/); [Stability & semver](https://better-drizzle.com/docs/reference/stability)
- No runtime `dependencies`; peers are `drizzle-orm`, `typescript ^5`, and optional `zod`, `ata-validator`, `eslint`, `@typescript-eslint/parser`. Node `>=18`. — [repo package.json](https://github.com/almeidazs/better-drizzle/blob/main/package.json); [npm registry](https://registry.npmjs.org/better-drizzle)
- 0.3.0 runs on Drizzle ORM 1.0 RC (relational queries v2): tables and relations come from `drizzle({ client, relations })`, so `better(db)` needs no `schema` option; many-to-many comes only from Drizzle's `.through()`. — [Release v0.3.0](https://github.com/almeidazs/better-drizzle/releases/tag/v0.3.0)
- Performance claims: the homepage says "9.5× faster than Drizzle's relational queries on nested reads" and "~5% read overhead and <5% write overhead". The benchmarks page says reads land "within ~12% of raw Drizzle, and most are within 9%" (the highest is explicit `NULLS LAST`, +11.3%). It attributes the 9.5x figure (3.94 ms vs 414.30 µs on a "relation graph") to a batched loader that "issues one query per relation node instead of the per-row work the equivalent raw code ends up doing". — [better-drizzle.com](https://better-drizzle.com/); [Benchmarks](https://better-drizzle.com/docs/performance/benchmarks)
- Documented limitations: no `groupBy` or aggregates beyond count; column-based `orderBy` only; model transforms (for example soft delete filtering) apply to the root query only, not to `include`d relations or `_count`; relations with a relation-level `where`, and `one` relations through a junction, cannot be loaded or filtered; row locks reject relation loading; raw SQL bypasses CRUD hooks. — [Limitations](https://better-drizzle.com/docs/guides/limitations)
- A CLI exists only as an open feature request (#52, opened by the maintainer 2026-09-25, body just "CLI"). — [Issue #52](https://github.com/almeidazs/better-drizzle/issues/52)

### Inferences

- The "~5% read overhead" on the homepage is more optimistic than the project's own benchmark page (~12% worst case, most within 9%). The "9.5× faster" figure compares against hand-written per-row raw code, as described on the benchmarks page, not a general claim against every Drizzle query.
- This is a Prisma-like query layer on top of Drizzle. Every query runs through Drizzle's query builder and driver. That matters for a codebase like BenPlate, which defines its schema in Drizzle but runs queries through Kysely: adopting better-drizzle would mean running queries through Drizzle (inferred from the architecture above; BenPlate's CLAUDE.md says "Kysely runs the queries").
- BenPlate's catalog pins `drizzle-orm: 1.0.0-rc.4` (`/Users/ruben/dev/benplate/pnpm-workspace.yaml`), which is exactly the only Drizzle version better-drizzle 0.3.0 accepts (`>=1.0.0-rc.4 <1.0.0-rc.5`).

### Gaps

- I did not independently reproduce the benchmark numbers. The page itself says absolute timings vary with machine load and only the ratios are stable.

## Who makes it? Affiliated with drizzle-team? Funding or backing?

### Takeaway

It is an independent, single-author project by Hiago Almeida (GitHub `almeidazs`, Brazil), published under a personal GitHub account. I found no affiliation with drizzle-team. Its backing is a Neon sponsorship (logo in the README and on the site) and one individual GitHub Sponsor.

### Cited Findings

- Repo owner `almeidazs` is a GitHub **User** account, not an organization. — [GitHub repo](https://github.com/almeidazs/better-drizzle)
- Maintainer profile: name "Hiago Almeida", location Brazil, bio "Principal Software Engineer · Previously @AbacatePay and @RewriteToday", website almeidazs.com, X/Twitter `eualmeidazs`, 38 public repos, 46 followers, account created 2023-05-23. — [GitHub profile](https://github.com/almeidazs)
- The homepage credits the project to "@almeidazs". — [better-drizzle.com](https://better-drizzle.com/)
- The sole npm maintainer of `better-drizzle` is `eualmeida` (hello@eualmeida.com.br). — [npm registry](https://registry.npmjs.org/better-drizzle); [npm page](https://www.npmjs.com/package/better-drizzle)
- The README says "Sponsored by Neon" with a Neon logo, and the site lists Neon and Victor Bona as sponsors. — [README](https://github.com/almeidazs/better-drizzle#readme); [better-drizzle.com](https://better-drizzle.com/)
- The GitHub Sponsors listing shows 1 sponsor (`vicotrbb`). Its goal text reads "It would mean a lot to me for my open source work to be recognized". — [GitHub Sponsors](https://github.com/sponsors/almeidazs) (GraphQL query, 2026-10-07)
- None of the 7 contributors belongs to drizzle-team (the list follows below). — [Contributors](https://github.com/almeidazs/better-drizzle/graphs/contributors)

### Inferences

- The "better-*" name echoes Better Auth, but I found nothing linking the two projects. The name and the "Drizzle ORM, but better" positioning imply no endorsement by drizzle-team.
- I could not see the size or terms of the Neon sponsorship (money, credits or logo exchange).

### Gaps

- I found no statement from drizzle-team (docs, X, Discord) acknowledging or endorsing the project. I did not search Drizzle's Discord.
- I found no company, legal entity or formal funding behind the project.
- I could not verify Neon's sponsorship from Neon's side.

## Maturity: releases, versions, cadence, downloads, GitHub activity

### Takeaway

The project is very young: the repo was created 2026-06-22 and the first npm release came out 2026-06-26, about 3.5 months before this research. It is pre-1.0 (0.x) and has had three npm releases. Development comes in bursts: heavy in June and September, nearly idle in August. As of 2026-10-07, the **latest version on npm is 0.2.0, not 0.3.0**: the 0.3.0 GitHub release (2026-10-03) failed to publish because the maintainer lost access to his npm account (2FA). The docs on the site already describe 0.3.0.

### Cited Findings

**Timeline and versions**

- Repo created 2026-06-22T16:12:45Z. First commit 2026-06-22 ("feat: first commit"). — [GitHub repo](https://github.com/almeidazs/better-drizzle)
- npm `better-drizzle` versions: 0.1.0 (2026-06-26), 0.1.1 (2026-06-27), 0.2.0 (2026-09-20). `dist-tags.latest` = `0.2.0`. — [npm registry](https://registry.npmjs.org/better-drizzle)
- GitHub releases: `better-drizzle@0.1.1` (2026-06-27), `v0.2.0` (2026-09-20), `v0.3.0` (2026-10-03). None is marked prerelease. — [Releases](https://github.com/almeidazs/better-drizzle/releases)
- Issue #66 (2026-10-05, open): "The v0.3.0 release was created, but the publish to npm workflow actually failed. Running `pnpm i better-drizzle@0.3.0` gives a `ERR_PNPM_NO_MATCHING_VERSION` error." A user's workaround was to pack the release source locally. — [Issue #66](https://github.com/almeidazs/better-drizzle/issues/66)
- Maintainer, 2026-10-04: "I lost access to my npm account due to two-factor authentication and have requested a reset. This will take about 1–3 days, so I can't publish the new `v0.3.0` version right now." — [Issue #61 comment](https://github.com/almeidazs/better-drizzle/issues/61)
- Maintainer, 2026-10-01: "the documentation is for the next version `v0.3.0` and not for the current one". This answered a user hitting "The export normalizeRelation was not found in module" when following the docs with the npm version. — [Issue #61](https://github.com/almeidazs/better-drizzle/issues/61)
- Separate plugin packages `@better-drizzle/soft-delete` and `@better-drizzle/timestamps` (0.1.0 and 0.1.1, June 2026) are superseded. Since 0.2.0, official plugins ship inside `better-drizzle` as subpath exports. — [npm @better-drizzle/soft-delete](https://www.npmjs.com/package/@better-drizzle/soft-delete); [Stability & semver](https://better-drizzle.com/docs/reference/stability)

**Drizzle version compatibility (peer ranges as published)**

- `drizzle-orm` peer ranges: 0.1.0 `^0.45.2`; 0.1.1 and 0.2.0 `^0.30.0`; 0.3.0 (unpublished on npm) `>=1.0.0-rc.4 <1.0.0-rc.5`. — [npm registry](https://registry.npmjs.org/better-drizzle); [Release v0.3.0](https://github.com/almeidazs/better-drizzle/releases/tag/v0.3.0)
- The 0.3.0 release notes explain the rc.4-only cap: "It is capped below `1.0.0-rc.5` because the typecheck fails against that snapshot. Projects on `drizzle-orm` 0.x must stay on `better-drizzle@~0.2.0`." — [Release v0.3.0](https://github.com/almeidazs/better-drizzle/releases/tag/v0.3.0)
- drizzle-orm npm dist-tags on 2026-10-07: `latest` = 0.45.3, `rc` = 1.0.0-rc.4 (published 2026-06-27). An rc.5 exists only as a snapshot tag (`1.0.0-rc.5-5935859`). — [npm registry drizzle-orm](https://registry.npmjs.org/drizzle-orm)
- Drizzle 1.0 RC support had been requested by users: issue #14 (2026-06-28, "Incompatible with drizzle-orm 1.0: extractTablesRelationalConfig is not a function") and #46 (2026-09-24). — [Issue #14](https://github.com/almeidazs/better-drizzle/issues/14); [Issue #46](https://github.com/almeidazs/better-drizzle/issues/46)

**npm downloads** (npm downloads API)

- Last week (2026-09-28 to 2026-10-04): 825. Last month (2026-09-05 to 2026-10-04): 2,455. — [npm downloads API](https://api.npmjs.org/downloads/point/last-week/better-drizzle)
- Monthly totals: Jun 2026 440; Jul 3,978; Aug 4,368; Sep 2,256; Oct 1–6: 528. — [npm downloads API range](https://api.npmjs.org/downloads/range/2025-01-01:2026-10-06/better-drizzle)
- Legacy plugin packages, last week: `@better-drizzle/soft-delete` 47, `@better-drizzle/timestamps` 27. — [npm downloads API](https://api.npmjs.org/downloads/point/last-week/@better-drizzle/soft-delete)

**GitHub metrics** (2026-10-07)

- 347 stars, 7 forks, 4 open issues + PRs (#43 UUIDv7 feature, #52 CLI, #65 dependabot PR, #66 npm publish bug), 66 issues/PRs total. Last push 2026-10-05. Not archived. — [GitHub repo](https://github.com/almeidazs/better-drizzle); [Issues](https://github.com/almeidazs/better-drizzle/issues)
- Commits by month (whole history): Jun 2026 113; Jul 34; Aug 3; Sep 153; Oct (1–5) 51. — [Commits](https://github.com/almeidazs/better-drizzle/commits/main)
- Commits from 2026-07-07 to 2026-10-07: 240, by author: almeidazs 221, mertcanaltin 8, dependabot 6, pablofdezr 3, flaxodotdev 1, joaotonaco 1. — [Commits](https://github.com/almeidazs/better-drizzle/commits/main)
- Two commit trailers name "Claude Opus 4.8 (1M context)" as co-author. An `AGENTS.md` and a `skills/better-drizzle` folder (agent skill) are in the repo root. — [repo](https://github.com/almeidazs/better-drizzle)
- Codebase size: about 31,900 lines of TypeScript in `src/` and 59 test files. CI runs tests against `postgres:16-alpine` and `mysql:8` service containers, and also includes CodeQL, dependency review and benchmark workflows. — [repo .github/workflows](https://github.com/almeidazs/better-drizzle/tree/main/.github/workflows)
- The release workflow publishes with `npm publish --provenance` using an `NPM_TOKEN` secret. — [release.yml](https://github.com/almeidazs/better-drizzle/blob/main/.github/workflows/release.yml)

**Visibility**

- Listed on daily.dev ("better-drizzle — Drizzle ORM, but better"). A preview deployment exists at better-drizzle.vercel.app. — [daily.dev](https://daily.dev/posts/owotzvexx); [vercel preview](https://better-drizzle.vercel.app/)

### Inferences

- Cadence: roughly 3 months passed between 0.1.1 (June 27) and 0.2.0 (Sept 20), then 0.3.0 followed two weeks later as a breaking release. The burst pattern (3 commits in August, 153 in September) fits a side project worked on in sprints.
- The published 0.2.0's peer range `^0.30.0` means `>=0.30.0 <0.31.0` under semver caret rules for 0.x. That excludes current Drizzle 0.x (0.45.3), so package managers would warn about or reject the peer. The maintainer wrote "any version of drizzle `^0.30`", which suggests he expected it to cover all 0.x. This is my reading of semver, not something reported in an issue.
- Being able to install only exactly `drizzle-orm@1.0.0-rc.4` with 0.3.0 makes better-drizzle a blocker for Drizzle RC upgrades until it ships a new release.
- Downloads fell from about 4,000/month in July and August to about 2,300 in September. Without referrer data, the cause cannot be pinned down.

### Gaps

- I could not check whether 0.3.0 was published to npm after 2026-10-07. The maintainer estimated a 1–3 day account reset starting around 2026-10-04.
- npmtrends and npm-stat were not consulted. The npm downloads API is the primary source they use.
- I found no launch posts on Reddit, Hacker News or X in web searches. I did not search X directly, so the author's announcements there are unverified.

## License, pricing, hosted components, telemetry

### Takeaway

Apache-2.0, free, fully open source. There are no paid tiers, no hosted components and no account requirement. I found no telemetry in the source.

### Cited Findings

- License: Apache-2.0, in the GitHub license metadata, the LICENSE file ("Apache License Version 2.0, January 2004") and the npm `license` field. — [GitHub repo](https://github.com/almeidazs/better-drizzle); [LICENSE](https://github.com/almeidazs/better-drizzle/blob/main/LICENSE); [npm registry](https://registry.npmjs.org/better-drizzle)
- The site presents the library as free and open source and has no pricing page. Its only monetary link is GitHub Sponsors. — [better-drizzle.com](https://better-drizzle.com/); [GitHub Sponsors](https://github.com/sponsors/almeidazs)
- The optional cache plugin uses a user-provided Redis store (`better-drizzle/cache/redis`). No vendor service is involved. — [Release v0.3.0](https://github.com/almeidazs/better-drizzle/releases/tag/v0.3.0); [Cache plugin docs](https://better-drizzle.com/docs/plugins/cache)
- Telemetry: `grep -rniE "telemetry|posthog|analytics|sentry|navigator\.|fetch\("` over `src/` on `main` (2026-10-07) returned no matches. — [repo src/](https://github.com/almeidazs/better-drizzle/tree/main/src)

### Inferences

- Nothing is gated behind payment, so cost is not a factor. Apache-2.0 includes an explicit patent grant.

### Gaps

- None of material importance. The telemetry check was a keyword grep of the source, not a full audit of network calls.

## Documentation quality, roadmap, stability guarantees

### Takeaway

The docs are extensive for a 3-month-old project: 54 MDX pages built with Fumadocs, covering querying, writing, plugins, guides, reference, limitations, benchmarks and a stability/semver policy. The release notes are unusually detailed. There is no published roadmap. The main weakness is that the live site documents the unpublished 0.3.0, so it does not match the installable 0.2.0.

### Cited Findings

- 54 docs pages under `apps/web/content/docs`, in these sections: getting-started, why; querying (reads, filters, relations, pagination, selecting-fields, null-and-undefined, jsonb, arrays, explain, prepared-statements); writing (crud, relation-writes, atomic-updates, throwing-results); advanced (transactions, hooks, locks, raw-sql, error-handling); plugins (overview, writing-plugins, soft-delete, timestamps, zod, ata, cache, rules, eslint); guides (migrating-from-drizzle, upgrading, testing, multi-tenancy, observability, frameworks, limitations, troubleshooting, recipes, service-patterns, client-extensions, dynamic-repositories, typing-results); reference (client, model-api, query-options, errors, stability, support-matrix); performance (benchmarks, parity); changelog; AI. — [Docs](https://better-drizzle.com/docs); [repo apps/web/content/docs](https://github.com/almeidazs/better-drizzle/tree/main/apps/web/content/docs)
- On 2026-09-24 the maintainer reworked the docs "into a learning path with full API coverage" (PR #48). — [PR #48](https://github.com/almeidazs/better-drizzle/pull/48)
- The 0.3.0 release notes list every breaking change and behavior change with commit links and links to an upgrade guide. Examples: `update()`/`delete()` now change at most one row; reads became lazy thenables; `findUnique` requires a unique `where`; invalid args throw `INVALID_ARGS` (400) instead of `OPERATION_ERROR` (500). — [Release v0.3.0](https://github.com/almeidazs/better-drizzle/releases/tag/v0.3.0)
- The 0.2.0 release notes are only an auto-generated PR list, mostly dependabot bumps. — [Release v0.2.0](https://github.com/almeidazs/better-drizzle/releases/tag/v0.2.0)
- Stability policy: for `0.3.x`, entrypoints, documented delegate methods, result shapes, option names, the plugin authoring API and the support matrix are called stable. `/ata` and `/cache` are experimental and "can change in a **patch** release". "While the package is pre-1.0, a breaking change lands in a **minor** bump (`0.2.x` → `0.3.0`) and is always called out in the release notes with a migration path." Type-breaking changes count as breaking, and public API snapshots are kept in the repo. — [Stability & semver](https://better-drizzle.com/docs/reference/stability)
- Dialect policy: the project prefers explicit support or an explicit structured error over hidden fallbacks. — [Stability & semver](https://better-drizzle.com/docs/reference/stability)
- Community: a Discord server is linked from the site. — [better-drizzle.com](https://better-drizzle.com/) (Discord invite https://discord.gg/yfjTbVXMW4)

### Inferences

- The docs and policy read as mature, but the record behind them is short: one breaking minor release (0.3.0) within about 3.5 months, and its docs went live before the package could be installed.
- Pre-1.0 semver here means any minor bump can break code. The project has done this once (0.2 to 0.3) and documented it thoroughly.

### Gaps

- I found no roadmap document. The word "roadmap" appears only in passing in `writing-plugins.mdx`. Open feature requests (#43 UUIDv7/organization plugin, #52 CLI) are the only forward-looking signals.
- I did not test whether the docs' code examples run against 0.3.0.

## Bus factor: how many active maintainers?

### Takeaway

The bus factor is 1. One person wrote about 92% of the commits in the last three months, holds the GitHub repo, is the only npm maintainer, and controls releases. The npm 2FA lockout in October 2026 has already shown the single point of failure: a finished release could not ship for days.

### Cited Findings

- All-time contributors: almeidazs 319 commits, dependabot 21, mertcanaltin 8, pablofdezr 3, joaotonaco 1, leoisadev1 1, flaxodotdev 1. — [Contributors](https://github.com/almeidazs/better-drizzle/graphs/contributors)
- Last 3 months: 221 of 240 commits (92%) by almeidazs. — [Commits](https://github.com/almeidazs/better-drizzle/commits/main)
- External contributions are substantive but few: a relation-filter correctness fix (PR #27, pablofdezr, which fixed "some/none/every relation filters emit an uncorrelated EXISTS and return wrong rows"), the ATA plugin (PR #51, mertcanaltin), typed JSONB path mutations (PR #54, flaxodotdev), `$where()` (PR #63, joaotonaco) and the docs site (PR #9, leoisadev1). — [Issue #26](https://github.com/almeidazs/better-drizzle/issues/26); [PR #27](https://github.com/almeidazs/better-drizzle/pull/27); [PR #51](https://github.com/almeidazs/better-drizzle/pull/51); [PR #54](https://github.com/almeidazs/better-drizzle/pull/54); [PR #63](https://github.com/almeidazs/better-drizzle/pull/63); [PR #9](https://github.com/almeidazs/better-drizzle/pull/9)
- Single npm maintainer: `eualmeida`. — [npm registry](https://registry.npmjs.org/better-drizzle)
- The npm 2FA lockout blocked the 0.3.0 publish (see the maturity section). — [Issue #61](https://github.com/almeidazs/better-drizzle/issues/61); [Issue #66](https://github.com/almeidazs/better-drizzle/issues/66)
- Issue responsiveness in the sample: the maintainer answered #61 the same day and #66 within hours. Bug #44 (soft-delete crash on better-sqlite3, 2026-09-23) and bug #26 are closed. — [Issue #61](https://github.com/almeidazs/better-drizzle/issues/61); [Issue #66](https://github.com/almeidazs/better-drizzle/issues/66); [Issue #44](https://github.com/almeidazs/better-drizzle/issues/44)

### Inferences

- Because the code is Apache-2.0 and has no runtime dependencies, forking or vendoring is a realistic fallback if the maintainer steps away. Forks already exist (for example joaotonaco/better-drizzle and mertcanaltin/better-drizzle, which appear to be contribution forks). — [search result: joaotonaco fork](https://github.com/joaotonaco/better-drizzle); [mertcanaltin fork](https://github.com/mertcanaltin/better-drizzle)
- A user's workaround for #66 shows a release can be built from source. In practice, though, consumers depend on one person's npm account.

### Gaps

- I found no governance document, co-maintainer, or second person with npm publish rights.
