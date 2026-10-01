import type { Database } from "@maribor/db";
import { SmartCoercionHandlerPlugin } from "@orpc/json-schema";
import { OpenAPIGenerator } from "@orpc/openapi";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { OpenAPIReferenceHandlerPlugin } from "@orpc/openapi/plugins";
import { onError } from "@orpc/server";

import { converters } from "../converters";
import { createORPCContext } from "./orpc";
import { appRouter } from "./router";

export type CreateApiOptions = {
  db: Database;
  apiPath: `/${string}`;
};

export function createApi({ db, apiPath }: CreateApiOptions) {
  const openAPIGenerator = new OpenAPIGenerator({ converters });

  const logError = (error: unknown) => {
    console.error(error);
  };

  // REST for the typed client (see ../client) and everyone else; coercion turns path and query
  // strings (`/planets/2`) into schema types
  const openAPIHandler = new OpenAPIHandler(appRouter, {
    plugins: [
      new SmartCoercionHandlerPlugin({ converters }),
      // Paths are relative to the handler prefix: {apiPath}/docs and {apiPath}/docs/spec.json
      new OpenAPIReferenceHandlerPlugin({
        docsPath: "/docs",
        specPath: "/docs/spec.json",
        spec: () =>
          openAPIGenerator.generate(appRouter, {
            base: {
              info: { title: "maribor", version: "1.0.0" },
              // Relative, so "try it" works through both the nginx and Vite proxies
              servers: [{ url: apiPath }],
            },
          }),
      }),
    ],
    interceptors: [onError(logError)],
  });

  return {
    handler: async (request: Request) => {
      return openAPIHandler.handle(request, {
        prefix: apiPath,
        context: await createORPCContext({ db }),
      });
    },
  };
}
