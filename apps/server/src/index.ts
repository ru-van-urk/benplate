import { serve } from "@hono/node-server";
import { createApi } from "@benplate/api/server";
import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { logger } from "hono/logger";

import { ENV } from "./env";
import { db } from "./services";

const api = createApi({ db, apiPath: "/api", docs: ENV.NODE_ENV !== "production" });

const app = new Hono();

// Liveness for Docker and uptime checks: answered by Hono before the API, so it stays independent of
// oRPC middleware; under /api so the nginx and Vite proxies forward it. Registered before the
// logger, which therefore never runs for it: Docker polls every 10s
app.get("/api/health", (c) => {
  return c.text("OK");
});

app.use(logger());

// nginx caps bodies at 1 MB too; this keeps the cap when the server is reached without it (dev, other proxies)
app.use("/api/*", bodyLimit({ maxSize: 1024 * 1024 }));

app.use("/*", async (c, next) => {
  const result = await api.handler(c.req.raw);

  if (result.matched) {
    return c.newResponse(result.response.body, result.response);
  }

  await next();
});

const server = serve({ fetch: app.fetch, port: ENV.PORT }, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`);
});

// Docker sends SIGTERM on redeploy: stop accepting connections, let in-flight requests finish, then close the pool
const shutdown = () => {
  server.close(() => {
    void db.destroy();
  });
};

process.once("SIGTERM", shutdown);
process.once("SIGINT", shutdown);
