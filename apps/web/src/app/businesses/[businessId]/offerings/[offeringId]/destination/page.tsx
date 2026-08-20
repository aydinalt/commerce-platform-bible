import { cookies } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { ServiceUnavailable } from "../../../../../service-unavailable";
import { isUnavailable, orUnavailable } from "../../../../../unavailable";

import { fetchDestinationManagement } from "../../../../../../business/api";
import {
  DESTINATION_ENTRY_LABELS,
  ELIGIBILITY_COPY,
  PLATFORM_OWNS,
  STATUS_COPY,
  VALIDATION_COPY,
  offers
} from "../../../../../../business/destination";
import {
  AUTH_ROUTES,
  SESSION_COOKIE
} from "../../../../../../identity/session";
import { saveDestinationReference } from "./actions";
import { DestinationForm } from "./destination-form";

import type { Metadata } from "next";

export const metadata: Metadata = { title: "Affiliate Destination" };

/**
 * Affiliate Destination management (UX-0005 §13).
 *
 * The screen renders the entries `US-OFR-F06-001` composed and decides none of
 * them. That composition already consulted the Offering's lifecycle and the
 * Business access gate, so an Archived Offering arrives with `VIEW` alone and
 * a Restricted Business arrives with whatever its Offering still permits —
 * neither of which this file knows or restates.
 *
 * §13's five prohibitions are kept by absence rather than by refusal. There is
 * no Review, Validate, Enable or Disable control here, and no way to ask for a
 * Handoff Eligibility recalculation, because the contract has no field for any
 * of them and the API has no owner route to receive one.
 */
export default async function DestinationPage({
  params
}: {
  params: Promise<{ businessId: string; offeringId: string }>;
}) {
  const { businessId, offeringId } = await params;
  const jar = await cookies();
  const session = jar.get(SESSION_COOKIE)?.value;
  if (session === undefined) redirect(AUTH_ROUTES.login);

  const entry = await orUnavailable(
    fetchDestinationManagement(session, businessId, offeringId)
  );
  /*
   * Two answers where there was one. `notFound()` answered both, and saying
   * "this is not here" about something that is there is the one claim a failed
   * read must never make — UX-0006 §14, distinguish zero from unavailable.
   */
  if (isUnavailable(entry))
    return (
      <ServiceUnavailable
        retryPath={`/businesses/${businessId}/offerings/${offeringId}/destination`}
      />
    );
  if (entry === null) notFound();

  const { destination, entries, offering } = entry;
  const creating = offers(entries, "CREATE");
  const editable = creating || offers(entries, "EDIT");

  return (
    <main lang="en">
      <p>
        <Link href={`/businesses/${businessId}/offerings/${offeringId}`}>
          {offering.title}
        </Link>
      </p>
      <h1>{DESTINATION_ENTRY_LABELS.VIEW}</h1>

      {destination === null ? (
        /* Absence is not a failure here. It is the state Create exists for,
           and where Create is not offered either, it is simply the truth
           about this Offering. */
        <p>This Offering has no destination.</p>
      ) : (
        <dl>
          <div>
            <dt>Address</dt>
            <dd>{destination.reference}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>{STATUS_COPY[destination.status]}</dd>
          </div>
          <div>
            <dt>Checked</dt>
            <dd>
              {VALIDATION_COPY[destination.validationResult]}
              {destination.validationReason === null
                ? ""
                : ` ${destination.validationReason}`}
            </dd>
          </div>
          <div>
            {/* Three facts, worded as three. Handoff Eligibility is composed
                from the other two by `US-OFR-F07-001`, and this page reports
                the composition's answer rather than deriving one of its own —
                a second derivation would eventually disagree. */}
            <dt>Handoff</dt>
            <dd>{ELIGIBILITY_COPY[destination.handoffEligibility]}</dd>
          </div>
        </dl>
      )}

      {/* Named rather than left to be inferred from four missing buttons: an
          owner who does not know enabling is the platform's job reads "Not
          enabled" as something they forgot to do. */}
      <p>{PLATFORM_OWNS}</p>

      {editable ? (
        <DestinationForm
          action={saveDestinationReference.bind(null, businessId, offeringId)}
          label={
            creating
              ? DESTINATION_ENTRY_LABELS.CREATE
              : DESTINATION_ENTRY_LABELS.EDIT
          }
          reference={destination?.reference ?? ""}
        />
      ) : null}
    </main>
  );
}
