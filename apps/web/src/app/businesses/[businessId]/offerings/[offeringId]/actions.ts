"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { editOfferingSchema } from "@commerce/contracts";
import { z } from "zod";

import {
  fetchOfferingContent,
  saveOfferingContent
} from "../../../../../business/api";
import {
  editRefusalMessage,
  type ActionState
} from "../../../../../business/action-outcome";
import { submittedValues } from "../../../../../business/offering-content";
import { AUTH_ROUTES, SESSION_COOKIE } from "../../../../../identity/session";

/**
 * Saves the Offering's content (UX-0005 §9 Edit, `US-OFR-F02-001`).
 *
 * The definitions are read again here rather than carried in hidden fields.
 * Two reasons, and both matter: a hidden field is something a submission can
 * change, and the question this action must answer is "what does this
 * Attribute mean *now*" — a definition retired since the form rendered should
 * not govern the value being written.
 *
 * §15. A refused save says nothing was saved and leaves the Offering with
 * exactly the content it had. Nothing here can move a lifecycle: the contract
 * has no field for one and the route has none to receive it, so AC-10 holds by
 * construction rather than by care.
 */
export async function saveOffering(
  businessId: string,
  offeringId: string,
  _previous: ActionState,
  form: FormData
): Promise<ActionState> {
  const jar = await cookies();
  const session = jar.get(SESSION_COOKIE)?.value;
  if (session === undefined) redirect(AUTH_ROUTES.login);

  const current = await fetchOfferingContent(session, businessId, offeringId);
  // Gone, or never theirs. The same answer either way, as everywhere else.
  if (current === null)
    return {
      code: "OFFERING_NOT_FOUND",
      kind: "REFUSED",
      message: editRefusalMessage("OFFERING_NOT_FOUND")
    };

  const parsed = editOfferingSchema.safeParse({
    attributes: submittedValues(current.applicableAttributes, form),
    // Category is not editable from this screen. It is sent back unchanged
    // because the save is a replacement, and UX-0005 §11 keeps Category out of
    // the content areas a correction may touch — moving an Offering is not
    // correcting what it says.
    categoryId: current.categoryId,
    summary: form.get("summary"),
    title: form.get("title")
  });
  if (!parsed.success)
    return {
      fields: z.flattenError(parsed.error).fieldErrors,
      kind: "INVALID"
    };

  const outcome = await saveOfferingContent(
    session,
    businessId,
    offeringId,
    parsed.data
  );
  revalidatePath(`/businesses/${businessId}/offerings/${offeringId}`);
  revalidatePath(`/businesses/${businessId}`);
  if (outcome.status >= 400) {
    const body = outcome.body as { code?: unknown; fieldErrors?: unknown };
    const code = typeof body.code === "string" ? body.code : "";
    return { code, kind: "REFUSED", message: editRefusalMessage(code) };
  }
  return { kind: "DONE" };
}
