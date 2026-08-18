"use server";

import { randomUUID } from "node:crypto";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import type { AvailableFilterResponse } from "@commerce/contracts";

import { fetchBrowseView, fetchSearchView } from "../discovery/api";
import { readAppliedFilters } from "../discovery/filters";

import {
  DISCOVERY_ENTRY_COOKIE,
  DISCOVERY_ENTRY_MAX_AGE_SECONDS,
  DISCOVERY_ROUTE,
  readBrowseEntry,
  readDiscoveryEntry,
  readPreparation,
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

/**
 * Returning into Discovery to find a second Offering to compare
 * (`US-DSC-F10-001` AC-1).
 *
 * The path identifier comes from the flow the person is already in rather than
 * being minted here. That is AC-4 in one line: a return is a continuation of
 * looking, not a new beginning, and a fresh identifier would record a second
 * Discovery Start for the same person still doing the same thing.
 *
 * If there is no path to continue, one is issued — a return that arrived
 * without a flow behind it is the first thing this person has done, and
 * counting it once is more honest than counting it never.
 */
export async function returnToPreparation(form: FormData): Promise<void> {
  const entry = readBrowseEntry(form.get("categoryId"));
  if (!entry) return;
  const preparation = readPreparation(
    { categoryId: entry.categoryId, offeringId: form.get("offeringId") },
    entry.categoryId
  );
  if (!preparation) return;
  await handOff({
    ...entry,
    pathId: (await currentPathId()) ?? randomUUID(),
    preparation
  });
}

/**
 * The entry the person is currently in, or nothing.
 *
 * Read from the carrier rather than from the submitted form. The form used to
 * carry a Category identifier and the action used to trust it; the cookie
 * already knows which path this is and what it holds, so asking the form was
 * both redundant and a field somebody could rewrite.
 */
async function currentEntry(): Promise<DiscoveryEntry | null> {
  const jar = await cookies();
  return readDiscoveryEntry(jar.get(DISCOVERY_ENTRY_COOKIE)?.value);
}

/** The Filters the API is currently offering for this exact entry. */
async function offeredFilters(
  entry: DiscoveryEntry,
  pathId: string
): Promise<readonly AvailableFilterResponse[]> {
  if (entry.kind === "SEARCH")
    return (await fetchSearchView({ ...entry, pathId })).filters;
  return (await fetchBrowseView({ ...entry, pathId })).filters;
}

/**
 * Applying Attribute Filters (UX-0002 §9).
 *
 * The offered Filters are fetched rather than carried through the form. §9.1
 * makes availability a property of the Category and the Attribute definition,
 * and a list of what may be applied, submitted by the browser, would be a list
 * the browser could edit — the form deciding its own validity.
 *
 * §9.7: applying narrows or preserves. The query, the Category and the path
 * identifier are untouched, because changing a Filter is the same person still
 * looking at the same thing.
 */
export async function applyFilters(form: FormData): Promise<void> {
  const entry = await currentEntry();
  if (!entry) return;
  const pathId = entry.pathId ?? randomUUID();
  const filters = readAppliedFilters(form, await offeredFilters(entry, pathId));

  await handOff({
    ...entry,
    ...(filters.length === 0 ? {} : { filters }),
    pathId
  });
}

/**
 * Clearing them (§9.7).
 *
 * "Clearing all Filters preserves the current query and active leaf Category
 * unless the person separately changes them" — so this drops one field and
 * nothing else. It is a separate action rather than an empty apply, because an
 * empty apply is indistinguishable from a form that failed to submit its
 * values.
 */
export async function clearFilters(): Promise<void> {
  const entry = await currentEntry();
  if (!entry) return;
  // Destructured rather than overwritten with an empty array: the carrier
  // should not hold an empty `filters` key that reads as "filtered by nothing".
  const { filters: _dropped, ...kept } = entry;
  await handOff({ ...kept, pathId: entry.pathId ?? randomUUID() });
}

/**
 * Narrowing a Search to one active leaf Category (UX-0002 §7.2,
 * `US-DSC-F04-001` AC-3).
 *
 * The path identifier is kept and no Browse entry is made. §6 is explicit:
 * "Selecting a Category to narrow an existing Search does not create a Browse
 * Discovery Start" — turning this into a Browse selection would record a
 * second person beginning to look, and lose the query while doing it.
 *
 * Filters are dropped by moving leaf. They were offered by the Category being
 * left, and §9.1 makes them applicable only inside the one that offered them.
 */
export async function narrowSearch(form: FormData): Promise<void> {
  const entry = await currentEntry();
  if (entry?.kind !== "SEARCH") return;
  const narrowed = readBrowseEntry(form.get("categoryId"));
  if (!narrowed) return;

  await handOff({
    categoryId: narrowed.categoryId,
    kind: "SEARCH",
    pathId: entry.pathId ?? randomUUID(),
    query: entry.query
  });
}

/**
 * Removing the narrowing, back to the Search across leaves.
 *
 * **This is a judgement rather than a stated rule.** §12 lists changing
 * Category among the bounded recoveries and §7.2 says a Search may begin
 * without one, so the state this returns to is one the experience already
 * permits — but no line says a narrowing may be removed outright. Without it a
 * person who narrows has no way back to the results they had, which is the
 * worse reading of a document that keeps criteria visible everywhere else.
 */
export async function widenSearch(): Promise<void> {
  const entry = await currentEntry();
  if (entry?.kind !== "SEARCH") return;
  await handOff({
    kind: "SEARCH",
    pathId: entry.pathId ?? randomUUID(),
    query: entry.query
  });
}

/**
 * Leaving the preparation flow (AC-7).
 *
 * The context is dropped and the person stays where they are. Clearing it is
 * the whole point — AC-3 makes it non-restorable once the flow ends, so there
 * is nowhere it could be kept "just in case".
 */
export async function leavePreparation(form: FormData): Promise<void> {
  const entry = readBrowseEntry(form.get("categoryId"));
  if (!entry) return;
  await handOff({ ...entry, pathId: (await currentPathId()) ?? randomUUID() });
}
