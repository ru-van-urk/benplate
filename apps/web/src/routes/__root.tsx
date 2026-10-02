import { Toaster } from "@maribor/ui/components/sonner";

import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { HeadContent, Outlet, createRootRouteWithContext } from "@tanstack/react-router";

import type { orpc } from "~/utils/orpc";

import "../index.css";

export interface RouterAppContext {
  orpc: typeof orpc;
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
  component: RootComponent,
  head: () => ({
    meta: [
      {
        title: "maribor",
      },
      {
        name: "description",
        content: "maribor is a web application",
      },
    ],
    links: [
      {
        rel: "icon",
        type: "image/svg+xml",
        href: "/favicon.svg",
      },
    ],
  }),
});

function RootComponent() {
  return (
    <>
      <HeadContent />

      <main className="min-h-svh">
        <Outlet />
      </main>

      <Toaster richColors />

      <ReactQueryDevtools />
    </>
  );
}
