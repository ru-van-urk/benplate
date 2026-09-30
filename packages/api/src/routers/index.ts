import { openapi } from "@orpc/openapi";
import type { RouterClient } from "@orpc/server";

import { publicProcedure } from "../index";
import { planetRouter } from "./planet";

export const appRouter = {
  healthCheck: publicProcedure.meta(openapi({ method: "GET", path: "/health" })).handler(() => {
    return "OK";
  }),
  planet: planetRouter,
};
export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
