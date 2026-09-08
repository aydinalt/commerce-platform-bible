import Link from "next/link";

import { OVERVIEW } from "../../../platform/copy";

/**
 * One figure, with the words that say what it counts (I79).
 *
 * **A card holds a count and nothing else.** No trend arrow, no percentage
 * change, no target — the same restraint `analytics-table.tsx` states and for
 * the same reason: every figure here is a count of records that exist, and an
 * arrow beside one would imply a comparison the platform never made. A card is
 * a bigger typeface, not a different claim.
 *
 * `value === null` is **unavailable**, and it renders as words rather than as a
 * dash or a zero. UX-0006 §14 turns on this distinction, and a card is exactly
 * where it is easiest to lose: a big `0` is the most confident thing on a
 * dashboard, and it would be a lie about a figure nobody managed to read.
 */
export function MetricCard({
  detail,
  heading,
  href,
  linkLabel,
  mark,
  value
}: {
  // `exactOptionalPropertyTypes` is on, and a card whose detail line is absent
  // passes `undefined` rather than omitting the prop — so the type says so.
  detail?: string | undefined;
  heading: string;
  /** The queue this figure counts, when there is one to open (I82). */
  href?: string | undefined;
  linkLabel?: string | undefined;
  /**
   * The badge glyph, in the template's top-left position (I82).
   *
   * A character rather than an icon set: the reference uses icon fonts, and
   * adding one would be a network dependency and a second vocabulary for
   * something a card already names in words. The badge marks the card's corner
   * so a row of four is scannable; it carries no meaning the heading does not.
   */
  mark?: string | undefined;
  value: number | null;
}) {
  return (
    <div className="metric-card">
      {mark === undefined ? null : (
        <span aria-hidden="true" className="metric-card-mark">
          {mark}
        </span>
      )}
      <h3>{heading}</h3>
      {value === null ? (
        <p className="metric-card-unavailable" role="alert">
          {OVERVIEW.cardUnavailable}
        </p>
      ) : (
        <>
          {/* `tabular-nums` so a column of cards keeps its digits aligned as
              the figures change under it. */}
          <p className="metric-card-value">{value.toLocaleString("tr-TR")}</p>
          {detail === undefined ? null : (
            <p className="metric-card-detail">{detail}</p>
          )}
        </>
      )}
      {/* The template's ruled card footer. Rendered even when the figure could
          not be read: the queue is still there to open, and an outage in the
          analytics read is not a reason to take the way out of the card away. */}
      {href === undefined || linkLabel === undefined ? null : (
        <p className="metric-card-link">
          <Link href={href}>{linkLabel}</Link>
        </p>
      )}
    </div>
  );
}

/**
 * The row the cards sit in.
 *
 * A component rather than a `div` on the page, and the reason is a guard rather
 * than taste: `i48-management-surfaces` asserts that no management `page.tsx`
 * carries a `className`, so that a pattern either belongs in the shared layer
 * or belongs in a component somebody can find. A grid declared inline on this
 * page would be a layout nothing else could reuse and nothing would check.
 */
export function MetricGrid({ children }: { children: React.ReactNode }) {
  return <div className="metric-grid">{children}</div>;
}
