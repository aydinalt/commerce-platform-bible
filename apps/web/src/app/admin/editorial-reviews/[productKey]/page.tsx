import { cookies } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { ServiceUnavailable } from "../../../service-unavailable";
import { isUnavailable, orUnavailable } from "../../../unavailable";

import { EditorialReviewPresentation } from "../../../../editorial/review-presentation";
import {
  fetchAdminPanel,
  fetchEditorialReview
} from "../../../../platform/api";
import { EDITORIAL } from "../../../../platform/copy";
import {
  actsAvailable,
  sinceLastChecked
} from "../../../../platform/editorial";
import { SUBMIT } from "../../../../form-copy";
import { AUTH_ROUTES, SESSION_COOKIE } from "../../../../identity/session";
import { When } from "../../../../platform/when";
import {
  publishEditorialReview,
  recheckEditorialReview,
  saveEditorialReview,
  withdrawEditorialReview
} from "../actions";
import { EditorialAct, SaveEditorialReview } from "../editorial-forms";

import type { Metadata } from "next";

export const metadata: Metadata = { title: EDITORIAL.title };

/**
 * One editorial review, and the acts its state allows (I94, `UX-0006`
 * **Frozen v1.2** §12C).
 *
 * **Saving, publishing, re-checking and withdrawing are four controls, not one
 * with a verb in it.** `PRD-0009` §13.4 makes re-checking a separate act from
 * saving in as many words, and a single control carrying `{ status, checked }`
 * would put the two back together at the one layer where the distinction has to
 * hold. The route names are the acts the audit trail records.
 *
 * **There is no delete control and there is not meant to be** (AC-7, §12C.12).
 * Withdrawal exists so that removal is not a database operation.
 */
export default async function EditorialReviewPage({
  params
}: {
  params: Promise<{ productKey: string }>;
}) {
  const { productKey } = await params;
  const jar = await cookies();
  const session = jar.get(SESSION_COOKIE)?.value;
  if (session === undefined) redirect(AUTH_ROUTES.login);

  const panel = await orUnavailable(fetchAdminPanel(session));
  if (isUnavailable(panel))
    return (
      <ServiceUnavailable
        retryPath={`/admin/editorial-reviews/${encodeURIComponent(productKey)}`}
      />
    );
  if (panel === null) notFound();

  const read = await orUnavailable(fetchEditorialReview(session, productKey));
  if (isUnavailable(read))
    return (
      <ServiceUnavailable
        retryPath={`/admin/editorial-reviews/${encodeURIComponent(productKey)}`}
      />
    );
  if (read === null) notFound();

  const acts = actsAvailable(read.status);
  const age = sinceLastChecked(read.lastCheckedAt);

  return (
    <main>
      <p>
        <Link href="/admin/editorial-reviews">{EDITORIAL.title}</Link>
      </p>
      <h1>{read.productKey}</h1>

      <section>
        <h2>{EDITORIAL.status}</h2>
        <ul>
          <li>
            <span>{EDITORIAL.status}</span>
            <span>{EDITORIAL.statuses[read.status]}</span>
          </li>
          {/*
            Both dates, and neither standing for the other (AC-9, AC-11). The
            first-published date is set once and never moves; the re-check date
            moves only when the writer says so. A review never re-checked says
            so rather than showing its publication date twice.
          */}
          <li>
            <span>{EDITORIAL.published}</span>
            <span>
              {read.publishedAt === null ? (
                "—"
              ) : (
                <When value={read.publishedAt} withTime={false} />
              )}
            </span>
          </li>
          <li>
            <span>{EDITORIAL.lastChecked}</span>
            <span>
              {age === null ? EDITORIAL.neverChecked : EDITORIAL.since(age)}
            </span>
          </li>
        </ul>
      </section>

      <section>
        <SaveEditorialReview
          action={saveEditorialReview.bind(null, read.id, read.productKey)}
          review={read}
        />
      </section>

      {/*
        §12C.7. The preview is the reader's presentation, rendered from the
        saved draft — not a second design of the review, which is why it is the
        same component `EDT F01` will place on the Offering presentation.

        It lives here and nowhere else. No address exists at which an
        unpublished review can be read, with or without a token: AC-5 says no
        Draft reaches any reader-facing surface, and a preview URL that could be
        sent to a reader is a reader-facing surface with an apology attached.

        It shows the draft's absences as absences. A review with no cons
        previews with no cons rather than a placeholder, because the point of
        looking is to see what is missing before publication refuses it.
      */}
      <section>
        <h2>{EDITORIAL.preview}</h2>
        <p>{EDITORIAL.previewNote}</p>
        <EditorialReviewPresentation review={read} />
      </section>

      <section>
        {acts.publish ? (
          <EditorialAct
            action={publishEditorialReview.bind(null, read.id, read.productKey)}
            label={EDITORIAL.publish}
            note={EDITORIAL.publishHelp}
            submit={SUBMIT.publish}
          />
        ) : null}

        {/*
          AC-10. Offered on a Published review and on no other: a Draft has
          never been presented, and a Withdrawn review is presented nowhere, so
          re-checking either would claim currency for something nobody can read.

          It is its own control and is never a checkbox on the save form — a
          re-check that happens by default is a claim the platform makes without
          anybody having made it.
        */}
        {acts.recheck ? (
          <EditorialAct
            action={recheckEditorialReview.bind(null, read.id, read.productKey)}
            label={EDITORIAL.recheck}
            note={EDITORIAL.recheckHelp}
            submit={SUBMIT.recheck}
          />
        ) : null}

        {acts.withdraw ? (
          <EditorialAct
            action={withdrawEditorialReview.bind(
              null,
              read.id,
              read.productKey
            )}
            label={EDITORIAL.withdraw}
            note={EDITORIAL.withdrawHelp}
            submit={SUBMIT.withdraw}
          />
        ) : null}
      </section>
    </main>
  );
}
