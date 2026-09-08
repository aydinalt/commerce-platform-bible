import { cookies } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { ServiceUnavailable } from "../../service-unavailable";
import { isUnavailable, orUnavailable } from "../../unavailable";

import { fetchAdminPanel, fetchAnalytics } from "../../../platform/api";
import { ANALYTICS_UNAVAILABLE, readPeriod } from "../../../platform/panel";
import { OVERVIEW, PANEL } from "../../../platform/copy";
import { featureEnabled } from "../../../platform/flags";
import { AUTH_ROUTES, SESSION_COOKIE } from "../../../identity/session";
import { EngagementBars } from "./engagement-bars";
import { MetricCard, MetricGrid } from "./metric-card";
import { PageHead } from "../../../platform/page-head";
import { PeriodTabs } from "./period-tabs";

import type { Metadata } from "next";

export const metadata: Metadata = { title: OVERVIEW.title };

/** The sum of a tally, for a card that counts a whole rather than a status. */
function total(tally: Record<string, number>): number {
  return Object.values(tally).reduce((sum, count) => sum + count, 0);
}

/**
 * The overview dashboard (I79, `UX-0006` §12).
 *
 * The Owner asked for a SmartHR-styled panel: metric cards at the top, the
 * engagement report drawn beneath them. This is that surface, and the important
 * thing about it is what it is **not**.
 *
 * **It is not a second source of figures.** Every number comes from
 * `/admin/analytics` — one request, the same one the existing panel makes — and
 * this page computes nothing the API did not already answer. A dashboard that
 * derived its own totals would become the place where two surfaces start
 * disagreeing about how many listings there are, and the one people believe
 * would be whichever they opened first.
 *
 * **It does not replace `/admin`.** The old panel keeps every queue, function
 * and table it had, and this page links to it. The Owner asked for a dashboard,
 * not for the removal of the surface that works; and behind a flag, a
 * replacement nobody had adopted yet would leave an Admin with neither.
 *
 * **It has no verb.** Like the analytics controller it reads from, there is
 * nothing on this page that changes anything — `US-PLT-F10-001` AC-17 forbids a
 * dashboard performing management automatically, and the way to guarantee that
 * is for the surface to have no action on it at all. Every card and bar is
 * either a figure or a link to the queue that owns the work.
 *
 * **The three §5.2 conditions are re-evaluated here and again by the API**, as
 * they are on every other Admin route: an Enabled account, a live Admin
 * authorization, and an explicitly entered Admin context. This page adds no
 * authorization tier of its own — there is exactly one, `adminContext`, and it
 * is the same gate every Admin surface passes.
 *
 * **It carries no `className`.** The visual system comes from the `workspace`
 * segment layout — the panel, the ruled heading, the wide measure — and the two
 * patterns this surface adds are components beside this file rather than markup
 * in it. `i48-management-surfaces` asserts that, so a later increment reaching
 * for a class here has to answer the question out loud.
 */
