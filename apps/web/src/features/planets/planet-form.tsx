import { isApiError } from "@benplate/api/client";
import { climates, newPlanetSchema } from "@benplate/contract";
import { Button } from "@benplate/ui/components/button";
import { FieldError, FieldGroup } from "@benplate/ui/components/field";

import { Field, Form, setErrors, useForm } from "@formisch/react";
import type * as v from "valibot";

import { NumberField, SelectField, TextField } from "#/components/form-fields";

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
          // An emptied text input is "", which means none (unknown, for the population)
          await onSubmit({
            ...output,
            description: output.description || null,
            population: output.population || null,
          });
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

        <div className="grid grid-cols-2 gap-4">
          <Field of={form} path={["climate"]}>
            {(field) => (
              <SelectField
                label="Climate"
                placeholder="Choose a climate"
                options={climates}
                field={field}
              />
            )}
          </Field>
          <Field of={form} path={["terrain"]}>
            {(field) => <TextField label="Terrain" placeholder="desert, mountains" field={field} />}
          </Field>
          <Field of={form} path={["diameterKm"]}>
            {(field) => <NumberField label="Diameter (km)" step={1} field={field} />}
          </Field>
          <Field of={form} path={["population"]}>
            {(field) => <TextField label="Population" inputMode="numeric" field={field} />}
          </Field>
          <Field of={form} path={["rotationPeriodHours"]}>
            {(field) => <NumberField label="Day (hours)" step={1} field={field} />}
          </Field>
          <Field of={form} path={["orbitalPeriodDays"]}>
            {(field) => <NumberField label="Year (days)" step={1} field={field} />}
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
