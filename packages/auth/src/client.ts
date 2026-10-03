import { createAuthClient as createBetterAuthClient } from "better-auth/client";

// Same origin as the API: nginx (production) and the Vite dev server proxy /api/auth to the server
export function createAuthClient({ origin }: { origin: string }) {
  return createBetterAuthClient({ baseURL: origin });
}
