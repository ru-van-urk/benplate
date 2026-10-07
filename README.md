# BenPlate

A pnpm monorepo starter for full-stack TypeScript apps: a React and TanStack Router web app, a Hono server with a type-safe oRPC API, email and password auth with Better Auth, Drizzle for schema and migrations, and Kysely for queries. It deploys as one Docker Compose stack with Postgresql. A small `planets` example shows every layer end to end: anyone can read planets, signed-in users can create, edit and delete them.

## Features

- **TypeScript** - For type safety and improved developer experience
- **TanStack Router** - File-based routing with full type safety
- **TailwindCSS** - Utility-first CSS for rapid UI development
- **Shared UI package** - shadcn/ui primitives live in `packages/ui`
- **Hono** - Lightweight, performant server framework
- **oRPC** - End-to-end type-safe APIs with OpenAPI integration
- **Better Auth** - Email and password sign-in, sessions in Postgres
- **Formisch** - Forms that validate with the API contract's Valibot schemas
- **evlog** - One structured log event per request
- **Node.js** - Runtime environment
- **Drizzle** - Schema and migrations
- **Kysely** - Type-safe SQL query builder, typed from the Drizzle schema
- **Postgresql** - Database engine
- **Oxlint** - Oxlint + Oxfmt (linting & formatting)
- **uncheck** - One command for Oxlint, Oxfmt, tsc and sherif, and the pre-commit hook
- **Turborepo** - Optimized monorepo build system

## Prerequisites

- Node 24, as pinned in `.node-version`
- pnpm 12, matching `packageManager` in `package.json`
- A local Postgresql, such as Postgres.app, Homebrew or your own container
- Docker, only for the Compose stack

## Getting Started

First, install the dependencies:

```bash
pnpm install
```

## Database Setup

This project uses Postgresql. Drizzle owns the schema and migrations, Kysely runs the queries (`packages/db/src/index.ts`).

1. Run a local Postgresql (Postgres.app, Homebrew or your own container) and create a database for the project.

