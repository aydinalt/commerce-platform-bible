import { cookies } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { ServiceUnavailable } from "../service-unavailable";
import { isUnavailable, orUnavailable } from "../unavailable";

import { fetchAdminPanel, fetchAnalytics } from "../../platform/api";
import {
  ACTIONABLE_HEADING,
  ANALYTICS_UNAVAILABLE,
  FUNCTION_HREFS,
  FUNCTION_LABELS,
  NO_DESTINATION_WORKLOAD,
  NO_OPEN_CASES,
  PERIODS,
  PERIOD_LABELS,
  readPeriod
} from "../../platform/panel";
import { PANEL } from "../../platform/copy";
import { AUTH_ROUTES, SESSION_COOKIE } from "../../identity/session";
import { logout } from "../login/actions";
import { AnalyticsTable } from "./analytics-table";

import type { Metadata } from "next";

export const metadata: Metadata = { title: PANEL.title };

/**
 * The Admin Dashboard (UX-0006).
 *
 * §5.2's three conditions are re-evaluated here on every request, and the API
 * evaluates them again on every read. An Enabled account, a live Admin
 * authorization and an explicitly entered Admin context are all required, and
 * the page cannot tell which is missing — nor should it, because a screen that
 * distinguished them would be a way of testing whether an authorization
 * exists.
 *
 * The functions offered are the ones `US-PLT-F01-001` composed. No provisioning
 * verb is among them, because none is a value that vocabulary can hold: §13
 * leaves establishing, granting and removing Admin authorization to the Product
 * Owner, outside this application entirely.
 *
 * There is no generic configuration area (§6). A settings page is where
 * ungoverned switches accumulate, and every governed thing here already has a
 * Story that owns it.
 */
export default async function AdminDashboardPage({
  searchParams
}: {
  searchParams: Promise<{ period?: string }>;
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
  if (isUnavailable(panel)) return <ServiceUnavailable retryPath="/admin" />;
  if (panel === null) notFound();

  const { period: raw } = await searchParams;
  const period = readPeriod(raw);
  /*
   * Wrapped because the read now throws on a 5xx rather than answering `null`.
   * The two existing `analytics === null` branches already said "unavailable"
   * rather than showing zero — UX-0006 §14's "distinguish zero from
   * unavailable" was honoured here — so this keeps that reaching them instead
   * of letting the failure take the moderation surfaces down with it, which
   * §15's last line forbids.
   */
  const read = await orUnavailable(fetchAnalytics(session, period));
  const analytics = isUnavailable(read) ? null : read;

  const openCases = analytics?.moderationCases.status.OPEN ?? 0;
  const destinationWork = Object.values(
    analytics?.destinationWorkload ?? {}
  ).reduce((total, count) => total + count, 0);

  return (
    <main>
      <h1>{PANEL.title}</h1>

      {/* §6. The queues that are waiting for an Admin, kept apart from the
          figures that merely describe the platform. Mixing them would make
          the work harder to find in proportion to how much there is to
          read. */}
      <section aria-labelledby="actionable">
        <h2 id="actionable">{ACTIONABLE_HEADING}</h2>
        {analytics === null ? (
          <p role="alert">{ANALYTICS_UNAVAILABLE}</p>
        ) : (
          <ul>
            <li>
              {openCases === 0 ? (
                NO_OPEN_CASES
              ) : (
                <Link href="/admin/moderation-cases">
                  {PANEL.casesWaiting(openCases)}
                </Link>
              )}
            </li>
            <li>
              {/* §14. An empty Affiliate workload is said as itself and is not
                  replaced by a General Moderation substitute: the two are
                  separate bodies of work and §9 keeps them separate. */}
              {destinationWork === 0 ? (
                NO_DESTINATION_WORKLOAD
              ) : (
                <Link href="/admin/destinations">
                  {PANEL.destinationsWaiting(destinationWork)}
                </Link>
              )}
            </li>
          </ul>
        )}
      </section>

      <section aria-labelledby="functions">
        <h2 id="functions">{PANEL.actions}</h2>
        <ul>
          {panel.functions.map((entry) => (
            <li key={entry}>
              {/* Linked where the function has a place of its own; named
                  where it is something done to a target you arrived at. */}
              {FUNCTION_HREFS[entry] === null ? (
                FUNCTION_LABELS[entry]
              ) : (
                <Link href={FUNCTION_HREFS[entry]}>
                  {FUNCTION_LABELS[entry]}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </section>

      {/* §12.1. The period is in the address, so a reload keeps it and a link
          to a queue can be returned from without losing what was selected. */}
      <nav aria-label={PANEL.analyticsPeriod}>
        <ul>
          {PERIODS.map((entry) => (
            <li key={entry}>
              {entry === period ? (
                <strong>{PERIOD_LABELS[entry]}</strong>
              ) : (
                <Link href={`/admin?period=${entry}`}>
                  {PERIOD_LABELS[entry]}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* §14. Unavailable is not zero, and the difference matters: one is a
          figure to act on and the other is a question that was not answered.
          §15 also keeps this failure local — the queues above are read from
          the same response, but nothing here blocks the moderation surfaces
          that have their own data. */}
      {analytics === null ? (
        <p role="alert">{ANALYTICS_UNAVAILABLE}</p>
      ) : (
        <AnalyticsTable analytics={analytics} />
      )}

      {/* §5.1. Logout is requested here and executed by UX-0008, which owns it
          wherever it is asked for. */}
      <form action={logout}>
        <button type="submit">{PANEL.signOut}</button>
      </form>
    </main>
  );
}
