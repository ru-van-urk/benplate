# BenPlate

A pnpm monorepo starter for full-stack TypeScript apps: a React and TanStack Router web app, a Hono server with a type-safe oRPC API, Drizzle for schema and migrations, and Kysely for queries. It deploys as one Docker Compose stack with Postgresql. A small `planets` example shows every layer end to end.

## Features

- **TypeScript** - For type safety and improved developer experience
- **TanStack Router** - File-based routing with full type safety
- **TailwindCSS** - Utility-first CSS for rapid UI development
- **Shared UI package** - shadcn/ui primitives live in `packages/ui`
- **Hono** - Lightweight, performant server framework
- **oRPC** - End-to-end type-safe APIs with OpenAPI integration
- **Node.js** - Runtime environment
- **Drizzle** - Schema and migrations
- **Kysely** - Type-safe SQL query builder, typed from the Drizzle schema
- **Postgresql** - Database engine
- **Oxlint** - Oxlint + Oxfmt (linting & formatting)
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

2. Copy `apps/server/.env.example` to `apps/server/.env` and point `DATABASE_URL` at that database.

3. Apply the migrations from `packages/db/src/migrations`. They create the tables and insert the example planets, the same way every deployed database starts:

```bash
pnpm run db:migrate
```

### Schema changes

Deployed databases only receive committed migrations from `packages/db/src/migrations`; `push` never runs against them.

1. Edit the schema in `packages/db/src/schema` and iterate locally with `pnpm run db:push`.
2. Once the change is settled, run `pnpm run db:generate --name <change>` (for example `--name add_moons_table`) and commit the new migration folder with the schema change. Always pass `--name`, so folders never get random names. Drizzle asks here whether a changed column or table is a rename, so answer in the terminal; the SQL it writes is what every deployed database runs.
3. For data changes (backfills, splitting a column, example data like `seed_planets`), `pnpm run db:generate --custom --name <name>` creates an empty migration to fill in by hand. Data that only belongs in some environments does not go in a migration: every database runs all of them.

CI fails when the schema changed without a migration. Never edit a migration that has been deployed; add a new one instead.

Then, run the development server:

