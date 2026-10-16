# Goodies

The smaller tools and tricks that come with the template. None of them is required to understand the app, but each saves time somewhere.

## Monorepo

- **[Turborepo](https://turborepo.com)** runs `dev`, `build` and `typecheck` across the packages in dependency order and caches what didn't change, so a second `pnpm check` only type-checks the packages you touched. The Dockerfiles use `turbo prune` to cut the repository down to one app and its packages, which keeps images small and their layers cached.
- **[pnpm catalogs](https://pnpm.io/catalogs)** keep every version in one place, `pnpm-workspace.yaml`, so the packages can't disagree on a version. `pnpm add:catalog <pkg>` adds a dependency there. pnpm also refuses versions published less than a day ago (`minimumReleaseAge`), a cheap guard against a compromised release.
- **[sherif](https://github.com/QuiiBz/sherif)** lints the monorepo itself: mismatched versions, missing fields, dependencies in the wrong place. `pnpm check` fixes what it can.

## Dependencies

- **[Taze](https://github.com/antfu-collective/taze)**: `pnpm deps:check` lists available updates for every package, catalog included, and `pnpm deps:update` writes them. It's configured to include the exactly pinned pre-releases and to skip versions pnpm would refuse.
- **[Knip](https://knip.dev)**: `pnpm knip` finds unused files, dependencies and exports. Run it before you finish; it's how the template stays free of leftovers.

## Code quality

- **[Oxlint](https://oxc.rs/docs/guide/usage/linter) and [Oxfmt](https://oxc.rs/docs/guide/usage/formatter)**: linting and formatting in one fast toolchain. Lint is type-aware (through tsgolint), allows no warnings and reports `disable` comments that no longer disable anything. The VS Code settings format on save with the Oxc extension.
- **[TypeScript 7](https://devblogs.microsoft.com/typescript/)**: the Go compiler, several times faster than `tsc` 5.
- **[ts-reset](https://github.com/total-typescript/ts-reset)** fixes TypeScript's built-in typings in every package: `JSON.parse` returns `unknown`, `.filter(Boolean)` narrows the array.
- **`#/` imports** in the web app (`#/features/planets/planet-form`) instead of `../../..`.

## Database

- **Drizzle Studio**: `pnpm db:studio` opens a browser UI on the local database.
- **`db:push`** to iterate on the schema without writing migrations, then **`db:generate --name`** once it's settled. CI fails when the schema changed without a migration.

## API and server

- **API docs**: [/api/docs](http://localhost:3000/api/docs) serves a Scalar reference generated from the contract, with the OpenAPI spec at `/api/docs/spec.json`. Off in production.
- **[evlog](https://evlog.dev)** logs one wide event per request, with the procedure, the user, the status and the duration, instead of a stream of loose lines. Pretty in development, JSON in production. See [Logging](tooling.md#logging).
- **A self-contained server bundle**: tsdown bundles the server and its migrations into `dist`, so the runtime image ships no `node_modules`.
- **Env checked at startup**: `apps/server/src/env.ts` validates `process.env` with Valibot and exits with a list of what's wrong.

## Web

- **TanStack Query Devtools** in development, bottom corner of the app.
- **Code splitting per page** for free, from the route files; app parts that only some visitors need (the delete dialog) are `lazy`.
- **[shadcn/ui](https://ui.shadcn.com)** components in `packages/ui`, added with the shadcn CLI and used as they come.

## Project

- **`pnpm template:init <name> "Display Name"`** renames a new project from the template in one go: package scope, database name, titles.
- **A CI smoke run**: CI migrates a fresh Postgres, boots the built server on it, reads the example data and signs up once. No test suite, but a broken migration or auth schema never reaches a deploy.
- **[CLAUDE.md](../CLAUDE.md)** holds the rules in short, so coding agents write code that looks like the rest of the template.
