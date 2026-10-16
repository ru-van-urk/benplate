import { newPersonSchema } from "@benplate/contract";
import { Button } from "@benplate/ui/components/button";
import { FieldError, FieldGroup } from "@benplate/ui/components/field";

import { Field, Form, setErrors, useForm } from "@formisch/react";
import type * as v from "valibot";

import { NumberField, SelectField, TextField } from "#/components/form-fields";

type PersonInput = v.InferOutput<typeof newPersonSchema>;

// Create and edit both validate with the contract's own schema, so the form and the API agree on every rule
export const PersonForm = ({
  planets,
  initialInput,
  submitLabel,
  onSubmit,
}: {
  // The homeworld choices: the select's values are the planets' ids
  planets: readonly { id: string; name: string }[];
  initialInput?: v.InferInput<typeof newPersonSchema>;
  submitLabel: string;
  onSubmit: (person: PersonInput) => Promise<unknown>;
}) => {
  const form = useForm({ schema: newPersonSchema, initialInput });

  return (
    <Form
      of={form}
      className="grid gap-4"
      onSubmit={async (output) => {
        try {
          // Emptied inputs mean unknown: "" for text, undefined for numbers
          await onSubmit({
            ...output,
            birthYear: output.birthYear || null,
            heightCm: output.heightCm ?? null,
            massKg: output.massKg ?? null,
          });
        } catch (error) {
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

        <Field of={form} path={["homeworldId"]}>
          {(field) => (
            <SelectField
              label="Homeworld"
              placeholder="Choose a homeworld"
              options={planets.map((planet) => ({ value: planet.id, label: planet.name }))}
              field={field}
            />
          )}
        </Field>

        <div className="grid grid-cols-3 gap-4">
          <Field of={form} path={["birthYear"]}>
            {(field) => <TextField label="Born" placeholder="19BBY" field={field} />}
          </Field>
          <Field of={form} path={["heightCm"]}>
            {(field) => <NumberField label="Height (cm)" step={1} field={field} />}
          </Field>
          <Field of={form} path={["massKg"]}>
            {(field) => <NumberField label="Mass (kg)" step={1} field={field} />}
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
