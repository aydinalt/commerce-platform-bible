import {
  type AdminAuditEvents,
  type AdminComplementaryPlacementResponse,
  type AdminOfferingFeedResponse,
  type AdminPanel,
  type AdminUserAccount,
  type AdminUserAccounts,
  type AdvertisingSettingsResponse,
  type Analytics,
  type AttributeResponse,
  type Categories,
  type DestinationWorkloadItem,
  type EditorialReviewAdmin,
  type ListingReportResponse,
  type ModerationCase,
  type OfferingFeedRunResponse,
  adminAuditEventsSchema,
  adminComplementaryPlacementsSchema,
  adminOfferingFeedsSchema,
  adminPanelSchema,
  adminUserAccountsSchema,
  advertisingSettingsSchema,
  analyticsSchema,
  attributesSchema,
  caseTargetEmailSchema,
  categoriesSchema,
  destinationWorkloadSchema,
  editorialReviewAdminSchema,
  editorialReviewListSchema,
  listingReportsSchema,
  moderationCaseSchema,
  moderationCasesSchema,
  offeringFeedRunsSchema
} from "@commerce/contracts";

import { absentUnlessUnavailable, fetchWithBudget } from "../api-error";

import { SESSION_COOKIE } from "../identity/api";

function apiBaseUrl(): string {
  return process.env.API_BASE_URL ?? "http://127.0.0.1:4000/api/v1";
}

function adminHeaders(session: string): Record<string, string> {
  return {
    accept: "application/json",
    cookie: `${SESSION_COOKIE}=${session}`,
    origin: process.env.PUBLIC_WEB_URL ?? "http://localhost:3000"
  };
}

/**
 * The Admin Panel baseline (UX-0006 §5.2, `US-PLT-F01-001`).
 *
 * `null` covers all three ways in to be shut: the account is not Enabled, the
 * authorization is absent, or the context was never entered. They are answered
 * identically here because the API answers them identically — telling somebody
 * which gate they failed would say whether an authorization exists, which is
 * not a fact a page should be able to test for.
 *
 * Re-read on every request rather than remembered from entry, so an
 * authorization removed between two page loads stops being an entry
 * immediately.
 */
export async function fetchAdminPanel(
  session: string
): Promise<AdminPanel | null> {
  const response = await fetchWithBudget(
    `${apiBaseUrl()}/admin/panel`,
    {
      cache: "no-store",
      headers: adminHeaders(session)
    },
    "ADMIN_PANEL"
  );
  if (!response.ok) return absentUnlessUnavailable(response, "ADMIN_PANEL");
  return adminPanelSchema.parse(await response.json());
}

/**
 * The case queue (§7).
 *
 * `status` filters the workflow and nothing else. A case carries no target
 * state, so there is nothing else to filter by — and a filter that pretended
 * otherwise would suggest cases and the things they concern are the same.
 */
export async function fetchModerationCases(
  session: string,
  status: "OPEN" | "CLOSED" | null
): Promise<ModerationCase[] | null> {
  const response = await fetchWithBudget(
    `${apiBaseUrl()}/admin/moderation-cases${status === null ? "" : `?status=${status}`}`,
    { cache: "no-store", headers: adminHeaders(session) },
    "MODERATION_CASES"
  );
  if (!response.ok)
    return absentUnlessUnavailable(response, "MODERATION_CASES");
  return moderationCasesSchema.parse(await response.json()).cases;
}

export async function fetchModerationCase(
  session: string,
  caseId: string
): Promise<ModerationCase | null> {
  const response = await fetchWithBudget(
    `${apiBaseUrl()}/admin/moderation-cases/${caseId}`,
    { cache: "no-store", headers: adminHeaders(session) },
    "MODERATION_CASE"
  );
  if (!response.ok) return absentUnlessUnavailable(response, "MODERATION_CASE");
  return moderationCaseSchema.parse(await response.json());
}

/**
 * The Affiliate Destination workload (§9).
 *
 * On the collection rather than under one Offering, because the question it
 * answers is "what is waiting for me" rather than "what about this one". A
 * read: looking at the queue moves nothing in it.
 */
