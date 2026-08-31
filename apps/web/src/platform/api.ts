import {
  adminPanelSchema,
  analyticsSchema,
  attributesSchema,
  categoriesSchema,
  type Categories,
  destinationWorkloadSchema,
  moderationCaseSchema,
  moderationCasesSchema,
  type AdminPanel,
  type Analytics,
  type AttributeResponse,
  type DestinationWorkloadItem,
  type ModerationCase
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
