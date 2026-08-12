import {
  adminPanelSchema,
  analyticsSchema,
  type AdminPanel,
  type Analytics
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
