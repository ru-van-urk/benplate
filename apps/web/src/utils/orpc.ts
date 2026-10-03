import { createTanstackQueryAPIClient } from "@benplate/api/client";

export const orpc = createTanstackQueryAPIClient({
  // Same origin; nginx (production) and the Vite dev server proxy /api to the server
  origin: window.location.origin,
  apiPath: "/api",
});
