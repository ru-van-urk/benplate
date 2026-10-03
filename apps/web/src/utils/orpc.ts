import { createTanstackQueryAPIClient } from "@benplate/api/client";
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

export const orpc = createTanstackQueryAPIClient({
  // Same origin; nginx (production) and the Vite dev server proxy /api to the server
  origin: window.location.origin,
  apiPath: "/api",
});
