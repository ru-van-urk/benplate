import { Field, FieldError, FieldLabel } from "@benplate/ui/components/field";
import { Input } from "@benplate/ui/components/input";
import { NativeSelect, NativeSelectOption } from "@benplate/ui/components/native-select";

import type { FieldElementProps } from "@formisch/react";
import type { ComponentProps } from "react";

// Inputs for a Formisch field store: render them inside `<Field of={form} path={[…]}>{(field) => …}</Field>`

// Formisch names inputs by their JSON path (`["name"]`); ids read better as `name` or `address.city`
const fieldId = (path: readonly PropertyKey[]) => path.map(String).join(".");

type InputProps = Omit<ComponentProps<typeof Input>, "id" | "value" | keyof FieldElementProps>;

type FieldState<TInput> = {
  path: readonly PropertyKey[];
  props: FieldElementProps;
  input: TInput;
  errors: readonly string[] | null;
};

export const TextField = ({
  label,
  field,
  ...props
}: InputProps & { label: string; field: FieldState<string | null | undefined> }) => {
  return (
    <Field data-invalid={!!field.errors}>
      <FieldLabel htmlFor={fieldId(field.path)}>{label}</FieldLabel>
      <Input
        {...props}
        {...field.props}
        id={fieldId(field.path)}
        value={field.input ?? ""}
        aria-invalid={!!field.errors}
      />
      <FieldError>{field.errors?.[0]}</FieldError>
    </Field>
  );
};

// Formisch passes an input's value through as a string, so number fields set their input themselves
export const NumberField = ({
  label,
  field,
  ...props
}: InputProps & {
  label: string;
  // Nullable too, for an optional number; an emptied input is undefined, which the form turns into null
  field: FieldState<number | null | undefined> & { onChange: (value: number | undefined) => void };
}) => {
  return (
    <Field data-invalid={!!field.errors}>
      <FieldLabel htmlFor={fieldId(field.path)}>{label}</FieldLabel>
      <Input
        type="number"
        {...props}
        {...field.props}
        id={fieldId(field.path)}
        value={field.input ?? ""}
        onChange={(event) => {
          const { value, valueAsNumber } = event.currentTarget;
          field.onChange(value === "" ? undefined : valueAsNumber);
        }}
        aria-invalid={!!field.errors}
      />
      <FieldError>{field.errors?.[0]}</FieldError>
    </Field>
  );
};

export const SelectField = ({
  label,
  placeholder,
  options,
  field,
}: {
  label: string;
  placeholder: string;
  // A value that is its own label (an enum), or a value with a label (a related record's id and name)
  options: readonly (string | { value: string; label: string })[];
  field: FieldState<string | undefined>;
}) => {
  return (
    <Field data-invalid={!!field.errors}>
      <FieldLabel htmlFor={fieldId(field.path)}>{label}</FieldLabel>
      <NativeSelect
        {...field.props}
        id={fieldId(field.path)}
        value={field.input ?? ""}
        aria-invalid={!!field.errors}
        className="w-full"
      >
        <NativeSelectOption value="" disabled>
          {placeholder}
        </NativeSelectOption>
        {options.map((option) => {
          const { value, label } =
            typeof option === "string" ? { value: option, label: option } : option;

          return (
            <NativeSelectOption key={value} value={value}>
              {label}
            </NativeSelectOption>
          );
        })}
      </NativeSelect>
      <FieldError>{field.errors?.[0]}</FieldError>
    </Field>
  );
};
