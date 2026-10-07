import { createFileRoute } from "@tanstack/react-router";

import { PeopleListPage } from "~/features/people/people-list-page";

export const Route = createFileRoute("/(public)/people/")({
  context: ({ context }) => ({
    listPeopleQueryOptions: context.orpc.person.list.queryOptions(),
  }),
  loader: async ({ context }) => {
    await context.queryClient.query({ ...context.listPeopleQueryOptions, staleTime: "static" });
  },
  component: PeopleListPage,
});
