import { createFileRoute } from "@tanstack/react-router";

import { NewPersonPage } from "~/features/people/new-person-page";

export const Route = createFileRoute("/_app/people/new")({
  // The planets to choose a homeworld from
  context: ({ context }) => ({
    listPlanetsQueryOptions: context.orpc.planet.list.queryOptions(),
  }),
  loader: async ({ context }) => {
    await context.queryClient.query({ ...context.listPlanetsQueryOptions, staleTime: "static" });
  },
  component: NewPersonPage,
});
