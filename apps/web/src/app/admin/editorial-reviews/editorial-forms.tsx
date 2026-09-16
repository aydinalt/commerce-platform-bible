"use client";

import { useActionState } from "react";

import type { EditorialReviewAdmin } from "@commerce/contracts";

import { SUBMIT, submitLabel } from "../../../form-copy";
import { EDITORIAL } from "../../../platform/copy";
import {
  ADMIN_IDLE,
  type AdminActionState
} from "../../../platform/admin-state";

type Action = (
  previous: AdminActionState,
  form: FormData
) => Promise<AdminActionState>;

/**
 * The parts of a review (I94, `UX-0006` **Frozen v1.2** §12C.5).
 *
 * **A closed list: a verdict, a score, headed sections, pros, cons, a byline.**
 * There is no note, memo, comment, label or tag field here, and that absence is
 * `AC-16` rather than an omission — `PRD-0009` §13.6 forbids any field, flag,
 * state or note through which a commercial relationship could be expressed, and
 * a general-purpose notes box is that field wearing a different name. A partner
 * who asks for their product's review to be marked as sponsored meets a form
 * with nowhere to put it.
 *
 * **Nothing here moves a date or changes a state.** Not a checkbox, not a
 * default. Publication and re-checking are their own acts with their own
 * controls, because §13.4 makes them separate acts.
 */
function ReviewParts({
  review
}: {
  /** The existing values, or nothing when the review does not exist yet. */
  review?: EditorialReviewAdmin;
}) {
  /*
   * The sections that exist, plus one empty slot. A page that re-reads after
   * every save hands back a fresh slot, so adding sections needs no client
   * state — and no state is state that cannot be lost when a save is refused.
   * A slot left blank is dropped rather than sent as an empty section.
   */
  const sections = [...(review?.sections ?? []), { body: "", heading: "" }];

  return (
    <>
      <p>
        <label htmlFor="verdict">{EDITORIAL.verdict}</label>
        <input
          defaultValue={review?.verdict ?? ""}
          id="verdict"
          maxLength={280}
          name="verdict"
          type="text"
        />
        <small>{EDITORIAL.verdictHelp}</small>
      </p>

      <p>
        <label htmlFor="score">{EDITORIAL.score}</label>
        {/* AC-13. The scale and the one decimal are stated here and enforced in
            the contract, the domain and a CHECK constraint. This input is a
            convenience, never the rule: a value outside it is refused rather
            than rounded into range. */}
        <input
          defaultValue={review?.score ?? ""}
          id="score"
          max={10}
          min={0}
          name="score"
          step={0.1}
          type="number"
        />
        <small>{EDITORIAL.scoreHelp}</small>
      </p>

      <fieldset>
        <legend>{EDITORIAL.sections}</legend>
        <small>{EDITORIAL.sectionsHelp}</small>
        {sections.map((section, index) => (
          <p key={`section-${String(index)}`}>
            <label htmlFor={`sectionHeading${String(index)}`}>
              {EDITORIAL.sectionHeading}
            </label>
            <input
              defaultValue={section.heading}
              id={`sectionHeading${String(index)}`}
              maxLength={160}
              name={`sectionHeading${String(index)}`}
              type="text"
            />
            <label htmlFor={`sectionBody${String(index)}`}>
              {EDITORIAL.sectionBody}
            </label>
            <textarea
              defaultValue={section.body}
              id={`sectionBody${String(index)}`}
              maxLength={8000}
              name={`sectionBody${String(index)}`}
              rows={4}
            />
          </p>
        ))}
      </fieldset>

      <p>
        <label htmlFor="pros">{EDITORIAL.pros}</label>
        <textarea
          defaultValue={(review?.pros ?? []).join("\n")}
          id="pros"
          name="pros"
          rows={4}
        />
        <small>{EDITORIAL.prosHelp}</small>
      </p>

      <p>
        <label htmlFor="cons">{EDITORIAL.cons}</label>
        <textarea
          defaultValue={(review?.cons ?? []).join("\n")}
          id="cons"
          name="cons"
          rows={4}
        />
        {/* §5: "A review with no cons is an advertisement, and readers know
            it." Said here rather than only at publication, because a writer
            who learns it at publication has already written the whole thing. */}
        <small>{EDITORIAL.consHelp}</small>
      </p>

      <p>
        <label htmlFor="byline">{EDITORIAL.byline}</label>
        <input
          defaultValue={review?.byline ?? ""}
          id="byline"
          maxLength={120}
          name="byline"
          type="text"
        />
        {/* AC-2. Typed, never derived from the signed-in account — and there is
            no control here that would fill it from one. */}
        <small>{EDITORIAL.bylineHelp}</small>
      </p>
    </>
  );
}