export async function fetchDestinationWorkload(
  session: string
): Promise<DestinationWorkloadItem[] | null> {
  const response = await fetchWithBudget(
    `${apiBaseUrl()}/admin/offerings/affiliate-destinations/workload`,
    { cache: "no-store", headers: adminHeaders(session) },
    "ADMIN_DESTINATIONS"
  );
  if (!response.ok)
    return absentUnlessUnavailable(response, "ADMIN_DESTINATIONS");
  return destinationWorkloadSchema.parse(await response.json()).items;
}

/// The Category tree (§10). Every Category, active and retired: retirement is
/// not deletion, and an Admin managing the catalogue has to see both.
/**
 * The catalogue an Admin manages: its Categories, and the Domains a root may be
 * created in.
 *
 * **It used to return the Categories alone**, because the Domains were a
 * constant in the web application. PRD-0001 v4.0 §E makes the set open, so they
 * are records now and arrive with the same read — one request, and no way for
 * the two halves to be read at different moments and disagree.
 */
export async function fetchCategories(
  session: string
): Promise<Categories | null> {
  const response = await fetchWithBudget(
    `${apiBaseUrl()}/admin/categories`,
    {
      cache: "no-store",
      headers: adminHeaders(session)
    },
    "ADMIN_CATEGORIES"
  );
  if (!response.ok)
    return absentUnlessUnavailable(response, "ADMIN_CATEGORIES");
  return categoriesSchema.parse(await response.json());
}

/// Every Attribute definition (§11), with its applicable Categories and its
/// allowed values.
export async function fetchAttributes(
  session: string
): Promise<AttributeResponse[] | null> {
  const response = await fetchWithBudget(
    `${apiBaseUrl()}/admin/attributes`,
    {
      cache: "no-store",
      headers: adminHeaders(session)
    },
    "ADMIN_ATTRIBUTES"
  );
  if (!response.ok)
    return absentUnlessUnavailable(response, "ADMIN_ATTRIBUTES");
  return attributesSchema.parse(await response.json()).attributes;
}

/**
 * Every editorial review the platform holds, whatever its state
 * (`UX-0006` **Frozen v1.2** §12C.3).
 *
 * Drafts are included deliberately: _"a Draft nobody can find is a Draft
 * nobody finishes"_. That is also why this is one read rather than a
 * state-filtered one — a writer arriving at this screen is looking for work in
 * progress at least as often as for work already published.
 *
 * `null` is "we could not ask", never "there are none". §12C.11 keeps the two
 * apart for the reason §8.9.2 keeps them apart on the reader's side: an empty
 * list is the claim *no reviews exist*, and an outage is not entitled to make
 * it.
 */
export async function fetchEditorialReviews(
  session: string
): Promise<EditorialReviewAdmin[] | null> {
  const response = await fetchWithBudget(
    `${apiBaseUrl()}/admin/editorial-reviews`,
    {
      cache: "no-store",
      headers: adminHeaders(session)
    },
    "ADMIN_EDITORIAL_REVIEWS"
  );
  if (!response.ok)
    return absentUnlessUnavailable(response, "ADMIN_EDITORIAL_REVIEWS");
  return editorialReviewListSchema.parse(await response.json()).reviews;
}

/**
 * One review, as its writer sees it — with the state and the parts a Draft may
 * still be missing.
 *
 * **Keyed by Product Key rather than by id**, because that is the thing a
 * review is about (`US-EDT-F02-001` AC-1 of the reading Story) and the thing a
 * writer arrives holding. The acts that follow are keyed by id, which the
 * shape carries.
 *
 * A key with no review is `null` — absent, not broken. The same distinction as
 * the list above, at the level of one row.
 */
export async function fetchEditorialReview(
  session: string,
  productKey: string
): Promise<EditorialReviewAdmin | null> {
  const response = await fetchWithBudget(
    `${apiBaseUrl()}/admin/editorial-reviews/${encodeURIComponent(productKey)}`,
    {
      cache: "no-store",
      headers: adminHeaders(session)
    },
    "ADMIN_EDITORIAL_REVIEW"
  );
  if (!response.ok)
    return absentUnlessUnavailable(response, "ADMIN_EDITORIAL_REVIEW");
  return editorialReviewAdminSchema.parse(await response.json());
}

