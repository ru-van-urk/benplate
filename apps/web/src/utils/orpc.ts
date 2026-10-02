import { createTanstackQueryAPIClient } from "@maribor/api/client";
import { QueryCache, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

function createQueryClient() {
  const client: QueryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
    queryCache: new QueryCache({
      onError: (error, query) => {
        toast.error(`Error: ${error.message}`, {
          action: {
            label: "Retry",
            onClick: () => {
              void client.refetchQueries({ queryKey: query.queryKey });
            },
          },
        });
      },
    }),
  });

  return client;
}

export const queryClient = createQueryClient();

export const orpc = createTanstackQueryAPIClient({
  // Same origin; nginx (production) and the Vite dev server proxy /api to the server
  origin: window.location.origin,
  apiPath: "/api",
});
