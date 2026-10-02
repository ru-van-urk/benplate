# maribor

This project was created with [Better-T-Stack](https://github.com/AmanVarshney01/create-better-t-stack), a modern TypeScript stack that combines React, TanStack Router, Hono, ORPC, and more.

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
2. Once the change is settled, run `pnpm run db:generate` and commit the new migration folder with the schema change. Drizzle asks here whether a changed column or table is a rename, so answer in the terminal; the SQL it writes is what every deployed database runs.
3. For data changes (backfills, splitting a column, example data like `seed_planets`), `pnpm run db:generate --custom --name <name>` creates an empty migration to fill in by hand. Data that only belongs in some environments does not go in a migration: every database runs all of them.

CI fails when the schema changed without a migration. Never edit a migration that has been deployed; add a new one instead.

Then, run the development server:

```bash
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the web application.
The server runs at [http://localhost:3001](http://localhost:3001), and the Vite dev server proxies `/api` to it:

- REST API, also used by the web app: [http://localhost:3000/api](http://localhost:3000/api/planets) (e.g. `GET /api/planets`, `GET /api/planets/{id}`, `POST /api/planets`)
- API docs and OpenAPI spec: [http://localhost:3000/api/docs](http://localhost:3000/api/docs), `/api/docs/spec.json`
- Health check (Hono, outside the API): `/api/health`

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
import { Button } from "@maribor/ui/components/button";
```

### Add app-specific blocks

If you want to add app-specific blocks instead of shared primitives, run the shadcn CLI from `apps/web`.

## Environment Configuration

Copy `.env.example` to `.env` in `apps/server`. Env files are ignored by git; keep secrets in them or in your deployment platform.

- **Server**: `apps/server/src/env.ts` validates `process.env` with Valibot at startup and exports a typed `ENV`. The `dev` and `start` scripts load `.env` with Node's `--env-file-if-exists`, so variables already set in the environment (Docker, CI) still apply.
- **Web**: needs no configuration. The client calls the REST API under `/api` on its own origin, which the Vite dev server (`vite.config.ts`) and nginx in production (`apps/web/nginx.conf`) proxy to the server. There is no CORS, and the same web image works in every environment.
- **Database tooling**: `drizzle.config.ts` reads `DATABASE_URL` from `apps/server/.env` when the variable is not already set.

Shared packages (`@maribor/db`, `@maribor/api`) receive configuration or initialized clients from the application.

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

Only `web` needs a public domain (container port `80`). nginx proxies `/api` (REST, `/api/docs` and `/api/health`) to `server:3000` over the internal Compose network. On Dokploy, add the domain to the `web` service in the Domains tab. For a public API subdomain, add `api.<domain>` to the `server` service (container port `3000`, path `/`, internal path `/api`) so `api.<domain>/planets` reaches `/api/planets`. `POSTGRES_PASSWORD` and `DATABASE_URL` are required: Compose refuses to start without them. `DATABASE_URL` must contain the same password and point at the `db` service, or at an external Postgresql instead.

Postgresql stores its data in the `postgres_data` volume. On every start, the `migrate` service runs `node dist/migrate.mjs` from the server image: it applies the pending migrations in one transaction and exits, and the server starts only after it succeeds. A failing migration changes nothing and keeps the new server down; check `docker compose logs migrate`, then fix it with a new migration and redeploy. The migrator takes no lock, so keep it in this single service rather than running it per server replica. The example planets are a migration too (`seed_planets`), so a new database starts with them.

For more details, see the guide on [Deploying with Docker Compose](https://www.better-t-stack.dev/docs/guides/docker).

## Linting, Formatting and CI

Oxlint and Oxfmt run once from the root. Each package's `oxlint.config.ts` / `oxfmt.config.ts` picks the preset from `tooling/` (`node` or `react`); anything without its own config falls back to the root `base`.

- Fix and verify everything: `pnpm run check` (lint with fixes, format, typecheck, then knip; stops at the first failure)
- CI (`.github/workflows/ci.yml`) runs the non-fixing variants on pushes to `main` and on pull requests: `typecheck`, `lint:check`, `format:check` and `knip`, plus a check that `packages/db/src/migrations` matches the schema

## Project Structure

```
maribor/
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
- `pnpm run db:generate`: Generate a migration from schema changes
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