/**
 * One write against the Admin surface, by `PUT`.
 *
 * Category rename and reparent, and every Attribute property, are statements
 * of what something *is* rather than acts performed on it — so they are `PUT`s
 * and share one carrier with `adminPost`'s counterpart below.
 */
export async function adminPut(
  session: string,
  path: string,
  body: unknown
): Promise<{ body: unknown; status: number }> {
  const response = await fetch(`${apiBaseUrl()}${path}`, {
    body: JSON.stringify(body),
    cache: "no-store",
    headers: { ...adminHeaders(session), "content-type": "application/json" },
    method: "PUT"
  });
  const text = await response.text();
  return {
    body: text === "" ? {} : (JSON.parse(text) as unknown),
    status: response.status
  };
}

/**
 * One write against the Admin surface.
 *
 * Deliberately general: the seven General Moderation actions live on seven
 * different routes owned by the Stories that define their consequences, and
 * this carries a request to whichever one the case named. It performs no
 * transition itself and knows what none of them mean.
 */
export async function adminPost(
  session: string,
  path: string,
  body?: unknown
): Promise<{ body: unknown; status: number }> {
  const response = await fetch(`${apiBaseUrl()}${path}`, {
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    cache: "no-store",
    headers: {
      ...adminHeaders(session),
      ...(body === undefined ? {} : { "content-type": "application/json" })
    },
    method: "POST"
  });
  const text = await response.text();
  return {
    body: text === "" ? {} : (JSON.parse(text) as unknown),
    status: response.status
  };
}

/**
 * Basic Analytics for one period (§12).
 *
 * `null` is "we could not ask", which §14 requires to be distinguishable from
 * zero. A zero is a real figure the Admin may act on; an empty page pretending
 * to be zeros would be the worst kind of quiet.
 */
export async function fetchAnalytics(
  session: string,
  period: Analytics["period"]
): Promise<Analytics | null> {
  const response = await fetchWithBudget(
    `${apiBaseUrl()}/admin/analytics?period=${period}`,
    { cache: "no-store", headers: adminHeaders(session) },
    "ADMIN_ANALYTICS"
  );
  if (!response.ok) return absentUnlessUnavailable(response, "ADMIN_ANALYTICS");
  return analyticsSchema.parse(await response.json());
}

/**
 * The queue of reader reports (I69).
 *
 * `status` is the only filter and the default is `OPEN`, because the queue
 * exists to be emptied. The closed statuses are readable so an Admin can answer
 * "did we already look at this listing?" when it is reported again.
 */
export async function fetchListingReports(
  session: string,
  status: "ACCEPTED" | "DISMISSED" | "OPEN"
): Promise<{ reports: ListingReportResponse[]; total: number } | null> {
  const response = await fetchWithBudget(
    `${apiBaseUrl()}/admin/listing-reports?status=${status}`,
    { cache: "no-store", headers: adminHeaders(session) },
    "LISTING_REPORTS"
  );
  if (!response.ok) return absentUnlessUnavailable(response, "LISTING_REPORTS");
  /*
   * **`total` is carried now, and dropping it was a defect (I81).** The API
   * answers at most `QUEUE_PAGE` reports and says how many there are; this
   * function kept the array and discarded the count, so a queue of four hundred
   * showed a hundred with nothing to indicate the other three hundred existed.
   * An Admin working a queue that silently ends is the one person who cannot
   * discover the truncation.
   */
  return listingReportsSchema.parse(await response.json());
}

/**
 * Closing one report.
 *
 * `false` for a report somebody else has already closed, which is the ordinary
 * race on a shared queue rather than a fault: the page says so and shows the
 * queue as it now stands.
 */
