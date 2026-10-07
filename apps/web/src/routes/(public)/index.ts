import { createFileRoute } from "@tanstack/react-router";

import { PlanetListPage } from "~/features/planets/planet-list-page";

export const Route = createFileRoute("/(public)/")({
  context: ({ context }) => ({
    listPlanetsQueryOptions: context.orpc.planet.list.queryOptions(),
  }),
  loader: async ({ context }) => {
    await context.queryClient.query({ ...context.listPlanetsQueryOptions, staleTime: "static" });
  },
  component: PlanetListPage,
});
