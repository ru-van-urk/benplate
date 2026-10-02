FROM node:24-slim AS base
ENV TURBO_TELEMETRY_DISABLED=1
# Same version as `packageManager` in the root package.json; Node 25+ no longer ships corepack
RUN npm install -g pnpm@12.6.0
WORKDIR /app

# Reduce the monorepo to the server and its workspace dependencies
FROM base AS pruner
# Same version as the repo's locked turbo, so `prune` understands turbo.json; bump together with the catalog
RUN npm install -g turbo@2.11.5
COPY . .
RUN turbo prune server --docker

FROM base AS builder
COPY --from=pruner /app/out/json/ .
RUN --mount=type=cache,target=/pnpm-store pnpm install --frozen-lockfile --store-dir /pnpm-store

COPY --from=pruner /app/out/full/ .
ENV NODE_ENV=production
RUN --mount=type=cache,target=/app/.turbo pnpm turbo run build --filter=server

# The bundle is self-contained (see tsdown.config.ts), so the runtime image needs no node_modules or pnpm
FROM node:24-slim AS runner
ENV NODE_ENV=production
WORKDIR /app/apps/server
COPY --from=builder /app/apps/server/dist ./dist
USER node
ENV PORT=3000
EXPOSE 3000
CMD ["node", "dist/index.mjs"]
