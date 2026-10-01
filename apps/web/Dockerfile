FROM node:24-slim AS base
ENV TURBO_TELEMETRY_DISABLED=1
RUN corepack enable
WORKDIR /app

# Reduce the monorepo to the web app and its workspace dependencies
FROM base AS pruner
# Same major as the repo's turbo, so `prune` understands turbo.json; bump together with the catalog
RUN npm install -g turbo@^2
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
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
