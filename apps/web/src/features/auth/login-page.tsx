import { Button } from "@benplate/ui/components/button";
import { FieldError, FieldGroup } from "@benplate/ui/components/field";

import { Field, Form, setErrors, useForm } from "@formisch/react";
import { useQueryClient } from "@tanstack/react-query";
import { Link, getRouteApi, useRouter } from "@tanstack/react-router";
import * as v from "valibot";

import { TextField } from "#/components/form-fields";
import { authClient, refreshSession } from "#/utils/auth";

const route = getRouteApi("/(public)/login");

export const LoginPage = () => {
  const search = route.useSearch();
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
};

const loginSchema = v.object({
  email: v.pipe(v.string(), v.email("Enter a valid email address")),
  password: v.pipe(v.string(), v.nonEmpty("Enter your password")),
});
