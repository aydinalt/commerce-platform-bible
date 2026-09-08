import { cookies } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { ServiceUnavailable } from "../../service-unavailable";
import { isUnavailable, orUnavailable } from "../../unavailable";

import {
  fetchAdminPanel,
  fetchOfferingFeedRuns,
  fetchOfferingFeeds
} from "../../../platform/api";
import { FEEDS, PANEL } from "../../../platform/copy";
import { When } from "../../../platform/when";
import { featureEnabled } from "../../../platform/flags";
import { AUTH_ROUTES, SESSION_COOKIE } from "../../../identity/session";

import { addFeed, pauseFeed } from "./actions";

import type { Metadata } from "next";

export const metadata: Metadata = { title: FEEDS.title };

/**
 * The partner catalogues, and how they last went (I76).
 *
 * The Owner asked for product data to arrive as an **affiliate feed rather than
 * as scraping**, read on a schedule, with the failures visible. This is where
 * a feed is described and where the failures are read.
 *
 * **The run log is not decoration.** Everything about a scheduled intake fails
 * quietly: a partner changes a field name and the sync keeps "succeeding" with
 * four thousand rejections; their server starts answering 503 and the last
 * import stays on the screen looking current. The counts and the recorded
 * message are what make the difference visible, and they are the reason this
 * page shows a run beside every feed rather than only a list of feeds.
 *
 * **Behind a flag**, like every new Admin surface in this series: merging the
 * code and adopting the capability stay two decisions.
 */
/*
 * Bare markup, like every other management page: the classes live in the Admin
 * layer, and a page reaching for one of its own is the question `i48` exists to
 * force out loud.
 */
