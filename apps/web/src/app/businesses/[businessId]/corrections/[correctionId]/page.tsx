import { cookies } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { ServiceUnavailable } from "../../../../service-unavailable";
import { isUnavailable, orUnavailable } from "../../../../unavailable";

import {
  fetchCorrectionNotices,
  fetchOfferingContent
} from "../../../../../business/api";
import {
  CONTENT_AREA_COPY,
  RE_REVIEW_COPY,
  TARGET_COPY
} from "../../../../../business/corrections";
import { AUTH_ROUTES, SESSION_COOKIE } from "../../../../../identity/session";
import { saveCorrectionResponse } from "./actions";
import { CorrectionForm } from "./correction-form";

import type { Metadata } from "next";

export const metadata: Metadata = { title: "Correction notice" };

/**
 * The bounded correction-edit path (UX-0005 §11).
 *
 * Its own address, because it is its own permission. PRD-0005 §8.3.1 opens
 * this path only for the exact Offering a notice identified and only for the
 * exact content area it targeted, and the way to keep that exact is to make
 * the correction the thing being addressed. There is no route here that names
 * an Offering, so no unrelated Offering can be reached under this authority.
 *
 * Whether the path is open is `boundedEditAvailable`, composed by
 * `US-BUS-F07-001` from PRD-0005's five conditions as one answer. This page
 * repeats none of them: five conditions restated here would be a second
 * definition, and a path enterable with four of them satisfied would be a way
 * around restriction rather than a narrow exception to it.
 */
export default async function CorrectionPage({
  params
}: {
  params: Promise<{ businessId: string; correctionId: string }>;
}) {
  const { businessId, correctionId } = await params;
  const jar = await cookies();
  const session = jar.get(SESSION_COOKIE)?.value;
  if (session === undefined) redirect(AUTH_ROUTES.login);

  const notices = await orUnavailable(
    fetchCorrectionNotices(session, businessId)
  );
  /*
   * Two answers where there was one. This route is the sharpest case: a
   * correction notice is the platform asking a Business owner to do something,
   * and `notFound()` during an outage told them the request they were answering
   * does not exist.
   */
  if (isUnavailable(notices))
    return (
      <ServiceUnavailable
        retryPath={`/businesses/${businessId}/corrections/${correctionId}`}
      />
    );
  if (notices === null) notFound();
  const notice = notices.find((candidate) => candidate.id === correctionId);
  // Not theirs, or not there. The same answer, as everywhere else.
  if (notice === undefined) notFound();

  const back = (
    <p>
      <Link href={`/businesses/${businessId}`}>Back to your Business</Link>
    </p>
  );

  // The path is closed, or this notice was never one that opened it. Either
  // way the notice is still shown, because it is still something asked of this
  // Business — and no reason is invented for the form's absence.
  if (
    !notice.boundedEditAvailable ||
    notice.offeringId === null ||
    notice.contentArea === null
  )
    return (
      <main lang="en">
        {back}
        <h1>Correction notice</h1>
        <p>{TARGET_COPY[notice.target]}</p>
        {notice.note === null ? null : <p>{notice.note}</p>}
      </main>
    );

  const content = await orUnavailable(
    fetchOfferingContent(session, businessId, notice.offeringId)
  );
  if (isUnavailable(content))
    return (
      <ServiceUnavailable
        retryPath={`/businesses/${businessId}/corrections/${correctionId}`}
      />
    );
  if (content === null) notFound();

  return (
    <main lang="en">
      {back}
      <h1>{content.title}</h1>
      <p>{TARGET_COPY[notice.target]}</p>
      <p>{CONTENT_AREA_COPY[notice.contentArea]}</p>
      {notice.note === null ? null : <p>{notice.note}</p>}
      {/* §11, said before the form rather than after the save: the person
          deciding what to write deserves to know it will not end the case. */}
      <p>{RE_REVIEW_COPY}</p>

      <CorrectionForm
        action={saveCorrectionResponse.bind(
          null,
          businessId,
          correctionId,
          notice.offeringId,
          notice.contentArea
        )}
        area={notice.contentArea}
        content={content}
      />
    </main>
  );
}
