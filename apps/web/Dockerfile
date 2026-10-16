FROM node:24-slim AS base
ENV TURBO_TELEMETRY_DISABLED=1
WORKDIR /app
# pnpm as pinned by `packageManager` (minus any +sha suffix); Node 25+ no longer ships corepack
COPY package.json ./
RUN npm install -g "$(node -p "require('./package.json').packageManager.split('+')[0]")"

# Reduce the monorepo to the web app and its workspace dependencies
FROM base AS pruner
# The repo's locked turbo, so `prune` understands turbo.json; the lockfile alone keeps this layer cached
COPY pnpm-lock.yaml ./
RUN version="$(sed -n 's/^  turbo@\([0-9][^:(]*\):$/\1/p' pnpm-lock.yaml | head -n 1)"; \
    if [ -z "$version" ]; then echo "turbo not found in pnpm-lock.yaml" >&2; exit 1; fi; \
    npm install -g "turbo@$version"
COPY . .
RUN turbo prune web --docker

FROM base AS builder
COPY --from=pruner /app/out/json/ .
RUN --mount=type=cache,target=/pnpm-store pnpm install --frozen-lockfile --store-dir /pnpm-store

COPY --from=pruner /app/out/full/ .
ENV NODE_ENV=production
RUN --mount=type=cache,target=/app/.turbo pnpm turbo run build --filter=web

FROM nginx:alpine AS runner
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY apps/web/nginx-headers.conf /etc/nginx/snippets/headers.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
