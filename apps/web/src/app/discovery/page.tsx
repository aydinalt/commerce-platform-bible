import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { isApiUnavailable } from "../../api-error";
import { fetchBrowseView, fetchSearchView } from "../../discovery/api";
import {
  DISCOVERY_ENTRY_COOKIE,
  readDiscoveryEntry
} from "../../discovery/entry";

import { BrowseResultsView, SearchResultsView } from "./discovery-view";
import { ResultsUnavailable } from "./results-unavailable";

import type { Metadata } from "next";

export const metadata: Metadata = { title: "Sonuçlar" };

/**
 * Discovery (`US-DSC-F06-001`).
 *
 * One route for both paths, because the criteria live in the carrier rather
 * than in the address — UX-0002 §4 leaves persistent or shareable URL state
 * outside V1, and two routes would have been that state under another name.
 *
 * The page is a shell: it reads the criteria, asks the API, and hands the
 * answer to a pure view. Everything that could be got wrong about Results —
 * which Offerings are eligible, what matched, in what order — was decided
 * before this file ran.
 */

/// Results change whenever an Offering is published or retired, so nothing
/// here may be prerendered.
export const dynamic = "force-dynamic";

export default async function DiscoveryPage() {
  const jar = await cookies();
  const entry = readDiscoveryEntry(jar.get(DISCOVERY_ENTRY_COOKIE)?.value);

  // No criteria means no Discovery: there is nothing to show and nothing to
  // invent, so the person goes back to where criteria are entered.
  if (!entry) redirect("/");

  /*
   * The read is attempted here rather than inside the branches so that one
   * `catch` covers both paths. UX-0002 §14 names a single "Search or Browse
   * result error" and gives it one behaviour, and two handlers would be two
   * chances to give it two.
   */
  try {
    if (entry.kind === "SEARCH")
      return (
        <SearchResultsView
          applied={entry.filters ?? []}
          view={await fetchSearchView(entry)}
        />
      );
    return (
      <BrowseResultsView
        applied={entry.filters ?? []}
        preparation={entry.preparation}
        view={await fetchBrowseView(entry)}
      />
    );
  } catch (error) {
    /*
     * Only the API's failures are presented as a bounded state. A contract
     * parse failure, a `TypeError` or any other defect is rethrown and reaches
     * the crash screen, because telling a person "try again shortly" about a
     * bug promises a retry that can never succeed and hides the bug for ever.
     *
     * The carrier is deliberately not touched on the way out. That single
     * absence is most of what §14 asks for: the criteria remain because nothing
     * removed them, and no alternative can be invented because nothing is
     * written.
     */
    if (!isApiUnavailable(error)) throw error;
    return <ResultsUnavailable entry={entry} />;
  }
}
