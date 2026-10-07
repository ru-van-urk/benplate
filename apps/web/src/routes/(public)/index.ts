import { createFileRoute } from "@tanstack/react-router";

import { PlanetListPage } from "~/features/planets/planet-list-page";

export const Route = createFileRoute("/(public)/")({
  context: ({ context }) => ({
    planetQueryOptions: context.orpc.planet.list.queryOptions(),
  }),
  loader: async ({ context }) => {
    await context.queryClient.query({ ...context.planetQueryOptions, staleTime: "static" });
  },
  component: PlanetListPage,
});
