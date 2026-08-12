"use client";

import { useActionState } from "react";

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
 * The Category is typed rather than chosen from a list, which is a real gap:
 * `US-DSC-F02-001`'s Category tree exists and the picker that would use it is
 * not built yet. An identifier a person has to find elsewhere is honest about
 * being unfinished in a way a broken picker would not be.
 */
export function CreateOffering({
  action
}: {
  action: (previous: ActionState, form: FormData) => Promise<ActionState>;
}) {
  const [state, dispatch, pending] = useActionState(action, ACTION_IDLE);
  const fields = state.kind === "INVALID" ? state.fields : {};

  return (
    <form action={dispatch} noValidate>
      <fieldset disabled={pending}>
        <legend>Create an Offering</legend>

        <p>
          <label htmlFor="title">Title</label>
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
          <label htmlFor="slug">Address</label>
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
          <label htmlFor="categoryId">Category identifier</label>
          <input
            aria-invalid={fields.categoryId ? true : undefined}
            id="categoryId"
            name="categoryId"
            required
            type="text"
          />
          {fields.categoryId ? (
            <span role="alert">{fields.categoryId.join(" ")}</span>
          ) : null}
        </p>

        <button type="submit">{pending ? "Creating…" : "Create"}</button>
      </fieldset>

      {state.kind === "REFUSED" ? <p role="alert">{state.message}</p> : null}
    </form>
  );
}