export async function reviewListingReport(input: {
  outcome: "ACCEPTED" | "DISMISSED";
  reportId: string;
  session: string;
}): Promise<boolean> {
  /*
   * Unbudgeted, like every other write here. Aborting a write does not undo it
   * — the API may have closed the report a moment after this side stopped
   * listening — so a timeout reported as a failure would tell an Admin their
   * decision was lost when it was recorded.
   */
  const response = await fetch(
    `${apiBaseUrl()}/admin/listing-reports/${input.reportId}/review`,
    {
      body: JSON.stringify({ outcome: input.outcome }),
      cache: "no-store",
      headers: {
        ...adminHeaders(input.session),
        "content-type": "application/json",
        origin: process.env.PUBLIC_WEB_URL ?? "http://localhost:3000"
      },
      method: "POST"
    }
  );
  return response.ok;
}

/**
 * Every complementary placement an Admin manages (I70).
 *
 * A read, so it is budgeted like the other Admin reads. What it returns is what
 * somebody wrote — labels, partners and addresses — and no measurement of any
 * kind: PRD-0006 §20.5 excludes impression, click and revenue reporting, so
 * there is nothing to report and nothing here to report it with.
 */
export async function fetchComplementaryPlacements(
  session: string
): Promise<AdminComplementaryPlacementResponse[] | null> {
  const response = await fetchWithBudget(
    `${apiBaseUrl()}/admin/complementary-placements`,
    { cache: "no-store", headers: adminHeaders(session) },
    "COMPLEMENTARY_PLACEMENTS"
  );
  if (!response.ok)
    return absentUnlessUnavailable(response, "COMPLEMENTARY_PLACEMENTS");
  return adminComplementaryPlacementsSchema.parse(await response.json())
    .placements;
}

/** Writing one placement, or correcting the one already under that label. */
export async function writeComplementaryPlacement(input: {
  body: unknown;
  session: string;
}): Promise<boolean> {
  // Unbudgeted, like every other write here.
  const response = await fetch(
    `${apiBaseUrl()}/admin/complementary-placements`,
    {
      body: JSON.stringify(input.body),
      cache: "no-store",
      headers: {
        ...adminHeaders(input.session),
        "content-type": "application/json",
        origin: process.env.PUBLIC_WEB_URL ?? "http://localhost:3000"
      },
      method: "POST"
    }
  );
  return response.ok;
}

/** Switching one off. It stays as a row, so it can come back. */
export async function deactivateComplementaryPlacement(input: {
  placementId: string;
  session: string;
}): Promise<boolean> {
  const response = await fetch(
    `${apiBaseUrl()}/admin/complementary-placements/${input.placementId}`,
    {
      cache: "no-store",
      headers: {
        ...adminHeaders(input.session),
        origin: process.env.PUBLIC_WEB_URL ?? "http://localhost:3000"
      },
      method: "DELETE"
    }
  );
  return response.ok;
}

/**
 * The advertising placement settings (I75).
 *
 * A read, budgeted like the other Admin reads. What comes back is what somebody
 * decided — a switch, a publisher identifier, one unit per region and the
 * Categories kept clear — and no measurement of any kind: PRD-0006 §20.5
 * excludes impression, click and revenue reporting, so there is nothing to
 * report and nothing here to report it with.
 */
export async function fetchAdvertisingSettings(
  session: string
): Promise<AdvertisingSettingsResponse | null> {
  const response = await fetchWithBudget(
    `${apiBaseUrl()}/admin/advertising`,
    { cache: "no-store", headers: adminHeaders(session) },
    "ADVERTISING_SETTINGS"
  );
  if (!response.ok)
    return absentUnlessUnavailable(response, "ADVERTISING_SETTINGS");
  return advertisingSettingsSchema.parse(await response.json());
}

/** Replacing them. Unbudgeted, like every other write here. */
export async function writeAdvertisingSettings(input: {
  body: unknown;
  session: string;
}): Promise<boolean> {
  const response = await fetch(`${apiBaseUrl()}/admin/advertising`, {
    body: JSON.stringify(input.body),
    cache: "no-store",
    headers: {
      ...adminHeaders(input.session),
      "content-type": "application/json",
      origin: process.env.PUBLIC_WEB_URL ?? "http://localhost:3000"
    },
    method: "PUT"
  });
  return response.ok;
}

