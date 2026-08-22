import Link from "next/link";

import type { CorrectionNotice } from "@commerce/contracts";

import { CORRECTION } from "../../../business/copy";

import {
  CONTENT_AREA_COPY,
  NO_NOTICES,
  RE_REVIEW_COPY,
  TARGET_COPY,
  noticeEntry
} from "../../../business/corrections";

/**
 * Correction notices (UX-0005 §12).
 *
 * Every element here is a reading. There is no button that acknowledges a
 * notice, none that dismisses one and none that replies: `US-BUS-F07-001` AC-5
 * says reading changes no state and AC-6 rules out Messaging, so the surest
 * way to keep both is to render nothing that submits.
 *
 * A notice with nowhere to go is still shown. Its `managementArea` is `null`
 * because the owner is not authorized for that area right now, which is a fact
 * about them and not about the notice — hiding it would leave someone unaware
 * that something was asked of their Business.
 */
export function CorrectionNotices({
  businessId,
  notices
}: {
  businessId: string;
  notices: CorrectionNotice[];
}) {
  const open = notices.filter((notice) => notice.caseStatus === "OPEN");

  return (
    <section aria-labelledby="corrections">
      <h2 id="corrections">{CORRECTION.noticesHeading}</h2>
      {open.length === 0 ? (
        /* §14. One sentence, and nothing that stands in for an inbox. */
        <p>{NO_NOTICES}</p>
      ) : (
        <ul>
          {open.map((notice) => {
            const entry = noticeEntry(businessId, notice);
            return (
              <li key={notice.id}>
                <p>{TARGET_COPY[notice.target]}</p>
                {/* The notice stays bounded to its target: where an exact
                    content area was named, it is named here too, and where
                    none was, none is invented. */}
                {notice.contentArea === null ? null : (
                  <p>{CONTENT_AREA_COPY[notice.contentArea]}</p>
                )}
                {notice.note === null ? null : <p>{notice.note}</p>}
                {entry === null ? null : (
                  <p>
                    <Link href={entry.href}>{entry.label}</Link>
                  </p>
                )}
                {notice.reReviewRequired ? <p>{RE_REVIEW_COPY}</p> : null}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
