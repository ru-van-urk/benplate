import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";

import { PersonForm } from "./person-form";

const route = getRouteApi("/_app/people/$publicId/edit");

export const EditPersonPage = () => {
  const { orpc, getPersonQueryOptions, listPlanetsQueryOptions } = route.useRouteContext();
  const navigate = route.useNavigate();
  const queryClient = useQueryClient();

  const { data: person } = useSuspenseQuery(getPersonQueryOptions);
  const { data: planets } = useSuspenseQuery(listPlanetsQueryOptions);

  const updatePerson = useMutation(
    orpc.person.update.mutationOptions({
      onSuccess: async () => {
        // A new homeworld changes two planets' residents
        await queryClient.invalidateQueries({ queryKey: orpc.key() });
        await navigate({ to: "/people/$publicId", params: { publicId: person.publicId } });
      },
    }),
  );

  return (
    <div className="container mx-auto grid max-w-md gap-4 px-4 py-2">
      <h1 className="font-medium">Edit {person.name}</h1>
      <PersonForm
        planets={planets}
        initialInput={{
          name: person.name,
          homeworldPublicId: person.homeworld.publicId,
          birthYear: person.birthYear,
          heightCm: person.heightCm,
          massKg: person.massKg,
        }}
        submitLabel="Save changes"
        onSubmit={(changes) => updatePerson.mutateAsync({ publicId: person.publicId, ...changes })}
      />
    </div>
  );
};