/** Marking one Category ad-free, and everything under it. */
export async function excludeCategoryFromAdvertising(input: {
  categoryId: string;
  session: string;
}): Promise<boolean> {
  const response = await fetch(`${apiBaseUrl()}/admin/advertising/exclusions`, {
    body: JSON.stringify({ categoryId: input.categoryId }),
    cache: "no-store",
    headers: {
      ...adminHeaders(input.session),
      "content-type": "application/json",
      origin: process.env.PUBLIC_WEB_URL ?? "http://localhost:3000"
    },
    method: "POST"
  });
  return response.ok;
}

/** Letting advertising back in. */
export async function includeCategoryInAdvertising(input: {
  categoryId: string;
  session: string;
}): Promise<boolean> {
  const response = await fetch(
    `${apiBaseUrl()}/admin/advertising/exclusions/${input.categoryId}`,
    {
      cache: "no-store",
      headers: {
        ...adminHeaders(input.session),
        origin: process.env.PUBLIC_WEB_URL ?? "http://localhost:3000"
      },
      method: "DELETE"
    }
  );
  return response.ok;
}

/**
 * The partner catalogues an Admin manages (I76).
 *
 * A read, budgeted like every other Admin read. It carries how each feed last
 * went, because a list of feeds without that answers "which partners do we
 * have" and never "which one is broken" — and the second is the question
 * somebody opens this page with.
 */
export async function fetchOfferingFeeds(
  session: string
): Promise<AdminOfferingFeedResponse[] | null> {
  const response = await fetchWithBudget(
    `${apiBaseUrl()}/admin/offering-feeds`,
    { cache: "no-store", headers: adminHeaders(session) },
    "OFFERING_FEEDS"
  );
  if (!response.ok) return absentUnlessUnavailable(response, "OFFERING_FEEDS");
  return adminOfferingFeedsSchema.parse(await response.json()).feeds;
}

/**
 * The sync log, newest first, or only its failures.
 *
 * The dashboard asks for `FAILED` and the feed page asks for everything. One
 * function rather than two, because "what went wrong" and "what happened" are
 * the same list read with a different question.
 */
export async function fetchOfferingFeedRuns(input: {
  failuresOnly?: boolean;
  session: string;
}): Promise<OfferingFeedRunResponse[] | null> {
  const query = input.failuresOnly === true ? "?outcome=FAILED" : "";
  const response = await fetchWithBudget(
    `${apiBaseUrl()}/admin/offering-feeds/runs${query}`,
    { cache: "no-store", headers: adminHeaders(input.session) },
    "OFFERING_FEED_RUNS"
  );
  if (!response.ok)
    return absentUnlessUnavailable(response, "OFFERING_FEED_RUNS");
  return offeringFeedRunsSchema.parse(await response.json()).runs;
}

/** Writing one feed, or correcting the one already under that name. */
export async function writeOfferingFeed(input: {
  body: unknown;
  session: string;
}): Promise<boolean> {
  const response = await fetch(`${apiBaseUrl()}/admin/offering-feeds`, {
    body: JSON.stringify(input.body),
    cache: "no-store",
    headers: {
      ...adminHeaders(input.session),
      "content-type": "application/json",
      origin: process.env.PUBLIC_WEB_URL ?? "http://localhost:3000"
    },
    method: "POST"
  });
  return response.ok;
}

/** Pausing one feed. Its listings stay exactly as they are. */
export async function deactivateOfferingFeed(input: {
  feedId: string;
  session: string;
}): Promise<boolean> {
  const response = await fetch(
    `${apiBaseUrl()}/admin/offering-feeds/${input.feedId}`,
    {
      cache: "no-store",
      headers: {
        ...adminHeaders(input.session),
        origin: process.env.PUBLIC_WEB_URL ?? "http://localhost:3000"
      },
      method: "DELETE"
    }
  );
  return response.ok;
}

/**
 * The Admin audit trail (I84).
 *
 * Filters travel as they arrived, so the address bar is the state: a reader who
 * narrowed to one actor and a fortnight can send that view to somebody else,
 * and the CSV link beside it exports exactly what is on screen because it is
 * built from the same query string.
 */
