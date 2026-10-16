# Deployment

One Docker Compose stack (`docker-compose.yml`, Dockerfiles in `apps/*/Dockerfile`): `web` (nginx with the built app), `server`, a Postgresql `db`, and a one-off `migrate` service.

- **Port:** `web` is the only service with a published port, http://localhost:3030 by default (set `WEB_PORT` to change it). The server and the database stay on the internal Compose network
- **Env:** copy `.env.example` to `.env` at the repository root; on a hosting platform, set the same variables in its environment settings
- **Commands:** `pnpm run docker:build`, `docker:up`, `docker:logs`, `docker:down`

Compose refuses to start without:

- `POSTGRES_PASSWORD`: Compose builds the `DATABASE_URL` for the `db` service from it. Set `DATABASE_URL` only to use an external Postgresql instead.
- `APP_URL`: the public domain, such as `https://example.com`; locally `http://localhost:3030` (or your `WEB_PORT`).
- `BETTER_AUTH_SECRET`: generate one with `openssl rand -hex 32`.

## Routing

Only `web` needs a public domain: point it at `WEB_PORT` on the host. nginx proxies `/api` (REST, `/api/auth` and `/api/health`) to `server:3000` over the internal Compose network. Put your reverse proxy (Traefik, Caddy, a platform's own) in front of `web` and let it end TLS. If the platform attaches several stacks to one shared network, isolate this one, so two stacks don't share the `server` hostname. nginx takes the client IP from the proxy's `X-Forwarded-For` (trusting private networks) and passes it on, so auth rate limits apply per client.

## Migrations

On every start, `migrate` runs `node dist/migrate.mjs` from the server image: it applies the pending migrations in one transaction and exits, and the server starts only after it succeeds. A failing migration changes nothing, but the API stays down until a fixed migration is deployed; `web` doesn't wait for the server, so the app stays up and `/api` returns 502 meanwhile. Check `docker compose logs migrate`, fix it with a new migration, and redeploy.

The server runs as one replica: auth rate limits live in its memory, and the migrator takes no lock, so keep it in this single service rather than per replica. Postgresql stores its data in the `postgres_data` volume.