/**
 * Creating the first draft for a Product Key (§12C.4).
 *
 * The Product Key appears only here. A review is about a product and cannot be
 * moved to a different one, so there is no later screen on which the key could
 * be changed — the save form below has no field for it.
 */
export function CreateEditorialReview({ action }: { action: Action }) {
  const [state, dispatch, pending] = useActionState(action, ADMIN_IDLE);

  return (
    <form action={dispatch}>
      <fieldset disabled={pending}>
        <legend>{EDITORIAL.create}</legend>

        <p>
          <label htmlFor="productKey">{EDITORIAL.productKey}</label>
          <input
            id="productKey"
            maxLength={64}
            name="productKey"
            required
            type="text"
          />
          {/* AC-14. The catalogue decides, not this field: a key nothing
              carries is refused by the platform and the refusal arrives while
              this form is still open. */}
          <small>{EDITORIAL.productKeyHelp}</small>
        </p>

        <ReviewParts />

        <button type="submit">{submitLabel(SUBMIT.create, pending)}</button>
      </fieldset>
      {state.kind === "REFUSED" ? <p role="alert">{state.message}</p> : null}
    </form>
  );
}

/**
 * Saving — the same control whether the review is a Draft or published
 * (§12C.6).
 *
 * One form for both occasions because they are one act. What differs is only
 * what the trail calls it, and that is decided by the route rather than here.
 */
export function SaveEditorialReview({
  action,
  review
}: {
  action: Action;
  review: EditorialReviewAdmin;
}) {
  const [state, dispatch, pending] = useActionState(action, ADMIN_IDLE);

  return (
    <form action={dispatch}>
      <fieldset disabled={pending}>
        <legend>{EDITORIAL.edit}</legend>
        <ReviewParts review={review} />
        <button type="submit">{submitLabel(SUBMIT.save, pending)}</button>
      </fieldset>
      {state.kind === "REFUSED" ? <p role="alert">{state.message}</p> : null}
    </form>
  );
}

/**
 * One act with no body: publish, re-check, or withdraw.
 *
 * **Each is its own form with its own button**, which is what keeps them
 * separate acts on the screen as well as in the API. A single control with a
 * dropdown of verbs would be the collapse §13.4 forbids, rebuilt in the
 * interface after the API had refused to allow it.
 */
export function EditorialAct({
  action,
  label,
  note,
  submit
}: {
  action: Action;
  label: string;
  /** What the act does and what survives it — §12C.9 and §12C.10 both need one. */
  note: string;
  /*
   * The pair from `SUBMIT` rather than two loose strings, so a caller cannot
   * take an idle label from one act and a working label from another — the
   * thing `form-copy.ts` keeps the pairs together to prevent.
   */
  submit: (typeof SUBMIT)[keyof typeof SUBMIT];
}) {
  const [state, dispatch, pending] = useActionState(action, ADMIN_IDLE);

  return (
    <form action={dispatch}>
      <fieldset disabled={pending}>
        <legend>{label}</legend>
        <small>{note}</small>
        <button type="submit">{submitLabel(submit, pending)}</button>
      </fieldset>
      {state.kind === "REFUSED" ? <p role="alert">{state.message}</p> : null}
    </form>
  );
}
