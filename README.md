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
- **Drizzle** - TypeScript-first ORM
- **SQLite/Turso** - Database engine
- **Oxlint** - Oxlint + Oxfmt (linting & formatting)
- **Turborepo** - Optimized monorepo build system

## Getting Started

First, install the dependencies:

```bash
pnpm install
```

## Database Setup

This project uses SQLite with Drizzle ORM.

1. Start the local SQLite database (optional):

```bash
pnpm run db:local
```

2. Copy `apps/server/.env.example` to `apps/server/.env` and update the connection details if needed.

3. Apply the schema to your database:

```bash
pnpm run db:push
```

Then, run the development server:

```bash
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the web application.
The API is running at [http://localhost:3001](http://localhost:3001).

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

Copy `.env.example` to `.env` in `apps/server` and `apps/web`. Env files are ignored by git; keep secrets in them or in your deployment platform.

- **Server**: `apps/server/src/env.ts` validates `process.env` with Zod at startup and exports a typed `ENV`. The `dev` and `start` scripts load `.env` with Node's `--env-file-if-exists`, so variables already set in the environment (Docker, CI) still apply.
- **Web**: only `VITE_`-prefixed variables reach the client bundle. `apps/web/src/env.ts` holds the Zod schema, which `vite.config.ts` checks on dev and build, and types `import.meta.env`.
- **Database tooling**: `drizzle.config.ts` reads `DATABASE_URL` from `apps/server/.env` when the variable is not already set.

Shared database and auth packages receive configuration or initialized clients from the application.

## Deployment

### Docker Compose

- Target: web + server
- Config: `docker-compose.yml` (app Dockerfiles live in `apps/*/Dockerfile`)
- Build images: pnpm run docker:build
- Start: pnpm run docker:up
- Logs: pnpm run docker:logs
- Stop: pnpm run docker:down

Environment variables are read from each app's `.env` file (baked into web builds for public variables) and overridden in `docker-compose.yml` for container networking.

Docker Compose uses the local `./.data/local.db` file. Run `pnpm run db:push` before starting the stack.

For more details, see the guide on [Deploying with Docker Compose](https://www.better-t-stack.dev/docs/guides/docker).

## Linting and Formatting

Oxlint and Oxfmt run once from the root. Each package's `oxlint.config.ts` / `oxfmt.config.ts` picks the preset from `tooling/` (`node` or `react`); anything without its own config falls back to the root `base`.

- Fix and verify everything: `pnpm run check` (lint with fixes, format, then typecheck; stops at the first failure)

## Project Structure

```
maribor/
├── apps/
│   ├── web/         # Frontend application (React + TanStack Router)
│   └── server/      # Backend API (Hono, ORPC)
├── packages/
│   ├── ui/          # Shared shadcn/ui components and styles
│   ├── api/         # API layer / business logic
│   └── db/          # Database schema & queries
├── tooling/
│   ├── typescript/  # Shared tsconfig presets (base, internal-package, vite)
│   ├── oxlint/      # Oxlint presets (base, node, react)
│   └── oxfmt/       # Oxfmt presets (base, react)
```

## Available Scripts

- `pnpm run dev`: Start all applications in development mode
- `pnpm run build`: Build all applications
- `pnpm run dev:web`: Start only the web application
- `pnpm run dev:server`: Start only the server
- `pnpm run typecheck`: Check TypeScript types across all packages
- `pnpm run db:push`: Push schema changes to database
- `pnpm run db:generate`: Generate database client/types
- `pnpm run db:migrate`: Run database migrations
- `pnpm run db:studio`: Open database studio UI
- `pnpm run db:local`: Start the local SQLite database
- `pnpm run lint` / `lint:check`: Run Oxlint with / without fixes
- `pnpm run format` / `format:check`: Write / check Oxfmt formatting
- `pnpm run check`: Run `lint`, `format` and `typecheck`, stopping at the first failure
- `pnpm run knip`: Find unused files, dependencies and exports
- `pnpm run deps:check` / `deps:update`: Report / write dependency updates with Taze
- `pnpm run clean`: Remove build output, caches and `node_modules`
- `pnpm run docker:build`: Build the Docker Compose images
- `pnpm run docker:up`: Build and start the Docker Compose stack
- `pnpm run docker:logs`: Tail logs from the Docker Compose stack
- `pnpm run docker:down`: Stop the Docker Compose stack
