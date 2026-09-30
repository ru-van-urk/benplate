import { Toaster } from "@maribor/ui/components/sonner";

import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { HeadContent, Outlet, createRootRouteWithContext } from "@tanstack/react-router";

import { type orpc } from "~/utils/orpc";

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
        href: "/favicon.ico",
      },
    ],
  }),
});

function RootComponent() {
  return (
    <>
      <HeadContent />

      <div className="grid h-svh grid-rows-[auto_1fr]">
        <Outlet />
      </div>

      <Toaster richColors />

      <ReactQueryDevtools />
    </>
  );
}
