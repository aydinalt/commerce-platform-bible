"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { openModerationCase } from "../../platform/api";
import { CASES } from "../../platform/copy";
import { AUTH_ROUTES, SESSION_COOKIE } from "../../identity/session";
import { ADMIN_IDLE, type AdminActionState } from "../../platform/admin-state";

/**
 * Opening a case against a target (I82).
 *
 * **It redirects to the case rather than reporting success.** An Admin who
 * opens a case is going to work it, and leaving them on the listing page with
 * "a case was opened" would make finding it a second task. The redirect also
 * settles what should happen when a target already has an Open case: the API
 * answers with that case (AC-2), and this lands on it — so a second press is
 * navigation, not a duplicate.
 *
 * `redirect` throws, so it sits outside the `try`-shaped flow deliberately:
 * there is no state to return on the successful path because this function does
 * not return on it.
 */
export async function openCaseFor(
  target:
    | { businessId: string; targetType: "BUSINESS" }
    | { offeringId: string; targetType: "OFFERING" }
    | { targetType: "USER_ACCOUNT"; userId: string },
  _previous: AdminActionState
): Promise<AdminActionState> {
  const jar = await cookies();
  const session = jar.get(SESSION_COOKIE)?.value;
  if (session === undefined) redirect(AUTH_ROUTES.login);

  const caseId = await openModerationCase({ session, target });
  /*
   * A refusal is reported rather than thrown. The ordinary causes are a target
   * that has been removed since the page was drawn and an authorization that
   * has been withdrawn since — both of which an Admin can act on, and neither
   * of which is a fault worth a stack trace.
   */
  if (caseId === null) return { kind: "REFUSED", message: CASES.openRefused };

  redirect(`/admin/moderation-cases/${caseId}`);
  // Unreachable; `redirect` throws. Returned so the signature stays total.
  return ADMIN_IDLE;
}
