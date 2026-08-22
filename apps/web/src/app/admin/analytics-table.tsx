import type { Analytics } from "@commerce/contracts";

import {
  CORE_FLOW_LABELS,
  DOMAIN_GAP,
  INFORMATIONAL_HEADING
} from "../../platform/panel";

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
        <p>Nothing recorded.</p>
      ) : (
        <dl>
          {entries.map(([key, count]) => (
            <div key={key}>
              <dt>{key}</dt>
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

      <Tally heading="User accounts" tally={analytics.userAccounts} />
      <Tally heading="Businesses" tally={analytics.businesses} />
      <Tally
        heading="Offerings by lifecycle"
        tally={analytics.offerings.lifecycle}
      />
      {/* §12.3 lists lifecycle and final public eligibility as two indicators,
          and they stay two here — a Published Offering is not necessarily a
          publicly visible one, and one table would suggest it is. */}
      <Tally
        heading="Offerings by public eligibility"
        tally={analytics.offerings.publicEligibility}
      />
      <Tally
        heading="Destinations by status"
        tally={analytics.affiliateDestinations.status}
      />
      <Tally
        heading="Destinations by validation"
        tally={analytics.affiliateDestinations.validationResult}
      />
      <Tally
        heading="Destinations by Handoff Eligibility"
        tally={analytics.affiliateDestinations.handoffEligibility}
      />
      <Tally
        heading="Cases by status"
        tally={analytics.moderationCases.status}
      />
      <Tally
        heading="Open cases by target"
        tally={analytics.moderationCases.openByTarget}
      />

      <h3>What people did</h3>
      {/* `stacking` is what turns this into labelled rows below 768px. An
          Admin queue that can only be read by scrolling sideways on a phone is
          a queue that does not get worked, and horizontal scroll inside a page
          is the one gesture people reliably fail to discover. */}
      <table className="stacking">
        <thead>
          <tr>
            <th scope="col">Indicator</th>
            <th scope="col">Overall</th>
            <th scope="col">By Domain</th>
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
                {count.byDomain.length === 0
                  ? "—"
                  : count.byDomain
                      .map((entry) => `${entry.domain}: ${entry.count}`)
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
