import { createFileRoute, redirect } from "@tanstack/react-router";

import { RegisterPage } from "#/features/auth/register-page";
import { redirectSearchSchema } from "#/utils/auth";

export const Route = createFileRoute("/(public)/register")({
  validateSearch: redirectSearchSchema,
  // Also runs after a successful sign-up, which signs in too (`autoSignIn`)
  beforeLoad: ({ context, search }) => {
    if (context.session) {
      throw redirect({ href: search.redirect ?? "/" });
    }
  },
  component: RegisterPage,
});
