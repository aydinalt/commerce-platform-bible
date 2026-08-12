"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createDraftOfferingSchema } from "@commerce/contracts";
import { z } from "zod";

import { actOnOffering, createOffering } from "../../../business/api";
import {
  refusalMessage,
  type ActionState
} from "../../../business/action-outcome";
import { AUTH_ROUTES, SESSION_COOKIE } from "../../../identity/session";

async function sessionOrLogin(): Promise<string> {
  const jar = await cookies();
  const session = jar.get(SESSION_COOKIE)?.value;
  if (session === undefined) redirect(AUTH_ROUTES.login);
  return session;
}

/**
 * Publish (UX-0005 §9).
 *
 * The screen offers this only where `US-BUS-F05-001` said it was permitted,
 * and the API checks every gate again inside the transaction that would
 * perform the transition. So a refusal here is not a bug in either — it is the
 * two-request gap doing exactly what it should, and the answer is to say what
 * happened rather than to pre-empt it with a third opinion.
 *
 * §15. A refused publication claims no transition: this returns a refusal and
 * revalidates, so the person sees the Offering exactly where it still is.
 */
export async function publishOffering(
  businessId: string,
  offeringId: string,
  _previous: ActionState,
  _form: FormData
): Promise<ActionState> {
  const session = await sessionOrLogin();
  const outcome = await actOnOffering(
    session,
    businessId,
    offeringId,
    "publication"
  );
  revalidatePath(`/businesses/${businessId}`);
  if (outcome.status >= 400)
    return {
      code: outcome.code,
      kind: "REFUSED",
      message: refusalMessage(outcome.code)
    };
  return { kind: "DONE" };
}

/**
 * Retire (§9).
 *
 * Available from Draft, Published and Hidden alike, and it produces PRD-0001's
 * Archived rather than a Dashboard-owned result. There is no confirmation step
 * here beyond the submission itself: retirement is not deletion, the Offering
 * stays readable afterwards, and an extra "are you sure" would suggest
 * something irreversible in a way the lifecycle does not support.
 */
export async function retireOffering(
  businessId: string,
  offeringId: string,
  _previous: ActionState,
  _form: FormData
): Promise<ActionState> {
  const session = await sessionOrLogin();
  const outcome = await actOnOffering(
    session,
    businessId,
    offeringId,
    "retirement"
  );
  revalidatePath(`/businesses/${businessId}`);
  if (outcome.status >= 400)
    return {
      code: outcome.code,
      kind: "REFUSED",
      message: refusalMessage(outcome.code)
    };
  return { kind: "DONE" };
}

/**
 * Create (§9).
 *
 * A new Offering begins as Draft, and this action says so nowhere — it sends a
 * title, a Category and an address, and PRD-0001 decides what the result is.
 * A screen that named the starting state would be a second place that could
 * one day disagree.
 *
 * Availability is the Business's moderation status, checked by the API. The
 * Dashboard hides the form where creation is unavailable rather than showing a
 * disabled one, because §14 asks for the action to be absent rather than
 * presented as unavailable.
 */
export async function createDraftOffering(
  businessId: string,
  _previous: ActionState,
  form: FormData
): Promise<ActionState> {
  const session = await sessionOrLogin();
  const parsed = createDraftOfferingSchema.safeParse({
    categoryId: form.get("categoryId"),
    slug: form.get("slug"),
    title: form.get("title")
  });
  if (!parsed.success)
    return {
      fields: z.flattenError(parsed.error).fieldErrors,
      kind: "INVALID"
    };

  const outcome = await createOffering(session, businessId, parsed.data);
  revalidatePath(`/businesses/${businessId}`);
  if (outcome.status >= 400)
    return {
      code: outcome.code,
      kind: "REFUSED",
      message: refusalMessage(outcome.code)
    };
  return { kind: "DONE" };
}
