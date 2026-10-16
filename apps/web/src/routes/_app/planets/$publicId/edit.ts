import { isApiError } from "@benplate/api/client";
import { createFileRoute, notFound } from "@tanstack/react-router";

import { EditPlanetPage } from "#/features/planets/edit-planet-page";

export const Route = createFileRoute("/_app/planets/$publicId/edit")({
  context: ({ context, params }) => ({
    getPlanetQueryOptions: context.orpc.planet.get.queryOptions({
      input: { publicId: params.publicId },
    }),
  }),
  loader: async ({ context }) => {
    try {
      await context.queryClient.query({ ...context.getPlanetQueryOptions, staleTime: "static" });
    } catch (error) {
      // An unknown planet is a missing page, not a failure: show the not-found screen instead of "Try again"
      if (isApiError(error, "NOT_FOUND")) {
        throw notFound();
      }

      throw error;
    }
  },
  component: EditPlanetPage,
});
