import { Button, buttonVariants } from "@benplate/ui/components/button";

import { type QueryClient, useQueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
  HeadContent,
  Link,
  Outlet,
  createRootRouteWithContext,
  useLocation,
  useRouter,
} from "@tanstack/react-router";

import { loadAuthClient, refreshSession, sessionQueryOptions } from "~/utils/auth";
import type { orpc } from "~/utils/orpc";

import "../index.css";

export interface RouterAppContext {
  orpc: typeof orpc;
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
  // Every route reads the session from here; it is fetched once and kept until `refreshSession` drops it
  beforeLoad: async ({ context }) => ({
    session: await context.queryClient.query({ ...sessionQueryOptions, staleTime: "static" }),
  }),
  component: RootComponent,
  head: () => ({
    meta: [
      {
        title: "BenPlate",
      },
      {
        name: "description",
        content: "BenPlate is a web application",
      },
    ],
  }),
});

function RootComponent() {
  return (
    <>
      <HeadContent />

      <Header />

      <main>
        <Outlet />
      </main>

      <ReactQueryDevtools />
    </>
  );
}

function Header() {
  const { session } = Route.useRouteContext();
  const location = useLocation();
  const queryClient = useQueryClient();
  const router = useRouter();

  const signOut = async () => {
    const authClient = await loadAuthClient();
    await authClient.signOut();
    await refreshSession(queryClient, router);
  };

  return (
    <header className="container mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3">
      <Link to="/" className="font-medium">
        BenPlate
      </Link>

      {session ? (
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">{session.user.name}</span>
          <Button variant="outline" size="sm" onClick={() => void signOut()}>
            Sign out
          </Button>
        </div>
      ) : location.pathname === "/login" || location.pathname === "/register" ? null : (
        <Link
          to="/login"
          search={{ redirect: location.href }}
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          Sign in
        </Link>
      )}
    </header>
  );
}
