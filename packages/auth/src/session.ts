import type { createAuthClient } from "./client";

export type Session = ReturnType<typeof createAuthClient>["$Infer"]["Session"];

// Better Auth's JSON dates (`toISOString()`), which its client turns back into `Date`s
const isoDate = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

// The session without Better Auth's client (about 30 KB), so the first page load can skip it. Same endpoint and
// result as `authClient.getSession()`: null when signed out. apps/web/index.html preloads this exact request
// (same URL, method and credentials); change one and the other, or the browser fetches the session twice
export async function fetchSession({ origin }: { origin: string }): Promise<Session | null> {
  const response = await fetch(`${origin}/api/auth/get-session`, { credentials: "same-origin" });

  if (!response.ok) {
    throw new Error(`Could not load the session (${response.status})`);
  }

  return JSON.parse(await response.text(), (_key, value: unknown) =>
    typeof value === "string" && isoDate.test(value) ? new Date(value) : value,
  ) as Session | null;
}
