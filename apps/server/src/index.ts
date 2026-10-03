import { serve } from "@hono/node-server";
import { createApi } from "@benplate/api/server";
import { createFsDrain } from "evlog/fs";
import { evlog, type EvlogVariables } from "evlog/hono";
import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";

import { ENV } from "./env";
import { log } from "./logger";
import { db } from "./services";

const api = createApi({ db, apiPath: "/api", docs: ENV.NODE_ENV !== "production" });

const app = new Hono<EvlogVariables>();

// Liveness for Docker and uptime checks: answered by Hono before the API, so it stays independent of
// oRPC middleware; under /api so the nginx and Vite proxies forward it. Registered before evlog,
// which therefore never logs it: Docker polls every 10s
app.get("/api/health", (c) => {
  return c.text("OK");
});

// One wide event per request, which the API enriches through `context.log`. Written to stdout (JSON in
// production), and in development also to .evlog/logs for reading back later
app.use(evlog({ drain: ENV.NODE_ENV === "production" ? undefined : createFsDrain() }));

// nginx caps bodies at 1 MB too; this keeps the cap when the server is reached without it (dev, other proxies)
app.use("/api/*", bodyLimit({ maxSize: 1024 * 1024 }));

app.use("/*", async (c, next) => {
  const result = await api.handler(c.req.raw, { log: c.get("log") });

  if (result.matched) {
    return c.newResponse(result.response.body, result.response);
  }

  await next();
});

const server = serve({ fetch: app.fetch, port: ENV.PORT }, (info) => {
  log.info("server", `Listening on http://localhost:${info.port}`);
});

// Docker sends SIGTERM on redeploy: stop accepting connections, let in-flight requests finish, then close the pool
const shutdown = () => {
  server.close(() => {
    void db.destroy();
  });
};

process.once("SIGTERM", shutdown);
process.once("SIGINT", shutdown);
