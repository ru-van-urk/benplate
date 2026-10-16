import { isApiError } from "@benplate/api/client";
import { createFileRoute, notFound } from "@tanstack/react-router";

import { EditPersonPage } from "#/features/people/edit-person-page";

export const Route = createFileRoute("/_app/people/$id/edit")({
  context: ({ context, params }) => ({
    getPersonQueryOptions: context.orpc.person.get.queryOptions({
      input: { id: params.id },
    }),
    // The planets to choose a homeworld from
    listPlanetsQueryOptions: context.orpc.planet.list.queryOptions(),
  }),
  loader: async ({ context }) => {
    try {
      await Promise.all([
        context.queryClient.query({ ...context.getPersonQueryOptions, staleTime: "static" }),
        context.queryClient.query({ ...context.listPlanetsQueryOptions, staleTime: "static" }),
      ]);
    } catch (error) {
      // An unknown person is a missing page, not a failure: show the not-found screen instead of "Try again"
      if (isApiError(error, "NOT_FOUND")) {
        throw notFound();
      }

      throw error;
    }
  },
  component: EditPersonPage,
});
