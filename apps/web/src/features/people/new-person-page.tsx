import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";

import { PersonForm } from "./person-form";

const route = getRouteApi("/_app/people/new");

export const NewPersonPage = () => {
  const { orpc, listPlanetsQueryOptions } = route.useRouteContext();
  const navigate = route.useNavigate();
  const queryClient = useQueryClient();

  const { data: planets } = useSuspenseQuery(listPlanetsQueryOptions);

  const createPerson = useMutation(
    orpc.person.create.mutationOptions({
      onSuccess: async (person) => {
        // The homeworld's residents change too
        await queryClient.invalidateQueries({ queryKey: orpc.key() });
        await navigate({ to: "/people/$id", params: { id: person.id } });
      },
    }),
  );

  return (
    <div className="container mx-auto grid max-w-md gap-4 px-4 py-2">
      <h1 className="font-medium">New person</h1>
      <PersonForm
        planets={planets}
        submitLabel="Create person"
        onSubmit={(person) => createPerson.mutateAsync(person)}
      />
    </div>
  );
};
