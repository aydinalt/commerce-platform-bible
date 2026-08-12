import Link from "next/link";

import type { ManagedOffering } from "@commerce/contracts";

import {
  ELIGIBILITY_COPY,
  ENTRY_LABELS,
  type LifecycleGroup
} from "../../../business/inventory";
import { publishOffering, retireOffering } from "./actions";
import { OfferingAction } from "./offering-actions";

const GROUP_LABELS: Record<LifecycleGroup, string> = {
  ARCHIVED: "Archived",
  DRAFT: "Draft",
  HIDDEN: "Hidden",
  PUBLISHED: "Published"
};

/**
 * One lifecycle group of the inventory (UX-0005 §8, §9).
 *
 * Each entry the API offered becomes the thing it names: `PUBLISH` and
 * `RETIRE` become submissions, `EDIT` and the destination entry become links,
 * and `VIEW` becomes the Offering's own heading. What this component never
 * does is decide *which* entries exist — `US-BUS-F05-001` composed that from
 * the same two authorities the write path consults, so a screen that filtered
 * them again would be a second opinion and eventually a different one.
 *
 * An Archived Offering therefore carries no action at all, and this file
 * contains no rule saying Archived is view-only. It was handed one entry.
 */
export function InventoryGroup({
  businessId,
  group,
  offerings
}: {
  businessId: string;
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
              {/* §9. Two facts, worded as two. The group heading is the
                  lifecycle; this is what the public can actually see. */}
              <p>{ELIGIBILITY_COPY[offering.publicEligibility]}</p>
              <ul>
                {offering.entries.map((entry) => (
                  <li key={entry}>
                    {entry === "PUBLISH" ? (
                      <OfferingAction
                        action={publishOffering.bind(
                          null,
                          businessId,
                          offering.id
                        )}
                        label={ENTRY_LABELS.PUBLISH}
                      />
                    ) : entry === "RETIRE" ? (
                      <OfferingAction
                        action={retireOffering.bind(
                          null,
                          businessId,
                          offering.id
                        )}
                        label={ENTRY_LABELS.RETIRE}
                      />
                    ) : entry === "EDIT" ? (
                      <Link
                        href={`/businesses/${businessId}/offerings/${offering.id}`}
                      >
                        {ENTRY_LABELS.EDIT}
                      </Link>
                    ) : entry === "MANAGE_AFFILIATE_DESTINATION" ? (
                      <Link
                        href={`/businesses/${businessId}/offerings/${offering.id}/destination`}
                      >
                        {ENTRY_LABELS.MANAGE_AFFILIATE_DESTINATION}
                      </Link>
                    ) : (
                      <Link
                        href={`/businesses/${businessId}/offerings/${offering.id}`}
                      >
                        {ENTRY_LABELS.VIEW}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