export async function fetchAuditEvents(input: {
  action: string | null;
  actorId: string | null;
  from: string | null;
  offset: number;
  session: string;
  to: string | null;
}): Promise<AdminAuditEvents | null> {
  const response = await fetchWithBudget(
    `${apiBaseUrl()}/admin/audit-events?${auditQuery(input)}`,
    { cache: "no-store", headers: adminHeaders(input.session) },
    "AUDIT_EVENTS"
  );
  if (!response.ok) return absentUnlessUnavailable(response, "AUDIT_EVENTS");
  return adminAuditEventsSchema.parse(await response.json());
}

/**
 * The query string both the list and the export are built from.
 *
 * One function, so the file a reader downloads cannot describe a different set
 * of rows from the page they downloaded it off — which is the way an export
 * quietly becomes wrong.
 */
export function auditQuery(input: {
  action: string | null;
  actorId: string | null;
  from: string | null;
  offset?: number;
  to: string | null;
}): string {
  const query = new URLSearchParams();
  if (input.action !== null) query.set("action", input.action);
  if (input.actorId !== null) query.set("actorId", input.actorId);
  if (input.from !== null) query.set("from", input.from);
  if (input.to !== null) query.set("to", input.to);
  if (input.offset !== undefined && input.offset > 0)
    query.set("offset", String(input.offset));
  return query.toString();
}

/**
 * The register of User Accounts (I83).
 *
 * **Carries no email address**, because the contract has nowhere to put one:
 * the Owner's PII rule is enforced in the schema rather than by this function
 * remembering to drop a field.
 */
export async function fetchUserAccounts(input: {
  session: string;
  status: AdminUserAccount["status"] | null;
}): Promise<AdminUserAccounts | null> {
  const query = input.status === null ? "" : `?status=${input.status}`;
  const response = await fetchWithBudget(
    `${apiBaseUrl()}/admin/user-accounts${query}`,
    { cache: "no-store", headers: adminHeaders(input.session) },
    "USER_ACCOUNTS"
  );
  if (!response.ok) return absentUnlessUnavailable(response, "USER_ACCOUNTS");
  return adminUserAccountsSchema.parse(await response.json());
}

/**
 * Revealing a User Account case target's email address (I82).
 *
 * The Owner's PII rule: an address never appears in a queue, and reaches an
 * Admin only when they ask for it on the case they are working. So this is a
 * request made when the button is pressed, not a field read when the page
 * loads — which is also the only shape an audit trail can later record.
 *
 * `null` where the case is not a User Account case or does not exist. The two
 * answer alike on purpose: telling them apart would let a caller learn which
 * case ids exist by asking for their addresses.
 */
export async function revealCaseTargetEmail(input: {
  caseId: string;
  session: string;
}): Promise<string | null> {
  const response = await fetch(
    `${apiBaseUrl()}/admin/moderation-cases/${input.caseId}/target-email`,
    {
      cache: "no-store",
      headers: {
        ...adminHeaders(input.session),
        origin: process.env.PUBLIC_WEB_URL ?? "http://localhost:3000"
      },
      method: "POST"
    }
  );
  if (!response.ok) return null;
  return caseTargetEmailSchema.parse(await response.json()).email;
}

/**
 * Opening a Moderation Case against a target (I82).
 *
 * The Owner asked for this to sit beside the target rather than on a page of
 * its own: an Admin looking at a listing, a Business or an account presses one
 * control and the case is opened against what they were already looking at.
 * Nobody types an identifier, so nobody mistypes one.
 *
 * A target that already has an Open case answers with that case rather than a
 * second one — one concern is one case (AC-2) — so pressing this twice is
 * safe and lands on the same place.
 */
export async function openModerationCase(input: {
  session: string;
  target:
    | { businessId: string; targetType: "BUSINESS" }
    | { offeringId: string; targetType: "OFFERING" }
    | { targetType: "USER_ACCOUNT"; userId: string };
}): Promise<string | null> {
  const response = await fetch(`${apiBaseUrl()}/admin/moderation-cases`, {
    body: JSON.stringify(input.target),
    cache: "no-store",
    headers: {
      ...adminHeaders(input.session),
      "content-type": "application/json",
      origin: process.env.PUBLIC_WEB_URL ?? "http://localhost:3000"
    },
    method: "POST"
  });
  if (!response.ok) return null;
  return moderationCaseSchema.parse(await response.json()).id;
}
