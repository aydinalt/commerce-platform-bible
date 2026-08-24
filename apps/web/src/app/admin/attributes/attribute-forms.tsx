"use client";

import { useActionState } from "react";

import type { AttributeResponse, CategoryResponse } from "@commerce/contracts";

import {
  REQUIRED_NEEDS_EVERY_LIVE_OFFERING,
  TEXT_IS_NOT_FILTERABLE,
  VALUE_KIND_LABELS
} from "../../../platform/catalog";
import { ATTRIBUTES } from "../../../platform/copy";
import {
  ADMIN_IDLE,
  type AdminActionState
} from "../../../platform/admin-state";

type Action = (
  previous: AdminActionState,
  form: FormData
) => Promise<AdminActionState>;

function CategoryChoices({
  categories,
  selected
}: {
  categories: readonly CategoryResponse[];
  selected: readonly string[];
}) {
  return (
    <fieldset>
      <legend>{ATTRIBUTES.appliesTo}</legend>
      {categories
        .filter((category) => category.active)
        .map((category) => (
          <p key={category.id}>
            <label htmlFor={`category-${category.id}`}>
              <input
                defaultChecked={selected.includes(category.id)}
                id={`category-${category.id}`}
                name="categoryIds"
                type="checkbox"
                value={category.id}
              />
              {category.name}
            </label>
          </p>
        ))}
    </fieldset>
  );
}

/**
 * Defining an Attribute (UX-0006 §11).
 *
 * The value kind is chosen once, here. It has its own route afterwards and
 * that route refuses while active-lifecycle Offerings hold values — so the
 * honest place to decide it is before anything depends on it.
 *
 * `TEXT_IS_NOT_FILTERABLE` is stated rather than enforced by this form. The
 * platform refuses it, and a control that quietly disabled itself would leave
 * an Admin wondering whether they had misread the option; a sentence tells
 * them the rule.
 */
export function CreateAttribute({
  action,
  categories
}: {
  action: Action;
  categories: readonly CategoryResponse[];
}) {
  const [state, dispatch, pending] = useActionState(action, ADMIN_IDLE);

  return (
    <form action={dispatch}>
      <fieldset disabled={pending}>
        <legend>{ATTRIBUTES.define}</legend>

        <p>
          <label htmlFor="name">{ATTRIBUTES.name}</label>
          <input id="name" name="name" required type="text" />
        </p>
        <p>
          <label htmlFor="stableKey">{ATTRIBUTES.stableKey}</label>
          <input id="stableKey" name="stableKey" required type="text" />
        </p>
        <p>
          <label htmlFor="valueKind">{ATTRIBUTES.valueKind}</label>
          <select id="valueKind" name="valueKind" required>
            {Object.entries(VALUE_KIND_LABELS).map(([kind, label]) => (
              <option key={kind} value={kind}>
                {label}
              </option>
            ))}
          </select>
        </p>
        <p>
          <label htmlFor="unit">{ATTRIBUTES.unitOnlyNumber}</label>
          <input id="unit" name="unit" type="text" />
        </p>

        {/* One line per allowed value, for the two Select kinds. Left empty
            for every other kind, where the platform accepts none. */}
        <fieldset>
          <legend>{ATTRIBUTES.options}</legend>
          {[0, 1, 2, 3].map((index) => (
            <p key={index}>
              <label htmlFor={`option-${String(index)}`}>
                {ATTRIBUTES.value}
              </label>
              <input
                id={`option-${String(index)}`}
                name="optionLabel"
                type="text"
              />
            </p>
          ))}
        </fieldset>

        <CategoryChoices categories={categories} selected={[]} />

        <p>
          <label htmlFor="filterable">
            <input id="filterable" name="filterable" type="checkbox" />
            {ATTRIBUTES.filterable}
          </label>
        </p>
        <p>{TEXT_IS_NOT_FILTERABLE}</p>
        <p>
          <label htmlFor="comparable">
            <input id="comparable" name="comparable" type="checkbox" />
            {ATTRIBUTES.comparable}
          </label>
        </p>

        <button type="submit">{pending ? "Defining…" : "Define"}</button>
      </fieldset>
      {state.kind === "REFUSED" ? <p role="alert">{state.message}</p> : null}
    </form>
  );
}

