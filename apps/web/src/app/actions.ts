"use server";

import { randomUUID } from "node:crypto";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  DISCOVERY_ENTRY_COOKIE,
  DISCOVERY_ENTRY_MAX_AGE_SECONDS,
  DISCOVERY_ROUTE,
  readBrowseEntry,
  readDiscoveryEntry,
  readSearchEntry,
  type DiscoveryEntry,
  type SearchEntryState
} from "../discovery/entry";

/**
 * The two explicit entries into Discovery.
 *
 * Both are submissions rather than links, for the same reason the API makes
 * them `POST`s: beginning to look is an occurrence. A link would let a route
 * begin by being followed — from a bookmark, a prefetch, a crawler — and
 * `US-DSC-F01-001` AC-2 and AC-3 both say "only after explicit" submission or
 * selection.
 *
 * Neither action performs Search matching, hierarchy traversal or result
 * composition. Home is an entry, and UX-0001 §6 keeps it that way.
 */

async function handOff(entry: DiscoveryEntry): Promise<never> {
  const jar = await cookies();
  jar.set(DISCOVERY_ENTRY_COOKIE, JSON.stringify(entry), {
    httpOnly: true,
    maxAge: DISCOVERY_ENTRY_MAX_AGE_SECONDS,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  });
  redirect(DISCOVERY_ROUTE);
}

/**
 * A path identifier is issued here rather than taken from the API's answer,
 * because a page render cannot write a cookie. Issuing it at the moment of the
 * action is also the more honest place: the path begins when the person acts,
 * and the API is told which path its Start belongs to rather than inventing
 * one per request.
 */
async function currentPathId(): Promise<string | undefined> {
  const jar = await cookies();
  return readDiscoveryEntry(jar.get(DISCOVERY_ENTRY_COOKIE)?.value)?.pathId;
}

/**
 * AC-2 and AC-5. A query that is only whitespace does not start Search; the
 * person keeps what they typed and Home claims nothing.
 */
export async function beginSearch(
  _previous: SearchEntryState,
  form: FormData
): Promise<SearchEntryState> {
  const { entry, typed } = readSearchEntry(form.get("query"));
  if (!entry) return { refused: true, typed };
  // Never returns: the hand-off ends in a redirect.
  return handOff({ ...entry, pathId: randomUUID() });
}

/**
 * AC-3. The selected Category is passed exactly, and an unrecognisable one is
 * refused rather than replaced — UX-0001 §13 forbids silently opening another.
 */
export async function beginBrowse(form: FormData): Promise<void> {
  const entry = readBrowseEntry(form.get("categoryId"));
  if (!entry) return;
  await handOff({ ...entry, pathId: randomUUID() });
}

/**
 * Moving through the hierarchy once Browse has begun.
 *
 * The difference from `beginBrowse` is the whole of `US-DSC-F03-001` AC-8: the
 * path identifier is kept, so a descendant selection finds the Discovery Start
 * already recorded and adds nothing. A fresh identifier here would quietly
 * count one person as several.
 */
export async function selectCategory(form: FormData): Promise<void> {
  const entry = readBrowseEntry(form.get("categoryId"));
  if (!entry) return;
  await handOff({ ...entry, pathId: (await currentPathId()) ?? randomUUID() });
}