```bash
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the web application.
The server runs at [http://localhost:3001](http://localhost:3001), and the Vite dev server proxies `/api` to it:

- REST API, also used by the web app: [http://localhost:3000/api](http://localhost:3000/api/planets) (e.g. `GET /api/planets`, `GET /api/planets/{id}`, `POST /api/planets`)
- API docs and OpenAPI spec: [http://localhost:3000/api/docs](http://localhost:3000/api/docs), `/api/docs/spec.json`. They are served only when `NODE_ENV` is not `production`, so never in the Docker image
- Health check (Hono, outside the API): `/api/health`

## Pre-release dependencies

Two groups are pinned to exact pre-release versions in the catalog (`pnpm-workspace.yaml`). Bump each group together, in one change, and read the changelog first.

- **drizzle-orm and drizzle-kit, on a 1.0 release candidate.** The setup relies on v1: `snakeCase.table`, `drizzle-orm/valibot`, folder-per-migration output and the name-based migrator. The Kysely bridge in `packages/db/src/index.ts` reads Drizzle v1's table types, so check it after every bump. [Changelog](https://github.com/drizzle-team/drizzle-orm/releases)
- **`@orpc/*`, on a 2.0 beta.** The template starts on the upcoming major, so new projects don't have to migrate from v1 to v2 soon after starting. [Changelog](https://github.com/middleapi/orpc/releases)

`pnpm run deps:check` lists bumps for these pins too.

## Starting a new project from this template

1. Rename `benplate` and `@benplate/*`: `git grep -l benplate` lists every file that mentions it.
2. Remove the example: the `planets` schema, contract and router (and their entries in each `index.ts`), the `seed_planets` migration, and the home route in `apps/web/src/routes/index.tsx`. Removing a migration is only safe before any database has applied it.
3. Set the title and description in `apps/web/index.html` and `apps/web/src/routes/__root.tsx`, and replace `apps/web/public/favicon.svg`.

## Adding a resource

A resource touches six files. Copy the `planets` files as a starting point:

1. `packages/db/src/schema/<resource>.ts`: the table, and its export in `packages/db/src/schema/index.ts`
2. `packages/api/src/contracts/<resource>.ts`: the routes, inputs, outputs and errors, and its entry in `packages/api/src/contracts/index.ts`
3. `packages/api/src/server/router/<resource>.ts`: the handlers, and its entry in `packages/api/src/server/router/index.ts`

Then run `pnpm run db:generate --name <change>` and commit the migration (see [Schema changes](#schema-changes)).

Tables use `snakeCase.table`, never `pgTable`: lint fails otherwise, because Kysely's `CamelCasePlugin` expects snake_case columns. Only some column modes return what their types say through Kysely, and only SQL defaults run. The comment at the top of `packages/db/src/index.ts` lists the supported modes. To return a typed error, map the database error in the handler, as `createPlanet` does with `isUniqueViolation`.

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

- **Server**: `apps/server/src/env.ts` validates `process.env` with Valibot at startup and exports a typed `ENV`. The `dev` and `start` scripts load `.env` with Node's `--env-file-if-exists`, so variables already set in the environment (Docker, CI) still apply.
- **Web**: needs no configuration. The client calls the REST API under `/api` on its own origin, which the Vite dev server (`vite.config.ts`) and nginx in production (`apps/web/nginx.conf`) proxy to the server. There is no CORS, and the same web image works in every environment.
- **Database tooling**: `drizzle.config.ts` reads `DATABASE_URL` from `apps/server/.env` when the variable is not already set.

Shared packages (`@benplate/db`, `@benplate/api`) receive configuration or initialized clients from the application.

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

Only `web` needs a public domain (container port `80`). nginx proxies `/api` (REST and `/api/health`) to `server:3000` over the internal Compose network. On Dokploy, enable Isolated Deployments for the stack, so two stacks on one host don't share the `server` hostname. Then add the domain to the `web` service in the Domains tab. `POSTGRES_PASSWORD` is required: Compose refuses to start without it, and builds the `DATABASE_URL` for the `db` service from it. Only set `DATABASE_URL` to use an external Postgresql instead.

Postgresql stores its data in the `postgres_data` volume. On every start, the `migrate` service runs `node dist/migrate.mjs` from the server image: it applies the pending migrations in one transaction and exits, and the server starts only after it succeeds. A failing migration changes nothing, but the API stays down until a fixed migration is deployed. `web` does not wait for the server, so the app itself stays up and `/api` returns 502 meanwhile. Check `docker compose logs migrate`, then fix it with a new migration and redeploy. The migrator takes no lock, so keep it in this single service rather than running it per server replica. The example planets are a migration too (`seed_planets`), so a new database starts with them.

## Linting, Formatting and CI

Oxlint and Oxfmt run once from the root. Each package's `oxlint.config.ts` / `oxfmt.config.ts` picks the preset from `tooling/` (`node` or `react`); anything without its own config falls back to the root `base`.

- Fix and verify everything: `pnpm run check` (lint with fixes, format, typecheck, then knip; stops at the first failure)
- CI (`.github/workflows/ci.yml`) runs the non-fixing variants on pull requests: `typecheck`, `build`, `lint:check`, `format:check` and `knip`, plus a check that `packages/db/src/migrations` matches the schema
- `main` only takes pull requests (the "protect main" ruleset), and the `check` job is a required status check. CI doesn't run on pushes to `main`, because every change already passed it in its pull request. Renaming the `check` job blocks merges until the ruleset names the new one

## Project Structure

```
benplate/
├── apps/
│   ├── web/         # Frontend application (React + TanStack Router)
│   └── server/      # Hono server: health check, mounts the API
├── packages/
│   ├── ui/          # Shared shadcn/ui components and styles
│   ├── api/         # oRPC: contracts, server implementation, typed client
│   └── db/          # Database schema & queries
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
- `pnpm run typecheck`: Check TypeScript types across all packages
- `pnpm run db:push`: Push the schema straight to the local database (development only)
- `pnpm run db:generate --name <change>`: Generate a migration from schema changes
- `pnpm run db:migrate`: Apply pending migrations to the local database (deployments do this in the `migrate` service)
- `pnpm run db:studio`: Open database studio UI
- `pnpm run lint` / `lint:check`: Run Oxlint with / without fixes
- `pnpm run format` / `format:check`: Write / check Oxfmt formatting
- `pnpm run check`: Run `lint`, `format`, `typecheck` and `knip`, stopping at the first failure
- `pnpm run knip`: Find unused files, dependencies and exports
- `pnpm run deps:check` / `deps:update`: Report / write dependency updates with Taze
- `pnpm run clean`: Remove build output, caches and `node_modules`
- `pnpm run docker:build`: Build the Docker Compose images
- `pnpm run docker:up`: Build and start the Docker Compose stack
- `pnpm run docker:logs`: Tail logs from the Docker Compose stack
- `pnpm run docker:down`: Stop the Docker Compose stack
