"use client";

import { useActionState } from "react";

import type { EditableOfferingContent } from "@commerce/contracts";

import {
  ACTION_IDLE,
  type ActionState
} from "../../../../../business/action-outcome";
import { CONTENT_AREA_COPY } from "../../../../../business/corrections";
import {
  NOT_SPECIFIED,
  currentValue,
  fieldName
} from "../../../../../business/offering-content";

/**
 * The bounded correction form (UX-0005 §11).
 *
 * One area, chosen by the notice and passed in as a discriminated `area`. This
 * component cannot render two areas at once because it is not given two — and
 * there is no field naming the area either, so a submission cannot change
 * which one it is. §11's "untargeted edit" has nothing to travel in.
 *
 * What is equally absent: any control that would publish, retire, hide,
 * restore, change a Category, change a moderation status, touch exposure, or
 * mark the case answered. §11 lists all of them as things this path does not
 * grant, and none of them has a control here to be forgotten about.
 */
export function CorrectionForm({
  action,
  area,
  content
}: {
  action: (previous: ActionState, form: FormData) => Promise<ActionState>;
  area: "TITLE" | "SUMMARY" | "ATTRIBUTES";
  content: EditableOfferingContent;
}) {
  const [state, dispatch, pending] = useActionState(action, ACTION_IDLE);
  const fields = state.kind === "INVALID" ? state.fields : {};

  return (
    <form action={dispatch} noValidate>
      <fieldset disabled={pending}>
        <legend>{CONTENT_AREA_COPY[area]}</legend>

        {area === "TITLE" ? (
          <p>
            <label htmlFor="title">{CONTENT_AREA_COPY.TITLE}</label>
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
        ) : null}

        {area === "SUMMARY" ? (
          <p>
            <label htmlFor="summary">{CONTENT_AREA_COPY.SUMMARY}</label>
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
        ) : null}

        {area === "ATTRIBUTES"
          ? content.applicableAttributes.map((attribute) => {
              const held = currentValue(content, attribute);
              const name = fieldName(attribute.id);
              const label = attribute.unit
                ? `${attribute.name} (${attribute.unit})`
                : attribute.name;
              const select =
                attribute.valueKind === "SINGLE_SELECT" ||
                attribute.valueKind === "MULTI_SELECT";
              return (
                <p key={attribute.id}>
                  <label htmlFor={name}>{label}</label>
                  {select ? (
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
                      {attribute.valueKind === "SINGLE_SELECT" ? (
                        <option value="">{NOT_SPECIFIED}</option>
                      ) : null}
                      {attribute.options.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : attribute.valueKind === "BOOLEAN" ? (
                    <select
                      defaultValue={held?.text ?? ""}
                      id={name}
                      name={name}
                    >
                      <option value="">{NOT_SPECIFIED}</option>
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  ) : (
                    <input
                      defaultValue={held?.text ?? ""}
                      id={name}
                      name={name}
                      step={
                        attribute.valueKind === "NUMBER" ? "any" : undefined
                      }
                      type={
                        attribute.valueKind === "NUMBER" ? "number" : "text"
                      }
                    />
                  )}
                </p>
              );
            })
          : null}

        <button type="submit">{pending ? "Saving…" : "Save"}</button>
      </fieldset>

      {state.kind === "REFUSED" ? <p role="alert">{state.message}</p> : null}
      {/* §11. Saved, and still open — said in the same breath, because the two
          facts are true at the same time and separating them is how a person
          comes to believe the second one is not true. */}
      {state.kind === "DONE" ? (
        <p role="status">
          Saved. The case stays open and the platform reviews it again.
        </p>
      ) : null}
    </form>
  );
}
