import type { Auth } from "@benplate/auth";
import type { Database } from "@benplate/db";
import { implement, ORPCError } from "@orpc/server";
import type { RequestLogger } from "evlog";

import { appContract } from "../contracts";

export type CreateORPCContextOptions = {
  db: Database;
  auth: Auth;
  // The request's, for `protectedProcedure` to read the session cookie from
  headers: Headers;
  // The request's wide event (evlog); `log.set()` adds fields to it, so log through this, not `console`
  log: RequestLogger;
};

export async function createORPCContext({ db, auth, headers, log }: CreateORPCContextOptions) {
  return { db, auth, headers, log };
}

export type Context = Awaited<ReturnType<typeof createORPCContext>>;

export const os = implement(appContract).$context<Context>();

// For routes on `authedContract`. Public routes never look up the session, so they cost no query; here the
// session usually comes from Better Auth's cookie cache instead of the database
export const protectedProcedure = os.use(async ({ context, next }) => {
  const session = await context.auth.api.getSession({ headers: context.headers });

  if (!session) {
    throw new ORPCError("UNAUTHORIZED");
  }

  context.log.set({ user: { id: session.user.id } });

  return next({ context: { session } });
});
