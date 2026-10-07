import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";

import { PlanetForm } from "./planet-form";

const route = getRouteApi("/_app/planets/$publicId/edit");

export const EditPlanetPage = () => {
  const { orpc, getPlanetQueryOptions } = route.useRouteContext();
  const navigate = route.useNavigate();
  const queryClient = useQueryClient();

  const { data: planet } = useSuspenseQuery(getPlanetQueryOptions);

  const updatePlanet = useMutation(
    orpc.planet.update.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: orpc.planet.key() });
        await navigate({ to: "/planets/$publicId", params: { publicId: planet.publicId } });
      },
    }),
  );

  return (
    <div className="container mx-auto grid max-w-md gap-4 px-4 py-2">
      <h1 className="font-medium">Edit {planet.name}</h1>
      <PlanetForm
        initialInput={{
          name: planet.name,
          description: planet.description,
          type: planet.type,
          moons: planet.moons,
          diameterKm: planet.diameterKm,
          distanceFromSunAu: planet.distanceFromSunAu,
          orbitalPeriodDays: planet.orbitalPeriodDays,
        }}
        submitLabel="Save changes"
        onSubmit={(changes) => updatePlanet.mutateAsync({ publicId: planet.publicId, ...changes })}
      />
    </div>
  );
};
