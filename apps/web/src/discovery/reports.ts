import { ApiRequestError, isApiUnavailable } from "../api-error";
import { SESSION_COOKIE } from "../identity/session";

/**
 * Sending a report about a listing (I69).
 *
 * Its own small module rather than a section of `discovery/api.ts`, for the
 * reason the favourites module gives: this is a write that carries the caller's
 * session if there is one and works without one if there is not, where
 * everything in that file is a read that answers the same to everybody.
 *
 * **Unbudgeted, like every other write this application makes.** Aborting a
 * write does not undo it — the API may have recorded the report a moment after
 * this side stopped listening — so a timeout reported as a failure would invite
 * a second identical report. The outage case is still named rather than folded
 * into a general refusal, because "the platform is down" and "the platform said
 * no" are different things to tell somebody who was doing it a favour.
 *
 * **Every failure is a returned outcome and never a thrown error.** A report is
 * a courtesy the reader is doing the platform; a crash in return would be the
 * worst possible answer to it, and the page they were reading is still the page
 * they want.
 */
export type ReportOutcome =
  "GONE" | "RECEIVED" | "REFUSED" | "TOO_MANY" | "UNAVAILABLE";

function apiBaseUrl(): string {
  return process.env.API_BASE_URL ?? "http://127.0.0.1:4000/api/v1";
}

export async function sendListingReport(input: {
  note: string | null;
  reason: string;
  session: string | undefined;
  slug: string;
}): Promise<ReportOutcome> {
  try {
    const response = await fetch(
      `${apiBaseUrl()}/offerings/${encodeURIComponent(input.slug)}/reports`,
      {
        body: JSON.stringify({ note: input.note, reason: input.reason }),
        cache: "no-store",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          // The API refuses a mutation from an unrecognised origin, so the web
          // application names itself rather than relying on what the runtime
          // would have sent.
          origin: process.env.PUBLIC_WEB_URL ?? "http://localhost:3000",
          ...(input.session === undefined
            ? {}
            : { cookie: `${SESSION_COOKIE}=${input.session}` })
        },
        method: "POST"
      }
    );
    if (response.status === 202) return "RECEIVED";
    if (response.status === 429) return "TOO_MANY";
    // A listing retired between the page being drawn and the report being sent
    // is the ordinary case rather than a fault, and it deserves its own
    // sentence: the thing they were reporting is gone.
    if (response.status === 404) return "GONE";
    // The vocabulary decides what counts as an outage rather than this module
    // deciding it again — a `503` and a `504` mean the same thing here as they
    // do on every page that reads.
    if (
      isApiUnavailable(new ApiRequestError("LISTING_REPORT", response.status))
    )
      return "UNAVAILABLE";
    return "REFUSED";
  } catch (error) {
    return isApiUnavailable(error) ? "UNAVAILABLE" : "REFUSED";
  }
}
