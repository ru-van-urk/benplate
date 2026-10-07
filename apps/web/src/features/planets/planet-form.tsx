import { isApiError } from "@benplate/api/client";
import { newPlanetSchema, planetTypes } from "@benplate/contract";
import { Button } from "@benplate/ui/components/button";
import { FieldError, FieldGroup } from "@benplate/ui/components/field";

import { Field, Form, setErrors, useForm } from "@formisch/react";
import type * as v from "valibot";

import { NumberField, SelectField, TextField } from "~/components/form-fields";

type PlanetInput = v.InferOutput<typeof newPlanetSchema>;

// Create and edit both validate with the contract's own schema, so the form and the API agree on every rule
export const PlanetForm = ({
  initialInput,
  submitLabel,
  onSubmit,
}: {
  initialInput?: v.InferInput<typeof newPlanetSchema>;
  submitLabel: string;
  onSubmit: (planet: PlanetInput) => Promise<unknown>;
}) => {
  const form = useForm({ schema: newPlanetSchema, initialInput });

  return (
    <Form
      of={form}
      className="grid gap-4"
      onSubmit={async (output) => {
        try {
          // An emptied description input is "", which means no description
          await onSubmit({ ...output, description: output.description || null });
        } catch (error) {
          if (isApiError(error, "CONFLICT")) {
            setErrors(form, { path: ["name"], errors: [error.message] });
            return;
          }

          setErrors(form, {
            errors: [error instanceof Error ? error.message : "Something went wrong"],
          });
        }
      }}
    >
      <FieldGroup>
        <Field of={form} path={["name"]}>
          {(field) => <TextField label="Name" field={field} />}
        </Field>

        <Field of={form} path={["description"]}>
          {(field) => <TextField label="Description" field={field} />}
        </Field>

        <Field of={form} path={["type"]}>
          {(field) => (
            <SelectField
              label="Type"
              placeholder="Choose a type"
              options={planetTypes}
              field={field}
            />
          )}
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field of={form} path={["moons"]}>
            {(field) => <NumberField label="Moons" step={1} field={field} />}
          </Field>
          <Field of={form} path={["diameterKm"]}>
            {(field) => <NumberField label="Diameter (km)" step={1} field={field} />}
          </Field>
          <Field of={form} path={["distanceFromSunAu"]}>
            {(field) => <NumberField label="Distance from the Sun (AU)" step="any" field={field} />}
          </Field>
          <Field of={form} path={["orbitalPeriodDays"]}>
            {(field) => <NumberField label="Orbital period (days)" step="any" field={field} />}
          </Field>
        </div>
      </FieldGroup>

      <FieldError>{form.errors?.[0]}</FieldError>

      <Button type="submit" disabled={form.isSubmitting}>
        {submitLabel}
      </Button>
    </Form>
  );
};
