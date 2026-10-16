import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";

// Pathless layout for everything that needs a signed-in user; the API checks the session again on every call
export const Route = createFileRoute("/_app")({
  beforeLoad: ({ context, location }) => {
    if (!context.session) {
      throw redirect({ to: "/login", search: { redirect: location.href } });
    }

    // Narrowed for the routes below
    return { session: context.session };
  },
  component: Outlet,
});
