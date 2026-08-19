import { SearchEntry } from "../search-entry";

import { retryDiscovery } from "../actions";

import type { DiscoveryEntry } from "../../discovery/entry";

/**
 * What Discovery shows when its Results could not be fetched.
 *
 * Two Frozen documents converge on this one surface, because from the person's
 * side "the route did not begin" and "the results did not arrive" are the same
 * moment.
 *
 * UX-0001 §13, *Search route cannot begin*: the entered query remains, no
 * Discovery Start is claimed, the person may retry or edit the query.
 * UX-0001 §13, *Category route cannot begin*: the selected Category is not
 * silently replaced, no other Category opens, the person may retry or choose
 * another active Category.
 * UX-0002 §14, *Search or Browse result error*: current criteria remain, no
 * alternative query or Category is invented, the person may retry, change
 * criteria, or return Home.
 *
 * **Nothing here fetches.** The read that failed is not attempted again to draw
 * this page, so the surface cannot fail the way the page did. That is also why
 * a Browse failure does not list the other active Categories: obtaining them
 * needs the API that just refused, and "choose another active Category" is
 * served by Home, which owns that list.
 *
 * **No occurrence is claimed.** Rendering this performs no request, so no
 * Discovery Start and no `Offering Presentation Open` can arise from a failure
 * — which is exactly what both documents ask for, and is true here by there
 * being nothing to be careful about.
 */
export function ResultsUnavailable({ entry }: { entry: DiscoveryEntry }) {
  return (
    <main>
      <section aria-labelledby="discovery-unavailable-heading">
        <h1 id="discovery-unavailable-heading">
          Sonuçlar şu anda getirilemedi
        </h1>

        {/* Stated in words, and as a live region, rather than by colour or by
            an icon — UX-0002 §16 asks for the accessible equivalent, and I9
            established that a state a person cannot hear is a state they do
            not have. */}
        <p role="status">
          Aramanız kaydedildi ve hiçbir şey değiştirilmedi. Birazdan tekrar
          deneyebilirsiniz.
        </p>

        {/* "Current criteria remain", shown rather than merely retained. The
            person can see that what they asked for is intact, which is the
            difference between criteria surviving and criteria appearing to
            have been thrown away. */}
        {entry.kind === "SEARCH" ? (
          <p>
            Aradığınız: <strong>{entry.query}</strong>
          </p>
        ) : (
          <p>Seçtiğiniz kategori korundu.</p>
        )}

        {/*
         * Retry is a submission and not a link.
         *
         * A `Link` would be prefetched, and a prefetched Discovery route is a
         * Discovery Start recorded for somebody who never asked for one — the
         * same reason every entry into Discovery is a `POST` rather than an
         * anchor. The action re-reads the untouched carrier, so retrying asks
         * for exactly what was asked for before and invents nothing.
         */}
        <form action={retryDiscovery}>
          <button type="submit">Tekrar dene</button>
        </form>

        {entry.kind === "SEARCH" ? (
          <section aria-labelledby="discovery-unavailable-edit">
            <h2 id="discovery-unavailable-edit">Ya da aramanızı değiştirin</h2>
            {/* "The person may retry or edit the query", and "the entered
                query remains" — the same component Home uses, pre-filled, so
                there is one Search entry in this application rather than two
                that will eventually disagree. */}
            <SearchEntry initialQuery={entry.query} />
          </section>
        ) : null}

        {/* "Return Home", where the active Categories and a fresh Search entry
            both live. A plain anchor: Home claims nothing, so nothing is
            fabricated by it being prefetched. */}
        <p>
          <a href="/">Ana sayfaya dön</a>
        </p>
      </section>
    </main>
  );
}
