"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { adminPost } from "../../../platform/api";
import { DESTINATION_PATHS } from "../../../platform/destinations";
import { moderationRefusal } from "../../../platform/moderation";
import { AUTH_ROUTES, SESSION_COOKIE } from "../../../identity/session";
import {
  ADMIN_IDLE,
  type AdminActionState
} from "../../../platform/admin-state";

/**
 * One Affiliate Destination Administration action (UX-0006 §9).
 *
 * Four verbs on four routes, each owned by `US-PLT-F07-001`. This carries the
 * request and reports what came back; it recalculates no status, no validation
 * result and no Handoff Eligibility, which is §9's last line and is true here
 * because there is nothing in this file that could compute one.
 *
 * Nothing here opens or closes a moderation case either. The two families are
 * separate, and the separation holds because this action has no way to reach
 * the case routes.
 */
export async function administerDestination(
  offeringId: string,
  _previous: AdminActionState,
  form: FormData
): Promise<AdminActionState> {
  const jar = await cookies();
  const session = jar.get(SESSION_COOKIE)?.value;
  if (session === undefined) redirect(AUTH_ROUTES.login);

  const verb = form.get("verb");
  if (typeof verb !== "string") return ADMIN_IDLE;

  /*
   * Validate carries the result the Admin decided; the other three carry
   * nothing. `NOT_VALIDATED` is not offered because it is the absence of a
   * result rather than one Validate can produce — the contract has no such
   * member, so it cannot be submitted.
   */
  const [path, body] =
    verb === "VALIDATE_VALID"
      ? [DESTINATION_PATHS.VALIDATE, { reason: null, result: "VALID" }]
      : verb === "VALIDATE_INVALID"
        ? [
            DESTINATION_PATHS.VALIDATE,
            { reason: readReason(form), result: "INVALID" }
          ]
        : verb === "ENABLE"
          ? [DESTINATION_PATHS.ENABLE, undefined]
          : verb === "DISABLE"
            ? [DESTINATION_PATHS.DISABLE, undefined]
            : verb === "REVIEW"
              ? [DESTINATION_PATHS.REVIEW, { note: readNote(form) }]
              : [null, undefined];
  if (path === null) return ADMIN_IDLE;

  const outcome = await adminPost(
    session,
    `/admin/offerings/${offeringId}/${path}`,
    body
  );
  revalidatePath("/admin/destinations");
  revalidatePath("/admin");
  if (outcome.status >= 400) {
    const payload = outcome.body as { code?: unknown };
    return {
      kind: "REFUSED",
      message: moderationRefusal(
        typeof payload.code === "string" ? payload.code : ""
      )
    };
  }
  return { kind: "DONE" };
}

function readReason(form: FormData): string | null {
  const reason = form.get("reason");
  return typeof reason === "string" && reason.trim() !== ""
    ? reason.trim()
    : null;
}

function readNote(form: FormData): string | null {
  const note = form.get("note");
  return typeof note === "string" && note.trim() !== "" ? note.trim() : null;
}
