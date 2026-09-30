import { appRouter } from "@maribor/api/routers/index";
import { migrateDb } from "@maribor/db/migrate";
import { SmartCoercionHandlerPlugin } from "@orpc/json-schema";
import { OpenAPIGenerator } from "@orpc/openapi";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { OpenAPIReferenceHandlerPlugin } from "@orpc/openapi/plugins";
import { onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import { ValibotToJsonSchemaConverter } from "@orpc/valibot";
import { Hono } from "hono";
import { logger } from "hono/logger";

import { createContext } from "./context";
import { ENV } from "./env";
import { db } from "./services";

await migrateDb(db);

const app = new Hono();

app.use(logger());

const converters = [new ValibotToJsonSchemaConverter()];
const openAPIGenerator = new OpenAPIGenerator({ converters });

const logError = (error: unknown) => {
  console.error(error);
};

// oRPC protocol for the typed client in apps/web
export const rpcHandler = new RPCHandler(appRouter, { interceptors: [onError(logError)] });

// REST for everyone else; coercion turns path and query strings (`/planets/2`) into schema types
export const apiHandler = new OpenAPIHandler(appRouter, {
  plugins: [
    new SmartCoercionHandlerPlugin({ converters }),
    // Paths are relative to the handler prefix: /api/docs and /api/docs/spec.json
    new OpenAPIReferenceHandlerPlugin({
      docsPath: "/docs",
      specPath: "/docs/spec.json",
      spec: () =>
        openAPIGenerator.generate(appRouter, {
          base: {
            info: { title: "maribor", version: "1.0.0" },
            // Relative, so "try it" works through both the nginx and Vite proxies
            servers: [{ url: "/api" }],
          },
        }),
    }),
  ],
  interceptors: [onError(logError)],
});

app.use("/*", async (c, next) => {
  const context = await createContext({ context: c });

  const rpcResult = await rpcHandler.handle(c.req.raw, {
    prefix: "/api/rpc",
    context: context,
  });

  if (rpcResult.matched) {
    return c.newResponse(rpcResult.response.body, rpcResult.response);
  }

  const apiResult = await apiHandler.handle(c.req.raw, {
    prefix: "/api",
    context: context,
  });

  if (apiResult.matched) {
    return c.newResponse(apiResult.response.body, apiResult.response);
  }

  await next();
});

app.get("/", (c) => {
  return c.text("OK");
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
