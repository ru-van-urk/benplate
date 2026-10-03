import { type Database, newId } from "@benplate/db";
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
    // Our Kysely, CamelCasePlugin included: Better Auth writes camelCase fields and the plugin maps them onto
    // the snake_case columns of the hand-written schema in @benplate/db
    database: { db, type: "postgres" },
    emailAndPassword: { enabled: true, autoSignIn: true, disableSignUp },
    // In memory, so per server process; on by default only in production
    rateLimit: { enabled: true },
    // A signed cookie carries the session for 5 minutes, so most protected calls skip the session query
    session: { cookieCache: { enabled: true, maxAge: 5 * 60 } },
    advanced: {
      database: { generateId: () => newId() },
    },
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
