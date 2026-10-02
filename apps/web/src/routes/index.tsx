import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  context: ({ context }) => ({
    planetQueryOptions: context.orpc.planet.list.queryOptions(),
  }),
  loader: async ({ context }) => {
    await context.queryClient.query({ ...context.planetQueryOptions, staleTime: "static" });
  },
  component: HomeComponent,
});

function HomeComponent() {
  const context = Route.useRouteContext();

  const planets = useSuspenseQuery(context.planetQueryOptions);

  return (
    <div className="container mx-auto max-w-3xl px-4 py-2">
      <div className="grid gap-6">
        <section className="rounded-lg border p-4">
          <h1 className="mb-2 font-medium">Planets</h1>
          {planets.data?.length ? (
            <ul className="divide-y">
              {planets.data.map((planet) => (
                <li key={planet.id} className="grid gap-0.5 py-2">
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="font-medium">{planet.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {planet.type} · {planet.distanceFromSunAu} AU ·{" "}
                      {planet.moons === 1 ? "1 moon" : `${planet.moons} moons`}
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
    </div>
  );
}
