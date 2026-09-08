import {
  favouriteMarksSchema,
  favouritesSchema,
  type FavouritesResponse
} from "@commerce/contracts";

import { fetchWithBudget } from "../api-error";
import { SESSION_COOKIE } from "../identity/session";

/**
 * Keeping things, and reading back what was kept (I64).
 *
 * Its own module rather than a section of `discovery/api.ts`, because these are
 * the only Discovery reads that are *about a person*: they carry the session
 * cookie and answer differently for each caller, where everything in that file
 * answers the same to everybody. Two kinds of read with two cache stories
 * should not share one module's habits.
 *
 * Server-side only, like every other API call this application makes. The
 * browser never reaches the API directly and the session cookie is `httpOnly`,
 * so the token is read from the request's jar and forwarded here.
 */
function apiBaseUrl(): string {
  return process.env.API_BASE_URL ?? "http://127.0.0.1:4000/api/v1";
}

function headers(session: string): Record<string, string> {
  return {
    accept: "application/json",
    cookie: `${SESSION_COOKIE}=${session}`,
    // The API refuses a cookie-authenticated mutation from an unrecognised
    // origin, so the web application names itself rather than relying on
    // whatever the runtime would have sent.
    origin: process.env.PUBLIC_WEB_URL ?? "http://localhost:3000"
  };
}

/**
 * Which products this person has kept.
 *
 * **Absent rather than empty when nobody is signed in**, and `null` again when
 * the API refuses or is unreachable. A Discovery page draws hearts from this,
 * and an empty array would say "you have kept nothing" — which is a different
 * statement from "there is nobody to have kept anything", and would show a
 * signed-in person every heart hollow during an outage.
 */
export async function readFavouriteMarks(
  session: string | undefined
): Promise<ReadonlySet<string> | null> {
  if (session === undefined) return null;
  /*
   * **Nothing here may take a page down.** The hearts are an ornament on a list
   * whose reason for existing is the list; a Discovery page that failed because
   * it could not decide which hearts to fill would be the smallest feature on
   * the screen breaking the largest one. Every failure — a refusal, an outage, a
   * session the API no longer recognises, even a malformed cookie — answers the
   * same way the Guest does: no marks, and therefore no hearts.
   */
  try {
    const response = await fetchWithBudget(
      `${apiBaseUrl()}/me/favourites/marks`,
      { cache: "no-store", headers: headers(session) },
      "favourite-marks"
    );
    if (!response.ok) return null;
    const marks = favouriteMarksSchema.parse(await response.json());
    return new Set(marks.productGroupKeys);
  } catch {
    return null;
  }
}

/** Everything this person kept, as cards drawn from today's cheapest seller. */
export async function readFavourites(
  session: string
): Promise<FavouritesResponse> {
  const response = await fetchWithBudget(
    `${apiBaseUrl()}/me/favourites`,
    { cache: "no-store", headers: headers(session) },
    "favourites"
  );
  if (!response.ok) throw new Error(`FAVOURITES_${response.status}`);
  return favouritesSchema.parse(await response.json());
}

/**
 * Keeps something, or stops keeping it.
 *
 * `PUT` and `DELETE` rather than one toggle, for the reason the API is shaped
 * that way: a toggle's effect depends on a state the caller cannot see, so two
 * presses racing would leave the heart wherever the last one landed and a
 * retried request would undo itself.
 */
export async function writeFavourite(input: {
  keep: boolean;
  session: string;
  slug: string;
}): Promise<void> {
  await fetch(`${apiBaseUrl()}/offerings/${input.slug}/favourite`, {
    cache: "no-store",
    headers: headers(input.session),
    method: input.keep ? "PUT" : "DELETE"
  });
}
