import { buttonVariants } from "@benplate/ui/components/button";

import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, getRouteApi } from "@tanstack/react-router";

import { formatPopulation } from "./population";

const route = getRouteApi("/(public)/");

export const PlanetListPage = () => {
  const context = route.useRouteContext();

  const planets = useSuspenseQuery(context.listPlanetsQueryOptions);

  return (
    <div className="container mx-auto max-w-3xl px-4 py-2">
      <section className="rounded-lg border p-4">
        <div className="mb-2 flex items-center justify-between gap-4">
          <h1 className="font-medium">Planets</h1>
          {/* Signed out, the `_app` guard sends this to /login first */}
          <Link to="/planets/new" className={buttonVariants({ size: "sm" })}>
            New planet
          </Link>
        </div>
        {planets.data.length ? (
          <ul className="divide-y">
            {planets.data.map((planet) => (
              <li key={planet.publicId} className="grid gap-0.5 py-2">
                <div className="flex items-baseline justify-between gap-4">
                  <Link
                    to="/planets/$publicId"
                    params={{ publicId: planet.publicId }}
                    className="font-medium hover:underline"
                  >
                    {planet.name}
                  </Link>
                  <span className="text-xs text-muted-foreground">
                    {planet.climate} · {planet.terrain} · population{" "}
                    {formatPopulation(planet.population)}
                  </span>
                </div>
                {planet.description && (
                  <p className="text-sm text-muted-foreground">{planet.description}</p>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <span className="text-sm text-muted-foreground">No planets found</span>
        )}
      </section>
    </div>
  );
};
