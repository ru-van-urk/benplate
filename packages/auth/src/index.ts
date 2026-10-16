import type { Database } from "@benplate/db";
import { drizzleAdapter } from "@better-auth/drizzle-adapter/relations-v2";
import { betterAuth } from "better-auth";

export type CreateAuthOptions = {
  db: Database;
  // The public origin of the web app; auth is served under its /api/auth, Better Auth's default basePath
  appUrl: string;
  secret: string;
  disableSignUp: boolean;
  // Better Auth's own log lines (schema problems, failed requests), so they come out in the app's format
  log: (level: "debug" | "info" | "warn" | "error", message: string) => void;
};

export function createAuth({ db, appUrl, secret, disableSignUp, log }: CreateAuthOptions) {
  return betterAuth({
    baseURL: appUrl,
    secret,
    // The app's Drizzle instance: Better Auth finds its tables through its relations (relations v2), and writes
    // camelCase fields that `snakeCase.table` maps onto the hand-written schema in @benplate/db
    database: drizzleAdapter(db, { provider: "pg" }),
    emailAndPassword: { enabled: true, autoSignIn: true, disableSignUp },
    // In memory, so per server process; on by default only in production
    rateLimit: { enabled: true },
    // A signed cookie carries the session for 5 minutes, so most protected calls skip the session query
    session: { cookieCache: { enabled: true, maxAge: 5 * 60 } },
    logger: { log },
  });
}

export type Auth = ReturnType<typeof createAuth>;

// Better Auth checks its tables against the database, but only logs a mismatch and then fails every auth
// request. Awaiting the same check at startup turns that into a crash with a clear message
export async function checkAuthSchema(auth: Auth) {
  const context = await auth.$context;
  await context.checkSchema?.();
}
