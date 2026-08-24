"use client";

import { useActionState } from "react";

import type { ModerationCase } from "@commerce/contracts";

import {
  ACTION_LABELS,
  ACTION_RESULTS,
  CLOSURE_CHANGES_NOTHING,
  CLOSURE_NEEDS_EVIDENCE,
  CLOSURE_NEEDS_RE_REVIEW,
  CONTENT_AREA_LABELS,
  CORRECTION_TARGET_LABELS
} from "../../../platform/moderation";
import { CASES, CASE_FORMS } from "../../../platform/copy";
import {
  ADMIN_IDLE,
  type AdminActionState
} from "../../../platform/admin-state";

type Action = (
  previous: AdminActionState,
  form: FormData
) => Promise<AdminActionState>;

/**
 * One General Moderation action (UX-0006 §7.3, §7.4).
 *
 * The result is stated beside the button in the words of the PRD that owns it,
 * so an Admin knows what they are about to cause before causing it. The
 * Dashboard explains and then consumes; it never redefines, which is why every
 * sentence here is a transition somebody else already wrote down.
 *
 * §14: the button is disabled while the submission resolves, so an action
 * cannot be applied twice while the target state is still being decided.
 */
function ModerationAction({
  action,
  entry
}: {
  action: Action;
  entry: ModerationCase["availableActions"][number];
}) {
  const [state, dispatch, pending] = useActionState(action, ADMIN_IDLE);

  return (
    <form action={dispatch}>
      <input name="action" type="hidden" value={entry} />
      <p>{ACTION_RESULTS[entry]}</p>
      <button disabled={pending} type="submit">
        {pending ? CASES.working : ACTION_LABELS[entry]}
      </button>
      {state.kind === "REFUSED" ? <p role="alert">{state.message}</p> : null}
    </form>
  );
}

/**
 * Request Correction (§7.2, §8).
 *
 * Its own form, because it is the one action that carries a decision rather
 * than only an intent: which of the four approved targets, and — for Offering
 * content — which exact area. User Account correction is absent from the list
 * because it is absent from the contract, so it is not a request this form
 * could make even if somebody edited it.
 *
 * The Offering is not asked for. It comes from the case, so a correction
 * cannot be aimed at something the case is not about.
 */
function RequestCorrection({
  action,
  offeringCase
}: {
  action: Action;
  offeringCase: boolean;
}) {
  const [state, dispatch, pending] = useActionState(action, ADMIN_IDLE);

  return (
    <form action={dispatch}>
      <input name="action" type="hidden" value="REQUEST_CORRECTION" />
      <fieldset disabled={pending}>
        <legend>{ACTION_LABELS.REQUEST_CORRECTION}</legend>
        <p>{ACTION_RESULTS.REQUEST_CORRECTION}</p>

        <p>
          <label htmlFor="target">{CASE_FORMS.correctionTarget}</label>
          <select id="target" name="target" required>
            {Object.entries(CORRECTION_TARGET_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </p>

        {/* The exact content area, and only where the case is about an
            Offering — the database refuses a content area without one. */}
        {offeringCase ? (
          <p>
            <label htmlFor="contentArea">{CASE_FORMS.correctionArea}</label>
            <select id="contentArea" name="contentArea">
              <option value="">{CASE_FORMS.correctionNotSpecific}</option>
              {Object.entries(CONTENT_AREA_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </p>
        ) : null}

        <p>
          <label htmlFor="note">{CASE_FORMS.correctionText}</label>
          <textarea id="note" name="note" />
        </p>

        <button type="submit">{pending ? "Sending…" : "Send"}</button>
      </fieldset>
      {state.kind === "REFUSED" ? <p role="alert">{state.message}</p> : null}
    </form>
  );
}

/// A no-action decision (§7.5). The reason is required, because a blank one
/// would be indistinguishable from never having looked.
function NoActionDecision({ action }: { action: Action }) {
  const [state, dispatch, pending] = useActionState(action, ADMIN_IDLE);

  return (
    <form action={dispatch}>
      <fieldset disabled={pending}>
        <legend>{CASE_FORMS.noActionTitle}</legend>
        <p>
          <label htmlFor="reason">{CASE_FORMS.noActionReason}</label>
          <textarea id="reason" name="reason" required />
        </p>
        <button type="submit">{pending ? "Recording…" : "Record"}</button>
      </fieldset>
      {state.kind === "REFUSED" ? <p role="alert">{state.message}</p> : null}
    </form>
  );
}

/// A re-review (§8). Cheap on purpose: the act is the point.
function ReReview({ action }: { action: Action }) {
  const [state, dispatch, pending] = useActionState(action, ADMIN_IDLE);

  return (
    <form action={dispatch}>
      <fieldset disabled={pending}>
        <legend>{CASE_FORMS.reReview}</legend>
        <p>
          <label htmlFor="note">{CASE_FORMS.note}</label>
          <textarea id="note" name="note" />
        </p>
        <button type="submit">{pending ? "Recording…" : "Record"}</button>
      </fieldset>
      {state.kind === "REFUSED" ? <p role="alert">{state.message}</p> : null}
    </form>
  );
}

/// Closure (§7.5). What it requires is said before it is attempted, and what
/// it does not do is said beside it.
function Closure({
  action,
  needsReReview
}: {
  action: Action;
  needsReReview: boolean;
}) {
  const [state, dispatch, pending] = useActionState(action, ADMIN_IDLE);

  return (
    <form action={dispatch}>
      <p>{CLOSURE_NEEDS_EVIDENCE}</p>
      {needsReReview ? <p>{CLOSURE_NEEDS_RE_REVIEW}</p> : null}
      <p>{CLOSURE_CHANGES_NOTHING}</p>
      <button disabled={pending} type="submit">
        {pending ? CASES.closing : CASES.closeThis}
      </button>
      {state.kind === "REFUSED" ? <p role="alert">{state.message}</p> : null}
    </form>
  );
}

export {
  Closure,
  ModerationAction,
  NoActionDecision,
  ReReview,
  RequestCorrection
};
