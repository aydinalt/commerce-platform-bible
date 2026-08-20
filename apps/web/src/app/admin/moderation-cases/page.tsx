import { cookies } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { ServiceUnavailable } from "../../service-unavailable";
import { isUnavailable, orUnavailable } from "../../unavailable";

import { fetchAdminPanel, fetchModerationCases } from "../../../platform/api";
import {
  NO_CASES,
  RE_REVIEW_REQUIRED_NOTICE,
  TARGET_LABELS
} from "../../../platform/moderation";
import { AUTH_ROUTES, SESSION_COOKIE } from "../../../identity/session";

import type { Metadata } from "next";

export const metadata: Metadata = { title: "Moderation cases" };

const FILTERS = ["OPEN", "CLOSED"] as const;

/**
 * The General Moderation case queue (UX-0006 §7).
 *
 * `status` is the only filter, and that is a statement rather than an
 * omission: a case carries no target state (§7.1), so there is nothing else to
 * filter by. A filter by "Hidden Offerings" would suggest cases and the things
 * they concern are the same, and the whole of §7.1 is that they are not.
 *
 * The Panel is read first. Not for its contents but because it is the gate —
 * an authorization removed since the last page load stops being an entry here
 * as immediately as anywhere else.
 */
export default async function ModerationCasesPage({
  searchParams
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const jar = await cookies();
  const session = jar.get(SESSION_COOKIE)?.value;
  if (session === undefined) redirect(AUTH_ROUTES.login);

  const panel = await orUnavailable(fetchAdminPanel(session));
  /*
   * Two answers where there was one. `notFound()` answered both, so during an
   * outage every Admin route said the Admin panel does not exist — the same claim the
   * API deliberately makes to somebody who is not an Admin, which is exactly
   * why it must not also be made to somebody who is.
   */
  if (isUnavailable(panel))
    return <ServiceUnavailable retryPath="/admin/moderation-cases" />;
  if (panel === null) notFound();

  const { status: raw } = await searchParams;
  const status = FILTERS.includes(raw as "OPEN" | "CLOSED")
    ? (raw as "OPEN" | "CLOSED")
    : "OPEN";
  const read = await orUnavailable(fetchModerationCases(session, status));
  const cases = isUnavailable(read) ? null : read;

  return (
    <main lang="en">
      <p>
        <Link href="/admin">Platform administration</Link>
      </p>
      <h1>Moderation cases</h1>

      <nav aria-label="Case status">
        <ul>
          {FILTERS.map((entry) => (
            <li key={entry}>
              {entry === status ? (
                <strong>{entry === "OPEN" ? "Open" : "Closed"}</strong>
              ) : (
                <Link href={`/admin/moderation-cases?status=${entry}`}>
                  {entry === "OPEN" ? "Open" : "Closed"}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {cases === null ? (
        <p role="alert">The cases could not be loaded.</p>
      ) : cases.length === 0 ? (
        <p>{NO_CASES}</p>
      ) : (
        <ul>
          {cases.map((entry) => (
            <li key={entry.id}>
              <h2>
                <Link href={`/admin/moderation-cases/${entry.id}`}>
                  {TARGET_LABELS[entry.targetType]}
                </Link>
              </h2>
              <p>Opened {entry.openedAt}</p>
              {/* §8. The owner answered and nobody has looked since. It is
                  surfaced in the queue because it is work waiting, not a
                  property of the case somebody has to open it to find. */}
              {entry.reReviewRequired ? (
                <p role="status">{RE_REVIEW_REQUIRED_NOTICE}</p>
              ) : null}
              <p>
                {entry.resolutions.length === 0
                  ? "Nothing recorded yet."
                  : `${entry.resolutions.length} recorded decisions.`}
              </p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
