import { createFileRoute, redirect } from "@tanstack/react-router";

import { LoginPage } from "#/features/auth/login-page";
import { redirectSearchSchema } from "#/utils/auth";

export const Route = createFileRoute("/(public)/login")({
  validateSearch: redirectSearchSchema,
  // Also runs after a successful sign-in (`refreshSession` reruns it), which is what navigates away
  beforeLoad: ({ context, search }) => {
    if (context.session) {
      throw redirect({ href: search.redirect ?? "/" });
    }
  },
  component: LoginPage,
});
