import {
  comparisonSetSchema,
  comparisonViewSchema,
  type ComparisonSetResponse,
  type ComparisonViewResponse
} from "@commerce/contracts";

import { ApiRequestError, fetchWithBudget } from "../api-error";

/**
 * The Compare flow, as the web application holds it.
 *
 * Only the set's identifier travels in the cookie. Everything about the set —
 * its members, its shared Category, whether it is full — lives on the server
 * and expires there, which is what makes PRD-0003's "no saved Compare history"
 * a property of the system rather than a promise about the browser.
 */

export const COMPARISON_SET_COOKIE = "comparison_set";

/**
 * What a refused addition tells the person. The set they already had is
 * untouched, which is why this carries a reason and nothing else.
 *
 * It lives here rather than beside the action because a `"use server"` module
 * may export nothing but async functions.
 */
export interface CompareEntryState {
  readonly refusal: string | null;
}

export const NO_COMPARE_REFUSAL: CompareEntryState = { refusal: null };

/// Matches the server's own expiry. The cookie outliving the set would only
/// produce a person holding a receipt for something that no longer exists.
export const COMPARISON_SET_MAX_AGE_SECONDS = 3600;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/iu;

export function readComparisonSetId(raw: string | undefined): string | null {
  return typeof raw === "string" && UUID.test(raw) ? raw : null;
}

function apiBaseUrl(): string {
  return process.env.API_BASE_URL ?? "http://127.0.0.1:4000/api/v1";
}

async function call(
  method: "DELETE" | "GET" | "POST",
  path: string,
  body?: unknown
): Promise<{ payload: unknown; status: number }> {
  const request: RequestInit = {
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    cache: "no-store",
    headers: {
      accept: "application/json",
      ...(body === undefined ? {} : { "content-type": "application/json" })
    },
    method
  };
  const url = `${apiBaseUrl()}${path}`;
  const response =
    method === "GET"
      ? await fetchWithBudget(url, request, "COMPARISON")
      : await fetch(url, request);
  /*
   * **A `503` used to become "your Comparison session has ended".** The page
   * asked `currentComparison` and, getting `null`, offered to start again —
   * which throws away a set the person built one Offering at a time, on the
   * strength of a claim nothing here could support.
   *
   * The comment above `openComparison`'s caller reasoned about two states,
   * *not openable* and *gone*, and told them apart by whether anything was left
   * to describe. A third state breaks that: during an outage there is nothing
   * left to describe either, and the page read it as gone.
   */
  if (method === "GET" && response.status >= 500)
    throw new ApiRequestError("COMPARISON", response.status);
  return {
    payload: response.status === 204 ? null : await response.json(),
    status: response.status
  };
}

/**
 * Beginning a set, or adding to the one already in the flow.
 *
 * A refusal comes back as a code rather than an exception, because every one
 * of them is an ordinary answer a person is entitled to see: the set is full,
 * the Offering belongs elsewhere, the Offering is no longer eligible.
 */
export async function addToComparison(input: {
  comparisonSetId: string | null;
  offeringId: string;
  replaces?: string | undefined;
}): Promise<{ refusal: string | null; set: ComparisonSetResponse | null }> {
  const { payload, status } =
    input.comparisonSetId === null
      ? await call("POST", "/decision/comparison-sets", {
          offeringId: input.offeringId
        })
      : await call(
          "POST",
          `/decision/comparison-sets/${input.comparisonSetId}/members`,
          {
            offeringId: input.offeringId,
            ...(input.replaces === undefined
              ? {}
              : { replaces: input.replaces })
          }
        );

  if (status === 200 || status === 201)
    return { refusal: null, set: comparisonSetSchema.parse(payload) };
  // A set that expired mid-flow is not a failure; the person simply starts a
  // new one with the Offering they were looking at.
  if (status === 404 && input.comparisonSetId !== null)
    return addToComparison({ ...input, comparisonSetId: null });
  return { refusal: refusalCode(payload), set: null };
}

export async function removeFromComparison(
  comparisonSetId: string,
  offeringId: string
): Promise<ComparisonSetResponse | null> {
  const { payload, status } = await call(
    "DELETE",
    `/decision/comparison-sets/${comparisonSetId}/members/${offeringId}`
  );
  return status === 200 ? comparisonSetSchema.parse(payload) : null;
}

export async function openComparison(
  comparisonSetId: string
): Promise<ComparisonViewResponse | null> {
  const { payload, status } = await call(
    "POST",
    `/decision/comparison-sets/${comparisonSetId}/compare`
  );
  return status === 200 ? comparisonViewSchema.parse(payload) : null;
}

export async function currentComparison(
  comparisonSetId: string
): Promise<ComparisonSetResponse | null> {
  const { payload, status } = await call(
    "GET",
    `/decision/comparison-sets/${comparisonSetId}`
  );
  return status === 200 ? comparisonSetSchema.parse(payload) : null;
}

function refusalCode(payload: unknown): string {
  return typeof payload === "object" &&
    payload !== null &&
    "code" in payload &&
    typeof payload.code === "string"
    ? payload.code
    : "UNKNOWN";
}
