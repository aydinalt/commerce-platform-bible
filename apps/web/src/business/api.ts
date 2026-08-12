import {
  businessDashboardSchema,
  type BusinessDashboardResponse
} from "@commerce/contracts";

import { SESSION_COOKIE } from "../identity/api";

function apiBaseUrl(): string {
  return process.env.API_BASE_URL ?? "http://127.0.0.1:4000/api/v1";
}

/**
 * The Dashboard, read from the API on every request.
 *
 * `US-BUS-F04-001` AC-7 re-evaluates the entry conditions on every read rather
 * than trusting what was true when the person signed in, and this is where
 * that becomes real: an account suspended, an ownership ended or a Business
 * restricted a moment ago changes what comes back, because the question is
 * asked again.
 *
 * `null` covers both "no such Business" and "not yours". The API answers them
 * identically and so does this — a caller who does not own a Business has no
 * standing to learn that it exists.
 */
export async function fetchDashboard(
  session: string,
  businessId: string
): Promise<BusinessDashboardResponse | null> {
  const response = await fetch(
    `${apiBaseUrl()}/businesses/${businessId}/dashboard`,
    {
      cache: "no-store",
      headers: {
        accept: "application/json",
        cookie: `${SESSION_COOKIE}=${session}`,
        origin: process.env.PUBLIC_WEB_URL ?? "http://localhost:3000"
      }
    }
  );
  if (!response.ok) return null;
  return businessDashboardSchema.parse(await response.json());
}
