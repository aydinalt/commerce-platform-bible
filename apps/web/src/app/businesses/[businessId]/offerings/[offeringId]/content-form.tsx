"use client";

import { useActionState } from "react";

import type {
  ApplicableAttribute,
  EditableOfferingContent
} from "@commerce/contracts";

import {
  ACTION_IDLE,
  shortfallMessages,
  type ActionState
} from "../../../../../business/action-outcome";
import {
  CONTENT_LABELS,
  NOT_SPECIFIED,
  currentValue,
  fieldName
} from "../../../../../business/offering-content";

/**
 * One Attribute's input, chosen by the kind its definition declares.
 *
 * The definition decides the control, so a Boolean Attribute cannot be
 * presented as free text and a Single Select cannot be presented as a
 * multiple choice. This is the same fact the API checks the submission
 * against — read once, used twice — rather than a parallel description of it.
 *
 * Every kind offers a way to say nothing, because an Offering holding no value
 * for an Attribute is an ordinary state and not a missing one. Only the
 * publication minimum makes some of them matter, and it says so at publication.
 */
function AttributeField({
  attribute,
  content
}: {
  attribute: ApplicableAttribute;
  content: EditableOfferingContent;
}) {
  const held = currentValue(content, attribute);
  const name = fieldName(attribute.id);
  const label = attribute.unit
    ? `${attribute.name} (${attribute.unit})`
    : attribute.name;

  if (
    attribute.valueKind === "SINGLE_SELECT" ||
    attribute.valueKind === "MULTI_SELECT"
  )
    return (
      <p>
        <label htmlFor={name}>{label}</label>
        <select
          defaultValue={
            attribute.valueKind === "MULTI_SELECT"
              ? (held?.optionIds ?? [])
              : (held?.optionIds[0] ?? "")
          }
          id={name}
          multiple={attribute.valueKind === "MULTI_SELECT"}
          name={name}
        >
          {/* A Single Select needs somewhere to land when the Offering holds
              no value. A Multi Select does not: selecting nothing already
              says it. */}
          {attribute.valueKind === "SINGLE_SELECT" ? (
            <option value="">{NOT_SPECIFIED}</option>
          ) : null}
          {attribute.options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </p>
    );

  if (attribute.valueKind === "BOOLEAN")
    return (
      <p>
        <label htmlFor={name}>{label}</label>
        <select defaultValue={held?.text ?? ""} id={name} name={name}>
          <option value="">{NOT_SPECIFIED}</option>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      </p>
    );

  return (
    <p>
      <label htmlFor={name}>{label}</label>
      <input
        defaultValue={held?.text ?? ""}
        id={name}
        name={name}
        step={attribute.valueKind === "NUMBER" ? "any" : undefined}
        type={attribute.valueKind === "NUMBER" ? "number" : "text"}
      />
    </p>
  );
}

/**
 * The Offering content form (UX-0005 §9 Edit).
 *
 * Rendered only where the Dashboard's entries offered `EDIT`, so this
 * component holds no availability rule: a Restricted Business's Published
 * Offering and an Archived one both arrive at this screen without a form, and
 * neither this file nor the page decides that.
 *
 * There is no Publish or Retire button here. Those are actions on the
 * Dashboard, and putting one beside a save would suggest that saving is part
 * of the transition — the opposite of what AC-10 says.
 */
export function ContentForm({
  action,
  content
}: {
  action: (previous: ActionState, form: FormData) => Promise<ActionState>;
  content: EditableOfferingContent;
}) {
  const [state, dispatch, pending] = useActionState(action, ACTION_IDLE);
  const fields = state.kind === "INVALID" ? state.fields : {};

  return (
    <form action={dispatch} noValidate>
      <fieldset disabled={pending}>
        <legend>Offering content</legend>

        <p>
          <label htmlFor="title">{CONTENT_LABELS.title}</label>
          <input
            aria-invalid={fields.title ? true : undefined}
            defaultValue={content.title}
            id="title"
            name="title"
            required
            type="text"
          />
          {fields.title ? (
            <span role="alert">{fields.title.join(" ")}</span>
          ) : null}
        </p>

        <p>
          <label htmlFor="summary">{CONTENT_LABELS.summary}</label>
          <textarea
            aria-invalid={fields.summary ? true : undefined}
            defaultValue={content.summary ?? ""}
            id="summary"
            name="summary"
          />
          {fields.summary ? (
            <span role="alert">{fields.summary.join(" ")}</span>
          ) : null}
        </p>

        {content.applicableAttributes.length > 0 ? (
          <fieldset>
            <legend>Attributes</legend>
            {content.applicableAttributes.map((attribute) => (
              <AttributeField
                attribute={attribute}
                content={content}
                key={attribute.id}
              />
            ))}
          </fieldset>
        ) : null}

        <button type="submit">{pending ? "Saving…" : "Save"}</button>
      </fieldset>

      {/* §15. A refusal says nothing was saved; it never claims a transition,
          and the values above are still the ones the Offering holds. */}
      {state.kind === "REFUSED" ? (
        <div role="alert">
          <p>{state.message}</p>
          {/* The conditions the platform named, relayed rather than composed.
              Absent for every refusal that published none. */}
          {state.shortfalls.length === 0 ? null : (
            <ul>
              {shortfallMessages(state.shortfalls).map((sentence) => (
                <li key={sentence}>{sentence}</li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
      {state.kind === "DONE" ? <p role="status">Saved.</p> : null}
    </form>
  );
}
