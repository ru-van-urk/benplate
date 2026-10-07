import { Button, buttonVariants } from "@benplate/ui/components/button";

import { useQueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
  HeadContent,
  Link,
  Outlet,
  getRouteApi,
  useLocation,
  useRouter,
} from "@tanstack/react-router";

import { authClient, refreshSession } from "~/utils/auth";

const route = getRouteApi("__root__");

export const RootLayout = () => {
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
};

const Header = () => {
  const { session } = route.useRouteContext();
  const location = useLocation();
  const queryClient = useQueryClient();
  const router = useRouter();

  const signOut = async () => {
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
};
