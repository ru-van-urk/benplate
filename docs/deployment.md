# Deployment

One Docker Compose stack (`docker-compose.yml`, Dockerfiles in `apps/*/Dockerfile`): `web` (nginx with the built app), `server`, a Postgresql `db`, and a one-off `migrate` service.

- **Local:** `docker-compose.override.yml` publishes `web` on http://localhost:3030 (override with `WEB_PORT`); Dokploy ignores it
- **Env:** copy `.env.example` to `.env` at the repository root; on Dokploy, set the same variables in the Environment tab
- **Commands:** `pnpm run docker:build`, `docker:up`, `docker:logs`, `docker:down`

Compose refuses to start without:

- `POSTGRES_PASSWORD`: Compose builds the `DATABASE_URL` for the `db` service from it. Set `DATABASE_URL` only to use an external Postgresql instead.
- `APP_URL`: the public domain, such as `https://example.com`; locally `http://localhost:3030` (or your `WEB_PORT`).
- `BETTER_AUTH_SECRET`: generate one with `openssl rand -hex 32`.

## Routing

Only `web` needs a public domain (container port `80`). nginx proxies `/api` (REST, `/api/auth` and `/api/health`) to `server:3000` over the internal Compose network. On Dokploy, enable Isolated Deployments for the stack, so two stacks on one host don't share the `server` hostname, then add the domain to the `web` service in the Domains tab. nginx takes the client IP from Traefik's `X-Forwarded-For` (trusting the private Docker networks) and passes it on, so auth rate limits apply per client.

## Migrations

On every start, `migrate` runs `node dist/migrate.mjs` from the server image: it applies the pending migrations in one transaction and exits, and the server starts only after it succeeds. A failing migration changes nothing, but the API stays down until a fixed migration is deployed; `web` doesn't wait for the server, so the app stays up and `/api` returns 502 meanwhile. Check `docker compose logs migrate`, fix it with a new migration, and redeploy.

The server runs as one replica: auth rate limits live in its memory, and the migrator takes no lock, so keep it in this single service rather than per replica. Postgresql stores its data in the `postgres_data` volume.
