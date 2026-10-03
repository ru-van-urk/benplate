FROM node:24-slim AS base
ENV TURBO_TELEMETRY_DISABLED=1
WORKDIR /app
# pnpm as pinned by `packageManager` (minus any +sha suffix); Node 25+ no longer ships corepack
COPY package.json ./
RUN npm install -g "$(node -p "require('./package.json').packageManager.split('+')[0]")"

# Reduce the monorepo to the server and its workspace dependencies
FROM base AS pruner
# The repo's locked turbo, so `prune` understands turbo.json; the lockfile alone keeps this layer cached
COPY pnpm-lock.yaml ./
RUN version="$(sed -n 's/^  turbo@\([0-9][^:(]*\):$/\1/p' pnpm-lock.yaml | head -n 1)"; \
    if [ -z "$version" ]; then echo "turbo not found in pnpm-lock.yaml" >&2; exit 1; fi; \
    npm install -g "turbo@$version"
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