2. Copy `apps/server/.env.example` to `apps/server/.env` and point `DATABASE_URL` at that database. The other values work as they are for development (see [Environment Configuration](#environment-configuration)).

3. Apply the migrations from `packages/db/src/migrations`. They create the tables, triggers and auth tables and insert the example planets, the same way every deployed database starts:

```bash
pnpm run db:migrate
```

### Schema changes

Deployed databases only receive committed migrations from `packages/db/src/migrations`; `push` never runs against them.

1. Edit the schema in `packages/db/src/schema` and iterate locally with `pnpm run db:push`. Push applies the schema only, not custom migrations such as `updated_at` triggers.
2. Once the change is settled, run `pnpm run db:generate --name <change>` (for example `--name add_moons_table`) and commit the new migration folder with the schema change. Always pass `--name`, so folders never get random names. Drizzle asks here whether a changed column or table is a rename, so answer in the terminal; the SQL it writes is what every deployed database runs.
3. For hand-written SQL (`updated_at` triggers, backfills, splitting a column, example data like `seed_planets`), `pnpm run db:generate --custom --name <name>` creates an empty migration to fill in. Data that only belongs in some environments does not go in a migration: every database runs all of them.

CI fails when the schema changed without a migration. Never edit a migration that has been deployed; add a new one instead.

Then, run the development server:

```bash
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the web application.
The server runs at [http://localhost:3001](http://localhost:3001), and the Vite dev server proxies `/api` to it:

- REST API, for everyone but the web app: [http://localhost:3000/api](http://localhost:3000/api/planets) (e.g. `GET /api/planets`, `GET /api/planets/{id}`, `POST /api/planets`)
- oRPC's RPC protocol, for the web app's typed client: `/api/rpc/*` (e.g. `POST /api/rpc/planet/list`). The same router answers both; RPC keeps `Date`s without the contract's schemas, so the browser bundle skips them
- Better Auth: `/api/auth/*` (e.g. `POST /api/auth/sign-in/email`, `GET /api/auth/get-session`)
- API docs and OpenAPI spec: [http://localhost:3000/api/docs](http://localhost:3000/api/docs), `/api/docs/spec.json`. They are served only when `NODE_ENV` is not `production`, so never in the Docker image
- Health check (Hono, outside the API): `/api/health`

## Pre-release dependencies

Two groups are pinned to exact pre-release versions in the catalog (`pnpm-workspace.yaml`). Bump each group together, in one change, and read the changelog first.

- **drizzle-orm and drizzle-kit, on a 1.0 release candidate.** The setup relies on v1: `snakeCase.table`, `drizzle-orm/valibot`, folder-per-migration output and the name-based migrator. The Kysely bridge in `packages/db/src/index.ts` reads Drizzle v1's table types, so check it after every bump. [Changelog](https://github.com/drizzle-team/drizzle-orm/releases)
- **`@orpc/*`, on a 2.0 beta.** The template starts on the upcoming major, so new projects don't have to migrate from v1 to v2 soon after starting. [Changelog](https://github.com/middleapi/orpc/releases)

`pnpm run deps:check` lists bumps for these pins too.

## Starting a new project from this template

1. On GitHub, use **Use this template** and clone the new repository.
2. Rename the project. The name becomes the package scope (`@<name>/*`) and the database name; the display name goes in titles (the page title, this README, the API docs). The script rewrites every tracked text file, then runs `pnpm install`:

   ```bash
   pnpm template:init <name> "Display Name"
   ```

3. Follow the steps it prints: the description in `apps/web/src/routes/__root.ts` and `apps/web/public/favicon.svg`.
4. Remove the example once you no longer need it: delete the `planets` schema, contract and router (and their entries in each `index.ts`) and the planet routes and pages (`apps/web/src/routes`, `apps/web/src/features/planets`), then run `pnpm run db:generate --name remove_planets`. Keep the earlier planet migrations: they may have run somewhere already, and on a new database the table is simply created and dropped again.

## Adding a resource

A resource touches six files. Copy the `planets` files as a starting point:

1. `packages/db/src/schema/<resource>.ts`: the table, and its export in `packages/db/src/schema/index.ts`
2. `packages/contract/src/<resource>.ts`: the routes, inputs, outputs and errors, and its entry in `packages/contract/src/index.ts`
3. `packages/api/src/server/router/<resource>.ts`: the handlers, and its entry in `packages/api/src/server/router/index.ts`

Then generate two migrations and commit them (see [Schema changes](#schema-changes)):

```bash
pnpm run db:generate --name add_<resource>
pnpm run db:generate --custom --name <resource>_updated_at
```

Fill the second one with the table's trigger, as in `planets_updated_at`:

```sql
CREATE TRIGGER "<resource>_updated_at" BEFORE UPDATE ON "<resource>"
FOR EACH ROW EXECUTE FUNCTION "set_updated_at"();
```

The table rules, which [CLAUDE.md](CLAUDE.md) lists too:

- **`snakeCase.table`, never `pgTable`.** Lint fails otherwise, because Kysely's `CamelCasePlugin` expects snake_case columns. Only some column modes return what their types say through Kysely, and only SQL defaults run. The comment at the top of `packages/db/src/index.ts` lists the supported modes.
- **`id: t.text().primaryKey()`, filled by `newId()`.** Ids are 12 random characters from `0-9a-z`, generated in the app (`packages/db/src/ids.ts`) and passed on every insert: `.values({ ...input, id: newId() })`. The column has no default, so a forgotten id is a type error. The database id is the API id, so URLs stay short (`/planets/k3m9x0q2a7zd`) and reveal no row counts. Ids aren't time-ordered: sort by `createdAt`. Foreign keys are `t.text()`; join tables use a composite primary key of their two foreign keys instead of an id.
- **`...timestamps`** (`packages/db/src/schema/columns.ts`) adds `createdAt` and `updatedAt`. The trigger above keeps `updatedAt` current, whatever writes the row.
- **Named unique constraints**, such as `.unique("planets_name_unique")`. To return a typed error, map the database error in the handler, as `createPlanet` does with `isUniqueViolation(error, "planets_name_unique")`. The constraint name keeps an id collision from turning into a misleading `CONFLICT`: it stays a 500.

The contract ships to the browser, so it imports only oRPC and Valibot, never `@benplate/db` or Drizzle. Its schemas are written by hand:

- **The output schema is what clients see.** A new column stays private until you list it. It holds types only (`v.string()`, `v.nullable(…)`), no input rules, so a row stored before a rule was tightened still passes the client's response validation.
- **Input schemas carry the rules** (`v.nonEmpty`, `v.minValue`, `integerSchema` for `integer` columns), and the web forms validate with them. Columns that are nullable or have a default are optional.
- **The router checks both against the table.** A handler that returns a row the output schema can't hold, or inserts input the table doesn't accept, fails to type-check, so a contract that drifts from the table fails `pnpm check`. That is also why an enum list such as `planetTypes` can be written in both packages.

Then decide who may call each route. Public routes use `oc` in the contract and `os` in the router. Routes that need a signed-in user start from `authedContract` and `protectedProcedure` (see [Authentication](#authentication)). Its route files go under `routes/(public)/` or `routes/_app/` to match, and its pages under `features/<resource>/` (see [Web routes](#web-routes)).

## Authentication

[Better Auth](https://www.better-auth.com) handles email and password accounts. `packages/auth` creates it from the app's database and settings (`createAuth`) and holds the browser client (`@benplate/auth/client`). The server serves it under `/api/auth/*`, same origin as the app, so there is no CORS.

- **Tables.** `user`, `session`, `account` and `verification` are written by hand in `packages/db/src/schema/auth.ts`, copied from Better Auth's [core schema](https://www.better-auth.com/docs/concepts/database#core-schema) and following the same rules as every table. Better Auth uses the app's Kysely instance, and its ids come from `newId()`. At startup the server checks the tables against what Better Auth expects and exits on a mismatch, so a missing column crashes the deploy with a clear log line instead of failing sign-ins later. To add a Better Auth plugin, copy its tables and fields from the plugin's docs page into the schema and generate a migration.
- **Sessions.** Better Auth keeps sessions in Postgres and caches them in a signed cookie for 5 minutes, so most protected calls skip the session query. Public API routes never look the session up.
- **Protected API routes.** Start the contract from `authedContract`, which declares `UNAUTHORIZED` so clients get a typed error, and implement it with `protectedProcedure`. It loads the session, sets `context.session`, adds the user id to the request's log event, and rejects anonymous calls with 401.
- **Sign-up.** Open by default. Set `AUTH_DISABLE_SIGNUP=true` to close it, for example once your own account exists; the register page then shows Better Auth's error.
- **Rate limiting.** Better Auth's built-in limiter is on in every environment. It keeps its counters in memory, so they are per server process: fine for the single server replica this stack runs. It limits by client IP, which nginx (and the Vite proxy in development) passes on in `X-Forwarded-For`.

## Web routes

TanStack Router's file routes, in two groups:

| Route                                             | What it does                                                                                     |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `__root.ts`                                       | Loads the session once (`beforeLoad`) into the router context; the header shows the user         |
| `(public)/…`                                      | Pages anyone can open: the planet list and detail, `/login` and `/register`                      |
| `_app/route.ts`                                   | Pathless layout for pages that need a signed-in user; redirects to `/login?redirect=<this page>` |
| `_app/planets/new.ts`, `_app/planets/$id/edit.ts` | The create and edit forms                                                                        |

Route files only declare the route: its `context`, `loader`, `beforeLoad`, `validateSearch` and the page as `component`. They are `.ts`, so they can't hold JSX. The page itself lives in `src/features/<feature>/` (`planets/planet-page.tsx`, `auth/login-page.tsx`, `layout/root-layout.tsx`) and reads its route through `getRouteApi("<route id>")`; importing a route file from a page would be circular, and lint rejects it. Code splitting still moves each page into its route's own chunk. App-wide pieces (form fields, the loader, the error and not-found screens) stay in `src/components/`.

Components are `const` arrow functions, which lint enforces in `apps/web` (`packages/ui` keeps shadcn's `function` style, so `shadcn add` output needs no edits). A component may render one defined further down the file; `no-use-before-define` is off on purpose, because tsc already rejects a value that is read before its declaration while the module loads (TS2448).

The login and register pages send signed-in users on to their `redirect` parameter, which only accepts a path on the same origin. After signing in or out, `refreshSession` (`apps/web/src/utils/auth.ts`) reloads the session and reruns every route's `beforeLoad`, so the guards redirect wherever the user now belongs. An API call that answers `UNAUTHORIZED`, such as after the session expired, does the same, which sends the user to the login page and back afterwards.

The session comes from a plain `fetch` (`@benplate/auth/session`), which `index.html` preloads so it downloads alongside the scripts; Better Auth's client (about 30 KB) loads only when someone signs in, up or out (`loadAuthClient`). Keep code that only some visitors need out of the first load the same way: the delete dialog on the public planet page is a `lazy` component, so only signed-in users download it.

Forms use [Formisch](https://formisch.dev) with the contract's own Valibot schemas (exported from `@benplate/contract`), so the form and the API agree on every rule. `apps/web/src/components/form-fields.tsx` renders Formisch fields with the shared shadcn `Field` components, and `planet-form.tsx` shows how an API error (`CONFLICT`) becomes a field error.

## Logging

The server logs with [evlog](https://evlog.dev): one wide event per request, with method, path, status and duration, which the API adds to. Each event carries `operation` (the oRPC procedure, such as `planet.create`) and, on protected routes, `user.id`. Only real failures (5xx) set the event's level to `error`; expected API errors such as `NOT_FOUND` or `CONFLICT` don't.

- **In the API**, add fields to the request's event with `context.log.set({ … })`, or record an error with `context.log.error(error)`.
- **Elsewhere in the server** (startup, migrations, Better Auth's own messages), use `log` from `apps/server/src/logger.ts`. Never `console`.
- **Output.** In production, every event is one JSON line on stdout, for `docker compose logs` or whatever collects them. In development, events are pretty-printed and also written to `apps/server/.evlog/logs/` (ignored by git) as JSON lines, so you can search them later.
- `/api/health` is registered before the logger and isn't logged: Docker polls it every 10 seconds.

The browser doesn't log to the server.

## UI Customization

React web apps in this stack share shadcn/ui primitives through `packages/ui`.

- Change design tokens and global styles in `packages/ui/src/styles/globals.css`
- Update shared primitives in `packages/ui/src/components/*`
- Adjust shadcn aliases or style config in `packages/ui/components.json` and `apps/web/components.json`

### Add more shared components

Run this from the project root to add more primitives to the shared UI package:

```bash
npx shadcn@latest add accordion dialog popover sheet table -c packages/ui
```

Import shared components like this:

```tsx
import { Button } from "@benplate/ui/components/button";
```

### Add app-specific blocks

If you want to add app-specific blocks instead of shared primitives, run the shadcn CLI from `apps/web`.

## Environment Configuration

Copy `.env.example` to `.env` in `apps/server`. Env files are ignored by git; keep secrets in them or in your deployment platform.

- **Server**: `apps/server/src/env.ts` validates `process.env` with Valibot at startup and exits with a list of what is wrong. The `dev` and `start` scripts load `.env` with Node's `--env-file-if-exists`, so variables already set in the environment (Docker, CI) still apply. The migrator (`migrate.ts`) only needs `DATABASE_URL`.

  | Variable              | Required | Meaning                                                                                                          |
  | --------------------- | -------- | ---------------------------------------------------------------------------------------------------------------- |
  | `DATABASE_URL`        | yes      | Postgres connection string                                                                                       |
  | `APP_URL`             | yes      | The app's public URL as the browser sees it: `http://localhost:3000` in development, `https://<domain>` deployed |
  | `BETTER_AUTH_SECRET`  | yes      | At least 32 characters (`openssl rand -hex 32`); signs session cookies, so changing it signs everyone out        |
  | `AUTH_DISABLE_SIGNUP` | no       | `true` closes sign-up; default `false`                                                                           |
  | `PORT`                | no       | Default `3001`; the Docker image sets `3000`                                                                     |
  | `NODE_ENV`            | no       | `production` in the Docker image; turns off the API docs and the `.evlog` file output                            |

- **Web**: needs no configuration. The client calls the API under `/api` on its own origin, which the Vite dev server (`vite.config.ts`) and nginx in production (`apps/web/nginx.conf`) proxy to the server. There is no CORS, and the same web image works in every environment.
- **Database tooling**: `drizzle.config.ts` reads `DATABASE_URL` from `apps/server/.env` when the variable is not already set.

Shared packages (`@benplate/db`, `@benplate/api`, `@benplate/auth`) receive configuration or initialized clients from the application.

## Deployment

### Docker Compose

- Target: web + server, with a Postgresql `db` and a one-off `migrate` service that applies pending migrations
- Config: `docker-compose.yml` (Dockerfiles live in `apps/*/Dockerfile`)
- Local: `docker-compose.override.yml` publishes `web` on http://localhost:3030 (override with `WEB_PORT`); Dokploy ignores it
- Env: copy `.env.example` to `.env` (Compose reads it from the repository root); on Dokploy, set the same variables in the Environment tab
- Build images: pnpm run docker:build
- Start: pnpm run docker:up
- Logs: pnpm run docker:logs
- Stop: pnpm run docker:down

Only `web` needs a public domain (container port `80`). nginx proxies `/api` (REST, `/api/rpc`, `/api/auth` and `/api/health`) to `server:3000` over the internal Compose network. On Dokploy, enable Isolated Deployments for the stack, so two stacks on one host don't share the `server` hostname. Then add the domain to the `web` service in the Domains tab.

Compose refuses to start without these variables in `.env` (or Dokploy's Environment tab):

- `POSTGRES_PASSWORD`: Compose builds the `DATABASE_URL` for the `db` service from it. Only set `DATABASE_URL` to use an external Postgresql instead.
- `APP_URL`: the domain you added, such as `https://example.com`. Locally it is `http://localhost:3030` (or your `WEB_PORT`).
- `BETTER_AUTH_SECRET`: generate one with `openssl rand -hex 32`.

The server only runs as one replica: auth rate limits live in its memory, and the migrator takes no lock. nginx takes the client IP from Traefik's `X-Forwarded-For` (trusting the private Docker networks) and passes it on, so rate limits apply per client rather than to the proxy.

Postgresql stores its data in the `postgres_data` volume. On every start, the `migrate` service runs `node dist/migrate.mjs` from the server image: it applies the pending migrations in one transaction and exits, and the server starts only after it succeeds. A failing migration changes nothing, but the API stays down until a fixed migration is deployed. `web` does not wait for the server, so the app itself stays up and `/api` returns 502 meanwhile. Check `docker compose logs migrate`, then fix it with a new migration and redeploy. The migrator takes no lock, so keep it in this single service rather than running it per server replica. The example planets are a migration too (`seed_planets`), so a new database starts with them.

## Linting, Formatting and CI

[uncheck](https://github.com/middleapi/uncheck) runs sherif, Oxlint, Oxfmt and tsc once from the root, and every check runs even after one fails. Each package's `oxlint.config.ts` / `oxfmt.config.ts` picks the preset from `tooling/` (`node` or `react`); anything without its own config falls back to the root `base`. tsc checks every `tsconfig.json`, and `apps/web`'s project references with `tsc -b`.

- Fix what can be fixed: `pnpm run fix` (Oxlint and Oxfmt fixes, sherif fixes; type errors are reported)
- Verify everything: `pnpm run check` (uncheck without fixes, then knip)
- Every commit runs Oxlint and Oxfmt on the staged files, fixes them and stages the fixes. `pnpm install` writes the hook through the `prepare` script; tsc is left to `check` to keep commits fast. Skip it with `git commit --no-verify`. uncheck can't write the hook when a global `core.hooksPath` is set
- CI (`.github/workflows/ci.yml`) runs `check` and `build` on pull requests, plus a check that `packages/db/src/migrations` matches the schema
- `main` only takes pull requests (the "protect main" ruleset), and the `check` job is a required status check. CI doesn't run on pushes to `main`, because every change already passed it in its pull request. Renaming the `check` job blocks merges until the ruleset names the new one

## Project Structure

```
benplate/
├── apps/
│   ├── web/         # Frontend application (React + TanStack Router)
│   └── server/      # Hono server: health check, auth, mounts the API
├── packages/
│   ├── ui/          # Shared shadcn/ui components and styles
│   ├── contract/    # oRPC contract: routes, schemas and errors, shared by server and clients
│   ├── api/         # oRPC: server implementation and typed client
│   ├── auth/        # Better Auth: server setup and browser client
│   └── db/          # Database schema & queries
├── scripts/
│   └── template-init.ts  # Renames a new project created from the template
├── tooling/
│   ├── typescript/  # Shared tsconfig presets (base, vite)
│   ├── oxlint/      # Oxlint presets (base, node, react)
│   └── oxfmt/       # Oxfmt presets (base, react)
```

## Available Scripts

- `pnpm run dev`: Start all applications in development mode
- `pnpm run build`: Build all applications
- `pnpm run dev:web`: Start only the web application
- `pnpm run dev:server`: Start only the server
- `pnpm run db:push`: Push the schema straight to the local database (development only)
- `pnpm run db:generate --name <change>`: Generate a migration from schema changes
- `pnpm run db:migrate`: Apply pending migrations to the local database (deployments do this in the `migrate` service)
- `pnpm run db:studio`: Open database studio UI
- `pnpm run check`: Run sherif, Oxlint, Oxfmt and tsc through uncheck, then knip (unused files, dependencies and exports)
- `pnpm run fix`: Apply Oxlint, Oxfmt and sherif fixes, and report what's left
- `pnpm run deps:check` / `deps:update`: Report / write dependency updates with Taze
- `pnpm run clean`: Remove build output, caches and `node_modules`
- `pnpm run template:init <name> [Display Name]`: Rename a project created from this template
- `pnpm run docker:build`: Build the Docker Compose images
- `pnpm run docker:up`: Build and start the Docker Compose stack
- `pnpm run docker:logs`: Tail logs from the Docker Compose stack
- `pnpm run docker:down`: Stop the Docker Compose stack
