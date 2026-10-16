# Getting started

## Prerequisites

- Node 24, as pinned in `.node-version`
- pnpm 12, matching `packageManager` in `package.json`
- A local Postgresql (Postgres.app, Homebrew or your own container) with a database for this project
- Docker, only for the Compose stack ([Deployment](deployment.md))

## Run it locally

1. Install the dependencies:

   ```bash
   pnpm install
   ```

2. Copy `apps/server/.env.example` to `apps/server/.env` and point `DATABASE_URL` at your database. The other values work as they are for development (see [Environment](#environment)).

3. Apply the migrations, then insert the example planets and people:

   ```bash
   pnpm run db:migrate
   pnpm run db:seed
   ```

4. Start the web app and the server:

   ```bash
   pnpm run dev
   ```

Open [http://localhost:3000](http://localhost:3000). The server runs at [http://localhost:3001](http://localhost:3001), and the Vite dev server proxies `/api` to it:

- REST API, also used by the web app: [http://localhost:3000/api/planets](http://localhost:3000/api/planets), `/api/people`, `/api/planets/{id}`
- Better Auth: `/api/auth/*` (e.g. `POST /api/auth/sign-in/email`, `GET /api/auth/get-session`)
- API docs and OpenAPI spec: [http://localhost:3000/api/docs](http://localhost:3000/api/docs) and `/api/docs/spec.json`, only when `NODE_ENV` is not `production`
- Health check (Hono, outside the API): `/api/health`

## Environment

Env files are ignored by git; keep secrets in them or in your deployment platform. `apps/server/src/env.ts` validates `process.env` with Valibot at startup and exits with a list of what is wrong. The `dev` and `start` scripts load `apps/server/.env` with Node's `--env-file-if-exists`, so variables already set (Docker, CI) win. The migrator only needs `DATABASE_URL`.

| Variable              | Required | Meaning                                                                                                          |
| --------------------- | -------- | ---------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`        | yes      | Postgres connection string                                                                                       |
| `APP_URL`             | yes      | The app's public URL as the browser sees it: `http://localhost:3000` in development, `https://<domain>` deployed |
| `BETTER_AUTH_SECRET`  | yes      | At least 32 characters (`openssl rand -hex 32`); signs session cookies, so changing it signs everyone out        |
| `AUTH_DISABLE_SIGNUP` | no       | `true` closes sign-up; default `false`                                                                           |
| `PORT`                | no       | Default `3001`; the Docker image sets `3000`                                                                     |
| `NODE_ENV`            | no       | `production` in the Docker image; turns off the API docs and the `.evlog` file output                            |

- **Web** needs no configuration. It calls the API under `/api` on its own origin, which the Vite dev server and nginx in production proxy to the server, so there is no CORS and one web image works everywhere.
- **Database tooling** (`drizzle.config.ts`) reads `DATABASE_URL` from `apps/server/.env` when it isn't already set. `db:push` and `db:migrate` change whatever database that is, so give this project a database of its own.

## Start a new project from the template

1. On GitHub, use **Use this template** and clone the new repository.
2. Rename the project. The name becomes the package scope (`@<name>/*`) and the database name; the display name goes in titles. The script rewrites every tracked text file, then runs `pnpm install`:

   ```bash
   pnpm template:init <name> "Display Name"
   ```

3. Follow the steps it prints: the description in `apps/web/src/routes/__root.ts` and `apps/web/public/favicon.svg`.
4. Remove the example once you no longer need it: the `planets` and `people` schema, contract and router files (and their entries in each `index.ts`), their routes and pages (`apps/web/src/routes`, `apps/web/src/features/planets`, `features/people`), and the seed (`packages/db/src/seed.ts`, `apps/server/src/seed.ts` and the `db:seed` and `docker:seed` scripts). Then run `pnpm run db:generate --name remove_example`. Keep the earlier migrations: they may have run somewhere already, and on a new database the tables are simply created and dropped again.
