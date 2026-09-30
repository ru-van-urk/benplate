import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { orpc } from "~/utils/orpc";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
  const healthCheck = useQuery(orpc.healthCheck.queryOptions());
  const planets = useQuery(orpc.planet.list.queryOptions());

  return (
    <div className="container mx-auto max-w-3xl px-4 py-2">
      <div className="grid gap-6">
        <section className="rounded-lg border p-4">
          <h2 className="mb-2 font-medium">API Status</h2>
          <div className="flex items-center gap-2">
            <div
              className={`h-2 w-2 rounded-full ${healthCheck.data ? "bg-green-500" : "bg-red-500"}`}
            />
            <span className="text-sm text-muted-foreground">
              {healthCheck.isLoading
                ? "Checking..."
                : healthCheck.data
                  ? "Connected"
                  : "Disconnected"}
            </span>
          </div>
        </section>
        <section className="rounded-lg border p-4">
          <h2 className="mb-2 font-medium">Planets</h2>
          {planets.isLoading ? (
            <span className="text-sm text-muted-foreground">Loading...</span>
          ) : planets.data?.length ? (
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
