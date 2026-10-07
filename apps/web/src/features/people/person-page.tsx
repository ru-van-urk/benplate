import { buttonVariants } from "@benplate/ui/components/button";

import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Link, getRouteApi } from "@tanstack/react-router";
import { Suspense, lazy } from "react";

const route = getRouteApi("/(public)/people/$publicId");

const ConfirmDelete = lazy(() => import("~/components/confirm-delete"));

export const PersonPage = () => {
  const context = route.useRouteContext();
  const navigate = route.useNavigate();
  const queryClient = useQueryClient();

  const { data: person } = useSuspenseQuery(context.getPersonQueryOptions);

  const deletePerson = useMutation(
    context.orpc.person.delete.mutationOptions({
      onSuccess: async () => {
        await navigate({ to: "/people" });
        // Their homeworld's residents change too
        await queryClient.invalidateQueries({ queryKey: context.orpc.key() });
      },
    }),
  );

  const facts = [
    ["Born", person.birthYear ?? "unknown"],
    ["Height", person.heightCm === null ? "unknown" : `${person.heightCm} cm`],
    ["Mass", person.massKg === null ? "unknown" : `${person.massKg} kg`],
  ] as const;

  return (
    <div className="container mx-auto grid max-w-3xl gap-4 px-4 py-2">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-medium">{person.name}</h1>

        {context.session && (
          <div className="flex gap-2">
            <Link
              to="/people/$publicId/edit"
              params={{ publicId: person.publicId }}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Edit
            </Link>
            <Suspense>
              <ConfirmDelete
                name={person.name}
                isPending={deletePerson.isPending}
                error={deletePerson.error?.message}
                onConfirm={() => deletePerson.mutate({ publicId: person.publicId })}
              />
            </Suspense>
          </div>
        )}
      </div>

      <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 text-sm">
        <dt className="text-muted-foreground">Homeworld</dt>
        <dd>
          <Link
            to="/planets/$publicId"
            params={{ publicId: person.homeworld.publicId }}
            className="hover:underline"
          >
            {person.homeworld.name}
          </Link>
        </dd>
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
