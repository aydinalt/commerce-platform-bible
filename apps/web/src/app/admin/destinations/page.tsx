import { cookies } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { ServiceUnavailable } from "../../service-unavailable";
import { isUnavailable, orUnavailable } from "../../unavailable";

import type { DestinationWorkloadItem } from "@commerce/contracts";

import {
  fetchAdminPanel,
  fetchDestinationWorkload
} from "../../../platform/api";
import {
  NO_WORKLOAD,
  SEPARATE_FROM_MODERATION,
  WORKLOAD_COPY,
  WORKLOAD_HEADINGS,
  WORKLOAD_ORDER,
  disableAvailable,
  enableAvailable
} from "../../../platform/destinations";
import {
  ELIGIBILITY_COPY,
  STATUS_COPY,
  VALIDATION_COPY
} from "../../../business/destination";
import { AUTH_ROUTES, SESSION_COOKIE } from "../../../identity/session";
import { administerDestination } from "./actions";
import { DestinationAction } from "./destination-actions";

import type { Metadata } from "next";

export const metadata: Metadata = { title: "Affiliate Destinations" };

/**
 * Affiliate Destination Administration (UX-0006 §9).
 *
 * Its own page, because it is its own family of work: §9 opens by saying this
 * is separate from General Moderation, and two queues sharing a screen would
 * be the first step towards one queue.
 *
 * The workload category is derived by `US-PLT-F07-001` on every read from the
 * two authoritative results, and this page renders that derivation rather than
 * repeating it. §9's closing line — the experience does not recalculate
 * destination states or Handoff Eligibility — is therefore not a discipline
 * observed here but a fact about what this file contains.
 *
 * The same three sentences describe status, validation and eligibility as the
 * Business sees them in UX-0005. One vocabulary read twice: an Admin and an
 * owner looking at the same destination should not be told different things
 * about it.
 */
function WorkloadItem({ item }: { item: DestinationWorkloadItem }) {
  const { destination } = item;
  const action = administerDestination.bind(null, destination.offeringId);

  return (
    <li>
      <p>{destination.reference}</p>
      <p>{STATUS_COPY[destination.status]}</p>
      <p>
        {VALIDATION_COPY[destination.validationResult]}
        {destination.validationReason === null
          ? ""
          : ` ${destination.validationReason}`}
      </p>
      <p>{ELIGIBILITY_COPY[destination.handoffEligibility]}</p>
      <p>
        <Link href={`/admin/moderation-cases?status=OPEN`}>
          Business {item.businessId}
        </Link>
      </p>

      <DestinationAction action={action} verb="REVIEW" />
      {/* Validate produces one of two results and never the absence of one:
          `NOT_VALIDATED` is what a destination has before anybody looks, not
          something Validate can decide. */}
      <DestinationAction action={action} verb="VALIDATE_VALID" />
      <DestinationAction action={action} verb="VALIDATE_INVALID" />
      {/* Enable is offered exactly where AC-6 would honour it, read from the
          same condition the route enforces. Disable applies to something that
          is on, because nothing else can be turned off. */}
      {enableAvailable(destination) ? (
        <DestinationAction action={action} verb="ENABLE" />
      ) : null}
      {disableAvailable(destination) ? (
        <DestinationAction action={action} verb="DISABLE" />
      ) : null}
    </li>
  );
}

export default async function DestinationWorkloadPage() {
  const jar = await cookies();
  const session = jar.get(SESSION_COOKIE)?.value;
  if (session === undefined) redirect(AUTH_ROUTES.login);

  const panel = await orUnavailable(fetchAdminPanel(session));
  /*
   * Two answers where there was one. `notFound()` answered both, so during an
   * outage every Admin route said the Admin panel does not exist — the same claim the
   * API deliberately makes to somebody who is not an Admin, which is exactly
   * why it must not also be made to somebody who is.
   */
  if (isUnavailable(panel))
    return <ServiceUnavailable retryPath="/admin/destinations" />;
  if (panel === null) notFound();

  const read = await orUnavailable(fetchDestinationWorkload(session));
  const items = isUnavailable(read) ? null : read;
  /*
   * A destination that has been Enabled or Disabled owes nothing, and says so
   * by having no category. It stays in the response because the read answers
   * "every destination and what is owed on it" — the queue is the subset that
   * owes something, which is what an Admin came here for.
   */
  const pending = items?.filter((item) => item.category !== null) ?? [];

  return (
    <main lang="en">
      <p>
        <Link href="/admin">Platform administration</Link>
      </p>
      <h1>Affiliate Destinations</h1>
      <p>{SEPARATE_FROM_MODERATION}</p>

      {items === null ? (
        <p role="alert">The workload could not be loaded.</p>
      ) : pending.length === 0 ? (
        /* §14. Said as itself, and not turned into an invitation to find
           something else to do to a Business. */
        <p>{NO_WORKLOAD}</p>
      ) : (
        WORKLOAD_ORDER.map((category) => {
          const group = pending.filter((item) => item.category === category);
          if (group.length === 0) return null;
          return (
            <section aria-labelledby={category} key={category}>
              <h2 id={category}>{WORKLOAD_HEADINGS[category]}</h2>
              {/* Whose turn it is, said out loud. An Admin who did not know
                  that a Business-correction item is not theirs to move would
                  keep returning to it wondering what to do. */}
              <p>{WORKLOAD_COPY[category]}</p>
              <ul>
                {group.map((item) => (
                  <WorkloadItem item={item} key={item.destination.id} />
                ))}
              </ul>
            </section>
          );
        })
      )}
    </main>
  );
}