export default async function OfferingFeedsPage() {
  if (!featureEnabled("OFFERING_FEEDS")) notFound();

  const jar = await cookies();
  const session = jar.get(SESSION_COOKIE)?.value;
  if (session === undefined) redirect(AUTH_ROUTES.login);

  const panel = await orUnavailable(fetchAdminPanel(session));
  if (isUnavailable(panel))
    return <ServiceUnavailable retryPath="/admin/offering-feeds" />;
  if (panel === null) notFound();

  const read = await orUnavailable(fetchOfferingFeeds(session));
  const feeds = isUnavailable(read) ? null : read;
  const readRuns = await orUnavailable(fetchOfferingFeedRuns({ session }));
  const runs = isUnavailable(readRuns) ? null : readRuns;

  return (
    <main>
      <p>
        <Link href="/admin">{PANEL.title}</Link>
      </p>
      <h1>{FEEDS.title}</h1>

      <form action={addFeed}>
        <p>
          <label htmlFor="feed-name">{FEEDS.name}</label>
          <input id="feed-name" name="name" required type="text" />
        </p>
        <p>
          <label htmlFor="feed-business">{FEEDS.business}</label>
          <input id="feed-business" name="businessId" required type="text" />
        </p>
        <p>
          <label htmlFor="feed-category">{FEEDS.category}</label>
          <input id="feed-category" name="categoryId" required type="text" />
          <span>{FEEDS.categoryHint}</span>
        </p>
        <p>
          <label htmlFor="feed-address">{FEEDS.address}</label>
          <input id="feed-address" name="documentUrl" required type="url" />
        </p>
        <p>
          <label htmlFor="feed-format">{FEEDS.format}</label>
          {/* The two format names are rendered from a list rather than typed
              as markup. `XML` and `JSON` are the same words in Turkish, and a
              literal here would be rendered ASCII prose — which `i27` reports,
              correctly, because it cannot tell a format name from a sentence
              somebody forgot to translate. */}
          <select defaultValue="XML" id="feed-format" name="format">
            {(["XML", "JSON"] as const).map((format) => (
              <option key={format} value={format}>
                {format}
              </option>
            ))}
          </select>
        </p>
        <p>
          <label htmlFor="feed-item-path">{FEEDS.itemPath}</label>
          <input id="feed-item-path" name="itemPath" type="text" />
          <span>{FEEDS.itemPathHint}</span>
        </p>

        <fieldset>
          <legend>{FEEDS.mapping}</legend>
          <p>{FEEDS.mappingHint}</p>
          {/* Twelve named fields. Required first, because those two are what
              the intake cannot work without: an identifier that survives the
              next sync, and a name. */}
          {(
            [
              ["mapExternalId", "externalId", true],
              ["mapTitle", "title", true],
              ["mapPrice", "price", false],
              ["mapCurrency", "currency", false],
              ["mapPriorPrice", "priorPrice", false],
              ["mapDeliveryCost", "deliveryCost", false],
              ["mapStock", "stock", false],
              ["mapUrl", "url", false],
              ["mapImageUrl", "imageUrl", false],
              ["mapSummary", "summary", false],
              ["mapProductKey", "productKey", false],
              ["mapCategoryKey", "categoryKey", false]
            ] as const
          ).map(([field, label, required]) => (
            <p key={field}>
              <label htmlFor={`feed-${field}`}>{label}</label>
              <input
                id={`feed-${field}`}
                name={field}
                {...(required ? { required: true } : {})}
                type="text"
              />
            </p>
          ))}
        </fieldset>

        <button type="submit">{FEEDS.add}</button>
      </form>

      {feeds === null ? (
        <p role="alert">{FEEDS.unreadable}</p>
      ) : feeds.length === 0 ? (
        <p>{FEEDS.none}</p>
      ) : (
        <ul>
          {feeds.map((feed) => (
            <li key={feed.feedId}>
              <h2>{feed.name}</h2>
              <p>
                {feed.businessName} · {feed.categoryName} · {feed.format} ·{" "}
                {feed.active ? FEEDS.active : FEEDS.inactive} ·{" "}
                {FEEDS.listings(feed.listingCount)}
              </p>
              <p>{feed.documentUrl}</p>

              {/* How it last went, beside the feed rather than in a separate
                  log: a list of partners that does not say which one is broken
                  answers the wrong question. */}
              {feed.lastRun === null ? (
                <p>{FEEDS.never}</p>
              ) : (
                <>
                  <p>
                    {feed.lastRun.outcome === "FAILED"
                      ? FEEDS.failed
                      : FEEDS.succeeded}{" "}
                    · <When value={feed.lastRun.finishedAt} />
                  </p>
                  {feed.lastRun.failureKind === null ? null : (
                    <p role="alert">
                      {FEEDS.failureKind[feed.lastRun.failureKind] ??
                        feed.lastRun.failureKind}
                    </p>
                  )}
                  {feed.lastRun.message === null ? null : (
                    <p>{feed.lastRun.message}</p>
                  )}
                  <p>{FEEDS.counts(feed.lastRun)}</p>
                  {feed.lastRun.missing === 0 ? null : (
                    <p>{FEEDS.missing(feed.lastRun.missing)}</p>
                  )}
                  {/* I78. What the Owner's 72-hour rule actually did. Shown
                      only when it did something: a line reading "0 withdrawn"
                      on every feed every hour is a line nobody reads, and the
                      whole value of these two is that they are rare. */}
                  {feed.lastRun.withdrawn === 0 ? null : (
                    <p>{FEEDS.withdrawn(feed.lastRun.withdrawn)}</p>
                  )}
                  {feed.lastRun.restored === 0 ? null : (
                    <p>{FEEDS.restored(feed.lastRun.restored)}</p>
                  )}
                  {feed.lastRun.rejections.length === 0 ? null : (
                    <>
                      <h3>{FEEDS.rejectionsTitle}</h3>
                      <ul>
                        {feed.lastRun.rejections.map((rejection, index) => (
                          <li key={`${rejection.externalId ?? "?"}-${index}`}>
                            {rejection.externalId ?? "—"}: {rejection.reason}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </>
              )}

              {feed.active ? (
                <form action={pauseFeed}>
                  <input name="feedId" type="hidden" value={feed.feedId} />
                  <button type="submit">{FEEDS.deactivate}</button>
                </form>
              ) : (
                <p>{FEEDS.paused}</p>
              )}
            </li>
          ))}
        </ul>
      )}

      <section aria-labelledby="feed-runs">
        <h2 id="feed-runs">{FEEDS.runsTitle}</h2>
        {runs === null ? (
          <p role="alert">{FEEDS.unreadable}</p>
        ) : (
          <ul>
            {runs.map((run) => (
              <li key={run.runId}>
                <When value={run.startedAt} /> · {run.feedName} ·{" "}
                {run.outcome === "FAILED" ? FEEDS.failed : FEEDS.succeeded} ·{" "}
                {FEEDS.counts(run)}
                {run.failureKind === null ? null : (
                  <span>
                    {" "}
                    · {FEEDS.failureKind[run.failureKind] ?? run.failureKind}
                  </span>
                )}
                {run.message === null ? null : <span> · {run.message}</span>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
