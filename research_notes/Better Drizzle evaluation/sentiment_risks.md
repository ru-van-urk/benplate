# Better Drizzle: community sentiment, real-world usage and dependency risks

All metrics were collected on 2026-10-07 unless a date is given. GitHub numbers come from the GitHub REST API (`gh api`); npm numbers come from registry.npmjs.org and api.npmjs.org.

## What Better Drizzle is (confirmed from its site)

### Takeaway

Better Drizzle exists. It is a Prisma-style "repository" API (findMany/include/where/paginate/upsert, hooks, plugins) layered on top of a Drizzle ORM client. One Brazilian developer, Hiago Almeida (GitHub `almeidazs`, npm `eualmeida`), started it in June 2026. It is Apache-2.0 licensed and lists Neon as its sponsor.

### Cited Findings

- The site describes it as a "type-safe repository API layer built on top of Drizzle ORM" with "relation filters, nested includes, pagination, relation writes, and plugins on every table". It supports PostgreSQL, MySQL and SQLite, reads the dialect from your Drizzle config, and needs no code generation. — [better-drizzle.com](https://better-drizzle.com/)
- The site says it is "maintained by almeidazs", "sponsored by Neon and Victor Bona", free and open source, npm package `better-drizzle`, version 0.3 for Drizzle ORM 1.0 RC, license Apache-2.0. — [better-drizzle.com](https://better-drizzle.com/)
- The site claims "~5% overhead on reads and under 5% on writes" over raw Drizzle, and relation queries "9.5× faster" than Drizzle's native relational queries. These are the project's own benchmarks; I found no independent check. — [better-drizzle.com](https://better-drizzle.com/)
- The author pitches it as: no codegen, no client process, no new schema language, "still your Drizzle client underneath, and you can drop back to it at any line". — [GitHub README](https://github.com/almeidazs/better-drizzle)
- The repo was created 2026-06-22. Its description is "ORM, but better". The README shows a "Sponsored by Neon" block. — [GitHub repo](https://github.com/almeidazs/better-drizzle)
- The author is Hiago Almeida, a backend engineer from Brazil. His other projects include files-sdk, paymesh and Serenity. — [GitHub profile](https://github.com/almeidazs), [X profile](https://x.com/eualmeidazs) (X returned HTTP 402 to my fetcher, so I could not read the posts)
- Search noise: "Better Drizzle" is also a kitchen oil dispenser from Kitchen Concepts Unlimited, which dominates general web results for the exact phrase. — [HomePage News](https://www.homepagenews.com/home-housewares/kitchen-concepts-unveils-better-drizzle-oil-dispenser/)

### Inferences

- "Better Drizzle" follows the "better-auth" naming style, but I found no connection to the Better Auth project.

### Gaps

- I could not confirm the size or terms of the Neon sponsorship, or who "Victor Bona" is.

## Where is it discussed, and what do people praise and criticise?

### Takeaway

Almost nothing independent has been written about it. I found no Hacker News posts or comments, no independent blog posts, dev.to articles or YouTube videos, and no Drizzle Discord or GitHub threads. Nearly all visible sentiment is in its own GitHub issue tracker: users are eager for Drizzle 1.0 support, there was one "abandoned" scare, and two users complained that the docs did not match the published package.

### Cited Findings

- **Hacker News:** the Algolia HN API returned 0 hits for both `better-drizzle` and `"better drizzle"` (checked 2026-10-07). — [hn.algolia.com API](https://hn.algolia.com/api/v1/search?query=better-drizzle)
- **Blogs and dev.to:** searches for "better-drizzle" with Drizzle/Prisma/review terms returned only generic Drizzle-vs-Prisma articles. None mention Better Drizzle (e.g. [makerkit.dev](https://makerkit.dev/blog/tutorials/drizzle-vs-prisma), [pkgpulse](https://www.pkgpulse.com/blog/drizzle-orm-vs-prisma-2026-update)).
- **Reddit:** my search tool cannot reach reddit.com, so I could not check Reddit. Nothing indexed on other sites linked to a Reddit thread either.
- **X/Twitter:** the author posts about the project on [x.com/eualmeidazs](https://x.com/eualmeidazs), but the page returned HTTP 402, so I could not read the posts, replies or engagement.
- **Praise in GitHub issues:**
  - "This make full sense. After trying v1, specially the new migrations, cannot go back anymore. I'll watch and wait until better drizzle support v1 and I'm excited to use it in future!" — mi3lix9, 2026-06-29, [issue #14](https://github.com/almeidazs/better-drizzle/issues/14)
  - "Damn, he did it 🔥", after the Drizzle 1.0 RC branch appeared. — rajatsandeepsen, 2026-10-01, [issue #46](https://github.com/almeidazs/better-drizzle/issues/46)
  - "I'm on rc4 and I'd be happy to test early builds, no rush tho." — joaotonaco, 2026-09-29, [issue #46](https://github.com/almeidazs/better-drizzle/issues/46). joaotonaco later contributed `$where()` ([PR #63](https://github.com/almeidazs/better-drizzle/pull/63)).
- **Criticism and complaints in GitHub issues:**
  - An issue titled "annnnnnnnnnd" with the body "abandoned". — Darren120, 2026-07-18, [issue #28](https://github.com/almeidazs/better-drizzle/issues/28). The maintainer replied on 2026-07-19: "Contrary to the belief, the better-drizzle project is neither dead nor stalled. I started a new job a week and a half ago and have been focusing on that transition…"
  - "The docs/site imply current Drizzle compatibility, but `better-drizzle@0.1.1` peer-deps `drizzle-orm@^0.30.0` and relies on the RQB v1 relational API that was removed in 1.0." — mi3lix9, 2026-06-28, [issue #14](https://github.com/almeidazs/better-drizzle/issues/14)
  - A user followed the docs with drizzle-orm 1.0.0-rc.4 and the published 0.2.0 crashed at boot ("Export normalizeRelation doesn't exist"). The maintainer answered: "Actually the documentation is for the next version `v0.3.0` and not for the current one." — mikkelwf / almeidazs, 2026-10-01, [issue #61](https://github.com/almeidazs/better-drizzle/issues/61)
  - "No type error, but when i started using it. No tables. Then i realized better-drizzle is not compatible with newest version of 1.0.0-rc." — rajatsandeepsen, 2026-09-24, [issue #46](https://github.com/almeidazs/better-drizzle/issues/46)
  - "[BUG]: v0.3.0 is not published to npm yet!" The workaround was "I downloaded the source code from the release, packed it locally". — MuhammadM1998, 2026-10-05/06, [issue #66](https://github.com/almeidazs/better-drizzle/issues/66)

### Inferences

- The visible community is small and made up of early adopters. Sentiment is positive about the idea (Prisma-style ergonomics on Drizzle), and the friction is about release logistics and the gap between docs and the published package, not about the API design.
- Lack of independent coverage is itself the main finding. There is no outside evaluation to lean on, so any adoption decision rests on reading the code and running the test suite yourself.

### Gaps

- Reddit (r/typescript, r/node, r/webdev), X/Twitter, Bluesky and Discord could not be checked or returned nothing. A manual Reddit and X search by a human is still worth doing.
- I found no YouTube videos.

## Who uses it in production or open-source projects?

### Takeaway

Adoption is small. I found about four public repos that list it in package.json, the largest being RexaDB (105 stars), and one 29-star repo with an open task to migrate to it. There is no showcase page. Weekly npm downloads are in the hundreds.

### Cited Findings

- **GitHub stats** (2026-10-07): 347 stars, 7 forks, 0 watchers. — [GitHub API](https://github.com/almeidazs/better-drizzle)
- **npm downloads:** 825 in the week 2026-09-28 to 2026-10-04, and 2,455 in the 30 days to 2026-10-04. — [npm downloads API](https://api.npmjs.org/downloads/point/last-week/better-drizzle)
- **Monthly npm downloads:** Jun 2026 440, Jul 3,978, Aug 4,368, Sep 2,256, Oct (1–4) 380. Usage peaked after launch and fell in September. The likely reason is that Drizzle 1.0 RC users could not use 0.2.0. — [npm downloads range API](https://api.npmjs.org/downloads/range/last-year/better-drizzle)
- **Public repos with `better-drizzle` in package.json** (from GitHub code search):
  - [RexaDB/RexaDB](https://github.com/RexaDB/RexaDB), 105 stars, "Modern database studio for teams who ship", last pushed 2026-10-06
  - [WerdoxDev/Huginn](https://github.com/WerdoxDev/Huginn), 2 stars, in `packages/huginn-backend-shared`
  - [dariast03/qranza](https://github.com/dariast03/qranza), 0 stars
- The GitHub "dependents" page listed only WerdoxDev/Huginn when scraped. — [network/dependents](https://github.com/almeidazs/better-drizzle/network/dependents)
- [Boring-Software-Inc/tripwire](https://github.com/Boring-Software-Inc/tripwire) (29 stars) has an open task "TRP-50 Migrate project to better-drizzle", filed 2026-06-27. — [issue #70](https://github.com/Boring-Software-Inc/tripwire/issues/70)
- The site and README have no showcase or "used by" section. — [better-drizzle.com](https://better-drizzle.com/), [README](https://github.com/almeidazs/better-drizzle)

### Inferences

- I found no evidence of a named company running it in production.

### Gaps

- Private or production usage cannot be seen. GitHub code search covers only indexed default branches.

## Issue tracker health, responsiveness and upstream tracking

### Takeaway

The maintainer answers outside reports fast, usually within hours. But nearly all code comes from one person who merges his own PRs within minutes, with no review. Releases are rare and bursty. Support for Drizzle 1.0 RC (relational queries v2) arrived about 3 months after it was first requested, and as of 2026-10-07 it still cannot be installed from npm.

### Cited Findings

- **Counts** (2026-10-07):
  - 66 numbered items: 20 issues and 46 PRs. Of the 46 PRs, 21 are Dependabot.
  - 3 issues are open: #66 npm publish failure, #52 CLI feature, #43 UUIDv7/organization plugin request. 1 Dependabot PR is open.
  - 10 of the 20 issues were filed by outside users. The rest are the maintainer's own feature tickets.
  - Source: [issues list](https://github.com/almeidazs/better-drizzle/issues?q=is%3Aissue)
- **Time to first maintainer reply on outside issues** (computed from API timestamps):
  - [#14](https://github.com/almeidazs/better-drizzle/issues/14) about 8h
  - [#28](https://github.com/almeidazs/better-drizzle/issues/28) about 19h
  - [#43](https://github.com/almeidazs/better-drizzle/issues/43) about 10h
  - [#44](https://github.com/almeidazs/better-drizzle/issues/44) about 1.5h (fixed in [c0ceef0](https://github.com/almeidazs/better-drizzle/commit/c0ceef01134c9890dda8223a1709c02d6393c146))
  - [#46](https://github.com/almeidazs/better-drizzle/issues/46) about 5h
  - [#61](https://github.com/almeidazs/better-drizzle/issues/61) about 2h
  - [#66](https://github.com/almeidazs/better-drizzle/issues/66) about 3.5h
  - The median is about 5h.
- **Self-merged PRs:** the maintainer's own feature PRs merge within 1–3 minutes of opening, e.g. [#57 "support Drizzle ORM 1.x"](https://github.com/almeidazs/better-drizzle/pull/57) (00:12 to 00:14), [#60 Redis cache](https://github.com/almeidazs/better-drizzle/pull/60) (about 1 min), [#64 prepared statements](https://github.com/almeidazs/better-drizzle/pull/64) (about 3 min).
- **Contributors** (commits): almeidazs 319, dependabot 21, mertcanaltin 8, pablofdezr 3, and joaotonaco, leoisadev1 and flaxodotdev 1 each. — [contributors API](https://github.com/almeidazs/better-drizzle/graphs/contributors)
- **Release history:**
  - npm 0.1.0 on 2026-06-26, 0.1.1 on 2026-06-27, 0.2.0 on 2026-09-20.
  - GitHub release v0.3.0 on 2026-10-03, but it is not on npm. npm `latest` is still 0.2.0.
  - There were no releases for about 12 weeks (late June to late September).
  - Sources: [npm registry](https://registry.npmjs.org/better-drizzle), [GitHub releases](https://github.com/almeidazs/better-drizzle/releases)
- **Activity lull:** Dependabot PRs opened 2026-06-30 sat until 2026-07-18/19. PRs opened 2026-08-07 sat until 2026-09-19. Together with the maintainer's "started a new job" comment, this points to roughly six quiet weeks from August to mid-September. — [PR #30](https://github.com/almeidazs/better-drizzle/pull/30), [PR #38](https://github.com/almeidazs/better-drizzle/pull/38), [issue #28](https://github.com/almeidazs/better-drizzle/issues/28)
- **Notable correctness bug:** in 0.1.1, `some`/`none`/`every` relation filters emitted an uncorrelated `EXISTS` and "silently return wrong rows. No error is raised." It was confirmed on SQLite and PostgreSQL 17 (e.g. `none: { published: true }` expected `["Bob","Carol"]`, got `[]`).
  - Reported 2026-07-15 by pablofdezr, who also wrote the fix ([PR #27](https://github.com/almeidazs/better-drizzle/pull/27), merged 2026-07-18).
  - The next npm release was 0.2.0 on 2026-09-20, so the npm `latest` version had this wrong-results bug for about 2 months after the fix was merged.
  - Source: [issue #26](https://github.com/almeidazs/better-drizzle/issues/26)
- **Upstream tracking (Drizzle 1.0 RC):**
  - Incompatibility with drizzle-orm 1.0.0-rc.3 was reported 2026-06-28 ([#14](https://github.com/almeidazs/better-drizzle/issues/14)).
  - Support merged 2026-09-30 ([PR #57](https://github.com/almeidazs/better-drizzle/pull/57)) and was tagged v0.3.0 on 2026-10-03.
  - The 0.3.0 peer range is `>=1.0.0-rc.4 <1.0.0-rc.5`, "capped below `1.0.0-rc.5` because the typecheck fails against that snapshot". — [v0.3.0 release notes](https://github.com/almeidazs/better-drizzle/releases/tag/v0.3.0)
- **npm publish blocked:** "I lost access to my npm account due to two-factor authentication and have requested a reset. This will take about 1–3 days, so I can't publish the new `v0.3.0` version right now." — almeidazs, 2026-10-04, [issue #61](https://github.com/almeidazs/better-drizzle/issues/61). Still unpublished as of 2026-10-07 ([npm registry](https://registry.npmjs.org/better-drizzle)).
- **Breaking changes in 0.3.0** (the list is long):
  - `better()` no longer takes `schema`, and type parameters become `typeof relations`.
  - Many-to-many comes only from `.through()`. Relations with a relation-level `where` are unsupported and throw.
  - `findUnique` requires a unique `where`. Invalid arguments now throw `INVALID_ARGS`.
  - `update()`/`delete()` now change at most one row; in 0.2.x they "ran their `where` against every matching row".
  - Reads became lazy thenables.
  - Source: [v0.3.0 release notes](https://github.com/almeidazs/better-drizzle/releases/tag/v0.3.0)
- **Experimental surfaces:** the `better-drizzle/cache` plugin "is experimental in `0.3.x`: its options, `$cache` API, store interface, and entry format can change in a patch release". `ata` is also experimental. — [README](https://github.com/almeidazs/better-drizzle)

### Inferences

- The silent behaviour changes in 0.3.0 (update/delete scope, lazy reads) mean an upgrade needs tests around writes, not just a typecheck.
- The exact-RC peer pin means each new Drizzle RC snapshot can break Better Drizzle until a new release ships. Drizzle 1.0 is still moving through RCs, so expect a lag of days to weeks after each Drizzle bump. Releases have been slow (two npm releases in 3.5 months) and npm publishing currently depends on one person's account.

### Gaps

- There is no npm publish history for 0.3.x yet, so the speed of patch releases after a Drizzle RC bump cannot be measured.
- I could not check GitHub Discussions; the API returned no discussions data.

## What the Drizzle team and community say, and roadmap overlap

### Takeaway

I found no statement from the Drizzle team about Better Drizzle, for or against. Drizzle's own relational queries v2 (in 1.0) already cover part of what Better Drizzle offers: relation filters, many-to-many via `.through()`, and offset/limit on relations. The parts Better Drizzle still adds on top are the write side (nested relation writes, upsert helpers), hooks and plugins, cursor pagination, soft delete and timestamps.

### Cited Findings

- A GitHub issue search for "better-drizzle" in the `drizzle-team` org returned only unrelated hits (better-sqlite3, etc.). There is no mention of the project. — [GitHub search](https://github.com/search?q=org%3Adrizzle-team+%22better-drizzle%22&type=issues)
- Drizzle RQB v2 adds:
  - filtering by relations ("Get all users whose ID>10 and who have at least one post with content starting with 'M'")
  - `.through()` for many-to-many
  - predefined relation `where` filters
  - offset/limit on related objects
  - Source: [Drizzle docs: relations v1 to v2](https://orm.drizzle.team/docs/relations-v1-v2)
- Better Drizzle 0.3.0 now gets its relations from Drizzle's own `defineRelations`/`drizzle({ relations })` and uses `.through()`. It does **not** support Drizzle's relation-level `where`; it throws, and "Drizzle's own `db.query` still handles them". — [v0.3.0 release notes](https://github.com/almeidazs/better-drizzle/releases/tag/v0.3.0)
- Better Drizzle reaches into Drizzle internals: 0.1.x used `extractTablesRelationalConfig`/`createTableRelationsHelpers`, and 0.2.0 failed on 1.0 RC with "Export normalizeRelation doesn't exist". — [issue #14](https://github.com/almeidazs/better-drizzle/issues/14), [issue #61](https://github.com/almeidazs/better-drizzle/issues/61)

### Inferences

- With RQB v2, Drizzle has absorbed most of Better Drizzle's read-side selling point (nested relation filters and includes). What is left is mostly ergonomics and the write side. If Drizzle adds relational writes or a repository layer, much of Better Drizzle would become redundant. This is speculation; I found no Drizzle roadmap item confirming such plans.
- Because it uses internal or unstable Drizzle APIs, it is more fragile than packages that use only Drizzle's public query builder.

### Gaps

- I found no Drizzle Discord comments, and no tweets from Drizzle team members, about the project. Discord is not searchable with my tools.

## Risks: bus factor, funding, license, telemetry, security, supply chain, lock-in

### Takeaway

The main risks are one maintainer (both commits and npm publishing; his 2FA lockout is blocking a release right now) and tight coupling to unstable Drizzle internals. Supply-chain hygiene is good: no runtime dependencies, no install scripts, npm provenance attestations, and no network calls in the published code. I found no telemetry and no security advisories. Lock-in is moderate: the schema stays plain Drizzle, but every call site written in its Prisma-style API would have to be rewritten to leave.

### Cited Findings

- **Bus factor:** 1. almeidazs has 319 of about 354 commits; the next human has 8. The npm package has one maintainer (`eualmeida`). — [contributors API](https://github.com/almeidazs/better-drizzle/graphs/contributors), [npm registry](https://registry.npmjs.org/better-drizzle)
- **Single point of failure, already hit:** the maintainer lost npm 2FA access on about 2026-10-04, which blocks the 0.3.0 publish. — [issue #61](https://github.com/almeidazs/better-drizzle/issues/61), [issue #66](https://github.com/almeidazs/better-drizzle/issues/66)
- **Maintainer time:** the maintainer said in July 2026 that a new job had slowed him down. — [issue #28](https://github.com/almeidazs/better-drizzle/issues/28)
- **Funding:** Neon is listed as sponsor ([README](https://github.com/almeidazs/better-drizzle)), plus "Victor Bona" ([site](https://better-drizzle.com/)). A GitHub Sponsors page exists ([sponsors/almeidazs](https://github.com/sponsors/almeidazs)). I could not find amounts.
- **License:** Apache-2.0 on both the repo and npm 0.2.0, with an explicit patent grant. There is no CLA and no history of license changes; the repo is only 3.5 months old. — [GitHub API](https://github.com/almeidazs/better-drizzle), [npm 0.2.0](https://registry.npmjs.org/better-drizzle/0.2.0)
- **Telemetry and network:** I downloaded the npm 0.2.0 tarball and searched `dist/*.js`. There are 0 occurrences of `fetch(`, `process.env`, `child_process`, `node:http` or `XMLHttpRequest`. The only URLs are docs links (better-drizzle.com, npmjs.com). The site and README do not mention telemetry. — [npm tarball 0.2.0](https://registry.npmjs.org/better-drizzle/-/better-drizzle-0.2.0.tgz)
- **The 0.3 cache plugin** makes Redis connections, which is opt-in network I/O. — [v0.3.0 release notes](https://github.com/almeidazs/better-drizzle/releases/tag/v0.3.0)
- **Dependencies and scripts:**
  - npm 0.2.0 has no `dependencies` and no `optionalDependencies`, and no install/postinstall/prepare scripts.
  - Its peers are `drizzle-orm` and `typescript`, plus optional `zod`, `eslint` and `@typescript-eslint/parser` (for its ESLint rules entry point).
  - Unpacked size is 838 KB, with entry points `.`, `./eslint`, `./plugins`, `./rules`, `./soft-delete`, `./timestamps` and `./zod`.
  - Source: [npm 0.2.0 manifest](https://registry.npmjs.org/better-drizzle/0.2.0)
- **Provenance:** npm 0.1.1 and 0.2.0 both carry SLSA provenance attestations, i.e. they were published from CI. — [npm attestations 0.2.0](https://registry.npmjs.org/-/npm/v1/attestations/better-drizzle@0.2.0)
- **Security advisories:** I found no GitHub security advisories or CVEs for `better-drizzle` in GitHub or npm search results (2026-10-07). — [GitHub repo](https://github.com/almeidazs/better-drizzle)
- **Packaging accuracy:** npm 0.2.0 declares the peer `drizzle-orm: ^0.30.0`. Under semver, a caret on 0.x means `>=0.30.0 <0.31.0`, yet the maintainer says it works with "any version of drizzle `^0.30`", and users run it on 0.45.x. So the declared range does not match real support. — [npm 0.2.0 manifest](https://registry.npmjs.org/better-drizzle/0.2.0), [issue #61](https://github.com/almeidazs/better-drizzle/issues/61), [issue #26](https://github.com/almeidazs/better-drizzle/issues/26)
- **Lock-in and exit:** the schema and relations stay plain Drizzle, and the raw Drizzle client stays available ("drop back to it at any line"). Leaving means rewriting every `client.<table>.findMany({ where, include, ... })` call, every hook and every plugin (soft delete, timestamps, cache) into Drizzle or SQL queries. 0.3.0 has no `schema` option; it requires a Drizzle instance built with `relations`. — [README](https://github.com/almeidazs/better-drizzle), [v0.3.0 release notes](https://github.com/almeidazs/better-drizzle/releases/tag/v0.3.0)

### Inferences

- **Fit with BenPlate:** this repo runs its queries through Kysely and uses Drizzle only for schema and migrations. Adopting Better Drizzle would add a runtime Drizzle client with a `relations` config and a second query API next to Kysely. That brings a two-query-layer cost on top of the lock-in above. BenPlate's own rules (ids from `newId()`, explicit unique constraint names mapped to `CONFLICT`, Kysely-only runtime) would also need to be reconciled with Better Drizzle's write helpers and hooks.
- **Supply-chain risk is low** (zero dependencies, provenance, no scripts). **Continuity risk is high** (one maintainer, a blocked npm account, a fast-moving upstream RC with exact pins).
- **Pre-release status itself is not the issue.** The concrete risks are:
  - silent behaviour changes between minors
  - a history of fixes waiting months for a release, including one for silently wrong query results
  - docs that describe unreleased versions

### Gaps

- I could not check OpenSSF Scorecard or Socket.dev scores; they were not fetched.
- I could not verify whether the npm 2FA reset finished after 2026-10-07.
- The sponsorship amounts and their duration are unknown, so I cannot judge funding sustainability.
