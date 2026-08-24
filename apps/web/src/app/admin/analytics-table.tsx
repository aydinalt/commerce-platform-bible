import type { Analytics } from "@commerce/contracts";

import {
  CORE_FLOW_LABELS,
  DOMAIN_GAP,
  INFORMATIONAL_HEADING
} from "../../platform/panel";
import { ANALYTICS, tallyLabel } from "../../platform/copy";

/**
 * One tally, rendered as the counts it is.
 *
 * The keys come from the API, which grouped records by the results their own
 * authorities produced. This component invents no bucket and merges none — a
 * status that appears is one something is actually in, and a status absent from
 * the tally is one nothing is in, which the API says by not sending it.
 */
function Tally({
  heading,
  tally
}: {
  heading: string;
  tally: Record<string, number>;
}) {
  const entries = Object.entries(tally).sort(([a], [b]) => a.localeCompare(b));
  return (
    <div>
      <h3>{heading}</h3>
      {entries.length === 0 ? (
        <p>{ANALYTICS.nothingRecorded}</p>
      ) : (
        <dl>
          {entries.map(([key, count]) => (
            <div key={key}>
              {/* Sorted by the contract key above rather than by the label, so
                  the order a tally appears in does not change with the
                  language it is read in. */}
              <dt>{tallyLabel(key)}</dt>
              <dd>{count}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}

/**
 * Basic Analytics (UX-0006 §12).
 *
 * Every figure is a count of records that already exist. Nothing here is
 * derived, weighted, projected or scored — which is most of what makes this
 * operational visibility rather than analytics, and is why there is no trend
 * arrow, no percentage change and no target beside any number.
 *
 * The current-state indicators and the core-flow indicators are separated,
 * because they answer different questions: one says what the platform holds
 * right now, the other says what people did during a period.
 */
export function AnalyticsTable({ analytics }: { analytics: Analytics }) {
  return (
    <section aria-labelledby="analytics">
      <h2 id="analytics">{INFORMATIONAL_HEADING}</h2>

      <Tally heading={ANALYTICS.userAccounts} tally={analytics.userAccounts} />
      <Tally heading={ANALYTICS.businesses} tally={analytics.businesses} />
      <Tally
        heading={ANALYTICS.lifecycle}
        tally={analytics.offerings.lifecycle}
      />
      {/* §12.3 lists lifecycle and final public eligibility as two indicators,
          and they stay two here — a Published Offering is not necessarily a
          publicly visible one, and one table would suggest it is. */}
      <Tally
        heading={ANALYTICS.publicEligibility}
        tally={analytics.offerings.publicEligibility}
      />
      <Tally
        heading={ANALYTICS.destinationStatus}
        tally={analytics.affiliateDestinations.status}
      />
      <Tally
        heading={ANALYTICS.destinationValidation}
        tally={analytics.affiliateDestinations.validationResult}
      />
      <Tally
        heading={ANALYTICS.eligibility}
        tally={analytics.affiliateDestinations.handoffEligibility}
      />
      <Tally
        heading={ANALYTICS.cases}
        tally={analytics.moderationCases.status}
      />
      <Tally
        heading={ANALYTICS.openByTarget}
        tally={analytics.moderationCases.openByTarget}
      />

      <h3>{ANALYTICS.heading}</h3>
      {/* `stacking` is what turns this into labelled rows below 768px. An
          Admin queue that can only be read by scrolling sideways on a phone is
          a queue that does not get worked, and horizontal scroll inside a page
          is the one gesture people reliably fail to discover. */}
      <table className="stacking">
        <thead>
          <tr>
            <th scope="col">{ANALYTICS.indicator}</th>
            <th scope="col">{ANALYTICS.overall}</th>
            <th scope="col">{ANALYTICS.byDomain}</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(analytics.coreFlow).map(([key, count]) => (
            <tr key={key}>
              <th scope="row">
                {CORE_FLOW_LABELS[key as keyof Analytics["coreFlow"]]}
              </th>
              <td>{count.overall}</td>
              <td>
                {/* The Domain was rendered as its contract key, so this cell
                    read `MOBILITY: 3` — the identifier, not the name. It is
                    data rather than a literal, which is why three passes over
                    the source did not see it. */}
                {count.byDomain.length === 0
                  ? "—"
                  : count.byDomain
                      .map(
                        (entry) => `${tallyLabel(entry.domain)}: ${entry.count}`
                      )
                      .join(", ")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* §12.2. The gap between a Domain breakdown and the overall figure is
          the truth rather than a defect, and saying so is how it stays that
          way — an unexplained gap is eventually "fixed" by guessing. */}
      <p>{DOMAIN_GAP}</p>
    </section>
  );
}
