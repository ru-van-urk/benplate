import { createTanstackQueryAPIClient } from "@maribor/api/client";
import { QueryCache, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
    queryCache: new QueryCache({
      onError: (error, query) => {
        toast.error(`Error: ${error.message}`, {
          action: {
            label: "retry",
            onClick: () => {
              query.invalidate();
            },
          },
        });
      },
    }),
  });
}

export const queryClient = createQueryClient();

export const orpc = createTanstackQueryAPIClient({
  // Same origin; nginx (production) and the Vite dev server proxy /api to the server
  origin: window.location.origin,
  apiPath: "/api",
});
