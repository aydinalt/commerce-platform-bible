import {
  businessDashboardSchema,
  businessInformationSchema,
  type BusinessDashboardResponse,
  type BusinessInformationResponse,
  type UpdateBusinessInformation
} from "@commerce/contracts";

import { SESSION_COOKIE } from "../identity/api";

function apiBaseUrl(): string {
  return process.env.API_BASE_URL ?? "http://127.0.0.1:4000/api/v1";
}

function ownerHeaders(session: string): Record<string, string> {
  return {
    accept: "application/json",
    cookie: `${SESSION_COOKIE}=${session}`,
    origin: process.env.PUBLIC_WEB_URL ?? "http://localhost:3000"
  };
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
    { cache: "no-store", headers: ownerHeaders(session) }
  );
  if (!response.ok) return null;
  return businessDashboardSchema.parse(await response.json());
}

/**
 * The complete Business Information set (UX-0005 §7).
 *
 * It carries protected Direct Contact alongside public identity, which is what
 * makes it an owner-only read: `US-BUS-F02-001` AC-13 keeps management
 * visibility wider than public exposure, and this response must never be
 * served from a public path.
 */
export async function fetchInformation(
  session: string,
  businessId: string
): Promise<BusinessInformationResponse | null> {
  const response = await fetch(
    `${apiBaseUrl()}/businesses/${businessId}/information`,
    { cache: "no-store", headers: ownerHeaders(session) }
  );
  if (!response.ok) return null;
  return businessInformationSchema.parse(await response.json());
}

/**
 * Saves the complete set as a replacement (§7, `US-BUS-F02-001` AC-2, AC-4).
 *
 * A `PUT` rather than a patch, because removal has to be expressible: an
 * optional field left blank is a field the Business no longer supplies, and a
 * merge would make "cleared" and "unchanged" the same request.
 */
export async function saveInformation(
  session: string,
  businessId: string,
  input: UpdateBusinessInformation
): Promise<{ body: unknown; status: number }> {
  const response = await fetch(
    `${apiBaseUrl()}/businesses/${businessId}/information`,
    {
      body: JSON.stringify(input),
      cache: "no-store",
      headers: { ...ownerHeaders(session), "content-type": "application/json" },
      method: "PUT"
    }
  );
  const text = await response.text();
  return {
    body: text === "" ? {} : (JSON.parse(text) as unknown),
    status: response.status
  };
}
