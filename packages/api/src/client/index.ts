import { createORPCClient } from "@orpc/client";
import type { ContractRouterClient } from "@orpc/contract";
import { ResponseValidationPlugin } from "@orpc/contract/plugins";
import { SmartCoercionLinkPlugin } from "@orpc/json-schema";
import { OpenAPILink } from "@orpc/openapi/fetch";
import { createTanstackQueryUtils, type RouterUtils } from "@orpc/tanstack-query";

import { appContract } from "../contracts";
import { converters } from "../converters";

export type APIClient = ContractRouterClient<typeof appContract>;

export type APIClientOptions = {
  origin: string;
  apiPath: `/${string}`;
};

export function createAPIClient({ origin, apiPath }: APIClientOptions): APIClient {
  // The link needs the full contract at runtime: its meta to turn each call into a method and
  // path, and its schemas for the plugins below
  const link = new OpenAPILink(appContract, {
    origin,
    url: apiPath,
    plugins: [
      // REST responses are plain JSON, so restore native types (an ISO string back into a `Date`)...
      new SmartCoercionLinkPlugin(appContract, { converters }),
      // ...then check the result against the contract's output schemas
      new ResponseValidationPlugin(appContract),
    ],
  });

  return createORPCClient(link);
}

export function createTanstackQueryAPIClient(options: APIClientOptions): RouterUtils<APIClient> {
  return createTanstackQueryUtils(createAPIClient(options));
}
