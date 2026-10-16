import { serve } from "@hono/node-server";
import { createApi } from "@benplate/api/server";
import { checkAuthSchema, createAuth } from "@benplate/auth";
import { createDb } from "@benplate/db";
import { createFsDrain } from "evlog/fs";
import { evlog, type EvlogVariables } from "evlog/hono";
import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";

import { getServerEnv } from "./env";
import { log } from "./logger";

const ENV = getServerEnv();

const db = createDb(ENV, {
  onError: (error) => {
    log.error("db", `Idle Postgres client error: ${error.message}`);
  },
});

const auth = createAuth({
  db,
  appUrl: ENV.APP_URL,
  secret: ENV.BETTER_AUTH_SECRET,
  disableSignUp: ENV.AUTH_DISABLE_SIGNUP,
  log: (level, message) => log[level]("auth", message),
});

// Better Auth logs a schema mismatch itself (through `log` above). Exiting here makes Compose restart the
// server with that line in its logs, instead of the server failing every sign-in
await checkAuthSchema(auth).catch(() => process.exit(1));

const api = createApi({ db, auth, apiPath: "/api", docs: ENV.NODE_ENV !== "production" });

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

// Better Auth's endpoints (sign-up, sign-in, session, sign-out); same origin as the app, so no CORS
app.on(["GET", "POST"], "/api/auth/*", (c) => auth.handler(c.req.raw));

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
    void db.$client.end();
  });
};

process.once("SIGTERM", shutdown);
process.once("SIGINT", shutdown);
