import type { ManagedOffering } from "@commerce/contracts";

import {
  ELIGIBILITY_COPY,
  ENTRY_LABELS,
  type LifecycleGroup
} from "../../../business/inventory";

const GROUP_LABELS: Record<LifecycleGroup, string> = {
  ARCHIVED: "Archived",
  DRAFT: "Draft",
  HIDDEN: "Hidden",
  PUBLISHED: "Published"
};

/**
 * One lifecycle group of the inventory (UX-0005 §8).
 *
 * The entries come from the API and are rendered as they arrive. This
 * component composes nothing and hides nothing: `US-BUS-F05-001` already
 * decided which entries are permitted, from the same two authorities the write
 * path consults, so a screen that filtered them again would be a second
 * opinion — and eventually a different one.
 *
 * An Archived Offering therefore shows `View` alone without this file knowing
 * that Archived is view-only. It is not told; it is simply given one entry.
 */
export function InventoryGroup({
  group,
  offerings
}: {
  group: LifecycleGroup;
  offerings: ManagedOffering[];
}) {
  return (
    <section aria-labelledby={`group-${group}`}>
      <h3 id={`group-${group}`}>{GROUP_LABELS[group]}</h3>
      {offerings.length === 0 ? (
        <p>Nothing here.</p>
      ) : (
        <ul>
          {offerings.map((offering) => (
            <li key={offering.id}>
              <h4>{offering.title}</h4>
              {/* §9. Two facts, worded as two. The lifecycle is the heading
                  above; this is what the public can actually see, and the
                  screen never says they are the same thing. */}
              <p>{ELIGIBILITY_COPY[offering.publicEligibility]}</p>
              <ul>
                {offering.entries.map((entry) => (
                  <li key={entry}>{ENTRY_LABELS[entry]}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
