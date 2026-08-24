"use client";

import { useActionState } from "react";

import type { CategoryResponse } from "@commerce/contracts";

import {
  ARCHIVED_DOES_NOT_BLOCK,
  DOMAINS,
  DOMAIN_LABELS,
  RETIREMENT_IS_NOT_DELETION
} from "../../../platform/catalog";
import { CATEGORIES } from "../../../platform/copy";
import {
  ADMIN_IDLE,
  type AdminActionState
} from "../../../platform/admin-state";

type Action = (
  previous: AdminActionState,
  form: FormData
) => Promise<AdminActionState>;

/**
 * Creating a Category (UX-0006 §10).
 *
 * One form for both shapes, because they are one act with one choice inside
 * it: a root that names a Domain, or a child that names a parent. Choosing a
 * parent is how a Domain is inherited, and that is why the Domain field is
 * only meaningful when no parent is chosen — the action sends one shape or the
 * other and the contract accepts nothing in between.
 *
 * There is no Domain control anywhere else in this application. AC-7 gives a
 * child its parent's Domain and no route accepts a new one, so a root's Domain
 * is decided once, here, and never again.
 */
export function CreateCategory({
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
        <legend>{CATEGORIES.create}</legend>

        <p>
          <label htmlFor="name">{CATEGORIES.name}</label>
          <input id="name" name="name" required type="text" />
        </p>
        <p>
          <label htmlFor="slug">{CATEGORIES.address}</label>
          <input id="slug" name="slug" required type="text" />
        </p>
        <p>
          <label htmlFor="stableKey">{CATEGORIES.stableKey}</label>
          <input id="stableKey" name="stableKey" required type="text" />
        </p>

        <p>
          <label htmlFor="parentId">{CATEGORIES.parent}</label>
          <select id="parentId" name="parentId">
            <option value="">{CATEGORIES.noParent}</option>
            {categories
              .filter((category) => category.active)
              .map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name} ({DOMAIN_LABELS[category.domain]})
                </option>
              ))}
          </select>
        </p>

        <p>
          <label htmlFor="domain">{CATEGORIES.domain}</label>
          <select id="domain" name="domain">
            {DOMAINS.map((domain) => (
              <option key={domain} value={domain}>
                {DOMAIN_LABELS[domain]}
              </option>
            ))}
          </select>
        </p>

        <button type="submit">{pending ? "Creating…" : "Create"}</button>
      </fieldset>
      {state.kind === "REFUSED" ? <p role="alert">{state.message}</p> : null}
    </form>
  );
}

/// AC-3. A name and nothing else — identity cannot travel with it.
export function RenameCategory({
  action,
  categoryId,
  name
}: {
  action: Action;
  /// Only so the field's label can name a control unique on a page of many.
  categoryId: string;
  name: string;
}) {
  const [state, dispatch, pending] = useActionState(action, ADMIN_IDLE);

  return (
    <form action={dispatch}>
      <fieldset disabled={pending}>
        <legend>{CATEGORIES.rename}</legend>
        {/* A `legend` names the group, not the control inside it. One field in
            one fieldset is exactly where that is easiest to miss and easiest
            to hear: without this, the box is announced as "edit text" and the
            Admin has to guess from the button beside it. */}
        <label htmlFor={`rename-${categoryId}`}>{CATEGORIES.newName}</label>
        <input
          defaultValue={name}
          id={`rename-${categoryId}`}
          name="name"
          required
          type="text"
        />
        <button type="submit">{pending ? "Saving…" : "Rename"}</button>
      </fieldset>
      {state.kind === "REFUSED" ? <p role="alert">{state.message}</p> : null}
    </form>
  );
}

/**
 * AC-4. Moving within the Domain.
 *
 * Only Categories in the same Domain are offered. Not as a second rule — the
 * platform refuses a cross-Domain parent regardless — but because offering one
 * would be inviting somebody to do the one thing §10 says the experience
 * prevents, and letting them find out by refusal.
 */
export function ReparentCategory({
  action,
  category,
  categories
}: {
  action: Action;
  category: CategoryResponse;
  categories: readonly CategoryResponse[];
}) {
  const [state, dispatch, pending] = useActionState(action, ADMIN_IDLE);

  return (
    <form action={dispatch}>
      <fieldset disabled={pending}>
        <legend>{CATEGORIES.move}</legend>
        <label htmlFor={`parent-${category.id}`}>{CATEGORIES.newParent}</label>
        <select
          defaultValue={category.parentId ?? ""}
          id={`parent-${category.id}`}
          name="parentId"
        >
          <option value="">{CATEGORIES.noParentMove}</option>
          {categories
            .filter(
              (candidate) =>
                candidate.active &&
                candidate.domain === category.domain &&
                candidate.id !== category.id
            )
            .map((candidate) => (
              <option key={candidate.id} value={candidate.id}>
                {candidate.name}
              </option>
            ))}
        </select>
        <button type="submit">{pending ? "Moving…" : "Move"}</button>
      </fieldset>
      {state.kind === "REFUSED" ? <p role="alert">{state.message}</p> : null}
    </form>
  );
}

/// AC-12. What retirement is, and what does not stand in its way, said where
/// it is offered rather than discovered through a refusal.
export function RetireCategory({ action }: { action: Action }) {
  const [state, dispatch, pending] = useActionState(action, ADMIN_IDLE);

  return (
    <form action={dispatch}>
      <p>{RETIREMENT_IS_NOT_DELETION}</p>
      <p>{ARCHIVED_DOES_NOT_BLOCK}</p>
      <button disabled={pending} type="submit">
        {pending ? CATEGORIES.retiring : CATEGORIES.retire}
      </button>
      {state.kind === "REFUSED" ? <p role="alert">{state.message}</p> : null}
    </form>
  );
}