/// AC-13. The properties an edit may change without touching any Offering.
export function AttributeProperties({
  action,
  attribute
}: {
  action: Action;
  attribute: AttributeResponse;
}) {
  const [state, dispatch, pending] = useActionState(action, ADMIN_IDLE);

  return (
    <form action={dispatch}>
      <fieldset disabled={pending}>
        <legend>{ATTRIBUTES.properties}</legend>
        <p>
          <label htmlFor={`name-${attribute.id}`}>{ATTRIBUTES.name}</label>
          <input
            defaultValue={attribute.name}
            id={`name-${attribute.id}`}
            name="name"
            required
            type="text"
          />
        </p>
        <p>
          <label htmlFor={`unit-${attribute.id}`}>{ATTRIBUTES.unit}</label>
          <input
            defaultValue={attribute.unit ?? ""}
            id={`unit-${attribute.id}`}
            name="unit"
            type="text"
          />
        </p>
        <p>
          <label htmlFor={`filterable-${attribute.id}`}>
            <input
              defaultChecked={attribute.filterable}
              id={`filterable-${attribute.id}`}
              name="filterable"
              type="checkbox"
            />
            {ATTRIBUTES.filterable}
          </label>
        </p>
        <p>
          <label htmlFor={`comparable-${attribute.id}`}>
            <input
              defaultChecked={attribute.comparable}
              id={`comparable-${attribute.id}`}
              name="comparable"
              type="checkbox"
            />
            {ATTRIBUTES.comparable}
          </label>
        </p>
        <button type="submit">{pending ? "Saving…" : "Save"}</button>
      </fieldset>
      {state.kind === "REFUSED" ? <p role="alert">{state.message}</p> : null}
    </form>
  );
}

/// §11. What turning this on asks of every live Offering, said before it is
/// asked rather than met as a refusal.
export function RequiredForPublication({
  action,
  attribute
}: {
  action: Action;
  attribute: AttributeResponse;
}) {
  const [state, dispatch, pending] = useActionState(action, ADMIN_IDLE);

  return (
    <form action={dispatch}>
      <fieldset disabled={pending}>
        <legend>{ATTRIBUTES.required}</legend>
        <p>{REQUIRED_NEEDS_EVERY_LIVE_OFFERING}</p>
        <p>
          <label htmlFor={`required-${attribute.id}`}>
            <input
              defaultChecked={attribute.requiredForPublication}
              id={`required-${attribute.id}`}
              name="requiredForPublication"
              type="checkbox"
            />
            {ATTRIBUTES.requiredExplained}
          </label>
        </p>
        <button type="submit">{pending ? "Saving…" : "Save"}</button>
      </fieldset>
      {state.kind === "REFUSED" ? <p role="alert">{state.message}</p> : null}
    </form>
  );
}

export function AttributeCategories({
  action,
  attribute,
  categories
}: {
  action: Action;
  attribute: AttributeResponse;
  categories: readonly CategoryResponse[];
}) {
  const [state, dispatch, pending] = useActionState(action, ADMIN_IDLE);

  return (
    <form action={dispatch}>
      <fieldset disabled={pending}>
        <CategoryChoices
          categories={categories}
          selected={attribute.categoryIds}
        />
        <button type="submit">{pending ? "Saving…" : "Save"}</button>
      </fieldset>
      {state.kind === "REFUSED" ? <p role="alert">{state.message}</p> : null}
    </form>
  );
}

/// Retiring an allowed value. Not deletion: an Offering that already holds it
/// keeps it, and no new Offering may choose it.
export function RetireOption({
  action,
  label
}: {
  action: Action;
  label: string;
}) {
  const [state, dispatch, pending] = useActionState(action, ADMIN_IDLE);

  return (
    <form action={dispatch}>
      <button disabled={pending} type="submit">
        {pending ? ATTRIBUTES.retiring : ATTRIBUTES.retire(label)}
      </button>
      {state.kind === "REFUSED" ? <p role="alert">{state.message}</p> : null}
    </form>
  );
}

export function AddOption({ action }: { action: Action }) {
  const [state, dispatch, pending] = useActionState(action, ADMIN_IDLE);

  return (
    <form action={dispatch}>
      <fieldset disabled={pending}>
        <legend>{ATTRIBUTES.addOption}</legend>
        <p>
          <label htmlFor="label">{ATTRIBUTES.label}</label>
          <input id="label" name="label" required type="text" />
        </p>
        <p>
          <label htmlFor="optionKey">{ATTRIBUTES.stableKey}</label>
          <input id="optionKey" name="stableKey" required type="text" />
        </p>
        <button type="submit">{pending ? "Adding…" : "Add"}</button>
      </fieldset>
      {state.kind === "REFUSED" ? <p role="alert">{state.message}</p> : null}
    </form>
  );
}
