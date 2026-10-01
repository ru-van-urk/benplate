import type { Database } from "@maribor/db";
import { implement } from "@orpc/server";

import { appContract } from "../contracts";

export type CreateORPCContextOptions = {
  db: Database;
};

export async function createORPCContext({ db }: CreateORPCContextOptions) {
  return { db };
}

export type Context = Awaited<ReturnType<typeof createORPCContext>>;

export const os = implement(appContract).$context<Context>();
