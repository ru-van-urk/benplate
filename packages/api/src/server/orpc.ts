import type { Database } from "@benplate/db";
import { implement } from "@orpc/server";
import type { RequestLogger } from "evlog";

import { appContract } from "../contracts";

export type CreateORPCContextOptions = {
  db: Database;
  // The request's wide event (evlog); `log.set()` adds fields to it, so log through this, not `console`
  log: RequestLogger;
};

export async function createORPCContext({ db, log }: CreateORPCContextOptions) {
  return { db, log };
}

export type Context = Awaited<ReturnType<typeof createORPCContext>>;

export const os = implement(appContract).$context<Context>();
