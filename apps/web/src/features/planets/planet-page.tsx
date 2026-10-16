import { isApiError } from "@benplate/api/client";
import { buttonVariants } from "@benplate/ui/components/button";

import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Link, getRouteApi } from "@tanstack/react-router";
import { Suspense, lazy } from "react";

import { formatPopulation } from "./population";

const route = getRouteApi("/(public)/planets/$id");

const ConfirmDelete = lazy(() => import("#/components/confirm-delete"));

export const PlanetPage = () => {
  const context = route.useRouteContext();
  const navigate = route.useNavigate();
  const queryClient = useQueryClient();

  const { data: planet } = useSuspenseQuery(context.getPlanetQueryOptions);

  const deletePlanet = useMutation(
    context.orpc.planet.delete.mutationOptions({
      onSuccess: async () => {
        await navigate({ to: "/" });
        await queryClient.invalidateQueries({ queryKey: context.orpc.planet.key() });
      },
    }),
  );

  const facts = [
    ["Climate", planet.climate],
    ["Terrain", planet.terrain],
    ["Diameter", `${planet.diameterKm.toLocaleString("en-US")} km`],
    ["Day", `${planet.rotationPeriodHours} hours`],
    ["Year", `${planet.orbitalPeriodDays} days`],
    ["Population", formatPopulation(planet.population)],
  ] as const;

  return (
    <div className="container mx-auto grid max-w-3xl gap-4 px-4 py-2">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-medium">{planet.name}</h1>

        {context.session && (
          <div className="flex gap-2">
            <Link
              to="/planets/$id/edit"
              params={{ id: planet.id }}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Edit
            </Link>
            <Suspense>
              <ConfirmDelete
                name={planet.name}
                isPending={deletePlanet.isPending}
                error={
                  isApiError(deletePlanet.error, "CONFLICT")
                    ? `${planet.name} still has residents. Delete them or move them to another planet first.`
                    : deletePlanet.error?.message
                }
                onConfirm={() => deletePlanet.mutate({ id: planet.id })}
              />
            </Suspense>
          </div>
        )}
      </div>

      {planet.description && <p className="text-sm text-muted-foreground">{planet.description}</p>}

      <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 text-sm">
        {facts.map(([label, value]) => (
          <div key={label} className="contents">
            <dt className="text-muted-foreground">{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>

      <section className="grid gap-1">
        <h2 className="text-sm font-medium">Residents</h2>
        {planet.residents.length ? (
          <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
            {planet.residents.map((resident) => (
              <li key={resident.id}>
                <Link to="/people/$id" params={{ id: resident.id }} className="hover:underline">
                  {resident.name}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <span className="text-sm text-muted-foreground">No known residents</span>
        )}
      </section>
    </div>
  );
};
