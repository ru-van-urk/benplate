import { createAuthClient } from "@benplate/auth/client";
import { type QueryClient, queryOptions } from "@tanstack/react-query";
import type { AnyRouter } from "@tanstack/react-router";
import * as v from "valibot";

export const authClient = createAuthClient({ origin: window.location.origin });

export type Session = typeof authClient.$Infer.Session;

// Loaded once by the root route; `refreshSession` drops it whenever the session may have changed
export const sessionQueryOptions = queryOptions({
  queryKey: ["session"],
  queryFn: async (): Promise<Session | null> => {
    const { data, error } = await authClient.getSession();

    if (error) {
      throw new Error(error.message ?? "Could not load the session");
    }

    return data;
  },
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
