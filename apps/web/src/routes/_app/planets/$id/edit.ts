import { createFileRoute } from "@tanstack/react-router";

import { EditPlanetPage } from "~/features/planets/edit-planet-page";

export const Route = createFileRoute("/_app/planets/$id/edit")({
  context: ({ context, params }) => ({
    planetQueryOptions: context.orpc.planet.find.queryOptions({ input: { id: params.id } }),
  }),
  loader: async ({ context }) => {
    await context.queryClient.query({ ...context.planetQueryOptions, staleTime: "static" });
  },
  component: EditPlanetPage,
});
