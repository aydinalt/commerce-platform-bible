import { cookies } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { fetchAdminPanel, fetchAnalytics } from "../../platform/api";
import {
  ACTIONABLE_HEADING,
  ANALYTICS_UNAVAILABLE,
  FUNCTION_LABELS,
  NO_DESTINATION_WORKLOAD,
  NO_OPEN_CASES,
  PERIODS,
  PERIOD_LABELS,
  readPeriod
} from "../../platform/panel";
import { AUTH_ROUTES, SESSION_COOKIE } from "../../identity/session";
import { logout } from "../login/actions";
import { AnalyticsTable } from "./analytics-table";

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

  const panel = await fetchAdminPanel(session);
  // Not Enabled, not authorized, or not in Admin context. One answer for all
  // three, exactly as the API gives one.
  if (panel === null) notFound();

  const { period: raw } = await searchParams;
  const period = readPeriod(raw);
  const analytics = await fetchAnalytics(session, period);

  const openCases = analytics?.moderationCases.status.OPEN ?? 0;
  const destinationWork = Object.values(
    analytics?.destinationWorkload ?? {}
  ).reduce((total, count) => total + count, 0);

  return (
    <main>
      <h1>Platform administration</h1>

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
                  {openCases} moderation cases need action
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
                  {destinationWork} Affiliate Destinations are waiting
                </Link>
              )}
            </li>
          </ul>
        )}
      </section>

      <section aria-labelledby="functions">
        <h2 id="functions">What you can do here</h2>
        <ul>
          {panel.functions.map((entry) => (
            <li key={entry}>{FUNCTION_LABELS[entry]}</li>
          ))}
        </ul>
      </section>

      {/* §12.1. The period is in the address, so a reload keeps it and a link
          to a queue can be returned from without losing what was selected. */}
      <nav aria-label="Analytics period">
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
        <button type="submit">Sign out</button>
      </form>
    </main>
  );
}
