import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";

import { PlanetForm } from "./planet-form";

const route = getRouteApi("/_app/planets/new");

export const NewPlanetPage = () => {
  const { orpc } = route.useRouteContext();
  const navigate = route.useNavigate();
  const queryClient = useQueryClient();

  const createPlanet = useMutation(
    orpc.planet.create.mutationOptions({
      onSuccess: async (planet) => {
        await queryClient.invalidateQueries({ queryKey: orpc.planet.key() });
        await navigate({ to: "/planets/$publicId", params: { publicId: planet.publicId } });
      },
    }),
  );

  return (
    <div className="container mx-auto grid max-w-md gap-4 px-4 py-2">
      <h1 className="font-medium">New planet</h1>
      <PlanetForm
        submitLabel="Create planet"
        onSubmit={(planet) => createPlanet.mutateAsync(planet)}
      />
    </div>
  );
};
