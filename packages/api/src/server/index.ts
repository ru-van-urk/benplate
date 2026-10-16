import type { Auth } from "@benplate/auth";
import type { Database } from "@benplate/db";
import { SmartCoercionHandlerPlugin } from "@orpc/json-schema";
import { OpenAPIGenerator } from "@orpc/openapi";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { OpenAPIReferenceHandlerPlugin } from "@orpc/openapi/plugins";
import { COMMON_ERROR_STATUS_MAP, ORPCError, onError } from "@orpc/server";
import type { RequestLogger } from "evlog";

import { converters } from "../converters";
import { type Context, createORPCContext } from "./orpc";
import { appRouter } from "./router";

export type CreateApiOptions = {
  db: Database;
  auth: Auth;
  apiPath: `/${string}`;
  // Serves the Scalar reference at {apiPath}/docs; it loads its script from a CDN, so keep it out of production
  docs: boolean;
};

export function createApi({ db, auth, apiPath, docs }: CreateApiOptions) {
  const openAPIGenerator = new OpenAPIGenerator({ converters });

  // Expected 4xx errors (not found, validation, conflicts) are part of the API; only real failures mark the
  // request's wide event as an error. v2 errors carry no status: the handler maps the code through this map, and unknown codes become 500
  const errorStatus = (error: ORPCError<string, unknown>) =>
    (COMMON_ERROR_STATUS_MAP as Record<string, number>)[error.code] ?? 500;

  const logError = (error: unknown, { context }: { context: Context }) => {
    if (!(error instanceof ORPCError) || errorStatus(error) >= 500) {
      context.log.error(error instanceof Error ? error : String(error));
    }
  };

  // The router never changes at runtime, so the spec is generated once, on the first docs request
  let spec: ReturnType<typeof openAPIGenerator.generate> | undefined;

  const docsPlugin = new OpenAPIReferenceHandlerPlugin({
    // Paths are relative to the handler prefix: {apiPath}/docs and {apiPath}/docs/spec.json
    docsPath: "/docs",
    specPath: "/docs/spec.json",
    spec: () =>
      (spec ??= openAPIGenerator.generate(appRouter, {
        base: {
          info: { title: "BenPlate", version: "1.0.0" },
          // Relative, so "try it" works through both the nginx and Vite proxies
          servers: [{ url: apiPath }],
        },
      })),
  });

  // REST for the typed client (see ../client) and everyone else; coercion turns path and query
  // strings into schema types (numbers, booleans, dates)
  const openAPIHandler = new OpenAPIHandler(appRouter, {
    plugins: [new SmartCoercionHandlerPlugin({ converters }), ...(docs ? [docsPlugin] : [])],
    interceptors: [
      // Names the procedure on the request's wide event
      (options) => {
        options.context.log.set({ operation: options.path.join(".") });
        return options.next();
      },
      onError(logError),
    ],
  });

  return {
    handler: async (request: Request, { log }: { log: RequestLogger }) => {
      return openAPIHandler.handle(request, {
        prefix: apiPath,
        context: await createORPCContext({ db, auth, headers: request.headers, log }),
      });
    },
  };
}
