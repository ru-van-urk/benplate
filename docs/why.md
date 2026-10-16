# Why BenPlate

BenPlate is a starting point for full-stack TypeScript apps: a React app, a typed API, auth and Postgres, in one repository that deploys as one Docker Compose stack. It's no framework and no standard anyone has to follow. Take it as a whole, or take the parts you like.

## The problem

- **Every project starts over.** Auth, the database, migrations, the API, forms, lint, CI and the deploy get rebuilt for every new project, a little differently each time. The first weeks go to plumbing instead of the app.
- **Projects drift apart.** Every repository has its own layout and its own conventions, so switching projects, reviewing someone else's code or picking up an old project costs time before you can do anything.
- **Type safety stops at the API.** The database, the API and the forms each describe the same data in their own way, and the bugs live in the gaps between them.

BenPlate answers with one stack, one layout and one set of rules ([CLAUDE.md](../CLAUDE.md)), typed from the table to the form field: change a column and `pnpm check` lists every place that has to follow.

## Where it came from

The earlier version ran on Cloudflare Workers with D1, and Kysely with types generated from the database. It worked, but:

- **Runtime limits.** Workers aren't Node: some packages don't run, CPU time is capped, and long-running work needs other Cloudflare products.
- **Local isn't production.** Wrangler simulates the platform, and problems that only show up deployed are hard to reproduce.
- **Lock-in.** Code and data are tied to Cloudflare's primitives (D1, bindings), so the app can't simply move to another host.
- **Codegen friction.** With Kysely the schema lived in SQL and the types came from a generate step after every change.

BenPlate keeps what was good (a typed API, a typed query builder) and swaps the rest for plain Node, Postgres and Drizzle, whose schema is TypeScript, so types follow without a codegen step.

## Boring to run

The one thing to remember. A deploy is `docker compose up`: nginx with the built app, the Node server, Postgres, and a one-off service that runs the migrations before the server starts. The same stack runs on a laptop, a VPS or any platform that runs Docker, so where an app runs is a choice you can still change later. No vendor accounts, no per-seat pricing, no platform-specific code.

The browser only talks to its own origin: nginx serves the app and proxies `/api` to the server, so there's no CORS and one web image works in every environment. See [Deployment](deployment.md).

## What it's for

Applications: logged-in tools, portals, dashboards, anything with forms and data. The web app is a client-rendered SPA, so it has no SSR. A marketing site that needs SEO sits next to it as its own app in `apps/` (an Astro site, for example), in the same monorepo and the same Compose stack.

## The decisions

| Choice                         | Instead of                                | Why                                                                                                                                                                 | Trade-off                                                                                |
| ------------------------------ | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Vite SPA and a separate server | Next.js, TanStack Start                   | Static files in nginx and one Node process are simple to host. A clear client/server split, and an API ready for other clients later, such as a mobile app          | No SSR; a marketing site is its own app                                                  |
| oRPC, contract first           | tRPC, plain Hono routes                   | The contract is its own package: the server implements it, the web app consumes it, and the client never imports server code. An OpenAPI spec and docs come free    |                                                                                          |
| REST on the wire               | oRPC's own RPC protocol                   | A readable network tab: `GET /api/planets/pl_…` works in DevTools and curl, and the web app uses exactly the API other clients get                                  | JSON drops `Date`; the client restores it and checks every response against the contract |
| Drizzle for everything         | Prisma, Kysely with codegen               | One tool for schema, migrations, relational queries and Studio, with the schema in TypeScript and no generate step for types                                        | It's on the 1.0 release candidate (see [Versions](#versions))                            |
| Two ids per row                | A UUID primary key                        | A private integer for joins, a prefixed public id for the API (`pl_u4apge8ke3bq`). The prefix says what an id points to, and URLs reveal no row counts              | Writing a relation costs one lookup from public to private id                            |
| Hand-written contract schemas  | Schemas generated from the tables         | The contract ships to the browser, so it can't import the database. Output schemas are an allow-list, so a new column never leaks by accident                       | Some fields are written twice; tsc fails when the copies disagree                        |
| Valibot and Formisch           | Zod with TanStack Form or React Hook Form | A form uses the contract's own schema for its fields, types and rules, so the form and the API can't disagree                                                       |                                                                                          |
| Route files apart from pages   | Pages inside route files                  | A route file is a short map of the page's data, guards and params; the page is only UI. The route builds the query options once, so prefetch and render can't drift | Two files per page                                                                       |
| Better Auth                    | Clerk, Auth0, Entra                       | Users and sessions live in our own Postgres. No per-user pricing, no vendor, and plugins for 2FA, organisations and SSO when a project needs them                   | A revoked session keeps working for up to 5 minutes (the cookie cache, tunable)          |
| Oxlint and Oxfmt               | ESLint and Prettier, Biome                | Fast, one toolchain, small configs: each package picks a preset from `tooling/`                                                                                     |                                                                                          |
| One Docker Compose stack       | Vercel, Railway, Cloudflare               | Portable and easy to run, see [Boring to run](#boring-to-run)                                                                                                       | One server replica: auth rate limits live in memory and the migrator takes no lock       |
| No test suite                  | A test framework in the template          | Each project picks the tests it needs. CI checks migrations against the schema, lint, types and the build, then boots the server on a fresh Postgres                |                                                                                          |

The how-to pages ([Database](database.md), [API](api.md), [Web app](web.md), [Authentication](auth.md)) explain each one in detail.

## Versions

The dependencies are new on purpose:

- **Speed.** TypeScript 7 (the Go compiler), Oxlint with type-aware rules and Oxfmt keep `pnpm check` fast enough to run before every push.
- **No refactor right after starting.** Drizzle 1.0 and oRPC 2 are close to stable. Starting on the release candidate and the beta means a new project doesn't migrate a major version weeks after it starts. Both are pinned exactly and bumped together after reading the changelog ([Tooling](tooling.md#pre-release-dependencies)).

## After you start a project

A project created from the template is copied once and then it's yours: it doesn't sync with BenPlate. What keeps projects alike is the layout, the docs and the rules in [CLAUDE.md](../CLAUDE.md), which people and coding agents follow alike. When BenPlate improves, port what's worth it by hand.

## Next

Seed data moves out of the migrations. The example planets and people are a migration today, so every database runs them; seeding becomes its own script, possibly with drizzle-seed, so migrations hold only schema and real data changes.
