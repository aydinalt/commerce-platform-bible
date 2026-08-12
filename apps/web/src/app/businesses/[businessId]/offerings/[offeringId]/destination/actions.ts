"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { authorAffiliateDestinationSchema } from "@commerce/contracts";
import { z } from "zod";

import {
  fetchDestinationManagement,
  saveDestination
} from "../../../../../../business/api";
import {
  refusalMessage,
  type ActionState
} from "../../../../../../business/action-outcome";
import {
  AUTH_ROUTES,
  SESSION_COOKIE
} from "../../../../../../identity/session";

/**
 * Saves the destination's reference (UX-0005 §13, `US-OFR-F06-001`).
 *
 * Whether this creates or replaces is decided from the entry the API offered
 * a moment ago, not from whether the browser thought a destination existed.
 * The two can disagree — and where they do, the API's answer is the one that
 * decides which verb the request uses.
 *
 * There is no field here for status, validation result or Handoff Eligibility,
 * and no route to ask for any of them. AC-8 reserves Review, Validate, Enable
 * and Disable to the platform, so this action could not perform one even if it
 * wanted to.
 */
export async function saveDestinationReference(
  businessId: string,
  offeringId: string,
  _previous: ActionState,
  form: FormData
): Promise<ActionState> {
  const jar = await cookies();
  const session = jar.get(SESSION_COOKIE)?.value;
  if (session === undefined) redirect(AUTH_ROUTES.login);

  const parsed = authorAffiliateDestinationSchema.safeParse({
    reference: form.get("reference")
  });
  if (!parsed.success)
    return {
      fields: z.flattenError(parsed.error).fieldErrors,
      kind: "INVALID"
    };

  const entry = await fetchDestinationManagement(
    session,
    businessId,
    offeringId
  );
  if (entry === null)
    return {
      code: "DESTINATION_NOT_MANAGEABLE",
      kind: "REFUSED",
      message: refusalMessage("DESTINATION_NOT_MANAGEABLE")
    };

  const outcome = await saveDestination(
    session,
    businessId,
    offeringId,
    parsed.data,
    entry.destination === null
  );
  revalidatePath(
    `/businesses/${businessId}/offerings/${offeringId}/destination`
  );
  if (outcome.status >= 400) {
    const body = outcome.body as { code?: unknown };
    const code = typeof body.code === "string" ? body.code : "";
    return { code, kind: "REFUSED", message: refusalMessage(code) };
  }
  return { kind: "DONE" };
}
