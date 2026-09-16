"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { adminPost, adminPut } from "../../../platform/api";
import {
  draftFromForm,
  editorialRefusal,
  missingParts
} from "../../../platform/editorial";
import { AUTH_ROUTES, SESSION_COOKIE } from "../../../identity/session";
import {
  ADMIN_IDLE,
  type AdminActionState
} from "../../../platform/admin-state";

/**
 * The five editorial acts (I94, `UX-0006` **Frozen v1.2** §12C.2).
 *
 * **Five actions rather than one that takes a verb**, matching the five routes
 * `I93` built and the five entries the trail records. A single action carrying
 * `{ act }` would put saving and re-checking back into one call at the one
 * layer where `PRD-0009` §13.4 requires them apart, and the payload would be
 * the obvious place for a future caller to set both at once.
 *
 * None of these decides anything. Each sends what was asked and reports what
 * came back — the transitions, the publication requirements and the refusals
 * all live in `modules/editorial` and the database, so an action that
 * pre-judged would only be able to disagree with them.
 */

async function sessionOrLogin(): Promise<string> {
  const jar = await cookies();
  const session = jar.get(SESSION_COOKIE)?.value;
  if (session === undefined) redirect(AUTH_ROUTES.login);
  return session;
}

/**
 * A refusal, turned into the sentence a writer reads.
 *
 * **An incomplete publication names every missing part, not the first.** The
 * domain returns them all in a fixed order for that reason (§12C.8); losing
 * them here would make a writer publish four times to learn four things.
 */
function outcome(result: { body: unknown; status: number }): AdminActionState {
  if (result.status < 400) return { kind: "DONE" };
  const payload = result.body as { code?: unknown; missing?: unknown };
  const code = typeof payload.code === "string" ? payload.code : "";
  const message = editorialRefusal(code);

  if (code === "EDITORIAL_REVIEW_INCOMPLETE" && Array.isArray(payload.missing))
    return {
      kind: "REFUSED",
      message: `${message} ${missingParts(
        payload.missing.filter(
          (part): part is string => typeof part === "string"
        )
      ).join(", ")}`
    };

  return { kind: "REFUSED", message };
}

/**
 * AC-14, AC-15. Creating the first draft for a Product Key.
 *
 * **Creating never publishes.** The review is held in Draft and publication is
 * a separate act, which is why this returns to the review rather than to any
 * public address.
 */
export async function createEditorialReview(
  _previous: AdminActionState,
  form: FormData
): Promise<AdminActionState> {
  const session = await sessionOrLogin();
  const productKey = form.get("productKey");
  if (typeof productKey !== "string" || productKey.trim() === "")
    return ADMIN_IDLE;

  const result = await adminPost(session, "/admin/editorial-reviews", {
    ...draftFromForm(form),
    productKey: productKey.trim()
  });
  revalidatePath("/admin/editorial-reviews");
  return outcome(result);
}

/**
 * Saving — editing a draft and revising a published review (§12C.6).
 *
 * **It moves neither date**, and the guarantee is structural rather than
 * careful: the payload this sends has no field for either, the route it reaches
 * does not name them, and the column that would otherwise drift is called
 * `last_checked_at` rather than `updated_at`. Three defences, because the
 * failure is silent — a review would keep presenting a re-check nobody had
 * earned.
 */
export async function saveEditorialReview(
  reviewId: string,
  productKey: string,
  _previous: AdminActionState,
  form: FormData
): Promise<AdminActionState> {
  const session = await sessionOrLogin();
  const result = await adminPut(
    session,
    `/admin/editorial-reviews/${reviewId}`,
    draftFromForm(form)
  );
  revalidatePath(`/admin/editorial-reviews/${productKey}`);
  return outcome(result);
}

/** AC-12. Refused unless every part §13.5 requires is present. */
export async function publishEditorialReview(
  reviewId: string,
  productKey: string,
  _previous: AdminActionState,
  _form: FormData
): Promise<AdminActionState> {
  const session = await sessionOrLogin();
  const result = await adminPost(
    session,
    `/admin/editorial-reviews/${reviewId}/publication`
  );
  revalidatePath(`/admin/editorial-reviews/${productKey}`);
  return outcome(result);
}

/**
 * AC-9, AC-10. The act that moves the re-check date, and the only one.
 *
 * **It sends no body**, which is the point rather than an economy. There is
 * nothing to state beyond that the check happened, and a payload would invite a
 * caller to send this alongside a save — exactly the collapse §13.4 forbids.
 */
export async function recheckEditorialReview(
  reviewId: string,
  productKey: string,
  _previous: AdminActionState,
  _form: FormData
): Promise<AdminActionState> {
  const session = await sessionOrLogin();
  const result = await adminPost(
    session,
    `/admin/editorial-reviews/${reviewId}/recheck`
  );
  revalidatePath(`/admin/editorial-reviews/${productKey}`);
  return outcome(result);
}

/**
 * AC-6, AC-7. Withdrawal, which is how a wrong judgement comes down.
 *
 * There is no delete action in this file and there is not meant to be
 * (§12C.12). The review stops being presented; that it existed, and who
 * withdrew it, stays in the trail.
 */
export async function withdrawEditorialReview(
  reviewId: string,
  productKey: string,
  _previous: AdminActionState,
  _form: FormData
): Promise<AdminActionState> {
  const session = await sessionOrLogin();
  const result = await adminPost(
    session,
    `/admin/editorial-reviews/${reviewId}/withdrawal`
  );
  revalidatePath(`/admin/editorial-reviews/${productKey}`);
  return outcome(result);
}
