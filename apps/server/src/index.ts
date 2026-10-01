import { createApi } from "@maribor/api/server";
import { migrateDb } from "@maribor/db/migrate";
import { Hono } from "hono";
import { logger } from "hono/logger";

import { ENV } from "./env";
import { db } from "./services";

await migrateDb(db);

const api = createApi({ db, apiPath: "/api" });

const app = new Hono();

app.use(logger());

// Liveness for Docker and uptime checks: answered by Hono before the API, so it stays independent of
// oRPC middleware; under /api so the nginx and Vite proxies forward it
app.get("/api/health", (c) => {
  return c.text("OK");
});

app.use("/*", async (c, next) => {
  const result = await api.handler(c.req.raw);

  if (result.matched) {
    return c.newResponse(result.response.body, result.response);
  }

  await next();
});

import { serve } from "@hono/node-server";

serve(
  {
    fetch: app.fetch,
    port: ENV.PORT,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
