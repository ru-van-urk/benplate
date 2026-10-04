import { Button } from "@benplate/ui/components/button";
import { FieldError, FieldGroup } from "@benplate/ui/components/field";

import { Field, Form, setErrors, useForm } from "@formisch/react";
import { useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import * as v from "valibot";

import { TextField } from "~/components/form-fields";
import { authClient, redirectSearchSchema, refreshSession } from "~/utils/auth";

const loginSchema = v.object({
  email: v.pipe(v.string(), v.email("Enter a valid email address")),
  password: v.pipe(v.string(), v.nonEmpty("Enter your password")),
});

export const Route = createFileRoute("/(public)/login")({
  validateSearch: redirectSearchSchema,
  // Also runs after a successful sign-in (`refreshSession` reruns it), which is what navigates away
  beforeLoad: ({ context, search }) => {
    if (context.session) {
      throw redirect({ href: search.redirect ?? "/" });
    }
  },
  component: LoginComponent,
});

function LoginComponent() {
  const search = Route.useSearch();
  const queryClient = useQueryClient();
  const router = useRouter();

  const form = useForm({ schema: loginSchema });

  return (
    <div className="container mx-auto grid max-w-sm gap-4 px-4 py-8">
      <h1 className="font-medium">Sign in</h1>

      <Form
        of={form}
        className="grid gap-4"
        onSubmit={async (output) => {
          const { error } = await authClient.signIn.email(output);

          if (error) {
            setErrors(form, { errors: [error.message ?? "Could not sign in"] });
            return;
          }

          await refreshSession(queryClient, router);
        }}
      >
        <FieldGroup>
          <Field of={form} path={["email"]}>
            {(field) => <TextField label="Email" type="email" autoComplete="email" field={field} />}
          </Field>
          <Field of={form} path={["password"]}>
            {(field) => (
              <TextField
                label="Password"
                type="password"
                autoComplete="current-password"
                field={field}
              />
            )}
          </Field>
        </FieldGroup>

        <FieldError>{form.errors?.[0]}</FieldError>

        <Button type="submit" disabled={form.isSubmitting}>
          Sign in
        </Button>
      </Form>

      <p className="text-xs text-muted-foreground">
        No account yet?{" "}
        <Link to="/register" search={search} className="underline underline-offset-4">
          Create one
        </Link>
      </p>
    </div>
  );
}
