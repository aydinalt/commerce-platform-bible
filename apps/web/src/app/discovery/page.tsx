import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { fetchBrowseView, fetchSearchView } from "../../discovery/api";
import {
  DISCOVERY_ENTRY_COOKIE,
  readDiscoveryEntry
} from "../../discovery/entry";

import { BrowseResultsView, SearchResultsView } from "./discovery-view";

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
}
