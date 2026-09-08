"use server";

import { randomUUID } from "node:crypto";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  priceConstraintSchema,
  RESULT_ARRANGEMENTS,
  type AvailableFilterResponse
} from "@commerce/contracts";

import { isApiUnavailable } from "../api-error";
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
  /*
   * I63. **Every criterion change puts the person back on page one.** A budget
   * narrowed while standing on page four is a new question, and page four of
   * the new answer is usually empty — which reads as "nothing matched" to
   * somebody who has simply overshot a shorter list.
   *
   * Dropped here rather than in each action, because this is exactly the kind
   * of thing one action out of six would forget. Moving between pages writes
   * the carrier through `handOffAt`, which is the one path that keeps it.
   */
  const { page: _dropped, ...atFirstPage } = entry;
  return writeEntry(atFirstPage);
}

/** The one hand-off that keeps a page number: moving between pages (I63). */
async function handOffAt(entry: DiscoveryEntry, page: number): Promise<never> {
  const { page: _dropped, ...criteria } = entry;
  return writeEntry(page <= 1 ? criteria : { ...criteria, page });
}

async function writeEntry(entry: DiscoveryEntry): Promise<never> {
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
 * Asking again for exactly what was asked for (UX-0001 §13, UX-0002 §14).
 *
 * The carrier was never rewritten when the read failed, so retrying is a
 * redirect and nothing else — no criteria are reconstructed, no path identifier
 * is minted, and there is no opportunity to invent an alternative query or
 * Category while doing it. Keeping the path identifier is what stops a retry
 * from counting as a second person beginning to look.
 *
 * A submission rather than a link, because a prefetched link into Discovery
 * would record the Discovery Start that the failure specifically did not claim.
 */
export async function retryDiscovery(): Promise<void> {
  /*
   * The carrier is read rather than assumed. It lives five minutes, and a
   * person who leaves this surface open longer than that has nothing left to
   * retry — sending them to Discovery would only bounce them Home again by way
   * of a route that claims to be showing them results. Home is where criteria
   * are entered, so that is where an expired retry belongs.
   */
  const entry = await currentEntry();
  redirect(entry ? DISCOVERY_ROUTE : "/");
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

  /*
   * UX-0002 §14, *Filter application error*: "the last confirmed criteria and
   * result set remain; the failed Filter is not silently applied; the person
   * may retry or remove it."
   *
   * All three are one decision — **return without writing the carrier.** The
   * carrier still holds the last confirmed criteria, so they remain; the
   * requested Filter never reaches it, so it is not applied; and the controls
   * the person used are still on the page, so retrying and removing are both
   * still available.
   *
   * The alternative — applying the Filter anyway and letting the results page
   * sort it out — is the one thing §14 names outright. A Filter the API never
   * confirmed as offered would be this application deciding what may be
   * filtered by, which §9.1 makes a property of the Category and the Attribute
   * definition rather than of a form.
   *
   * Defects are rethrown, as everywhere else: only the API being unavailable is
   * an ordinary condition to absorb.
   */
  let offered;
  try {
    offered = await offeredFilters(entry, pathId);
  } catch (error) {
    if (!isApiUnavailable(error)) throw error;
    return;
  }

  const filters = readAppliedFilters(form, offered);
  await handOff({
    ...entry,
    ...(filters.length === 0 ? {} : { filters }),
    pathId
  });
}

/**
 * Setting or changing the budget (UX-0002 §9A, `US-DSC-F11-001`).
 *
 * **Not routed through `offeredFilters`, and that is the whole difference
 * between this action and `applyFilters`.** A Filter is offered by a Category
 * and has to be checked against the one being browsed; a Price Constraint is
 * offered wherever Results are (§10.6.1), so there is nothing to check it
 * against here — the API validates the amounts, and an amount that is not one
 * never reaches the carrier because the contract refuses it first.
 *
 * An empty pair of bounds removes the constraint rather than writing one with
 * no bound: a person who clears both fields has stopped constraining, and
 * `PRICE_CONSTRAINT_HAS_NO_BOUND` is the API's answer to a request nobody
 * meant to make.
 */
export async function applyBudget(form: FormData): Promise<void> {
  const entry = await currentEntry();
  if (!entry) return;

  const read = (name: string): string | null => {
    const raw = form.get(name);
    if (typeof raw !== "string") return null;
    const trimmed = raw.trim();
    return trimmed === "" ? null : trimmed;
  };

  const parsed = priceConstraintSchema.safeParse({
    currency: (read("currency") ?? "TRY").toUpperCase(),
    maxAmount: read("maxAmount"),
    minAmount: read("minAmount")
  });

  /*
   * A refusal leaves the carrier alone, exactly as a refused Filter does. The
   * fields the person typed are still on the page, so correcting the figure is
   * the next thing they can do — and the results they were looking at are
   * still the results of the criteria they actually confirmed.
   */
  const { price: _dropped, ...kept } = entry;
  await handOff({
    ...kept,
    ...(parsed.success ? { price: parsed.data } : {}),
    pathId: entry.pathId ?? randomUUID()
  });
}

/**
 * Removing it (§9A.4).
 *
 * Drops one field and nothing else: the query, the Category and the Attribute
 * Filters are the person's other criteria and removing a budget is not a
 * statement about any of them.
 */
export async function clearBudget(): Promise<void> {
  const entry = await currentEntry();
  if (!entry) return;
  const { price: _dropped, ...kept } = entry;
  await handOff({ ...kept, pathId: entry.pathId ?? randomUUID() });
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

/**
 * Moving between pages of Results (I63).
 *
 * A submitted form rather than a link, like every other criterion control on
 * this surface, and for the same reason: the criteria live in the carrier
 * rather than in the address (UX-0002 §4), so there is no URL for a link to
 * point at. Nothing else about the person's question changes — the query, the
 * Category, the Filters and the budget are all untouched, because turning a
 * page is not a statement about any of them.
 *
 * An unreadable or out-of-range number leaves the carrier alone rather than
 * guessing a page: the person is still where they were, and the pager they
 * pressed is still on the screen.
 */
export async function goToPage(form: FormData): Promise<void> {
  const entry = await currentEntry();
  if (!entry) return;

  const raw = form.get("page");
  const page = typeof raw === "string" ? Number(raw) : Number.NaN;
  if (!Number.isInteger(page) || page < 1 || page > 400) return;

  await handOffAt({ ...entry, pathId: entry.pathId ?? randomUUID() }, page);
}

/**
 * Setting or clearing "only what is in stock" (I64).
 *
 * One action rather than an apply and a clear, because a checkbox has two
 * states and both arrive in the same submission — an unticked box sends
 * nothing, which is exactly the request to stop constraining. The budget needs
 * two actions because clearing it means emptying two fields somebody typed;
 * this one does not.
 *
 * Like every criterion change, it returns the person to the first page:
 * `handOff` drops the page for all of them.
 */
export async function applyStock(form: FormData): Promise<void> {
  const entry = await currentEntry();
  if (!entry) return;

  const { inStockOnly: _dropped, ...kept } = entry;
  await handOff({
    ...kept,
    ...(form.get("inStockOnly") === "true" ? { inStockOnly: true } : {}),
    pathId: entry.pathId ?? randomUUID()
  });
}

/**
 * Pressing one of the four tabs (I68).
 *
 * An arrangement is a criterion, so it goes through the same hand-off as the
 * budget and the stock switch — which also means it drops the page, and that is
 * right: page four of the newest listings is not page four of the cheapest
 * ones, and keeping the number would put somebody in a position they never
 * asked for.
 *
 * `DEFAULT` is written as an absence rather than as a value, so the carrier
 * holds a criterion only while one is in force. An unrecognised value is
 * ignored entirely: the tabs are a closed set, and a form field is editable.
 */
export async function applyArrangement(form: FormData): Promise<void> {
  const entry = await currentEntry();
  if (!entry) return;

  const chosen = form.get("arrangement");
  if (
    typeof chosen !== "string" ||
    !(RESULT_ARRANGEMENTS as readonly string[]).includes(chosen)
  )
    return;

  const { arrangement: _dropped, ...kept } = entry;
  await handOff({
    ...kept,
    ...(chosen === "DEFAULT"
      ? {}
      : { arrangement: chosen as (typeof RESULT_ARRANGEMENTS)[number] }),
    pathId: entry.pathId ?? randomUUID()
  });
}
