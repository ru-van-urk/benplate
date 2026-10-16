# BenPlate

A pnpm monorepo starter for full-stack TypeScript apps: React and TanStack Router on the web, a Hono server with a type-safe oRPC API, email and password auth with Better Auth, and Postgres with Drizzle for the schema, migrations and queries. It deploys as one Docker Compose stack.

A small Star Wars example, after [SWAPI](https://swapi.dev), shows every layer end to end: planets and the people who live there. Anyone can browse them; signed-in users can create, edit and delete them, except a planet that still has residents.

## Stack

- **Web**: React, TanStack Router and Query, Tailwind with shadcn/ui (`packages/ui`), Formisch forms validated by the API's own schemas
- **API**: Hono and oRPC, contract first, served as REST with an OpenAPI spec
- **Auth**: Better Auth, email and password, sessions in Postgres
- **Database**: Postgres with Drizzle: schema, migrations, relational queries and Studio
- **Tooling**: Oxlint, Oxfmt, sherif, tsc, knip, Turborepo, evlog for logging

## Quick start

```bash
pnpm install
cp apps/server/.env.example apps/server/.env   # then point DATABASE_URL at a local Postgres database
pnpm run db:migrate
pnpm run dev                                   # http://localhost:3000
```

## Docs

- [Why BenPlate](docs/why.md): the problem it solves, where it came from, and the decisions behind the stack
- [Goodies](docs/goodies.md): Turborepo, Knip, Taze and the other small tools that come with it
- [Getting started](docs/getting-started.md): setup, environment variables, starting a project from the template
- [Database](docs/database.md): schema changes, table rules, ids, queries, relations, enums, `updated_at`
- [API](docs/api.md): the contract, procedures and errors
- [Web app](docs/web.md): routes, data loading, forms, the session, UI
- [Adding a resource](docs/adding-a-resource.md): every file a new resource touches
- [Authentication](docs/auth.md): Better Auth's tables, sessions, protected routes, rate limiting
- [Deployment](docs/deployment.md): Docker Compose, routing behind a proxy, migrations on deploy
- [Tooling](docs/tooling.md): checks, CI, logging, pre-release dependencies, scripts
- [Git and GitHub](docs/git.md): the `develop` and `main` flow, merge methods, rulesets for a new repository

[CLAUDE.md](CLAUDE.md) lists the rules in short.

## Project structure

```
benplate/
├── apps/
│   ├── web/         # React + TanStack Router
│   └── server/      # Hono: health check, auth, mounts the API
├── packages/
│   ├── ui/          # Shared shadcn/ui components and styles
│   ├── contract/    # oRPC contract: routes, schemas and errors, shared by server and clients
│   ├── api/         # oRPC server implementation and typed client
│   ├── auth/        # Better Auth: server setup and browser client
│   └── db/          # Drizzle: schema, relations, migrations
├── docs/            # The docs above
├── scripts/         # template-init.ts
└── tooling/         # Shared tsconfig, Oxlint and Oxfmt presets
```
