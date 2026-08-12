import {
  adminPanelSchema,
  analyticsSchema,
  moderationCaseSchema,
  moderationCasesSchema,
  type AdminPanel,
  type Analytics,
  type ModerationCase
} from "@commerce/contracts";

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
  const response = await fetch(`${apiBaseUrl()}/admin/panel`, {
    cache: "no-store",
    headers: adminHeaders(session)
  });
  if (!response.ok) return null;
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
  const response = await fetch(
    `${apiBaseUrl()}/admin/moderation-cases${status === null ? "" : `?status=${status}`}`,
    { cache: "no-store", headers: adminHeaders(session) }
  );
  if (!response.ok) return null;
  return moderationCasesSchema.parse(await response.json()).cases;
}

export async function fetchModerationCase(
  session: string,
  caseId: string
): Promise<ModerationCase | null> {
  const response = await fetch(
    `${apiBaseUrl()}/admin/moderation-cases/${caseId}`,
    { cache: "no-store", headers: adminHeaders(session) }
  );
  if (!response.ok) return null;
  return moderationCaseSchema.parse(await response.json());
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
  const response = await fetch(
    `${apiBaseUrl()}/admin/analytics?period=${period}`,
    { cache: "no-store", headers: adminHeaders(session) }
  );
  if (!response.ok) return null;
  return analyticsSchema.parse(await response.json());
}
