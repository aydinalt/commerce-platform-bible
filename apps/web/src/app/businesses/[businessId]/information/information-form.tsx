"use client";

import { useActionState } from "react";

import { INFORMATION } from "../../../../business/copy";

import {
  DIRECT_CONTACT_FIELDS,
  FIELD_LABELS,
  GROUP_COPY,
  PUBLIC_IDENTITY_FIELDS,
  REQUIRED_FIELD,
  type InformationField
} from "../../../../business/information";
import { SAVE_IDLE, type SaveState } from "../../../../business/save-state";

function Field({
  errors,
  name,
  value
}: {
  errors: string[] | undefined;
  name: InformationField;
  value: string;
}) {
  const required = name === REQUIRED_FIELD;
  return (
    <p>
      <label htmlFor={name}>
        {FIELD_LABELS[name]}
        {required ? " (required)" : null}
      </label>
      <input
        aria-describedby={errors ? `${name}-error` : undefined}
        aria-invalid={errors ? true : undefined}
        defaultValue={value}
        id={name}
        name={name}
        required={required}
        type="text"
      />
      {/* §17. A form error is associated with the information it is about,
          rather than collected somewhere the person has to go looking. */}
      {errors ? (
        <span id={`${name}-error`} role="alert">
          {errors.join(" ")}
        </span>
      ) : null}
    </p>
  );
}

/**
 * Business Information (UX-0005 §7).
 *
 * Two sections with two headings, because §7 requires public identity and
 * authenticated-only Direct Contact to stay distinguishable — and the person
 * filling the form in is exactly who needs to see which half strangers can
 * read. A single list with the fields interleaved would satisfy the data model
 * and lose the promise.
 *
 * Every field is rendered every time, including the empty ones. Leaving one
 * blank and saving is how a Business stops supplying it, so an absent field
 * would make removal unreachable.
 */
export function InformationForm({
  action,
  values
}: {
  action: (previous: SaveState, form: FormData) => Promise<SaveState>;
  values: Record<InformationField, string>;
}) {
  const [state, dispatch, pending] = useActionState(action, SAVE_IDLE);
  const fields = state.kind === "INVALID" ? state.fields : {};

  return (
    <form action={dispatch} noValidate>
      <fieldset disabled={pending}>
        <legend>{INFORMATION.identityHeading}</legend>
        <p>{GROUP_COPY.identity}</p>
        {PUBLIC_IDENTITY_FIELDS.map((name) => (
          <Field
            errors={fields[name]}
            key={name}
            name={name}
            value={values[name]}
          />
        ))}
      </fieldset>

      <fieldset disabled={pending}>
        <legend>{INFORMATION.contactHeading}</legend>
        <p>{GROUP_COPY.contact}</p>
        {DIRECT_CONTACT_FIELDS.map((name) => (
          <Field
            errors={fields[name]}
            key={name}
            name={name}
            value={values[name]}
          />
        ))}
      </fieldset>

      <button type="submit">{pending ? "Saving…" : "Save"}</button>

      {state.kind === "UNCHANGED" ? <p role="alert">{state.message}</p> : null}
      {state.kind === "SAVED" ? <p role="status">{INFORMATION.saved}</p> : null}
    </form>
  );
}
