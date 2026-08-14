"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { saveCorrectionSchema } from "@commerce/contracts";
import { z } from "zod";

import {
  fetchOfferingContent,
  saveCorrection
} from "../../../../../business/api";
import { type ActionState } from "../../../../../business/action-outcome";
import { correctionRefusalMessage } from "../../../../../business/corrections";
import { submittedValues } from "../../../../../business/offering-content";
import { AUTH_ROUTES, SESSION_COOKIE } from "../../../../../identity/session";

/**
 * One bounded correction save (UX-0005 §11).
 *
 * The area is bound at the call site from the notice the server read, never
 * taken from the submission. That is the whole of §11's boundary: a form that
 * carried its own area could be made to carry a different one, and this action
 * would then be asking to change something the notice never targeted. Here
 * there is nowhere for such a request to travel — and the API refuses it again
 * anyway, which is why the boundary holds even though this is not the only
 * thing keeping it.
 *
 * Nothing here can close a case, move a lifecycle, change a moderation status
 * or touch exposure. `saveCorrectionSchema` has no field for any of them, so
 * §11's list of things the experience does not grant is a fact about the
 * contract rather than a discipline this file observes.
 */
export async function saveCorrectionResponse(
  businessId: string,
  correctionId: string,
  offeringId: string,
  area: "TITLE" | "SUMMARY" | "ATTRIBUTES",
  _previous: ActionState,
  form: FormData
): Promise<ActionState> {
  const jar = await cookies();
  const session = jar.get(SESSION_COOKIE)?.value;
  if (session === undefined) redirect(AUTH_ROUTES.login);

  const parsed = saveCorrectionSchema.safeParse(
    area === "ATTRIBUTES"
      ? {
          area,
          attributes: submittedValues(
            (await fetchOfferingContent(session, businessId, offeringId))
              ?.applicableAttributes ?? [],
            form
          )
        }
      : area === "TITLE"
        ? { area, title: form.get("title") }
        : { area, summary: form.get("summary") }
  );
  if (!parsed.success)
    return {
      fields: z.flattenError(parsed.error).fieldErrors,
      kind: "INVALID"
    };

  const outcome = await saveCorrection(
    session,
    businessId,
    correctionId,
    parsed.data
  );
  revalidatePath(`/businesses/${businessId}/corrections/${correctionId}`);
  revalidatePath(`/businesses/${businessId}`);
  if (outcome.status >= 400) {
    const body = outcome.body as {
      code?: unknown;
      fieldErrors?: Record<string, unknown>;
    };
    const code = typeof body.code === "string" ? body.code : "";
    const published = body.fieldErrors?.publicationMinimum;
    return {
      code,
      kind: "REFUSED",
      message: correctionRefusalMessage(code),
      shortfalls: Array.isArray(published)
        ? published.filter((e): e is string => typeof e === "string")
        : []
    };
  }
  return { kind: "DONE" };
}
