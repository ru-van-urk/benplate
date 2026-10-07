import { createFileRoute } from "@tanstack/react-router";

import { PlanetPage } from "~/features/planets/planet-page";

export const Route = createFileRoute("/(public)/planets/$id")({
  context: ({ context, params }) => ({
    planetQueryOptions: context.orpc.planet.find.queryOptions({ input: { id: params.id } }),
  }),
  loader: async ({ context }) => {
    await context.queryClient.query({ ...context.planetQueryOptions, staleTime: "static" });
  },
  component: PlanetPage,
});
