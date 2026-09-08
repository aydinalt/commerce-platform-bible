"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { reviewListingReport } from "../../../platform/api";
import { AUTH_ROUTES, SESSION_COOKIE } from "../../../identity/session";

/**
 * Closing one reader report (I69).
 *
 * Two outcomes and neither of them touches the listing. `ACCEPTED` records that
 * an Admin agrees there is something to fix; what is then done about it happens
 * through the Stories that own the consequences — a Moderation Case, a
 * correction request, a message to the partner. A report queue that could hide
 * an Offering directly would be a second moderation system with none of the
 * first one's rules.
 *
 * The queue is revalidated rather than redirected away from: an Admin closing
 * the third of forty reports is still working through the forty.
 */
export async function reviewReport(form: FormData): Promise<void> {
  const jar = await cookies();
  const session = jar.get(SESSION_COOKIE)?.value;
  if (session === undefined) redirect(AUTH_ROUTES.login);

  const reportId = form.get("reportId");
  const outcome = form.get("outcome");
  if (
    typeof reportId !== "string" ||
    reportId === "" ||
    (outcome !== "ACCEPTED" && outcome !== "DISMISSED")
  )
    return;

  /*
   * A report somebody else closed in the meantime answers `false`. Nothing is
   * shown about it beyond the queue no longer holding it: the work is done, and
   * which Admin did it is in the row rather than in an interruption. The
   * sentence for a surface that wants to say it is `REPORTS.alreadyReviewed`,
   * read from the copy module directly.
   *
   * **It used to be re-exported from here, and that broke the build.** A
   * `"use server"` file may export async functions and nothing else, so
   * `export const ALREADY_REVIEWED = REPORTS.alreadyReviewed` turned every
   * production build of `/admin/listing-reports` into a hard failure — while
   * `typecheck`, `lint` and 1244 tests all passed, because none of them runs
   * `next build`. Found by I75 running the full verification.
   */
  await reviewListingReport({ outcome, reportId, session });
  revalidatePath("/admin/listing-reports");
}
