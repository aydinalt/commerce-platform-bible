import { cookies } from "next/headers";

import { CONTENT } from "../../../../../business/copy";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { ServiceUnavailable } from "../../../../service-unavailable";
import { isUnavailable, orUnavailable } from "../../../../unavailable";

import {
  fetchDashboard,
  fetchOfferingContent
} from "../../../../../business/api";
import {
  LIFECYCLE_GROUPS,
  ELIGIBILITY_COPY
} from "../../../../../business/inventory";
import {
  heldAsText,
  offersEdit
} from "../../../../../business/offering-content";
import { AUTH_ROUTES, SESSION_COOKIE } from "../../../../../identity/session";
import { TERMS } from "../../../../../vocabulary";
import { saveOffering } from "./actions";
import { ContentForm } from "./content-form";

import type { Metadata } from "next";

/*
 * **`Offering` until I51.** The word the whole product uses for this is
 * `TERMS.offering`, and the tab is the one place it was still English — named
 * from the vocabulary now rather than restated, so a rename lands in one file.
 */
export const metadata: Metadata = { title: TERMS.offering };

/**
 * One Offering, as its owner (UX-0005 §9 Edit, §8's View).
 *
 * Whether this is an edit or a reading is not decided here. The Dashboard's
 * entries already answered it — `US-BUS-F05-001` composed them from PRD-0001's
 * lifecycle and PRD-0005's access gate, the same two authorities the save
 * consults — so this page asks for them and does what they say. An Archived
 * Offering and a Restricted Business's Published Offering both land on the
 * reading, and no statement on this page says why.
 *
 * Both reads happen on every request. §5.2's conditions are live, so an
 * ownership that ended a moment ago produces a `notFound` here rather than a
 * form that fails on submission.
 */
export default async function OfferingPage({
  params
}: {
  params: Promise<{ businessId: string; offeringId: string }>;
}) {
  const { businessId, offeringId } = await params;
  const jar = await cookies();
  const session = jar.get(SESSION_COOKIE)?.value;
  if (session === undefined) redirect(AUTH_ROUTES.login);

  const [content, dashboard] = await Promise.all([
    orUnavailable(fetchOfferingContent(session, businessId, offeringId)),
    orUnavailable(fetchDashboard(session, businessId))
  ]);
  /*
   * Two answers where there was one. `notFound()` answered both, and saying
   * "this is not here" about something that is there is the one claim a failed
   * read must never make — UX-0006 §14, distinguish zero from unavailable.
   */
  if (isUnavailable(content) || isUnavailable(dashboard))
    return (
      <ServiceUnavailable
        retryPath={`/businesses/${businessId}/offerings/${offeringId}`}
      />
    );
  if (content === null || dashboard === null) notFound();

  const managed = LIFECYCLE_GROUPS.flatMap(
    (group) => dashboard.inventory[group]
  ).find((offering) => offering.id === offeringId);
  if (managed === undefined) notFound();

  return (
    <main>
      <p>
        <Link href={`/businesses/${businessId}`}>
          {dashboard.business.name}
        </Link>
      </p>
      <h1>{content.title}</h1>

      {/* §9's "Public eligibility language", said here as it is said on the
          Dashboard: the lifecycle and what the public can see are two facts. */}
      <p>{ELIGIBILITY_COPY[managed.publicEligibility]}</p>

      {offersEdit(managed.entries) ? (
        <ContentForm
          action={saveOffering.bind(null, businessId, offeringId)}
          content={content}
        />
      ) : (
        <section aria-labelledby="content">
          {/* No form, and no sentence explaining its absence. The entries said
              this Offering is not editable right now, and inventing a reason
              here would be this screen's own account of a rule it does not
              own. */}
          <h2 id="content">{CONTENT.heading}</h2>
          <p>{content.summary ?? "Özet yok."}</p>
          {content.applicableAttributes.length > 0 ? (
            <dl>
              {content.applicableAttributes.map((attribute) => (
                <div key={attribute.id}>
                  <dt>{attribute.name}</dt>
                  <dd>{heldAsText(content, attribute)}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </section>
      )}
    </main>
  );
}
