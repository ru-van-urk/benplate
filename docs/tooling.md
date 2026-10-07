# Tooling

## Checks and CI

`pnpm check` runs sherif, Oxlint, Oxfmt, tsc and knip in that order, and stops at the first one that fails. Oxlint and Oxfmt run once from the root; tsc checks the root `tsconfig.json`, then every package's `typecheck` script through Turborepo, which caches packages that didn't change. A new package with a `tsconfig.json` needs a `typecheck` script (`tsc --noEmit`, or `tsc -b` for a config with references like `apps/web`). Each package's `oxlint.config.ts` / `oxfmt.config.ts` picks a preset from `tooling/` (`node` or `react`); anything without its own config falls back to the root `base`. Generated files (`migrations`, `generated`, `routeTree.gen.ts`) are left alone.

- `pnpm run fix`: sherif, Oxlint and Oxfmt fixes. Each runs even when the one before it leaves problems; run `check` for what remains
- `pnpm run check`: the checks above without fixes, then knip (unused files, dependencies and exports)

CI (`.github/workflows/ci.yml`) runs on pull requests:

- **`check`**: `pnpm check`, `pnpm build`, and a check that `packages/db/src/migrations` matches the schema
- **`database`**: migrates a fresh Postgres 18, then boots the built server (which runs Better Auth's schema check), reads the seeded planets and people and signs up once

`main` only takes pull requests (the "protect main" ruleset), with `check` as a required status check. Renaming that job blocks merges until the ruleset names the new one.

## Logging

The server logs with [evlog](https://evlog.dev): one wide event per request, with method, path, status and duration, which the API adds to. Each event carries `operation` (the procedure, such as `planet.create`) and, on protected routes, `user.id`. Only real failures (5xx) set the level to `error`; expected API errors such as `NOT_FOUND` don't.

- **In the API**, add fields with `context.log.set({ … })`, or record an error with `context.log.error(error)`
- **Elsewhere in the server** (startup, migrations, Better Auth's own messages), use `log` from `apps/server/src/logger.ts`. Never `console`
- **Output**: one JSON line per event on stdout in production; pretty-printed in development, and also written to `apps/server/.evlog/logs/` (ignored by git)
- `/api/health` is registered before the logger and isn't logged: Docker polls it every 10 seconds

## Pre-release dependencies

Two groups are pinned to exact pre-release versions in the catalog (`pnpm-workspace.yaml`), on purpose. Bump each group together, in one change, after reading the changelog. `pnpm run deps:check` lists bumps for them too.

- **drizzle-orm and drizzle-kit, on a 1.0 release candidate**: `snakeCase.table`, folder-per-migration output and the name-based migrator are v1. [Changelog](https://github.com/drizzle-team/drizzle-orm/releases)
- **`@orpc/*`, on a 2.0 beta**, so new projects don't migrate from v1 soon after starting. [Changelog](https://github.com/middleapi/orpc/releases)

## Scripts

| Script                                                    | What it does                                                           |
| --------------------------------------------------------- | ---------------------------------------------------------------------- |
| `dev`, `dev:web`, `dev:server`                            | Start everything, or one app, in development                           |
| `build`                                                   | Build all apps                                                         |
| `db:push`                                                 | Push the schema to the local database                                  |
| `db:generate --name <change>`                             | Generate a migration from schema changes (`--custom` for an empty one) |
| `db:migrate`                                              | Apply pending migrations to the local database                         |
| `db:studio`                                               | Open Drizzle Studio                                                    |
| `check`, `fix`                                            | Verify everything, or apply the fixes that can be applied              |
| `deps:check`, `deps:update`                               | Report or write dependency updates (Taze)                              |
| `docker:build`, `docker:up`, `docker:logs`, `docker:down` | Manage the Compose stack                                               |
| `template:init <name> [Display Name]`                     | Rename a project created from this template                            |
| `clean`                                                   | Remove build output, caches and `node_modules`                         |