export default async function AdminOverviewPage({
  searchParams
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  // The flag is checked before the session, so an unadopted surface is a `404`
  // to everybody rather than a login prompt that leads to one.
  if (!featureEnabled("ADMIN_DASHBOARD")) notFound();

  const jar = await cookies();
  const session = jar.get(SESSION_COOKIE)?.value;
  if (session === undefined) redirect(AUTH_ROUTES.login);

  const panel = await orUnavailable(fetchAdminPanel(session));
  if (isUnavailable(panel))
    return <ServiceUnavailable retryPath="/admin/overview" />;
  // The same claim the API makes to somebody who is not an Admin, made here for
  // the same reason: a surface that answered differently would be a way of
  // testing whether an Admin authorization exists.
  if (panel === null) notFound();

  const { period: raw } = await searchParams;
  const period = readPeriod(raw);
  const read = await orUnavailable(fetchAnalytics(session, period));
  const analytics = isUnavailable(read) ? null : read;

  return (
    <main>
      {/* The reference template's top row: title and breadcrumb on the left,
          what you can do from here on the right (I82). */}
      <PageHead
        action={{ href: "/admin", label: OVERVIEW.fullPanel }}
        crumbs={[{ href: "/admin", label: OVERVIEW.breadcrumbRoot }]}
        title={OVERVIEW.title}
      />

      <PeriodTabs base="/admin/overview" period={period} />

      {/*
        §14. Unavailable is not zero.

        The cards are rendered either way — each one says so for itself rather
        than the section vanishing — because a dashboard that disappeared during
        an outage would leave an Admin unable to tell a broken read from a quiet
        platform.
      */}
      <section aria-labelledby="metrics">
        <h2 id="metrics">{OVERVIEW.metricsTitle}</h2>
        <MetricGrid>
          {/*
            The Owner asked for "toplam ilan", and the total is what the figure
            is. The publicly eligible count rides underneath rather than in
            place of it: they are two different facts — §12.3 keeps lifecycle
            and final public eligibility as separate indicators, because a
            Published listing is not necessarily a visible one — and a single
            card showing only the second under a heading saying "how many
            listings" would quietly answer a question nobody asked.
          */}
          <MetricCard
            detail={
              analytics === null
                ? undefined
                : `${OVERVIEW.eligible}: ${(
                    analytics.offerings.publicEligibility.ELIGIBLE ?? 0
                  ).toLocaleString("tr-TR")}`
            }
            heading={OVERVIEW.listings}
            mark="◉"
            value={
              analytics === null ? null : total(analytics.offerings.lifecycle)
            }
          />
          {/* Only the two workload cards carry a footer link, and that is
              AC-15/AC-16 rather than a layout choice: an actionable indicator
              opens the queue it counts, and the others are figures with nowhere
              to go. The template gives every card a "View All"; copying that
              would invent two destinations that do not exist. */}
          <MetricCard
            heading={OVERVIEW.casesOpen}
            href={analytics?.actionable.OPEN_MODERATION_CASES ?? undefined}
            linkLabel={OVERVIEW.viewQueue}
            mark="⚑"
            value={
              analytics === null
                ? null
                : (analytics.moderationCases.status.OPEN ?? 0)
            }
          />
          <MetricCard
            heading={OVERVIEW.businesses}
            mark="▣"
            value={analytics === null ? null : total(analytics.businesses)}
          />
          <MetricCard
            heading={OVERVIEW.destinations}
            href={analytics?.actionable.DESTINATION_WORKLOAD ?? undefined}
            linkLabel={OVERVIEW.viewQueue}
            mark="↗"
            value={
              analytics === null
                ? null
                : total(analytics.affiliateDestinations.status)
            }
          />
        </MetricGrid>
      </section>

      {/*
        §12.5's handoff from a figure to the work behind it (I81).

        The overview shipped without this and `OVERVIEW.queuesTitle` sat in
        `copy.ts` unused, which is what a missing section looks like from the
        outside. AC-15 makes the workload indicators actionable — each opens the
        queue it counts — and AC-16 makes every core-flow indicator *not*
        actionable, because those are things that happened and there is nowhere
        to go about them.

        **The addresses come from the API's own `actionable` map**, not from
        this page. A dashboard that hard-coded where a queue lives would be the
        second place that fact is written, and the one that goes stale.
      */}
      {analytics === null ? null : (
        <section aria-labelledby="queues">
          <h2 id="queues">{OVERVIEW.queuesTitle}</h2>
          <ul>
            <li>
              <Link href={analytics.actionable.OPEN_MODERATION_CASES}>
                {PANEL.casesWaiting(analytics.moderationCases.status.OPEN ?? 0)}
              </Link>
            </li>
            <li>
              <Link href={analytics.actionable.DESTINATION_WORKLOAD}>
                {PANEL.destinationsWaiting(
                  Object.values(analytics.destinationWorkload).reduce(
                    (sum, count) => sum + count,
                    0
                  )
                )}
              </Link>
            </li>
          </ul>
        </section>
      )}

      {analytics === null ? (
        <p role="alert">{ANALYTICS_UNAVAILABLE}</p>
      ) : (
        <EngagementBars rate={analytics.affiliateHandoffRate} />
      )}
    </main>
  );
}
