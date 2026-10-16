import { buttonVariants } from "@benplate/ui/components/button";

import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, getRouteApi } from "@tanstack/react-router";

const route = getRouteApi("/(public)/people/");

export const PeopleListPage = () => {
  const context = route.useRouteContext();

  const people = useSuspenseQuery(context.listPeopleQueryOptions);

  return (
    <div className="container mx-auto max-w-3xl px-4 py-2">
      <section className="rounded-lg border p-4">
        <div className="mb-2 flex items-center justify-between gap-4">
          <h1 className="font-medium">People</h1>
          {/* Signed out, the `_app` guard sends this to /login first */}
          <Link to="/people/new" className={buttonVariants({ size: "sm" })}>
            New person
          </Link>
        </div>
        {people.data.length ? (
          <ul className="divide-y">
            {people.data.map((person) => (
              <li key={person.id} className="flex items-baseline justify-between gap-4 py-2">
                <Link
                  to="/people/$id"
                  params={{ id: person.id }}
                  className="font-medium hover:underline"
                >
                  {person.name}
                </Link>
                <Link
                  to="/planets/$id"
                  params={{ id: person.homeworld.id }}
                  className="text-xs text-muted-foreground hover:underline"
                >
                  {person.homeworld.name}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <span className="text-sm text-muted-foreground">No people found</span>
        )}
      </section>
    </div>
  );
};
