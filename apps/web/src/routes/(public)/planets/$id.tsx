import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@benplate/ui/components/alert-dialog";
import { Button, buttonVariants } from "@benplate/ui/components/button";

import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(public)/planets/$id")({
  context: ({ context, params }) => ({
    planetQueryOptions: context.orpc.planet.find.queryOptions({ input: { id: params.id } }),
  }),
  loader: async ({ context }) => {
    await context.queryClient.query({ ...context.planetQueryOptions, staleTime: "static" });
  },
  component: PlanetComponent,
});

function PlanetComponent() {
  const context = Route.useRouteContext();

  const { data: planet } = useSuspenseQuery(context.planetQueryOptions);

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
            <DeletePlanet id={planet.id} name={planet.name} />
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
}

function DeletePlanet({ id, name }: { id: string; name: string }) {
  const { orpc } = Route.useRouteContext();
  const navigate = Route.useNavigate();
  const queryClient = useQueryClient();

  const deletePlanet = useMutation(
    orpc.planet.delete.mutationOptions({
      onSuccess: async () => {
        await navigate({ to: "/" });
        await queryClient.invalidateQueries({ queryKey: orpc.planet.key() });
      },
    }),
  );

  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant="destructive" size="sm" />}>
        Delete
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {name}?</AlertDialogTitle>
          <AlertDialogDescription>This can't be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={deletePlanet.isPending}
            onClick={() => deletePlanet.mutate({ id })}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
