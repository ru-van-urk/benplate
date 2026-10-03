import { Button } from "@benplate/ui/components/button";
import { FieldError, FieldGroup } from "@benplate/ui/components/field";

import { Field, Form, setErrors, useForm } from "@formisch/react";
import { useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import * as v from "valibot";

import { TextField } from "~/components/form-fields";
import { authClient, redirectSearchSchema, refreshSession } from "~/utils/auth";

const registerSchema = v.object({
  name: v.pipe(v.string(), v.trim(), v.nonEmpty("Enter your name")),
  email: v.pipe(v.string(), v.email("Enter a valid email address")),
  // Better Auth's default minimum
  password: v.pipe(v.string(), v.minLength(8, "Use at least 8 characters")),
});

export const Route = createFileRoute("/(public)/register")({
  validateSearch: redirectSearchSchema,
  // Also runs after a successful sign-up, which signs in too (`autoSignIn`)
  beforeLoad: ({ context, search }) => {
    if (context.session) {
      throw redirect({ href: search.redirect ?? "/" });
    }
  },
  component: RegisterComponent,
});

function RegisterComponent() {
  const search = Route.useSearch();
  const queryClient = useQueryClient();
  const router = useRouter();

  const form = useForm({ schema: registerSchema });

  return (
    <div className="container mx-auto grid max-w-sm gap-4 px-4 py-8">
      <h1 className="font-medium">Create an account</h1>

      <Form
        of={form}
        className="grid gap-4"
        onSubmit={async (output) => {
          const { error } = await authClient.signUp.email(output);

          // Includes "sign-up is disabled" when AUTH_DISABLE_SIGNUP is set
          if (error) {
            setErrors(form, { errors: [error.message ?? "Could not create the account"] });
            return;
          }

          await refreshSession(queryClient, router);
        }}
      >
        <FieldGroup>
          <Field of={form} path={["name"]}>
            {(field) => <TextField label="Name" autoComplete="name" field={field} />}
          </Field>
          <Field of={form} path={["email"]}>
            {(field) => <TextField label="Email" type="email" autoComplete="email" field={field} />}
          </Field>
          <Field of={form} path={["password"]}>
            {(field) => (
              <TextField
                label="Password"
                type="password"
                autoComplete="new-password"
                field={field}
              />
            )}
          </Field>
        </FieldGroup>

        <FieldError>{form.errors?.[0]}</FieldError>

        <Button type="submit" disabled={form.isSubmitting}>
          Create account
        </Button>
      </Form>

      <p className="text-xs text-muted-foreground">
        Already have an account?{" "}
        <Link to="/login" search={search} className="underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </div>
  );
}
