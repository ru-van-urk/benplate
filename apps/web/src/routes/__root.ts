import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext } from "@tanstack/react-router";

import { RootLayout } from "#/features/layout/root-layout";
import { sessionQueryOptions } from "#/utils/auth";
import type { orpc } from "#/utils/orpc";

import "../index.css";

export interface RouterAppContext {
  orpc: typeof orpc;
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
  // Every route reads the session from here; it is fetched once and kept until `refreshSession` drops it
  beforeLoad: async ({ context }) => ({
    session: await context.queryClient.query({ ...sessionQueryOptions, staleTime: "static" }),
  }),
  component: RootLayout,
  head: () => ({
    meta: [
      {
        title: "BenPlate",
      },
      {
        name: "description",
        content: "BenPlate is a web application",
      },
    ],
  }),
});
