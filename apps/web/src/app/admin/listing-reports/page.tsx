import { cookies } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { ServiceUnavailable } from "../../service-unavailable";
import { isUnavailable, orUnavailable } from "../../unavailable";

import { fetchAdminPanel, fetchListingReports } from "../../../platform/api";
import { CASES, PANEL, REPORTS } from "../../../platform/copy";
import { TERMS } from "../../../vocabulary";
import { OpenCase } from "../open-case";
import { openCaseFor } from "../open-case-action";
import { When } from "../../../platform/when";
import { AUTH_ROUTES, SESSION_COOKIE } from "../../../identity/session";

import { reviewReport } from "./actions";

import type { Metadata } from "next";

export const metadata: Metadata = { title: REPORTS.title };

const FILTERS = ["OPEN", "ACCEPTED", "DISMISSED"] as const;

const FILTER_LABELS: Record<(typeof FILTERS)[number], string> = {
  ACCEPTED: REPORTS.accepted,
  DISMISSED: REPORTS.dismissed,
  OPEN: REPORTS.open
};

/**
 * The queue of reader reports (I69).
 *
 * **Oldest first, and that is the whole layout decision.** Every other list on
 * this platform shows the newest first because it is news; this is work, and a
 * queue arranged by arrival would let the oldest report sit unread forever
 * behind a page of new ones.
 *
 * The Panel is read first for the reason every Admin route reads it: an
 * authorization removed since the last page load stops being an entry here as
 * immediately as anywhere else.
 */
export default async function ListingReportsPage({
  searchParams
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const jar = await cookies();
  const session = jar.get(SESSION_COOKIE)?.value;
  if (session === undefined) redirect(AUTH_ROUTES.login);

  const panel = await orUnavailable(fetchAdminPanel(session));
  if (isUnavailable(panel))
    return <ServiceUnavailable retryPath="/admin/listing-reports" />;
  if (panel === null) notFound();

  const { status: raw } = await searchParams;
  const status = FILTERS.includes(raw as (typeof FILTERS)[number])
    ? (raw as (typeof FILTERS)[number])
    : "OPEN";
  const read = await orUnavailable(fetchListingReports(session, status));
  const queue = isUnavailable(read) ? null : read;
  const reports = queue?.reports ?? null;

  return (
    <main>
      <p>
        <Link href="/admin">{PANEL.title}</Link>
      </p>
      <h1>{REPORTS.title}</h1>

      <nav aria-label={REPORTS.statusFilter}>
        <ul>
          {FILTERS.map((entry) => (
            <li key={entry}>
              {entry === status ? (
                <strong>{FILTER_LABELS[entry]}</strong>
              ) : (
                <Link href={`/admin/listing-reports?status=${entry}`}>
                  {FILTER_LABELS[entry]}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {reports === null || queue === null ? (
        <p role="alert">{REPORTS.unreadable}</p>
      ) : reports.length === 0 ? (
        <p>{REPORTS.none}</p>
      ) : (
        <>
          {/*
            How many there are, and — when the API's page does not hold them
            all — that it does not (I81).

            The queue answers at most `QUEUE_PAGE` rows. This page used to show
            those rows and nothing else, so an Admin with four hundred open
            reports saw a hundred and had no way to learn the rest existed.
            Saying the total is the smaller half of the fix; saying that the
            list below is *not* the total is the half that stops somebody
            concluding the queue is empty when it is not.

            Not paged, and deliberately so: the queue is oldest-first and exists
            to be emptied, so working the hundred on this page brings the next
            hundred into it. Paging would offer an Admin the choice of which
            part of a backlog to look at, which is the choice the controller
            declines to offer when it fixes the page size.
          */}
          <p role="status">
            {REPORTS.waiting(queue.total)}
            {queue.total > reports.length
              ? ` — ${REPORTS.showingOldest(reports.length)}`
              : ""}
          </p>
          <ul>
            {reports.map((report) => (
              <li key={report.reportId}>
                <h2>{REPORTS.reasons[report.reason]}</h2>
                <p>
                  {REPORTS.listing}:{" "}
                  <Link href={`/offerings/${report.offeringSlug}`}>
                    {report.offeringTitle}
                  </Link>{" "}
                  ({REPORTS.listingNumber}: {report.listingNumber})
                </p>
                <p>
                  {REPORTS.submitted}: <When value={report.submittedAt} />
                </p>
                {/* The pattern, surfaced in the queue rather than found by
                  opening rows one at a time: one person saying a price is wrong
                  is a claim, six people saying it is today's work. */}
                {report.reportsForListing > 1 ? (
                  <p role="status">
                    {REPORTS.sameListing(report.reportsForListing)}
                  </p>
                ) : null}
                {/*
                A stranger's text, rendered as text. React escapes it, and
                nothing here interprets it: the note is evidence, not content
                the platform is publishing.
              */}
                {report.note === null ? null : (
                  <blockquote>{report.note}</blockquote>
                )}

                {/*
                  I82. The step that was missing after "haklı — işlem gerekiyor".

                  Accepting a report records a judgement and deliberately does
                  nothing to the listing: PRD-0006 §21.4 keeps the report queue
                  from being a second moderation system. So the Admin who
                  accepts one has to open a case — and until now no control
                  anywhere in the panel could open one, which left the whole
                  acceptance path ending in a dead stop.
                */}
                <OpenCase
                  label={CASES.openFor(TERMS.offering)}
                  open={openCaseFor.bind(null, {
                    offeringId: report.offeringId,
                    targetType: "OFFERING"
                  })}
                  targetName={report.offeringTitle}
                />

                {report.status === "OPEN" ? (
                  <form action={reviewReport}>
                    <input
                      name="reportId"
                      type="hidden"
                      value={report.reportId}
                    />
                    <button name="outcome" type="submit" value="ACCEPTED">
                      {REPORTS.accept}
                    </button>
                    <button name="outcome" type="submit" value="DISMISSED">
                      {REPORTS.dismiss}
                    </button>
                  </form>
                ) : null}
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
