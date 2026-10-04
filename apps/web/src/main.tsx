import { isApiError } from "@benplate/api/client";
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import ReactDOM from "react-dom/client";
import * as v from "valibot";

import Loader from "./components/loader";
import NotFound from "./components/not-found";
import RouteError from "./components/route-error";
import { routeTree } from "./routeTree.gen";
import { refreshSession } from "./utils/auth";
import { orpc } from "./utils/orpc";

// Plain messages for the forms, where the contract's generated schemas would say "Invalid type: Expected number"
v.setSpecificMessage(v.number, "Enter a number");
v.setSpecificMessage(v.enum, "Choose one of the options");

// An expired or revoked session surfaces as UNAUTHORIZED from any protected call. Handle it like a sign-out:
// the `_app` guard then sends the user to /login, with a redirect back to the current page
const onError = (error: Error) => {
  if (isApiError(error, "UNAUTHORIZED")) {
    void refreshSession(queryClient, router);
  }
};

const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError }),
  mutationCache: new MutationCache({ onError }),
  defaultOptions: { queries: { retry: false } },
});

const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  scrollRestoration: true,
  defaultPendingComponent: () => <Loader />,
  defaultErrorComponent: RouteError,
  defaultNotFoundComponent: NotFound,
  context: { orpc, queryClient },
  Wrap: ({ children }: { children: React.ReactNode }) => {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  },
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById("app");

if (!rootElement) {
  throw new Error("Root element not found");
}

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<RouterProvider router={router} />);
}
