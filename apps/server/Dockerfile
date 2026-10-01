FROM node:24-slim AS base
ENV TURBO_TELEMETRY_DISABLED=1
RUN corepack enable
WORKDIR /app

# Reduce the monorepo to the server and its workspace dependencies
FROM base AS pruner
# Same major as the repo's turbo, so `prune` understands turbo.json; bump together with the catalog
RUN npm install -g turbo@^2
COPY . .
RUN turbo prune server --docker

FROM base AS builder
COPY --from=pruner /app/out/json/ .
RUN --mount=type=cache,target=/pnpm-store pnpm install --frozen-lockfile --store-dir /pnpm-store

COPY --from=pruner /app/out/full/ .
ENV NODE_ENV=production
RUN --mount=type=cache,target=/app/.turbo pnpm turbo run build --filter=server

FROM base AS runner
ENV NODE_ENV=production

# Workspace packages are bundled into dist, so only production deps are needed at runtime
COPY --from=pruner /app/out/json/ .
RUN --mount=type=cache,target=/pnpm-store pnpm install --prod --frozen-lockfile --store-dir /pnpm-store
COPY --from=builder /app/apps/server/dist ./apps/server/dist

ENV PORT=3000
EXPOSE 3000

WORKDIR /app/apps/server
CMD ["node", "dist/index.mjs"]
