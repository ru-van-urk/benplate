import type { appContract } from "@benplate/contract";
import { ORPCError, createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { ContractRouterClient } from "@orpc/contract";
import { createTanstackQueryUtils, type RouterUtils } from "@orpc/tanstack-query";

export type APIClient = ContractRouterClient<typeof appContract>;

export type APIClientOptions = {
  origin: string;
  apiPath: `/${string}`;
};

export function createAPIClient({ origin, apiPath }: APIClientOptions): APIClient {
  // oRPC's own protocol (see ../server), which needs only the contract's types: it carries `Date`s and other
  // native types itself, and the server already validates every input and output against the contract
  return createORPCClient(new RPCLink({ origin, url: `${apiPath}/rpc` }));
}

export function createTanstackQueryAPIClient(options: APIClientOptions): RouterUtils<APIClient> {
  return createTanstackQueryUtils(createAPIClient(options));
}

// Whether a caught error is one the route declares (`.errors({ CONFLICT: {} })`) with this code
export function isApiError(error: unknown, code: string): error is ORPCError<string, unknown> {
  return error instanceof ORPCError && error.defined && error.code === code;
}
