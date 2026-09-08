import type { Analytics } from "@commerce/contracts";

import { HANDOFF_RATE, OVERVIEW } from "../../../platform/copy";

/**
 * Views and handoffs per listing, drawn (I79).
 *
 * The Owner asked for the CTR report to be *visualised*, and this is the whole
 * of that: one bar per listing, its filled part the handoffs, its length the
 * opens. Two lengths a reader compares by eye instead of two numbers they
 * compare by arithmetic.
 *
 * **Three things this drawing must not do, each of which it would do by
 * default.**
 *
 * *It must not draw a rate for a listing that has none.* An Offering nobody has
 * opened has `rate === null`, and a zero-width bar is a picture of "nobody
 * chose this" when the truth is "nobody has looked" — `PRD-0006` v2.5 §11.6.3
 * exists for exactly that confusion, and a chart is where it is easiest to
 * commit, because a bar of length zero looks like data rather than absence.
 * Such a row is drawn as a labelled absence.
 *
 * *It must not scale each bar to its own rate.* Every bar is scaled against the
 * **most-opened listing in the set**, so bar length means opens across the
 * whole chart. Scaling each to itself would make a listing opened twice look
 * the same size as one opened four thousand times, which is the one comparison
 * an Admin actually came here to make.
 *
 * *It must not become a ranking.* The order is the API's — by opens — and is
 * not re-sorted here. Sorting by rate would put a 1-of-2 listing above a
 * 300-of-1000 one and quietly turn an observation into a recommendation, which
 * §11.6 keeps analytics out of.
 *
 * The bars are `div`s sized by a percentage, not an SVG chart: the same figures
 * sit in a real table underneath, so the drawing is an aid rather than the only
 * way to read the data.
 */
export function EngagementBars({
  rate
}: {
  rate: Analytics["affiliateHandoffRate"];
}) {
  const rows = rate.byOffering;
  if (rows.length === 0)
    return (
      <section aria-labelledby="engagement">
        <h2 id="engagement">{OVERVIEW.engagementTitle}</h2>
        <p>{OVERVIEW.noEngagement}</p>
      </section>
    );

  /*
   * The scale. `Math.max(…, 1)` guards the division rather than the data: every
   * row here has at least one open in practice, and a chart that threw on the
   * one day that stopped being true would take the dashboard down over a
   * drawing.
   */
  const widest = Math.max(...rows.map((row) => row.opens), 1);

  return (
    <section aria-labelledby="engagement">
      <h2 id="engagement">{OVERVIEW.engagementTitle}</h2>
      <ul className="engagement">
        {rows.map((row) => {
          const width = (row.opens / widest) * 100;
          /*
           * Of the drawn bar, not of the chart: the filled part is a share of
           * this listing's own opens, so it reads as its rate while the whole
           * bar reads as its volume.
           */
          const filled = row.opens === 0 ? 0 : (row.handoffs / row.opens) * 100;
          return (
            <li key={row.offeringId}>
              <p className="engagement-label">{row.title}</p>
              <div className="engagement-track" style={{ width: `${width}%` }}>
                <div
                  className="engagement-fill"
                  style={{ width: `${filled}%` }}
                />
              </div>
              <p className="engagement-figures">
                {HANDOFF_RATE.overall(row)} ·{" "}
                {row.rate === null
                  ? HANDOFF_RATE.noRate
                  : HANDOFF_RATE.rate(row.rate)}
              </p>
            </li>
          );
        })}
      </ul>
      <p className="engagement-note">{OVERVIEW.engagementNote}</p>
    </section>
  );
}
