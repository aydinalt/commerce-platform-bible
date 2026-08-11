import type { BrowseRoots } from "@commerce/contracts";

import { fetchBrowseRoots } from "../discovery/api";

import { beginBrowse } from "./actions";
import { SearchEntry } from "./search-entry";

/**
 * Home (`US-DSC-F01-001`).
 *
 * One public, role-neutral entry into Discovery. It reads no principal and
 * renders no branch on one, so AC-4 and AC-6 hold by construction rather than
 * by four code paths that happen to agree: a Guest, an Enabled User, a
 * Business, an Admin and a Suspended account all receive this same markup.
 *
 * Home performs no Search matching, no hierarchy traversal, no result
 * composition and no filtering (UX-0001 §6). It offers two explicit routes and
 * gets out of the way.
 */

/// Categories change when an Admin retires one, so the page is rendered per
/// request rather than at build time.
export const dynamic = "force-dynamic";

/**
 * UX-0001 §8.1: Home consumes active root Category definitions. It does not
 * reorder them by popularity, feature a subset or group them under invented
 * headings, so the Domain grouping the API returns is flattened in the order
 * received and nothing is added to it.
 */
function rootCategories(roots: BrowseRoots) {
  return roots.domains.flatMap((domain) => domain.categories);
}

/**
 * UX-0001 §12: if Categories cannot be resolved, Search stays available and the
 * Browse area says so. `null` is the unresolved case and an empty array is the
 * resolved-but-empty one, because they are different things to say.
 */
async function activeRootCategories() {
  try {
    return rootCategories(await fetchBrowseRoots());
  } catch {
    return null;
  }
}

export default async function HomePage() {
  const categories = await activeRootCategories();

  return (
    <main>
      <section>
        <SearchEntry />

        <nav aria-labelledby="browse-entry-heading">
          <h2 id="browse-entry-heading">Ya da bir kategoriden başlayın</h2>
          {categories === null ? (
            // Bounded, and honest about which of the two entries is affected.
            <p role="status">
              Kategoriler şu anda getirilemedi. Arama kullanılabilir durumda.
            </p>
          ) : categories.length === 0 ? (
            <p role="status">Şu anda açık bir kategori yok.</p>
          ) : (
            // AC-3. Selecting a Category is a submission, not a link: a route
            // that begins by being followed could begin from a bookmark or a
            // prefetch, which is not an explicit selection.
            <form action={beginBrowse}>
              <ul>
                {categories.map((category) => (
                  <li key={category.id}>
                    <button name="categoryId" type="submit" value={category.id}>
                      {category.name}
                    </button>
                  </li>
                ))}
              </ul>
            </form>
          )}
        </nav>
      </section>
    </main>
  );
}
