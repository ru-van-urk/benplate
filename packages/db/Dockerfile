FROM node:24-slim AS base
ENV TURBO_TELEMETRY_DISABLED=1
RUN corepack enable
WORKDIR /app

# Reduce the monorepo to the db package and its workspace dependencies
FROM base AS pruner
# Same major as the repo's turbo, so `prune` understands turbo.json; bump together with the catalog
RUN npm install -g turbo@^2
COPY . .
RUN turbo prune @maribor/db --docker

# drizzle-kit is a dev dependency, so this image keeps the full install instead of a production one
FROM base AS runner
COPY --from=pruner /app/out/json/ .
RUN --mount=type=cache,target=/pnpm-store pnpm install --frozen-lockfile --store-dir /pnpm-store
COPY --from=pruner /app/out/full/ .

WORKDIR /app/packages/db
# Without --force, a change that would lose data needs confirmation, so the push fails instead of applying it
CMD ["pnpm", "exec", "drizzle-kit", "push"]
