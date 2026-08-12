"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { adminPost, fetchModerationCase } from "../../../platform/api";
import { actionPath, moderationRefusal } from "../../../platform/moderation";
import { AUTH_ROUTES, SESSION_COOKIE } from "../../../identity/session";
import {
  ADMIN_IDLE,
  type AdminActionState
} from "../../../platform/admin-state";

async function sessionOrLogin(): Promise<string> {
  const jar = await cookies();
  const session = jar.get(SESSION_COOKIE)?.value;
  if (session === undefined) redirect(AUTH_ROUTES.login);
  return session;
}

/**
 * Applying one General Moderation action (UX-0006 §7.3, §7.4).
 *
 * The action is checked against the case's own `availableActions` before it is
 * sent — not as a second opinion, but because the address it goes to depends on
 * which action it is, and an action the case does not offer has no address.
 * `US-PLT-F02-001` composed that list from the target's current state, and the
 * route it reaches checks the same state again inside the transaction.
 *
 * Nothing here describes what the action does. Seven routes owned by seven
 * Stories produce seven results; this carries the request and consumes the
 * answer, which is exactly what §7.4 allows and no more.
 */
export async function applyModerationAction(
  caseId: string,
  _previous: AdminActionState,
  form: FormData
): Promise<AdminActionState> {
  const session = await sessionOrLogin();
  const raw = form.get("action");
  if (typeof raw !== "string") return ADMIN_IDLE;

  const found = await fetchModerationCase(session, caseId);
  if (found === null)
    return {
      kind: "REFUSED",
      message: moderationRefusal("MODERATION_CASE_NOT_FOUND")
    };

  const action = found.availableActions.find((entry) => entry === raw);
  // Not offered, so not addressable. The refusal names the state rather than
  // the submission, because the state is what changed.
  if (action === undefined)
    return { kind: "REFUSED", message: moderationRefusal("") };

  const path = actionPath(action, {
    businessId: found.businessId,
    offeringId: found.offeringId,
    userId: found.userId
  });
  if (path === null) return { kind: "REFUSED", message: moderationRefusal("") };

  /*
   * Request Correction needs a target and, for Offering content, the exact
   * area — everything else carries no body at all. The correction target is
   * read from the form because it is a decision the Admin makes; the Offering
   * comes from the case, so a correction cannot be aimed at something the case
   * is not about.
   */
  const body =
    action === "REQUEST_CORRECTION"
      ? {
          contentArea: form.get("contentArea") ?? null,
          note: form.get("note") ?? null,
          offeringId: found.offeringId,
          target: form.get("target")
        }
      : undefined;

  const outcome = await adminPost(session, path, body);
  revalidatePath(`/admin/moderation-cases/${caseId}`);
  revalidatePath("/admin/moderation-cases");
  if (outcome.status >= 400) {
    const payload = outcome.body as { code?: unknown };
    const code = typeof payload.code === "string" ? payload.code : "";
    return { kind: "REFUSED", message: moderationRefusal(code) };
  }
  return { kind: "DONE" };
}

/**
 * Recording a no-action decision (§7.5).
 *
 * Its own act rather than a checkbox on closure, because deciding that nothing
 * needs doing is a decision that stands in the record whether or not the case
 * is closed afterwards. The reason is required by the contract: a blank one
 * would be indistinguishable from never having looked.
 */
export async function recordNoAction(
  caseId: string,
  _previous: AdminActionState,
  form: FormData
): Promise<AdminActionState> {
  const session = await sessionOrLogin();
  const reason = form.get("reason");
  if (typeof reason !== "string" || reason.trim() === "") return ADMIN_IDLE;

  const outcome = await adminPost(
    session,
    `/admin/moderation-cases/${caseId}/no-action-decision`,
    { reason: reason.trim() }
  );
  revalidatePath(`/admin/moderation-cases/${caseId}`);
  return outcome.status >= 400
    ? { kind: "REFUSED", message: moderationRefusal(codeOf(outcome.body)) }
    : { kind: "DONE" };
}

/**
 * Recording a re-review (§8).
 *
 * Deliberately cheap: an optional note and nothing else. The act is the point —
 * somebody looked at what the owner did. Requiring a justification would make
 * the correct thing feel expensive and encourage closing without it, which is
 * the failure this exists to prevent.
 */
export async function recordReReview(
  caseId: string,
  _previous: AdminActionState,
  form: FormData
): Promise<AdminActionState> {
  const session = await sessionOrLogin();
  const note = form.get("note");
  const outcome = await adminPost(
    session,
    `/admin/moderation-cases/${caseId}/re-review`,
    {
      note: typeof note === "string" && note.trim() !== "" ? note.trim() : null
    }
  );
  revalidatePath(`/admin/moderation-cases/${caseId}`);
  return outcome.status >= 400
    ? { kind: "REFUSED", message: moderationRefusal(codeOf(outcome.body)) }
    : { kind: "DONE" };
}

/**
 * Closing the case (§7.5).
 *
 * Explicit, because nothing else closes it: no action applied within the case
 * closes it and neither does time. A refused closure leaves the case exactly
 * Open — the requirement is a database trigger, so that is the transaction's
 * doing rather than this action's care.
 */
export async function closeCase(
  caseId: string,
  _previous: AdminActionState,
  _form: FormData
): Promise<AdminActionState> {
  const session = await sessionOrLogin();
  const outcome = await adminPost(
    session,
    `/admin/moderation-cases/${caseId}/closure`
  );
  revalidatePath(`/admin/moderation-cases/${caseId}`);
  revalidatePath("/admin/moderation-cases");
  return outcome.status >= 400
    ? { kind: "REFUSED", message: moderationRefusal(codeOf(outcome.body)) }
    : { kind: "DONE" };
}

function codeOf(body: unknown): string {
  if (typeof body !== "object" || body === null) return "";
  const code = (body as { code?: unknown }).code;
  return typeof code === "string" ? code : "";
}
