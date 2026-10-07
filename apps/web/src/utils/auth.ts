import type { createAuthClient } from "@benplate/auth/client";
import { fetchSession } from "@benplate/auth/session";
import { type QueryClient, queryOptions } from "@tanstack/react-query";
import type { AnyRouter } from "@tanstack/react-router";
import * as v from "valibot";

let authClient: Promise<ReturnType<typeof createAuthClient>> | undefined;

// Better Auth's client, loaded on first use (signing in, up or out) instead of with every page
export function loadAuthClient() {
  return (authClient ??= import("@benplate/auth/client").then(({ createAuthClient }) =>
    createAuthClient({ origin: window.location.origin }),
  ));
}

// Loaded once by the root route; `refreshSession` drops it whenever the session may have changed
export const sessionQueryOptions = queryOptions({
  queryKey: ["session"],
  queryFn: () => fetchSession({ origin: window.location.origin }),
});

// After signing in or out, and when the API answers UNAUTHORIZED: reload the session, then rerun every route's
// `beforeLoad`, so the `_app` guard and the login/register pages redirect to wherever the user belongs now
export async function refreshSession(queryClient: QueryClient, router: AnyRouter) {
  await queryClient.resetQueries({ queryKey: sessionQueryOptions.queryKey });
  await router.invalidate();
}

// Where to go after signing in. Only same-origin paths (`/x`, not `//host` or `/\host`), so the parameter can't
// be used as an open redirect; anything else is dropped
export const redirectSearchSchema = v.object({
  redirect: v.fallback(v.optional(v.pipe(v.string(), v.regex(/^\/(?![/\\])/))), undefined),
});
