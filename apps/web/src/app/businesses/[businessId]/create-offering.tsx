"use client";

import { SUBMIT, submitLabel } from "../../../form-copy";

import { useActionState } from "react";

import { CREATE } from "../../../business/copy";

import type { AssignableCategory } from "@commerce/contracts";

import {
  ACTION_IDLE,
  type ActionState
} from "../../../business/action-outcome";

/**
 * Create Offering (UX-0005 §9).
 *
 * Rendered only where the Business's moderation status permits creation, so
 * this component contains no availability rule of its own — §14 asks for the
 * action to be *absent* where it is unavailable rather than shown disabled,
 * and a Restricted owner never reaches this form.
 *
 * The Category is chosen from the Categories an Offering may currently be
 * assigned to — the same predicate creation enforces, so a choice offered here
 * is one creation would accept. Each is shown by its whole path, because two
 * Categories may share a leaf name in different parts of the catalogue and a
 * list of bare names would ask somebody to choose between two identical
 * options.
 */
export function CreateOffering({
  action,
  categories
}: {
  action: (previous: ActionState, form: FormData) => Promise<ActionState>;
  categories: readonly AssignableCategory[];
}) {
  const [state, dispatch, pending] = useActionState(action, ACTION_IDLE);
  const fields = state.kind === "INVALID" ? state.fields : {};

  return (
    <form action={dispatch} noValidate>
      <fieldset disabled={pending}>
        <legend>{CREATE.heading}</legend>

        <p>
          <label htmlFor="title">{CREATE.title}</label>
          <input
            aria-invalid={fields.title ? true : undefined}
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
          <label htmlFor="slug">{CREATE.address}</label>
          <input
            aria-invalid={fields.slug ? true : undefined}
            id="slug"
            name="slug"
            required
            type="text"
          />
          {fields.slug ? (
            <span role="alert">{fields.slug.join(" ")}</span>
          ) : null}
        </p>

        <p>
          <label htmlFor="categoryId">{CREATE.category}</label>
          <select
            aria-invalid={fields.categoryId ? true : undefined}
            id="categoryId"
            name="categoryId"
            required
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.path.join(" › ")}
              </option>
            ))}
          </select>
          {fields.categoryId ? (
            <span role="alert">{fields.categoryId.join(" ")}</span>
          ) : null}
        </p>

        <button type="submit">{submitLabel(SUBMIT.create, pending)}</button>
      </fieldset>

      {state.kind === "REFUSED" ? <p role="alert">{state.message}</p> : null}
    </form>
  );
}
