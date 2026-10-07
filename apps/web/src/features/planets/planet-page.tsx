import { buttonVariants } from "@benplate/ui/components/button";

import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, getRouteApi } from "@tanstack/react-router";
import { Suspense, lazy } from "react";

const route = getRouteApi("/(public)/planets/$id");

export const PlanetPage = () => {
  const context = route.useRouteContext();

  const { data: planet } = useSuspenseQuery(context.getPlanetQueryOptions);

  const facts = [
    ["Type", planet.type],
    ["Moons", planet.moons],
    ["Diameter", `${planet.diameterKm} km`],
    ["Distance from the Sun", `${planet.distanceFromSunAu} AU`],
    ["Orbital period", `${planet.orbitalPeriodDays} days`],
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
              <DeletePlanet id={planet.id} name={planet.name} />
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
    </div>
  );
};

// Only signed-in users see it, so only they download the dialog (Base UI, about 50 KB)
const DeletePlanet = lazy(() =>
  import("./delete-planet").then(({ DeletePlanet }) => ({ default: DeletePlanet })),
);
