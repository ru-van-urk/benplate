import { isApiError } from "@benplate/api/client";
import { createFileRoute, notFound } from "@tanstack/react-router";

import { PersonPage } from "~/features/people/person-page";

export const Route = createFileRoute("/(public)/people/$publicId")({
  context: ({ context, params }) => ({
    getPersonQueryOptions: context.orpc.person.get.queryOptions({
      input: { publicId: params.publicId },
    }),
  }),
  loader: async ({ context }) => {
    try {
      await context.queryClient.query({ ...context.getPersonQueryOptions, staleTime: "static" });
    } catch (error) {
      // An unknown person is a missing page, not a failure: show the not-found screen instead of "Try again"
      if (isApiError(error, "NOT_FOUND")) {
        throw notFound();
      }

      throw error;
    }
  },
  component: PersonPage,
});
