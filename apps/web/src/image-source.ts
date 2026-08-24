/**
 * What this application is willing to load as an image.
 *
 * **The guard is at render rather than at storage, deliberately.**
 * `US-BUS-F02-001` Out of Scope §11 excludes technical URL validation, so an
 * owner may save whatever they type and the platform does not judge it. That
 * was harmless while no stored URL ever became an `src`.
 *
 * I30 makes two of them one: the Business logo, stored since I1 and never
 * rendered, and the new Offering visuals. **Rendering is what makes the missing
 * check load-bearing**, so the check belongs to rendering — which also means
 * nothing about what may be stored changes, and the Frozen out-of-scope stays
 * true.
 *
 * The single owner of this decision, in the same shape as `api-error.ts`: one
 * module answers one question for the whole application.
 */

/**
 * The two schemes an image may come from.
 *
 * `http:` and `https:` and nothing else. The exclusions are the point:
 *
 * - `javascript:` is not executed by an `img` in any current browser, but it
 *   costs nothing to refuse and the same value reaches an `a href` elsewhere.
 * - `data:` can carry an SVG, and an SVG is a document with scripting rather
 *   than a picture. It is inert inside an `img` today; that is a property of
 *   browsers rather than of this application, and it is not one worth relying
 *   on for a value a stranger supplied.
 * - A protocol-relative `//host/path` inherits the page's scheme and is refused
 *   for being ambiguous rather than for being dangerous.
 *
 * `http:` is allowed because Offering visuals are addresses from other sites
 * and refusing plain HTTP would silently drop them. It costs a mixed-content
 * warning, which is visible, where dropping them would not be.
 */
const ALLOWED = new Set(["http:", "https:"]);

/**
 * The URL if it can be loaded, `null` if it cannot.
 *
 * `null` rather than a placeholder, because every Frozen criterion here says
 * the same thing twice: present the supplied visual, **and do not invent media
 * when it is absent**. A refused URL is a visual that is not there, and the
 * surfaces already know how to say nothing.
 */
export function imageSource(raw: string | null): string | null {
  if (raw === null) return null;
  const trimmed = raw.trim();
  if (trimmed === "") return null;

  try {
    /*
     * Parsed rather than matched with a prefix test. `new URL` normalises the
     * scheme's case and rejects the whitespace and control characters that make
     * `startsWith("http")` answer yes about something that is not a URL — and
     * `"https:/\evil"` is the shape that defeats a prefix test while parsing to
     * something else entirely.
     */
    return ALLOWED.has(new URL(trimmed).protocol) ? trimmed : null;
  } catch {
    // Not a URL at all. Same answer as a refused one: nothing to show.
    return null;
  }
}
